### Importing necessary libraries
## Instead of mediapipe we will be using opencv haarcascades and DNN model
import cv2
import numpy as np
#import mediapipe as mp
#import torch 
import time
import os
import json
from datetime import datetime
import math

## Initiallizing mediapipe for creating a face mesh..

class FaceLoginSystem:
    def __init__(self):

        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        self.profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')

        ## DNN model for face detection
        self.use_dnn = True
        try:
            # Load DNN model for face detection
            self.net = cv2.dnn.readNetFromTensorflow(
                'opencv_face_detector_uint8.pb',
                'opencv_face_detector.pbtxt'
            )
        except:
            print("DNN model not found, using Haar cascades")
            self.use_dnn = False
        
        # Feature detection
        self.orb = cv2.ORB_create(nfeatures=500)
        self.sift = None
        try:
            self.sift = cv2.SIFT_create()
        except:
            print("SIFT not available, using ORB only")
        
        # System parameters
        self.detection_start_time = None
        self.required_detection_time = 5.0  # 5 seconds
        self.face_detected = False
        self.login_successful = False
        self.face_data = []
        self.user_data_dir = "user_face_data"
        self.images_dir = "face_images"
        self.models_dir = "trained_models"  # New directory for saved models
        
        # Quality control parameters
        self.stability_threshold = 50  # pixels (increased for better stability)
        self.previous_face_center = None
        self.stable_frames = 0
        self.required_stable_frames = 10  # reduced requirement
        self.min_face_size = 80  # reduced minimum size
        
        # Face recognition parameters
        self.face_recognizer = cv2.face.LBPHFaceRecognizer_create()
        self.is_model_trained = False
        self.training_data = []  # Store training data
        self.training_labels = []  # Store training labels
        self.user_id = 1  # Default user ID
        
        # Create directories
        for directory in [self.user_data_dir, self.images_dir, self.models_dir]:
            if not os.path.exists(directory):
                os.makedirs(directory)

    def detect_faces_dnn(self, frame):
        """Detect faces using DNN model"""
        if not self.use_dnn:
            return []
        
        h, w = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(frame, 1.0, (300, 300), [104, 117, 123])
        self.net.setInput(blob)
        detections = self.net.forward()
        
        faces = []
        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            if confidence > 0.5:
                x1 = int(detections[0, 0, i, 3] * w)
                y1 = int(detections[0, 0, i, 4] * h)
                x2 = int(detections[0, 0, i, 5] * w)
                y2 = int(detections[0, 0, i, 6] * h)
                faces.append((x1, y1, x2-x1, y2-y1, confidence))
        
        return faces

    def detect_faces_haar(self, frame):
        """Detect faces using Haar cascades"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect frontal faces with more lenient parameters
        faces = self.face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.05,  # Smaller scale factor for better detection
            minNeighbors=3,    # Reduced neighbors for more detections
            minSize=(self.min_face_size, self.min_face_size),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        
        # If no frontal faces, try profile with more lenient parameters
        if len(faces) == 0:
            faces = self.profile_cascade.detectMultiScale(
                gray, 
                scaleFactor=1.05, 
                minNeighbors=3, 
                minSize=(self.min_face_size, self.min_face_size),
                flags=cv2.CASCADE_SCALE_IMAGE
            )
        
        # Convert to format: (x, y, w, h, confidence)
        face_list = []
        for (x, y, w, h) in faces:
            face_list.append((x, y, w, h, 1.0))  # Haar doesn't provide confidence
        
        return face_list

    def detect_eyes(self, face_roi):
        """Detect eyes in face region"""
        gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        eyes = self.eye_cascade.detectMultiScale(
            gray_face,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(20, 20)
        )
        return eyes

    def extract_face_features(self, face_roi):
        """Extract features from face region"""
        gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        
        features = {
            'orb_features': None,
            'sift_features': None,
            'lbp_histogram': None,
            'geometric_features': None
        }
        
        # ORB features
        try:
            keypoints, descriptors = self.orb.detectAndCompute(gray_face, None)
            if descriptors is not None:
                features['orb_features'] = descriptors.tolist()
        except Exception as e:
            print(f"ORB feature extraction failed: {e}")
            features['orb_features'] = None
        
        # SIFT features (if available)
        if self.sift is not None:
            try:
                keypoints, descriptors = self.sift.detectAndCompute(gray_face, None)
                if descriptors is not None:
                    features['sift_features'] = descriptors.tolist()
            except Exception as e:
                print(f"SIFT feature extraction failed: {e}")
                features['sift_features'] = None
        
        # LBP histogram
        try:
            lbp = self.calculate_lbp(gray_face)
            hist, _ = np.histogram(lbp.ravel(), bins=256, range=[0, 256])
            features['lbp_histogram'] = hist.tolist()
        except Exception as e:
            print(f"LBP calculation failed: {e}")
            features['lbp_histogram'] = None
        
        # Geometric features
        features['geometric_features'] = self.calculate_geometric_features(face_roi)
        
        return features

    def calculate_lbp(self, image, radius=1, n_points=8):
        """Calculate Local Binary Pattern"""
        rows, cols = image.shape
        lbp = np.zeros((rows, cols), dtype=np.uint8)
        
        for i in range(radius, rows - radius):
            for j in range(radius, cols - radius):
                center = image[i, j]
                binary_string = ""
                
                for k in range(n_points):
                    angle = 2 * np.pi * k / n_points
                    x = int(i + radius * np.cos(angle))
                    y = int(j + radius * np.sin(angle))
                    
                    if image[x, y] >= center:
                        binary_string += "1"
                    else:
                        binary_string += "0"
                
                lbp[i, j] = int(binary_string, 2)
        
        return lbp

    def convert_to_serializable(self, obj):
        """Convert numpy types to Python native types for JSON serialization"""
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, dict):
            return {key: self.convert_to_serializable(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self.convert_to_serializable(item) for item in obj]
        else:
            return obj

    def calculate_geometric_features(self, face_roi):
        """Calculate geometric features from face"""
        gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        h, w = gray_face.shape
        
        features = {
            'face_width': int(w),
            'face_height': int(h),
            'aspect_ratio': float(w / h if h > 0 else 0),
            'area': int(w * h),
        }
        
        # Detect eyes for geometric calculations
        eyes = self.detect_eyes(face_roi)
        if len(eyes) >= 2:
            # Sort eyes by x coordinate
            eyes = sorted(eyes, key=lambda x: x[0])
            left_eye = eyes[0]
            right_eye = eyes[1] if len(eyes) > 1 else eyes[0]
            
            # Eye distance
            eye_distance = math.sqrt(
                (right_eye[0] - left_eye[0])**2 + 
                (right_eye[1] - left_eye[1])**2
            )
            features['eye_distance'] = float(eye_distance)
            features['eye_face_ratio'] = float(eye_distance / w if w > 0 else 0)
        
        return features

    def prepare_training_data(self, face_roi):
        """Prepare face data for training the LBPH recognizer"""
        try:
            gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
            # Resize to standard size for consistent training
            gray_face = cv2.resize(gray_face, (200, 200))
            
            self.training_data.append(gray_face)
            self.training_labels.append(self.user_id)
            
            print(f"Added training sample {len(self.training_data)} for user {self.user_id}")
            return True
        except Exception as e:
            print(f"Error preparing training data: {e}")
            return False

    def save_simple_model(self):
        """Save a simple model even if training fails"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Create a basic recognizer and save it
            simple_recognizer = cv2.face.LBPHFaceRecognizer_create()
            
            if len(self.training_data) > 0:
                training_data_array = np.array(self.training_data)
                training_labels_array = np.array(self.training_labels, dtype=np.int32)
                simple_recognizer.train(training_data_array, training_labels_array)
            
            # Save with both timestamped and simple names
            model_path1 = os.path.join(self.models_dir, f"simple_model_{timestamp}.yml")
            model_path2 = os.path.join(self.models_dir, "latest_face_model.yml")
            
            simple_recognizer.write(model_path1)
            simple_recognizer.write(model_path2)
            
            print(f"Simple model saved to: {model_path1}")
            print(f"Latest model saved to: {model_path2}")
            
            return True
        except Exception as e:
            print(f"Failed to save the model: {e}")
            return False

    def train_and_save_model(self):
        """Train the LBPH face recognizer and save the model"""
        print(f"DEBUG: Current training data length: {len(self.training_data)}")
        print(f"DEBUG: Training labels length: {len(self.training_labels)}")
        
        if len(self.training_data) < 1:  # Accept even 1 sample
            print(f"No training data available. Have {len(self.training_data)} samples")
            return False
        
        try:
            print("Training face recognition model...")
            print(f"Training with {len(self.training_data)} samples for user {self.user_id}")
            
            # Ensure we have proper numpy arrays
            training_data_array = np.array(self.training_data)
            training_labels_array = np.array(self.training_labels, dtype=np.int32)
            
            print(f"DEBUG: Training data shape: {training_data_array.shape}")
            print(f"DEBUG: Training labels shape: {training_labels_array.shape}")
            
            # Create a NEW recognizer for training
            new_recognizer = cv2.face.LBPHFaceRecognizer_create()
            
            # Train the LBPH recognizer
            new_recognizer.train(training_data_array, training_labels_array)
            self.is_model_trained = True
            print("Model training completed successfully!")
            
            # Save the trained model
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            model_filename = f"face_recognizer_model_{timestamp}.yml"
            model_path = os.path.join(self.models_dir, model_filename)
            
            print(f"DEBUG: Attempting to save model to: {model_path}")
            print(f"DEBUG: Models directory exists: {os.path.exists(self.models_dir)}")
            
            # Ensure the directory exists
            os.makedirs(self.models_dir, exist_ok=True)
            
            # Save the model using OpenCV's write method
            new_recognizer.write(model_path)
            
            # Verify the file was created
            if os.path.exists(model_path):
                file_size = os.path.getsize(model_path)
                print(f"Model file created successfully: {model_path} (Size: {file_size} bytes)")
            else:
                print(f"Model file not created: {model_path}")
                return False
            
            # Also save training metadata
            metadata = {
                'timestamp': timestamp,
                'model_path': model_path,
                'model_filename': model_filename,
                'training_samples': len(self.training_data),
                'user_id': self.user_id,
                'model_type': 'LBPH_Face_Recognizer',
                'training_data_shape': str(training_data_array.shape),
                'labels_shape': str(training_labels_array.shape)
            }
            
            metadata_path = os.path.join(self.models_dir, f"model_metadata_{timestamp}.json")
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            print(f"Model successfully saved to: {model_path}")
            print(f"Model metadata saved to: {metadata_path}")
            print(f"Training completed with {len(self.training_data)} samples")
            
            # Also save a backup with a simple name for Flask integration
            simple_model_path = os.path.join(self.models_dir, "latest_face_model.yml")
            new_recognizer.write(simple_model_path)
            print(f"Saving the latest model: {simple_model_path}")
            
            # Update the main recognizer
            self.face_recognizer = new_recognizer
            
            return True
            
        except Exception as e:
            print(f"Error in saving model: {e}")
            import traceback
            traceback.print_exc()
            return False

    def load_model(self, model_path):
        """Load a pre-trained model"""
        try:
            if os.path.exists(model_path):
                self.face_recognizer.read(model_path)
                self.is_model_trained = True
                print(f"Model loaded from: {model_path}")
                return True
            else:
                print(f"Model file not found: {model_path}")
                return False
        except Exception as e:
            print(f"Error loading model: {e}")
            return False

    def predict_face(self, face_roi):
        """Predict face using trained model"""
        if not self.is_model_trained:
            return None, 0
        
        try:
            gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
            gray_face = cv2.resize(gray_face, (200, 200))
            
            label, confidence = self.face_recognizer.predict(gray_face)
            return label, confidence
        except Exception as e:
            print(f"Error in face prediction: {e}")
            return None, 0

    def is_face_stable(self, face_rect):
        """Check if face position is stable"""
        x, y, w, h = face_rect[:4]
        current_center = (x + w//2, y + h//2)
        
        if self.previous_face_center is None:
            self.previous_face_center = current_center
            self.stable_frames = 1  # Start counting immediately
            return True  # Consider first detection as stable
        
        # Calculate distance from previous position
        distance = math.sqrt(
            (current_center[0] - self.previous_face_center[0])**2 +
            (current_center[1] - self.previous_face_center[1])**2
        )
        
        self.previous_face_center = current_center
        
        if distance < self.stability_threshold:
            self.stable_frames += 1
        else:
            self.stable_frames = max(0, self.stable_frames - 2)  # Gradual decrease instead of reset
        
        return self.stable_frames >= self.required_stable_frames

    def calculate_face_quality(self, face_roi):
        """Calculate quality score of the face image"""
        gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        
        # Sharpness (Laplacian variance)
        sharpness = cv2.Laplacian(gray_face, cv2.CV_64F).var()
        
        # Brightness (mean intensity)
        brightness = np.mean(gray_face)
        
        # Contrast (standard deviation)
        contrast = np.std(gray_face)
        
        # Normalize scores
        sharpness_score = min(sharpness / 500.0, 1.0)  # Normalize to 0-1
        brightness_score = 1.0 - abs(brightness - 128) / 128.0  # Optimal around 128
        contrast_score = min(contrast / 64.0, 1.0)  # Normalize to 0-1
        
        # Combined quality score
        quality_score = (sharpness_score + brightness_score + contrast_score) / 3.0
        return quality_score

    def save_user_data(self, face_roi, face_rect):
        """Save user face data to JSON file and face image to images folder"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save face image to images folder
        face_image_filename = f'face_snapshot_{timestamp}.jpg'
        face_image_path = os.path.join(self.images_dir, face_image_filename)
        
        # Ensure face image is saved successfully
        success = cv2.imwrite(face_image_path, face_roi)
        if not success:
            print(f"Failed to save face image to {face_image_path}")
            return None
        
        # Create JSON file in user_data folder
        json_filename = f'user_face_{timestamp}.json'
        json_filepath = os.path.join(self.user_data_dir, json_filename)
        
        # Extract and convert features to serializable format
        try:
            features = self.extract_face_features(face_roi)
            quality_score = self.calculate_face_quality(face_roi)
            
            # Convert all data to serializable format
            user_data = {
                'timestamp': timestamp,
                'face_image_path': face_image_path,
                'face_image_filename': face_image_filename,
                'face_rectangle': {
                    'x': int(face_rect[0]),
                    'y': int(face_rect[1]),
                    'width': int(face_rect[2]),
                    'height': int(face_rect[3])
                },
                'features': self.convert_to_serializable(features),
                'quality_score': float(quality_score),
                'stability_frames': int(self.stable_frames)
            }
            
            # Save JSON file
            with open(json_filepath, 'w') as f:
                json.dump(user_data, f, indent=2)
            
            print(f"Face snapshots saved to: {face_image_path}")
            print(f"Face data saved to: {json_filepath}")
            print(f"Quality score: {quality_score:.2f}")
            return json_filepath
            
        except Exception as e:
            print(f"Error saving user data: {e}")
            # Still try to save just the image info
            try:
                basic_data = {
                    'timestamp': timestamp,
                    'face_image_path': face_image_path,
                    'face_image_filename': face_image_filename,
                    'face_rectangle': {
                        'x': int(face_rect[0]),
                        'y': int(face_rect[1]),
                        'width': int(face_rect[2]),
                        'height': int(face_rect[3])
                    },
                    'error': str(e)
                }
                
                with open(json_filepath, 'w') as f:
                    json.dump(basic_data, f, indent=2)
                    
                print(f"✓ Basic data saved despite error: {json_filepath}")
                return json_filepath
            except Exception as e2:
                print(f"Failed to save even basic data: {e2}")
                return None

    def draw_face_info(self, frame, face_rect, confidence, quality_score=None, prediction_info=None):
        """Draw face detection information"""
        x, y, w, h = face_rect[:4]
        
        # Draw face rectangle
        color = (0, 255, 0) if self.stable_frames >= self.required_stable_frames else (0, 255, 255)
        cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
        
        # Draw confidence
        cv2.putText(frame, f'Conf: {confidence:.2f}', 
                   (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        
        # Draw quality score if available
        if quality_score is not None:
            cv2.putText(frame, f'Quality: {quality_score:.2f}', 
                       (x, y + h + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        
        # Draw prediction info if available
        if prediction_info and self.is_model_trained:
            label, pred_confidence = prediction_info
            if label is not None:
                cv2.putText(frame, f'User: {label} ({pred_confidence:.1f})', 
                           (x, y + h + 40), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 255), 2)
        
        # Draw eyes
        face_roi = frame[y:y+h, x:x+w]
        eyes = self.detect_eyes(face_roi)
        for (ex, ey, ew, eh) in eyes:
            cv2.rectangle(frame, (x + ex, y + ey), (x + ex + ew, y + ey + eh), (255, 0, 0), 2)

    def draw_login_status(self, frame, elapsed_time, total_time):
        """Draw login progress and status"""
        height, width = frame.shape[:2]
        
        # Progress bar
        bar_width = int(width * 0.6)
        bar_height = 20
        bar_x = int(width * 0.2)
        bar_y = height - 60
        
        # Background bar
        cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), 
                     (50, 50, 50), -1)
        
        # Progress fill
        progress = min(elapsed_time / total_time, 1.0)
        fill_width = int(bar_width * progress)
        color = (0, 255, 0) if progress >= 1.0 else (0, 255, 255)
        cv2.rectangle(frame, (bar_x, bar_y), (bar_x + fill_width, bar_y + bar_height), 
                     color, -1)
        
        # Progress text
        progress_text = f"Login Progress: {elapsed_time:.1f}/{total_time:.1f}s"
        cv2.putText(frame, progress_text, (bar_x, bar_y - 10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Stability indicator
        stability_text = f"Stability: {self.stable_frames}/{self.required_stable_frames}"
        cv2.putText(frame, stability_text, (bar_x, bar_y - 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Training samples indicator
        training_text = f"Training samples: {len(self.training_data)}"
        cv2.putText(frame, training_text, (bar_x, bar_y - 50), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Status text
        if self.login_successful:
            status_text = "Login Successful!"
            status_color = (0, 255, 0)
            # Draw success icon
            center = (width - 80, 80)
            cv2.circle(frame, center, 30, (0, 255, 0), 3)
            cv2.putText(frame, "✓", (center[0] - 15, center[1] + 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 0), 3)
        elif self.face_detected:
            if self.stable_frames >= self.required_stable_frames:
                status_text = "FACE STABLE - Scanning..."
                status_color = (0, 255, 0)
            else:
                status_text = "FACE DETECTED - Hold Still"
                status_color = (0, 255, 255)
        else:
            status_text = "Looking for Face..."
            status_color = (0, 0, 255)
        
        cv2.putText(frame, status_text, (20, 40), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, status_color, 2)

    def _open_camera(self, index: int = 0):
        """Open camera with robust backend fallbacks (Windows)."""
        backends = [
            getattr(cv2, 'CAP_DSHOW', None),
            getattr(cv2, 'CAP_MSMF', None),
            getattr(cv2, 'CAP_ANY', None),
        ]
        for backend in backends:
            if backend is None:
                continue
            cap = cv2.VideoCapture(index, backend)
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
            cap.set(cv2.CAP_PROP_FPS, 30)
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            if cap.isOpened():
                # Warm up
                for _ in range(3):
                    cap.read()
                return cap
            cap.release()
        return None

    def run_face_login_system(self):
        """Main function to run the face login system"""
        cap = self._open_camera(0)
        if cap is None:
            print("Failed to open camera with all backends")
            return
        
        print("Face Login System Started")
        print("Images will be saved to: face_images/")
        print("Data will be saved to: user_face_data/")
        print("Models will be saved to: trained_models/")
        print("\ngit remote add upstream Instructions:")
        print("   - Look directly at the camera")
        print("   - Hold still for 5 seconds") 
        print("   - Ensure good lighting")
        print("   - Press 'q' to quit")
        print("   - Press 'r' to reset")
        print("   - Press 't' to train and save model (need 1+ samples)")
        print("   - Press 's' to force save current training data")
        print("   - Press 'f' to FORCE create model with current face")
        print("   - Press 'l' to load existing model")
        #print("-" * 50)
        
        current_face_roi = None
        current_face_rect = None
        
        while True:
            ret, frame = cap.read()
            if not ret:
                print('Frame is not appearing...')
                # Attempt recovery by reopening
                cap.release()
                cap = self._open_camera(0)
                if cap is None:
                    break
                else:
                    continue
            
            frame = cv2.flip(frame, 1)
            current_time = time.time()
            
            # Detect faces
            if self.use_dnn:
                faces = self.detect_faces_dnn(frame)
            else:
                faces = self.detect_faces_haar(frame)
            
            if len(faces) > 0:
                # Take the largest/most confident face
                if self.use_dnn:
                    face = max(faces, key=lambda x: x[4])  # Sort by confidence
                else:
                    face = max(faces, key=lambda x: x[2] * x[3])  # Sort by area
                
                x, y, w, h, confidence = face
                face_rect = (x, y, w, h)
                face_roi = frame[y:y+h, x:x+w]
                current_face_roi = face_roi.copy()
                current_face_rect = face_rect
                
                # Calculate quality
                quality_score = self.calculate_face_quality(face_roi)
                
                # Predict face if model is trained
                prediction_info = None
                if self.is_model_trained:
                    prediction_info = self.predict_face(face_roi)
                
                # Draw face info
                self.draw_face_info(frame, face_rect, confidence, quality_score, prediction_info)
                
                # Check stability
                is_stable = self.is_face_stable(face_rect)
                
                if not self.face_detected:
                    self.face_detected = True
                    self.detection_start_time = current_time
                    print("Face detected! Hold still for login...")
                
                elapsed_time = current_time - self.detection_start_time
                
                # Store face data and prepare training data AGGRESSIVELY
                if len(self.face_data) < 20:  # Increased limit
                    self.face_data.append({
                        'face_roi': face_roi.copy(),
                        'face_rect': face_rect,
                        'timestamp': current_time,
                        'quality_score': quality_score
                    })
                    
                    # Add to training data MORE FREQUENTLY (reduced quality threshold)
                    if quality_score > 0.15:  # Very low threshold
                        success = self.prepare_training_data(face_roi)
                        if success:
                            print(f"Training data collected: {len(self.training_data)}/3 needed")
                
                # FORCE MODEL CREATION every 10 frames if we have enough data
                if len(self.training_data) >= 3 and not self.is_model_trained:
                    frame_count = getattr(self, 'frame_count', 0) + 1
                    setattr(self, 'frame_count', frame_count)
                    if frame_count % 10 == 0:  # Try every 10 frames
                        print("FORCING MODEL TRAINING...")
                        self.train_and_save_model()
                
                # Check login completion - simplified conditions
                if (elapsed_time >= self.required_detection_time and 
                    not self.login_successful and 
                    quality_score > 0.2):  # Reduced quality threshold
                    
                    self.login_successful = True
                    # Take best quality image from stored data
                    best_data = max(self.face_data, key=lambda x: x['quality_score']) if self.face_data else {
                        'face_roi': face_roi, 'face_rect': face_rect, 'quality_score': quality_score
                    }
                    
                    filepath = self.save_user_data(best_data['face_roi'], best_data['face_rect'])
                    print("LOGIN SUCCESSFUL! Data and snapshot saved.")
                    
                    # FORCE MODEL TRAINING NOW
                    print(f"Current training samples: {len(self.training_data)}")
                    if len(self.training_data) >= 1:  # Even with 1 sample, try to train
                        # Add more samples quickly if needed
                        while len(self.training_data) < 5:
                            self.prepare_training_data(best_data['face_roi'])
                        
                        print("FORCING MODEL TRAINING WITH LOGIN DATA...")
                        model_saved = self.train_and_save_model()
                        if not model_saved:
                            print("Model training failed! Trying alternative method...")
                            # Try saving a simple version
                            self.save_simple_model()
                    else:
                        print("No training data available, creating minimal model...")
                        # Create minimal training data from current face
                        for i in range(5):
                            self.prepare_training_data(best_data['face_roi'])
                        self.train_and_save_model()
                    
                    # Show success message for 3 seconds then close
                    success_start = time.time()
                    while time.time() - success_start < 3.0:
                        success_frame = frame.copy()
                        self.draw_login_status(success_frame, self.required_detection_time, self.required_detection_time)
                        
                        # Add success message overlay
                        overlay = success_frame.copy()
                        cv2.rectangle(overlay, (50, 200), (success_frame.shape[1]-50, 300), (0, 255, 0), -1)
                        cv2.addWeighted(overlay, 0.7, success_frame, 0.3, 0, success_frame)
                        cv2.putText(success_frame, "LOGIN SUCCESSFUL!", 
                                  (success_frame.shape[1]//2 - 200, 240), 
                                  cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 3)
                        cv2.putText(success_frame, "Snapshot saved! Closing in 3 seconds...", 
                                  (success_frame.shape[1]//2 - 250, 270), 
                                  cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                        
                        cv2.imshow('OpenCV Face Login System', success_frame)
                        if cv2.waitKey(1) & 0xFF == ord('q'):
                            break
                    break  # Exit the main loop
                
                self.draw_login_status(frame, elapsed_time, self.required_detection_time)
                
            else:
               
                if self.face_detected and not self.login_successful:
                    # Only reset if face has been lost for more than 1 second
                    if hasattr(self, 'face_lost_time'):
                        if time.time() - self.face_lost_time > 1.0:
                            print("Face lost! Please position yourself properly.")
                            self.face_detected = False
                            self.detection_start_time = None
                            self.stable_frames = 0
                            delattr(self, 'face_lost_time')
                    else:
                        self.face_lost_time = time.time()
                else:
                    self.face_detected = False
                    self.detection_start_time = None
                    self.stable_frames = 0
                
                if not self.face_detected:
                    self.draw_login_status(frame, 0, self.required_detection_time)
            
            # Display concise guidance
            cv2.putText(frame, "Face Login - Hold steady for 5s", 
                       (20, frame.shape[0] - 20), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.6, (255, 255, 255), 2)
            
            cv2.imshow('OpenCV Face Login System', frame)
            
            # Handle key presses
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('r'):
                # Reset system
                self.face_detected = False
                self.login_successful = False
                self.detection_start_time = None
                self.face_data = []
                self.stable_frames = 0
                self.previous_face_center = None
                self.training_data = []
                self.training_labels = []
                if hasattr(self, 'face_lost_time'):
                    delattr(self, 'face_lost_time')
                print("System reset!")
            elif key == ord('t'):
                # Train and save model (force training)
                if len(self.training_data) >= 1:  # Accept even 1 sample
                    print("Force training model...")
                    self.train_and_save_model()
                else:
                    print(f"No training data available. Currently have {len(self.training_data)} samples")
                    print("Stay in front of camera to collect samples.")
            elif key == ord('s'):
                # Force save model (new shortcut)
                if len(self.training_data) >= 1:  # Accept even 1 sample
                    print("Force saving current training data...")
                    self.train_and_save_model()
                else:
                    print(f"No training data to save. Currently have {len(self.training_data)} samples.")
            elif key == ord('f'):
                # Force create model with current face (emergency option)
                if current_face_roi is not None:
                    print("EMERGENCY: Creating model with current face...")
                    # Clear and rebuild training data
                    self.training_data = []
                    self.training_labels = []
                    # Add current face multiple times
                    for i in range(5):
                        self.prepare_training_data(current_face_roi)
                    # Force train
                    self.train_and_save_model()
                else:
                    print("No face currently detected!")
            elif key == ord('l'):
                # Load existing model
                print("Available models:")
                model_files = [f for f in os.listdir(self.models_dir) if f.endswith('.yml')]
                if model_files:
                    latest_model = max(model_files)
                    model_path = os.path.join(self.models_dir, latest_model)
                    self.load_model(model_path)
                else:
                    print("No saved models found!")
        
        cap.release()
        cv2.destroyAllWindows()
        print("Face Login System Stopped")
        print(f"Check your snapshots in: {os.path.abspath(self.images_dir)}")
        print(f"Check your data files in: {os.path.abspath(self.user_data_dir)}")
        print(f"Check your models in: {os.path.abspath(self.models_dir)}")

def main():
    """Main function to run the face login system"""
    try:
        face_login = FaceLoginSystem()
        face_login.run_face_login_system()
    except KeyboardInterrupt:
        print("\nSystem interrupted by user")
    except Exception as e:
        print(f"An error occurred: {e}")
    
if __name__ == "__main__":
    main()