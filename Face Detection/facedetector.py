import cv2
import threading
import time
import os
import importlib.util
from flask import Flask, Response, jsonify, request
from flask_cors import CORS


class WebcamStream:
    def __init__(self, src=0):
        self.src = src
        self.video = None
        self.current_frame = None
        self.is_recording = False
        self._lock = threading.Lock()

        # Do not start immediately; caller controls lifecycle with start()
        self._started = False

    def _open_with_backends(self):
        """Try opening the camera with multiple Windows backends for reliability."""
        backends = [
            getattr(cv2, 'CAP_DSHOW', None),  # DirectShow (most reliable on Windows)
            getattr(cv2, 'CAP_MSMF', None),   # Media Foundation
            getattr(cv2, 'CAP_ANY', None),    # Fallback to any
        ]
        last_error = None
        for backend in backends:
            if backend is None:
                continue
            try:
                cap = cv2.VideoCapture(self.src, backend)
                # Apply some sane defaults
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
                cap.set(cv2.CAP_PROP_FPS, 30)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                if cap.isOpened():
                    # Warm up the sensor by grabbing a couple of frames
                    for _ in range(3):
                        cap.read()
                    return cap
                else:
                    last_error = f"Backend {backend} failed to open"
                    cap.release()
            except Exception as e:
                last_error = str(e)
        raise Exception(last_error or f"Could not open video source {self.src}")

    def init_camera(self):
        """Initialize webcam"""
        if self.video is not None:
            self.video.release()
        self.video = self._open_with_backends()

    def start(self):
        if self._started:
            return
        # Initialize camera and spawn capture thread
        if self.video is None or not self.video.isOpened():
            self.init_camera()
        self.is_recording = True
        self.thread = threading.Thread(target=self._capture_frames, daemon=True)
        self.thread.start()
        self._started = True

    def _capture_frames(self):
        """Background thread to continuously capture frames."""
        retry_count = 0
        max_retries = 3
        read_failures = 0

        while self.is_recording:
            if not self.video.isOpened():
                print("Video capture is not opened, attempting to reinitialize...")
                retry_count += 1
                if retry_count > max_retries:
                    print("Max retries reached, stopping capture")
                    self.is_recording = False
                    break
                try:
                    self.init_camera()
                    continue
                except Exception as e:
                    print(f"Failed to reinitialize camera: {str(e)}")
                    time.sleep(1)
                    continue

            success, frame = self.video.read()
            if success:
                with self._lock:
                    self.current_frame = frame
                retry_count = 0
                read_failures = 0
            else:
                print("Failed to grab frame")
                read_failures += 1
                if read_failures >= 10:
                    # Try to reinitialize the camera if consecutive failures occur
                    try:
                        self.init_camera()
                        read_failures = 0
                        continue
                    except Exception as e:
                        print(f"Reinitialization after read failures failed: {e}")
                time.sleep(0.1)

    def get_frame(self):
        """Return the latest frame captured."""
        with self._lock:
            if self.current_frame is None:
                return None
            return self.current_frame.copy()

    def release(self):
        """Stop recording and release resources."""
        self.is_recording = False
        if hasattr(self, 'thread') and self.thread.is_alive():
            self.thread.join(timeout=1.0)
        if hasattr(self, 'video') and self.video is not None:
            self.video.release()
        self._started = False


app = Flask(__name__)
CORS(app)

_stream = None
_last_faces = 0
_status_text = "Idle"
_login_successful = False
_latest_quality = 0.0

# Dynamically import FaceLoginSystem from the main python file (filename contains hyphen)
MODULE_PATH = os.path.join(os.path.dirname(__file__), 'Face-Iris_login_system.py')
spec = importlib.util.spec_from_file_location('face_login_module', MODULE_PATH)
face_login_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(face_login_module)
FaceLoginSystem = face_login_module.FaceLoginSystem
fls = FaceLoginSystem()


def _ensure_stream(src=0):
    global _stream
    if _stream is None:
        _stream = WebcamStream(src=src)
        _stream.start()
    elif not _stream._started:
        _stream.start()
    return _stream


def generate_frames():
    global _last_faces, _status_text, _login_successful, _latest_quality
    while True:
        if _stream is None or not _stream._started:
            time.sleep(0.05)
            continue
        frame = _stream.get_frame()
        if frame is None:
            time.sleep(0.01)
            continue
        frame = cv2.flip(frame, 1)

        # Detect faces using the same logic as the desktop script
        faces = fls.detect_faces_dnn(frame) if fls.use_dnn else fls.detect_faces_haar(frame)
        _last_faces = len(faces)
        current_time = time.time()

        if len(faces) > 0:
            if fls.use_dnn:
                face = max(faces, key=lambda x: x[4])
            else:
                face = max(faces, key=lambda x: x[2] * x[3])

            x, y, w, h, confidence = face
            face_rect = (x, y, w, h)
            face_roi = frame[y:y+h, x:x+w]

            quality_score = fls.calculate_face_quality(face_roi)
            _latest_quality = float(quality_score)
            prediction_info = fls.predict_face(face_roi) if fls.is_model_trained else None

            fls.draw_face_info(frame, face_rect, confidence, quality_score, prediction_info)

            if not fls.face_detected:
                fls.face_detected = True
                fls.detection_start_time = current_time
            elapsed_time = current_time - (fls.detection_start_time or current_time)
            is_stable = fls.is_face_stable(face_rect)

            if len(fls.training_data) < 20:
                fls.face_data.append({
                    'face_roi': face_roi.copy(),
                    'face_rect': face_rect,
                    'timestamp': current_time,
                    'quality_score': quality_score
                })
                if quality_score > 0.15:
                    fls.prepare_training_data(face_roi)

            if len(fls.training_data) >= 3 and not fls.is_model_trained:
                frame_count = getattr(fls, 'frame_count', 0) + 1
                setattr(fls, 'frame_count', frame_count)
                if frame_count % 10 == 0:
                    fls.train_and_save_model()

            if (elapsed_time >= fls.required_detection_time and not fls.login_successful and quality_score > 0.2):
                fls.login_successful = True
                _login_successful = True
                best_data = max(fls.face_data, key=lambda x: x['quality_score']) if fls.face_data else {
                    'face_roi': face_roi, 'face_rect': face_rect, 'quality_score': quality_score
                }
                fls.save_user_data(best_data['face_roi'], best_data['face_rect'])
                if len(fls.training_data) >= 1:
                    while len(fls.training_data) < 5:
                        fls.prepare_training_data(best_data['face_roi'])
                    fls.train_and_save_model()
                else:
                    for _ in range(5):
                        fls.prepare_training_data(best_data['face_roi'])
                    fls.train_and_save_model()

            fls.draw_login_status(frame, elapsed_time, fls.required_detection_time)
            _status_text = 'Login Successful!' if fls.login_successful else ('FACE STABLE — Scanning...' if is_stable else 'FACE DETECTED — Hold Still')
        else:
            fls.face_detected = False
            fls.detection_start_time = None
            fls.stable_frames = 0
            fls.draw_login_status(frame, 0, fls.required_detection_time)
            _status_text = 'Looking for Face...'
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            continue
        jpg = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + jpg + b'\r\n')


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'stream_active': _stream._started if _stream else False,
        'faces': _last_faces,
        'status_text': _status_text,
        'login_successful': _login_successful,
        'quality': _latest_quality
    })


@app.route('/start', methods=['POST'])
def start():
    src = int(request.args.get('src', '0'))
    _ensure_stream(src)
    return jsonify({'message': 'camera started'})


@app.route('/stop', methods=['POST'])
def stop():
    global _stream
    if _stream is not None:
        _stream.release()
    return jsonify({'message': 'camera stopped'})


@app.route('/video_feed')
def video_feed():
    if _stream is None:
        _ensure_stream()
    resp = Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
    # Ensure CORS for canvas readback in the client and disable caching
    try:
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        resp.headers['Pragma'] = 'no-cache'
        resp.headers['Expires'] = '0'
    except Exception:
        pass
    return resp


@app.route('/stream.mjpg')
def mjpeg_stream():
    # Alternate path to avoid ad-blockers or extensions that block 'video' keywords
    if _stream is None:
        _ensure_stream()
    resp = Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
    try:
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        resp.headers['Pragma'] = 'no-cache'
        resp.headers['Expires'] = '0'
    except Exception:
        pass
    return resp


@app.route('/snapshot.jpg')
def snapshot_jpg():
    """Return a single processed JPEG frame (overlay included). Useful when MJPEG is blocked."""
    global _last_faces, _status_text, _login_successful, _latest_quality
    if _stream is None:
        _ensure_stream()
    # Wait briefly for a frame
    frame = None
    for _ in range(10):
        frame = _stream.get_frame()
        if frame is not None:
            break
        time.sleep(0.01)
    if frame is None:
        return Response(status=204)

    frame = cv2.flip(frame, 1)

    # Perform one-shot processing similar to the streaming path
    faces = fls.detect_faces_dnn(frame) if fls.use_dnn else fls.detect_faces_haar(frame)
    _last_faces = len(faces)
    current_time = time.time()

    if len(faces) > 0:
        face = max(faces, key=(lambda x: x[4]) if fls.use_dnn else (lambda x: x[2] * x[3]))
        x, y, w, h, confidence = face
        face_rect = (x, y, w, h)
        face_roi = frame[y:y+h, x:x+w]
        quality_score = fls.calculate_face_quality(face_roi)
        _latest_quality = float(quality_score)
        prediction_info = fls.predict_face(face_roi) if fls.is_model_trained else None
        fls.draw_face_info(frame, face_rect, confidence, quality_score, prediction_info)
        if not fls.face_detected:
            fls.face_detected = True
            fls.detection_start_time = current_time
        elapsed_time = current_time - (fls.detection_start_time or current_time)
        is_stable = fls.is_face_stable(face_rect)
        fls.draw_login_status(frame, elapsed_time, fls.required_detection_time)
        _status_text = 'Login Successful!' if fls.login_successful else ('FACE STABLE — Scanning...' if is_stable else 'FACE DETECTED — Hold Still')
    else:
        fls.face_detected = False
        fls.detection_start_time = None
        fls.stable_frames = 0
        fls.draw_login_status(frame, 0, fls.required_detection_time)
        _status_text = 'Looking for Face...'

    ret, buffer = cv2.imencode('.jpg', frame)
    if not ret:
        return Response(status=500)
    jpg = buffer.tobytes()
    resp = Response(jpg, mimetype='image/jpeg')
    try:
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        resp.headers['Pragma'] = 'no-cache'
        resp.headers['Expires'] = '0'
    except Exception:
        pass
    return resp


def main():
    app.run(host='0.0.0.0', port=8001, debug=False)


if __name__ == "__main__":
    main()
