"""
Body Measurement Estimation Model
Uses MediaPipe Pose to detect body landmarks and estimate measurements
"""
from __future__ import annotations
from typing import List, Dict, Optional, Tuple
import cv2
import numpy as np
import base64
import io
import os
import joblib
from PIL import Image

# Import MediaPipe solutions or tasks based on version
try:
    # First try old solutions API (backward compatibility)
    import mediapipe as mp
    import mediapipe.solutions.pose as mp_pose
    import mediapipe.solutions.drawing_utils as mp_drawing
    HAS_SOLUTIONS = True
except (ImportError, AttributeError, Exception):
    try:
        # Try tasks API (newer MediaPipe)
        import mediapipe as mp
        import mediapipe.tasks.python.vision as mp_vision
        from mediapipe.framework.formats import landmark_pb2
        # Use drawing utils from vision if available
        try:
            import mediapipe.python.solutions.drawing_utils as mp_drawing
        except (ImportError, Exception):
            # Fallback to a custom or missing drawing utils if necessary
            mp_drawing = None
        HAS_SOLUTIONS = False
    except (ImportError, Exception):
        mp = None
        mp_pose = None
        mp_drawing = None
        HAS_SOLUTIONS = False
        print("⚠️ MediaPipe could not be loaded. Body measurement estimation will be disabled.")

class BodyMeasurementModel:
    def __init__(self):
        global HAS_SOLUTIONS
        self.ml_model_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), 
            '..', 
            '..', 
            '..', 
            '..', 
            'body_model.pkl'
        )
        self.ml_model = None
        if os.path.exists(self.ml_model_path):
            try:
                self.ml_model = joblib.load(self.ml_model_path)
                print(f"✅ Loaded ML body model from {self.ml_model_path}")
            except Exception as e:
                print(f"⚠️ Could not load ML body model: {e}")

        # Initialize MediaPipe Pose
        if HAS_SOLUTIONS and mp_pose:
            try:
                self.pose = mp_pose.Pose(
                    static_image_mode=True,
                    model_complexity=2,
                    enable_segmentation=True,
                    min_detection_confidence=0.5
                )
            except Exception as e:
                print(f"⚠️ Could not initialize MediaPipe Pose: {e}")
                self.pose = None
        elif not HAS_SOLUTIONS and mp_vision:
            # Initialize Pose Landmarker using Tasks API
            try:
                base_options = mp_vision.BaseOptions(model_asset_path='pose_landmarker_heavy.task')
                options = mp_vision.PoseLandmarkerOptions(
                    base_options=base_options,
                    running_mode=mp_vision.RunningMode.IMAGE,
                    num_poses=1,
                    min_pose_detection_confidence=0.5,
                    min_pose_presence_confidence=0.5,
                    min_tracking_confidence=0.5,
                    output_segmentation_masks=True
                )
                self.pose_landmarker = mp_vision.PoseLandmarker.create_from_options(options)
            except Exception as e:
                print(f"⚠️ Could not initialize Pose Landmarker: {e}")
                self.pose_landmarker = None
        else:
            self.pose = None
            self.pose_landmarker = None

    def _calculate_distance(self, p1, p2, img_w, img_h):
        """Calculate Euclidean distance between two landmarks in pixels"""      
        x1, y1 = p1.x * img_w, p1.y * img_h
        x2, y2 = p2.x * img_w, p2.y * img_h
        return np.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

    def estimate_measurements(self, image_data: np.ndarray | str, user_height_cm: int = 165, user_weight_kg: float = 70.0) -> Tuple[Optional[Dict[str, any]], Optional[str]]:
        """
        Estimate body measurements from image
        """
        if isinstance(image_data, str):
            if "base64," in image_data:
                image_data = image_data.split("base64,")[1]
            img_bytes = base64.b64decode(image_data)
            img = Image.open(io.BytesIO(img_bytes))
            image = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        else:
            image = image_data
            
        img_h, img_w, _ = image.shape
        
        # Process image based on API type
        if HAS_SOLUTIONS:
            results = self.pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            if not results.pose_landmarks:
                return (None, 'No pose detected')
            landmarks = results.pose_landmarks.landmark
            # Convert to list for easier access
            l = landmarks
        else:
            # Convert to MediaPipe Image
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            detection_result = self.pose_landmarker.detect(mp_image)
            if not detection_result.pose_landmarks:
                return (None, 'No pose detected')
            landmarks = detection_result.pose_landmarks[0]
            l = landmarks

        # 1. Basic landmarks (11=L shoulder, 12=R shoulder, 23=L hip, 24=R hip)
        # Handle different landmark access patterns
        if HAS_SOLUTIONS:
            shoulder_dist_px = self._calculate_distance(l[11], l[12], img_w, img_h)
            hip_dist_px = self._calculate_distance(l[23], l[24], img_w, img_h)
            avg_ankle_y = (l[27].y + l[28].y) / 2
            nose_y = l[0].y
        else:
            shoulder_dist_px = self._calculate_distance(l[11], l[12], img_w, img_h)
            hip_dist_px = self._calculate_distance(l[23], l[24], img_w, img_h)
            avg_ankle_y = (l[27].y + l[28].y) / 2
            nose_y = l[0].y
        
        # 2. Pixel-to-cm conversion
        pixel_height = (avg_ankle_y - nose_y) * img_h * 1.15
        cm_per_px = user_height_cm / pixel_height if pixel_height > 0 else 0    
        shoulder_width = shoulder_dist_px * cm_per_px
        
        # 3. Estimation logic (ML Model)
        if self.ml_model is not None:
            try:
                import pandas as pd
                features = pd.DataFrame([[user_height_cm, user_weight_kg, shoulder_width]], 
                                     columns=['Height_cm', 'Weight_kg', 'ShoulderWidth_cm'])
                predictions = self.ml_model.predict(features)[0]
                chest_cm = float(predictions[0])
                waist_cm = float(predictions[1])
                hips_cm = float(predictions[2])
            except Exception as e:
                chest_cm = shoulder_width * 2.2
                waist_cm = hip_dist_px * cm_per_px * 2.0
                hips_cm = hip_dist_px * cm_per_px * 2.3
        else:
            chest_cm = shoulder_width * 2.2
            waist_cm = hip_dist_px * cm_per_px * 2.0
            hips_cm = hip_dist_px * cm_per_px * 2.3
            
        # 4. Prepare annotated image
        annotated_image = image.copy()
        if HAS_SOLUTIONS and mp_drawing:
            mp_drawing.draw_landmarks(annotated_image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
        elif not HAS_SOLUTIONS:
            # Custom drawing for Tasks API results
            for landmark in landmarks:
                x = int(landmark.x * img_w)
                y = int(landmark.y * img_h)
                cv2.circle(annotated_image, (x, y), 5, (233, 30, 99), -1)

        _, buffer = cv2.imencode(".jpg", annotated_image)
        encoded_image = base64.b64encode(buffer).decode("utf-8")
        
        return (
            {
                'measurements': {
                    'Shoulder': round(shoulder_width, 1),
                    'Chest': round(chest_cm, 1),
                    'Waist': round(waist_cm, 1),
                    'Hips': round(hips_cm, 1),
                    'Height': user_height_cm,
                    'Weight': user_weight_kg
                },
                'annotated_image': f"data:image/jpeg;base64,{encoded_image}"
            },
            None
        )
