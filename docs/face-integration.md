# Face verification integration — how to run end-to-end

This document describes how to run the face verification flow together with the existing Node server and React client.

Assumptions
- You have completed the `client/` and `server/` folders as you said.
- You are on Windows and will run the Face Detection Python service locally.

Steps
1. Start the Node server (server should already be configured):
   - From repo root:
     ```powershell
     cd "C:\Users\saman\Desktop\hackathon\server"
     npm install
     npm run dev # or npm start depending on your package.json
     ```
   - Ensure the server is responding on its configured port (usually 5000 or 3000). The React client will call `/api/auth/biometric-verify`.

2. Start the React client (if not already running):
   ```powershell
   cd "C:\Users\saman\Desktop\hackathon\client"
   npm install
   npm start
   ```
   Open http://localhost:3000 and go to `/login`.

3. Start the Face Detection Python service (in a separate terminal):
   ```powershell
   cd "C:\Users\saman\Desktop\hackathon\Face Detection"
   .\start_face_service.ps1
   ```
   This will create a `.venv` and run `facedetector.py` on port 8001. You should see logs and the `/health` endpoint available.

4. Use the web client
   - Open `/login`, switch to the "Face" tab and click "Open Camera".
   - The client will attach the stream from `http://127.0.0.1:8001/video_feed` and poll `/health`.
   - When the Python service detects a stable face it will set `login_successful: true` on `/health`.
   - The client will capture a deterministic hash, call the Node `/api/auth/biometric-verify`, receive a JWT, and the React app will automatically redirect the user based on role.

Troubleshooting
- Camera not opening:
  - Ensure the camera is not in use by another app.
  - Try changing the device index in `facedetector.py` or running the webcam at lower resolution.
- opencv-contrib install fails:
  - Use the pinned wheel `opencv-contrib-python==4.5.5.64` in Face Detection venv.
- Biometric verify returns 500:
  - Inspect Node server logs (server terminal) for `Biometric verification` logs and errors.
  - Inspect Face Detection logs (PowerShell) for face model errors.
- Frontend cannot reach face service:
  - Ensure the browser can access `http://127.0.0.1:8001/health`. CORS headers are set in `facedetector.py`.

If anything fails, collect the PowerShell output from the face service, the Node server logs, and the browser console + network request payload for `/api/auth/biometric-verify` and share them.
