# Hack_Elite

A minimal README for the Hack_Elite project.

Overview
- Web app with React client, Node.js server, and a local Python face-detection service.

Prerequisites
- Node.js & npm
- Python 3.8+

Quick start
1. Start the server
   ```powershell
   cd server
   npm install
   npm run dev # or npm start
   ```
2. Start the client
   ```powershell
   cd client
   npm install
   npm start
   ```
3. Start the face detection service (Windows)
   ```powershell
   cd "Face Detection"
   .\start_face_service.ps1
   ```

Where to look
- `client/` — React frontend
- `server/` — Node/Express backend
- `Face Detection/` — Python Flask face detection and models

If something fails, check the terminal logs for the service you just started (server, client, or face service).
