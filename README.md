# SendGrid Email Sender

This repository contains a minimal Node.js/Express application that submits an
email address and tracking number to a Cloudflare hosted endpoint. The endpoint
is expected to send a SendGrid template email using the provided values.

## Setup

1. Copy `.env.example` to `.env` and set `SENDGRID_ENDPOINT` to your Cloudflare
   Worker URL that triggers the SendGrid template.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. Visit `http://localhost:3000` to use the form.

## Notes

The server acts as a thin proxy so the browser never calls the Cloudflare
endpoint directly. It validates inputs and forwards them as JSON to the
configured `SENDGRID_ENDPOINT`.

