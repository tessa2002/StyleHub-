"""
Python ML API Server (Simplified for Body Estimation)
Flask server that exposes Body Measurement ML model predictions via REST API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Only import body estimation models as requested
from models.body_ml_model import BodyMLModel
# from models.body_measurement import BodyMeasurementModel

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize models
print("Initializing body estimation models...")
print("  - Body ML (Tabular Data)")
body_ml_model = BodyMLModel()
# print("  - Body Pose (Image Data)")
# body_pose_model = BodyMeasurementModel()
print("Models initialized.")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Python ML Body Estimation API is running',
        'port': 5001
    })

@app.route('/predict/body-measurement', methods=['POST'])
def predict_body_measurement():
    """
    Predict body measurements (Chest, Waist, Hips)
    Expected input: {
        height_cm: number,
        weight_kg: number,
        shoulder_width_cm: number (optional if image provided),
        image: string (base64, optional)
    }
    """
    try:
        data = request.get_json()
        
        # 1. If image is provided, use pose model to get shoulder width first
        # if 'image' in data and data['image']:
        #     height_ref = data.get('height_cm', 165)
        #     weight_ref = data.get('weight_kg', 70)
        #     
        #     # Use pose model
        #     pose_result, err = body_pose_model.estimate_measurements(
        #         data['image'], 
        #         user_height_cm=height_ref,
        #         user_weight_kg=weight_ref
        #     )
        #     
        #     if err:
        #         return jsonify({'success': False, 'error': f'Pose detection failed: {err}'}), 400
        #     
        #     # Use the shoulder width from pose model to feed into ML model
        #     detected_shoulder = pose_result['measurements'].get('Shoulder', 40.0)
        #     
        #     # Use ML model to refine other measurements
        #     ml_result = body_ml_model.predict(
        #         height_ref, 
        #         weight_ref, 
        #         detected_shoulder
        #     )
        #     
        #     if 'error' in ml_result:
        #         return jsonify({'success': False, 'error': ml_result['error']}), 400
        #         
        #     # Merge results
        #     final_prediction = {
        #         **ml_result,
        #         'annotated_image': pose_result.get('annotated_image'),
        #         'raw_pose_measurements': pose_result['measurements']
        #     }
        #     
        #     return jsonify({
        #         'success': True,
        #         'prediction': final_prediction
        #     })

        # 2. Standard flow (manual inputs)
        required_fields = ['height_cm', 'weight_kg', 'shoulder_width_cm']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Make prediction
        result = body_ml_model.predict(
            data['height_cm'], 
            data['weight_kg'], 
            data['shoulder_width_cm']
        )
        
        if 'error' in result:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 400
            
        return jsonify({
            'success': True,
            'prediction': result
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/models/status', methods=['GET'])
def get_models_status():
    """Get status of body estimation models"""
    import os
    from datetime import datetime
    
    def get_model_info(model, name, path):
        """Helper function to get model information"""
        trained_time = None
        exists = os.path.exists(path)
        if exists:
            trained_time = datetime.fromtimestamp(
                os.path.getmtime(path)
            ).isoformat()
        
        return {
            'name': name,
            'path': path,
            'trained': exists,
            'lastTrained': trained_time
        }
    
    # Use paths from models if available, otherwise default
    body_ml_path = getattr(body_ml_model, 'model_path', 'body_model.pkl')
    
    models = {
        'body_ml': get_model_info(body_ml_model, 'Body Measurement ML', body_ml_path),
        # 'body_pose': {
        #     'name': 'Body Pose Estimation (MediaPipe)',
        #     'status': 'available' if body_pose_model.pose or getattr(body_pose_model, 'pose_landmarker', None) else 'unavailable'
        # }
    }
    
    return jsonify({
        'success': True,
        'models': models
    })

if __name__ == '__main__':
    try:
        print("=" * 60)
        print("🐍 Python Body Estimation API")
        print("=" * 60)
        print("Starting server on http://localhost:5001")
        print()
        print("Available endpoints:")
        print("  GET  /health")
        print("  POST /predict/body-measurement")
        print("  GET  /models/status")
        print()
        print("Press CTRL+C to stop")
        print("=" * 60)
        
        app.run(host='0.0.0.0', port=5001, debug=True)
    except Exception as e:
        print(f"FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
