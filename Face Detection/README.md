# Face Detection — detailed README

This folder contains the local Python face-detection service used by the project. It captures webcam frames, runs face detection/recognition, and exposes simple HTTP endpoints that the React frontend uses during login.

Contents (important files)
- `facedetector.py` — Flask app, webcam capture loop and endpoints (`/video_feed`, `/stream.mjpg`, `/snapshot.jpg`, `/health`, `/start`, `/stop`).
- `Face-Iris_login_system.py` — face detection / login logic used by `facedetector.py`.
- `trained_models/` — LBPH `.yml` models produced by the training logic.
- `haarcascade_frontalface_default.xml` — Haar cascade for face detection.
- `requirements.txt` — Python dependencies.
- `start_face_service.ps1` — Windows PowerShell helper to create a venv, install deps and run `facedetector.py`.

Summary of what this service does
- Streams processed frames over MJPEG (or snapshot) so the frontend can preview detection.
- Exposes `/health` which reports whether a face was found and whether the face-login criteria are met (`login_successful`).
- When `login_successful` becomes true the frontend captures the displayed image, creates a deterministic template, and calls the Node backend `/api/auth/biometric-verify`.

Quick start (Windows PowerShell — recommended)
1. Open PowerShell and change to this folder:
```powershell
cd "C:\Users\saman\Desktop\hackathon\Face Detection"
```
2. Run the helper script (creates `.venv`, installs packages, runs the server):
```powershell
.\start_face_service.ps1
```

Manual start (Windows PowerShell)
1. Create and activate a virtual environment and install requirements:
```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r .\requirements.txt
# If opencv-contrib fails, try a known working version:
.\.venv\Scripts\python.exe -m pip install opencv-contrib-python==4.5.5.64
```
2. Run the service:
```powershell
.\.venv\Scripts\python.exe facedetector.py
```

Manual start (macOS / Linux)
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python facedetector.py
```

HTTP endpoints (what they do)
- `GET /health` — JSON status object: { status, stream_active, faces, status_text, login_successful, quality }
- `POST /start` — start the webcam capture thread (optional `?src=0` to change camera index)
- `POST /stop` — stop the webcam capture thread and release the camera
- `GET /video_feed` — multipart MJPEG stream (suitable for <img src="/video_feed"> or attaching to an <img> element)
- `GET /stream.mjpg` — alternate MJPEG path (helps avoid some blockers)
- `GET /snapshot.jpg` — single processed JPEG frame (useful when MJPEG streams are blocked)

How the frontend uses this service
- The React client opens `/video_feed` or `/stream.mjpg` into an `<img>` tag when using backend streaming mode.
- The client polls `/health` (every ~400ms) and when `login_successful: true` it:
  1. Captures the currently displayed frame on the client and derives a deterministic biometric template (SHA-256 over a downscaled canvas)
  2. Posts `{ biometricTemplate, deviceFingerprint? }` to your Node server at `/api/auth/biometric-verify`
  3. On successful response (server returns `{ user, token }`) the React `AuthContext` stores the token and navigates to the appropriate page.

Quick checks and testing endpoints
- Health check (PowerShell):
```powershell
Invoke-RestMethod http://127.0.0.1:8001/health | ConvertTo-Json -Depth 5
```
- Snapshot (PowerShell):
```powershell
Invoke-WebRequest http://127.0.0.1:8001/snapshot.jpg -OutFile snapshot.jpg
```
- Open stream in browser: `http://127.0.0.1:8001/video_feed` or `http://127.0.0.1:8001/stream.mjpg`

Common problems & fixes

1) Cannot import/ use OpenCV / `cv2` problems
- Symptom: Import errors, missing `cv2.face`, or `CascadeClassifier` not found.
- Quick check (run in the same Python env you're using for the service):
```powershell
.\.venv\Scripts\python.exe - <<'PY'
import cv2
print('cv2:', getattr(cv2,'__file__','<no-file>'))
print('version:', getattr(cv2,'__version__','<no-version>'))
print('has face submodule:', hasattr(cv2, 'face'))
print('has CascadeClassifier:', hasattr(cv2, 'CascadeClassifier'))
PY
```
- If the package is wrong or build failed, reinstall a known wheel:
```powershell
.\.venv\Scripts\python.exe -m pip install --upgrade --force-reinstall opencv-contrib-python==4.5.5.64
```

2) Camera cannot be opened or is blank
- Cause: camera used by another app, wrong device index, or permission denied.
- Fixes:
  - Close other apps using the camera.
  - Try changing camera index by calling the start endpoint with `?src=1` or editing the default in `facedetector.py`.
  - Restart the machine or test with a simple webcam capture script.

3) Browser cannot attach MJPEG stream or shows CORS errors
- Ensure the Python service is running and accessible at `http://127.0.0.1:8001`.
- Check that headers for CORS are present (the app sets Access-Control-Allow-Origin: * on responses).

4) The frontend never receives `login_successful`
- Inspect the face service console (where `facedetector.py` is running) for warnings/errors.
- Manually call `/health` and observe `faces`, `status_text`, and `login_successful`.
- If detection appears to work visually (overlay is drawn in snapshot) but `login_successful` is never true, tune detection thresholds inside `Face-Iris_login_system.py` (required_detection_time, quality thresholds) or increase camera lighting.

Useful tweaks
- Change camera index (when start service):
  - Use `POST /start?src=1` to try the second camera.
- Run the service with more debug logs: edit `facedetector.py` and call `app.run(debug=True)` temporarily.
- Lower FPS / resolution if your camera is slow: `WebcamStream._open_with_backends` sets width/height and fps — reduce those values to 640x360 / 15 fps.

How to stop the service
- Press Ctrl+C in the terminal where the Python process is running. Or call `POST /stop` to ask the server to release the camera.

Logs and where to look
- The Python service prints logs to the terminal where you ran it (start_face_service.ps1 calls the Python directly). Look there for stack traces and debugging prints.
- The client (React) prints errors to the browser console and network tab — inspect `/health` polling and the outgoing `/api/auth/biometric-verify` POST.
- The Node backend prints its own logs; watch it for requests to `/api/auth/biometric-verify` and any errors.

If you still have issues
- Copy and paste the exact error output from:
  - PowerShell terminal running `facedetector.py`
  - Browser console (any network request failures)
  - Node server logs for `/api/auth/biometric-verify`
- With that I can suggest targeted fixes.

Short troubleshooting checklist (one-liner commands)
- Check face service health:
```powershell
Invoke-RestMethod http://127.0.0.1:8001/health
```
- Fetch one snapshot:
```powershell
Invoke-WebRequest http://127.0.0.1:8001/snapshot.jpg -OutFile snapshot.jpg
```
- Reinstall opencv wheel (if cv2 problems):
```powershell
.\.venv\Scripts\python.exe -m pip install --upgrade --force-reinstall opencv-contrib-python==4.5.5.64
```

More help
- If you want, I can run the start script here in the workspace terminal and share logs — say `start face service` and I'll run it and report results. If you prefer to run locally, run the `start_face_service.ps1` script and paste the terminal output if errors appear.

---
README last updated: Aug 21, 2025

