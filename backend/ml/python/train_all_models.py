"""
Train All ML Models
Run this script to train all 5 machine learning models
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.knn_customer_preference import CustomerPreferenceModel
from models.naivebayes_fabric import FabricRecommendationModel
from models.decisiontree_tailor import TailorAllocationModel
from models.svm_order_delay import OrderDelayModel
from models.bpnn_satisfaction import CustomerSatisfactionModel

def main():
    print("=" * 60)
    print("🤖 TRAINING ALL ML MODELS - Python Edition")
    print("=" * 60)
    print()
    
    results = {}
    
    # 1. Train Customer Preference Model (KNN)
    print("1️⃣  Customer Preference Classification (KNN)")
    print("-" * 60)
    try:
        knn_model = CustomerPreferenceModel()
        accuracy = knn_model.train()
        results['knn'] = {'status': 'success', 'accuracy': accuracy}
        
        # Test prediction
        test_result = knn_model.predict({
            'previousOrders': 10,
            'avgOrderValue': 5000,
            'fabricPreference': 1,
            'designComplexity': 3
        })
        print(f"   Sample Prediction: {test_result['preferenceLabel']}")
        print()
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        results['knn'] = {'status': 'failed', 'error': str(e)}
        print()
    
    # 2. Train Fabric Recommendation Model (Naive Bayes)
    print("2️⃣  Fabric Recommendation (Naive Bayes)")
    print("-" * 60)
    try:
        nb_model = FabricRecommendationModel()
        accuracy = nb_model.train()
        results['naivebayes'] = {'status': 'success', 'accuracy': accuracy}
        
        # Test prediction
        test_result = nb_model.predict({
            'season': 2,
            'occasion': 1,
            'priceRange': 2,
            'skinTone': 1
        })
        print(f"   Sample Prediction: {test_result['fabricLabel']}")
        print()
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        results['naivebayes'] = {'status': 'failed', 'error': str(e)}
        print()
    
    # 3. Train Tailor Allocation Model (Decision Tree)
    print("3️⃣  Tailor Allocation Optimization (Decision Tree)")
    print("-" * 60)
    try:
        dt_model = TailorAllocationModel()
        accuracy = dt_model.train()
        results['decisiontree'] = {'status': 'success', 'accuracy': accuracy}
        
        # Test prediction
        test_result = dt_model.predict(
            expertise_level=8,
            current_workload=50,
            order_complexity=6,
            deadline_days=10,
            specialization_match=7,
            customer_priority=3
        )
        print(f"   Sample Prediction: {test_result['suitability']}")
        print()
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        results['decisiontree'] = {'status': 'failed', 'error': str(e)}
        print()
    
    # 4. Train Order Delay Detection Model (SVM)
    print("4️⃣  Order Delay Risk Detection (SVM)")
    print("-" * 60)
    try:
        svm_model = OrderDelayModel()
        accuracy = svm_model.train()
        results['svm'] = {'status': 'success', 'accuracy': accuracy}
        
        # Test prediction
        test_result = svm_model.predict(
            order_complexity=5,
            item_count=3,
            tailor_availability=7,
            material_stock=70,
            lead_time=12,
            customer_priority=3,
            is_rush_order=0
        )
        print(f"   Sample Prediction: {test_result['status']} (Risk: {test_result['risk_level']})")
        print()
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        results['svm'] = {'status': 'failed', 'error': str(e)}
        print()
    
    # 5. Train Customer Satisfaction Model (BPNN)
    print("5️⃣  Customer Satisfaction Prediction (BPNN)")
    print("-" * 60)
    try:
        bpnn_model = CustomerSatisfactionModel()
        accuracy = bpnn_model.train()
        results['bpnn'] = {'status': 'success', 'accuracy': accuracy}
        
        # Test prediction
        test_result = bpnn_model.predict(
            delivery_time=7,
            order_accuracy=95,
            fabric_quality=8.5,
            tailor_communication=8.0,
            price_fairness=4.0
        )
        print(f"   Sample Prediction: {test_result['satisfaction_level']} ({test_result['satisfaction_stars']:.2f}/5 stars)")
        print()
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        results['bpnn'] = {'status': 'failed', 'error': str(e)}
        print()
    
    # Summary
    print("=" * 60)
    print("📊 TRAINING SUMMARY")
    print("=" * 60)
    
    for model_name, result in results.items():
        if result['status'] == 'success':
            print(f"✅ {model_name.upper()}: Trained (Accuracy: {result['accuracy']:.2f}%)")
        else:
            print(f"❌ {model_name.upper()}: Failed - {result.get('error', 'Unknown error')}")
    
    print()
    print("=" * 60)
    
    # Check if all models trained successfully
    all_success = all(r['status'] == 'success' for r in results.values())
    
    if all_success:
        print("🎉 ALL MODELS TRAINED SUCCESSFULLY!")
        print()
        print("Next steps:")
        print("1. Start the Python API server: python backend/ml/python/api.py")
        print("2. Access predictions at: http://localhost:5001/predict/<model>")
        print("3. View predictions in frontend: http://localhost:3000/admin/ml")
    else:
        print("⚠️  Some models failed to train. Please check the errors above.")
    
    print("=" * 60)

if __name__ == '__main__':
    main()

