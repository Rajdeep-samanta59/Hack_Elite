# Face Detection service (local)

This folder contains the Python face-detection service used by the frontend Login page to stream camera frames and signal when a face is verified.

Files of interest
- `facedetector.py` — Flask app and webcam capture loop. Serves `/video_feed`, `/stream.mjpg`, `/snapshot.jpg`, `/health`, `/start`, `/stop` on port 8001 by default.
- `Face-Iris_login_system.py` — core face-detection/login logic (imported by `facedetector.py`).
- `trained_models/` — contains LBPH `.yml` face recognizer models used by the Python code.
- `haarcascade_frontalface_default.xml` — Haar cascade used by the detector.
- `requirements.txt` — Python dependencies.

Quick start (Windows PowerShell)
1. Open PowerShell and change to this folder:
   ```powershell
   cd "C:\Users\saman\Desktop\hackathon\Face Detection"
   ```
2. Run the helper script (it will create a virtualenv and install dependencies if required):
   ```powershell
   .\start_face_service.ps1
   ```
   The script uses the venv Python binary directly, so it doesn't require modifying your PowerShell execution policy.

Manual steps (if you prefer to run commands yourself)
1. Create a venv and install requirements
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\python.exe -m pip install --upgrade pip
   .\.venv\Scripts\python.exe -m pip install -r .\requirements.txt
   # If opencv-contrib install fails, try a pinned compatible wheel:
   .\.venv\Scripts\python.exe -m pip install opencv-contrib-python==4.5.5.64
   ```
2. Run the service
   ```powershell
   .\.venv\Scripts\python.exe facedetector.py
   ```

How the login flow works (end-to-end)
- Open the React app and navigate to `/login`.
- Switch to the "Face" tab and click "Open Camera". The frontend will call `http://127.0.0.1:8001/start` and attach the stream from `/video_feed` or `/stream.mjpg`.
- The Python service analyzes the video frames and when it determines the face is stable and verified it sets `login_successful` in its `/health` output.
- The frontend polls `/health` and when it sees `login_successful: true` it captures a snapshot, calls your Node backend `/api/auth/biometric-verify` (via `authAPI.biometricVerify`) and the server responds with a JWT token and user object.
- The React `AuthContext` saves the token and automatically redirects the user based on role (`/patient/dashboard`, `/doctor/portal`, or `/admin`).

Troubleshooting
- "Cannot open camera" or `cv2` errors:
  - Ensure the camera is free (no other app using it). Try rebooting or changing camera index (edit `facedetector.py` to use src=1 etc).
  - If `opencv-contrib-python` fails to install, install a known-good version: `opencv-contrib-python==4.5.5.64`.
  - On Windows prefer the DirectShow backend which `facedetector.py` already tries to use.

- PowerShell ExecutionPolicy errors when running other scripts:
  - This helper calls the venv Python binary directly; you should not need to change ExecutionPolicy. If you do, set it temporarily:
    ```powershell
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    ```

- Frontend can't attach the stream or `video_feed` returns 404:
  - Ensure the Python service is running on `http://127.0.0.1:8001` and that your browser can reach that URL.
  - Check logs in the PowerShell window where you started the service.

- Biometric verify returns 500 or fails:
  - Check the Node server logs for `/api/auth/biometric-verify` requests.
  - Confirm the client is sending `{ biometricTemplate, deviceFingerprint }`. The client captures a deterministic hash from the displayed frame and sends it.

Testing endpoints
- Health check (should return JSON)
  ```powershell
  curl http://127.0.0.1:8001/health
  ```

- Snapshot (single processed frame)
  ```powershell
  curl http://127.0.0.1:8001/snapshot.jpg --output snapshot.jpg
  ```

If something does not work for you, tell me the exact error printed in the PowerShell window and the browser console/network tab. I can then adjust the scripts or help patch the client/server to match your environment.
