// server.js
// Minimal proxy to safely call IntakeQ's Client API from the browser.
//
// Requirements:
//   - Node 18+ (for built-in fetch). If on Node <18, `npm i node-fetch` and import it.
//   - A .env file with INTAKEQ_API_KEY=your_api_key_here
//
// Start:  node server.js
// Visit:  http://localhost:3000

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const INTAKEQ_API_KEY = process.env.INTAKEQ_API_KEY;
if (!INTAKEQ_API_KEY) {
  console.warn('[WARN] INTAKEQ_API_KEY is not set. Create a .env file with your key.');
}

const app = express();

// In production, replace "*" with your site origin.
app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve the client UI from /public
app.use(express.static(path.join(__dirname, 'public')));

// GET /api/client/:clientId -> returns a single client profile (includeProfile=true)
app.get('/api/client/:clientId', async (req, res) => {
  try {
    const clientId = req.params.clientId.trim();

    // IntakeQ lets you pass the numeric Client ID to search= for an exact match.
    if (!/^\d+$/.test(clientId)) {
      return res.status(400).json({ error: 'clientId must be numeric' });
    }

    const url = new URL('https://intakeq.com/api/v1/clients'); // Base URL per docs.
    url.searchParams.set('search', clientId);
    url.searchParams.set('includeProfile', 'true'); // return full profile fields.

    const iqResp = await fetch(url, {
      headers: {
        'X-Auth-Key': INTAKEQ_API_KEY, // Auth header required by IntakeQ.
        'Accept': 'application/json'
      }
    });

    if (iqResp.status === 401 || iqResp.status === 403) {
      return res.status(401).json({ error: 'Unauthorized. Check X-Auth-Key / API permissions.' });
    }

    if (!iqResp.ok) {
      const text = await iqResp.text().catch(() => '');
      return res.status(iqResp.status).json({ error: 'IntakeQ API error', status: iqResp.status, body: text });
    }

    const data = await iqResp.json();

    // The query endpoint returns an array. For numeric ClientID, it should be an exact match.
    // Return the first result or 404 if none.
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ error: `Client ${clientId} not found` });
    }

    // If IntakeQ ever returns more than one (edge case), pick the client whose ClientId matches.
    const exact = data.find(c => String(c.ClientId) === clientId) || data[0];
    return res.json(exact);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', details: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Client lookup tool running on http://localhost:${PORT}`);
});
