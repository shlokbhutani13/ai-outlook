# Gmail AI Reply Extension

This project is a Chrome extension that generates AI-based email replies inside Gmail using a local Node.js backend.

## Features

- Adds an "AI Reply" button inside Gmail
- Generates a suggested reply for any opened email
- Displays the response in an editable popup
- Allows copying the generated reply

## Tech Stack

- JavaScript (Chrome Extension)
- Node.js
- Express

## Project Structure

ai-outlook/
- extension/
  - content.js
  - background.js
  - manifest.json
- app.js
- package.json

## Setup

1. Install dependencies:
   npm install

2. Start the backend server:
   node app.js

3. Load the extension:
   - Go to chrome://extensions/
   - Enable Developer Mode
   - Click "Load unpacked"
   - Select the extension folder

4. Open Gmail and click the "AI Reply" button

## Notes

- The backend runs on http://localhost:5051
- The current version returns a sample reply
- Backend must be running for the extension to work

## Author

Shlok Bhutani
https://github.com/shlokbhutani13