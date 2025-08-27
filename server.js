// server.js
// Minimal Express server that forwards email + tracking number to a Cloudflare
// endpoint which is expected to send a SendGrid template email.
//
// Requirements:
//   - Node 18+ for the built-in fetch API.
//   - .env file with SENDGRID_ENDPOINT set to your Cloudflare Worker URL.
//
// Start:  node server.js
// Visit:  http://localhost:3000

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const SENDGRID_ENDPOINT = process.env.SENDGRID_ENDPOINT;
if (!SENDGRID_ENDPOINT) {
  console.warn('[WARN] SENDGRID_ENDPOINT is not set. Create a .env file.');
}

const app = express();

// In production, replace "*" with your site origin.
app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve the client UI from /public
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/login -> basic placeholder that validates presence of credentials
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};

  if (typeof username !== 'string' || !username.trim() ||
      typeof password !== 'string' || !password.trim()) {
    return res
      .status(400)
      .json({ error: 'username and password are required' });
  }

  return res.json({ success: true });
});

// POST /api/send-email -> forwards email and tracking number to Cloudflare
app.post('/api/send-email', async (req, res) => {
  try {
    const { email, trackingNumber } = req.body || {};

    if (typeof email !== 'string' || !email.trim() ||
        typeof trackingNumber !== 'string' || !trackingNumber.trim()) {
      return res
        .status(400)
        .json({ error: 'email and trackingNumber are required' });
    }

    const cfResp = await fetch(SENDGRID_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), trackingNumber: trackingNumber.trim() })
    });

    if (!cfResp.ok) {
      const text = await cfResp.text().catch(() => '');
      return res
        .status(cfResp.status)
        .json({ error: 'Cloudflare request failed', status: cfResp.status, body: text });
    }

    // Try to parse JSON response; if none, return empty object.
    const data = await cfResp.json().catch(() => ({}));
    return res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', details: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Email sender running on http://localhost:${PORT}`);
});

