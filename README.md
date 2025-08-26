# medicalCRM

This repository provides a minimal Node.js/Express proxy and browser UI for looking up an IntakeQ client profile by `ClientID`.

## Setup

1. Copy `.env.example` to `.env` and set your `INTAKEQ_API_KEY`.
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Visit `http://localhost:3000` and enter a numeric `ClientID`.

## Notes

The proxy protects the IntakeQ API key by keeping it on the server and avoids CORS issues when calling the IntakeQ API from the browser.
