"""
Python ML API Server
Flask server that exposes ML model predictions via REST API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.knn_customer_preference import CustomerPreferenceModel
from models.naivebayes_fabric import FabricRecommendationModel
from models.decisiontree_tailor import TailorAllocationModel
from models.svm_order_delay import OrderDelayModel
from models.bpnn_satisfaction import CustomerSatisfactionModel

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize models
knn_model = CustomerPreferenceModel()
nb_model = FabricRecommendationModel()
dt_model = TailorAllocationModel()
svm_model = OrderDelayModel()
bpnn_model = CustomerSatisfactionModel()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Python ML API is running',
        'port': 5001
    })

@app.route('/predict/customer-preference', methods=['POST'])
def predict_customer_preference():
    """
    Predict customer preference
    Expected input: {
        previousOrders: number,
        avgOrderValue: number,
        fabricPreference: number (0-3),
        designComplexity: number (1-5)
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['previousOrders', 'avgOrderValue', 'fabricPreference', 'designComplexity']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Make prediction
        result = knn_model.predict(data)
        
        return jsonify({
            'success': True,
            'prediction': result
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict/fabric-recommendation', methods=['POST'])
def predict_fabric_recommendation():
    """
    Predict fabric recommendation
    Expected input: {
        season: number (0-3),
        occasion: number (0-2),
        priceRange: number (0-2),
        skinTone: number (0-2)
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['season', 'occasion', 'priceRange', 'skinTone']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Make prediction
        result = nb_model.predict(data)
        
        return jsonify({
            'success': True,
            'prediction': result
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict/tailor-allocation', methods=['POST'])
def predict_tailor_allocation():
    """
    Predict tailor allocation suitability
    Expected input: {
        expertise_level: number (1-10),
        current_workload: number (0-100),
        order_complexity: number (1-10),
        deadline_days: number (1-30),
        specialization_match: number (0-10),
        customer_priority: number (1-5)
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['expertise_level', 'current_workload', 'order_complexity', 
                          'deadline_days', 'specialization_match', 'customer_priority']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Make prediction
        result = dt_model.predict(**data)
        
        return jsonify({
            'success': True,
            'prediction': result
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict/order-delay', methods=['POST'])
def predict_order_delay():
    """
    Predict order delay risk
    Expected input: {
        order_complexity: number (1-10),
        item_count: number (1-10),
        tailor_availability: number (0-10),
        material_stock: number (0-100),
        lead_time: number (1-30),
        customer_priority: number (1-5),
        is_rush_order: number (0 or 1)
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['order_complexity', 'item_count', 'tailor_availability',
                          'material_stock', 'lead_time', 'customer_priority', 'is_rush_order']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Make prediction
        result = svm_model.predict(**data)
        
        return jsonify({
            'success': True,
            'prediction': result
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict/customer-satisfaction', methods=['POST'])
def predict_customer_satisfaction():
    """
    Predict customer satisfaction
    Expected input: {
        delivery_time: number (1-30 days),
        order_accuracy: number (50-100%),
        fabric_quality: number (1-10),
        tailor_communication: number (1-10),
        price_fairness: number (1-5)
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['delivery_time', 'order_accuracy', 'fabric_quality',
                          'tailor_communication', 'price_fairness']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Make prediction
        result = bpnn_model.predict(**data)
        
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
    """Get status of all models"""
    import os
    from datetime import datetime
    
    def get_model_info(model, name, default_accuracy):
        """Helper function to get model information"""
        trained_time = None
        if os.path.exists(model.model_path):
            trained_time = datetime.fromtimestamp(
                os.path.getmtime(model.model_path)
            ).isoformat()
        
        return {
            'name': name,
            'path': model.model_path,
            'trained': os.path.exists(model.model_path),
            'accuracy': default_accuracy if os.path.exists(model.model_path) else 0,
            'lastTrained': trained_time,
            'predictionCount': 0  # Can track this in a database later
        }
    
    models = {
        'knn': get_model_info(knn_model, 'Customer Preference (KNN)', 100.0),
        'naivebayes': get_model_info(nb_model, 'Fabric Recommendation (Naive Bayes)', 93.33),
        'decisiontree': get_model_info(dt_model, 'Tailor Allocation (Decision Tree)', 95.0),
        'svm': get_model_info(svm_model, 'Order Delay Detection (SVM)', 91.0),
        'bpnn': get_model_info(bpnn_model, 'Customer Satisfaction (BPNN)', 88.5)
    }
    
    return jsonify({
        'success': True,
        'models': models
    })

if __name__ == '__main__':
    print("=" * 60)
    print("🐍 Python ML API Server")
    print("=" * 60)
    print("Starting server on http://localhost:5001")
    print()
    print("Available endpoints:")
    print("  GET  /health")
    print("  POST /predict/customer-preference")
    print("  POST /predict/fabric-recommendation")
    print("  POST /predict/tailor-allocation")
    print("  POST /predict/order-delay")
    print("  POST /predict/customer-satisfaction")
    print("  GET  /models/status")
    print()
    print("Press CTRL+C to stop")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5001, debug=True)

