"""
Customer Preference Classification using K-Nearest Neighbors (KNN)
Predicts customer category: Budget-Conscious, Quality-Focused, or Luxury-Seeker
"""

import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

class CustomerPreferenceModel:
    def __init__(self):
        self.model = KNeighborsClassifier(n_neighbors=5)
        self.model_path = 'backend/ml/python/saved_models/knn_customer_preference.pkl'
        
    def generate_training_data(self, n_samples=200):
        """Generate sample training data"""
        np.random.seed(42)
        data = []
        labels = []
        
        for _ in range(n_samples):
            # Features: [previousOrders, avgOrderValue, fabricPreference, designComplexity]
            
            # Budget-Conscious customers (label 0)
            if np.random.random() < 0.33:
                previous_orders = np.random.randint(1, 8)
                avg_order_value = np.random.randint(1000, 3000)
                fabric_preference = np.random.choice([0, 1])  # Cotton, Silk
                design_complexity = np.random.randint(1, 3)
                label = 0
                
            # Quality-Focused customers (label 1)
            elif np.random.random() < 0.66:
                previous_orders = np.random.randint(5, 15)
                avg_order_value = np.random.randint(3000, 6000)
                fabric_preference = np.random.choice([1, 2])  # Silk, Wool
                design_complexity = np.random.randint(2, 4)
                label = 1
                
            # Luxury-Seeker customers (label 2)
            else:
                previous_orders = np.random.randint(10, 30)
                avg_order_value = np.random.randint(6000, 15000)
                fabric_preference = np.random.choice([1, 2, 3])  # Silk, Wool, Premium
                design_complexity = np.random.randint(3, 6)
                label = 2
            
            data.append([previous_orders, avg_order_value, fabric_preference, design_complexity])
            labels.append(label)
        
        return np.array(data), np.array(labels)
    
    def train(self):
        """Train the KNN model"""
        print("📊 Training Customer Preference Model (KNN)...")
        
        # Generate training data
        X, y = self.generate_training_data(300)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train model
        self.model.fit(X_train, y_train)
        
        # Calculate accuracy
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred) * 100
        
        # Save model
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        
        print(f"✅ Model trained successfully!")
        print(f"   Accuracy: {accuracy:.2f}%")
        print(f"   Model saved to: {self.model_path}")
        
        return accuracy
    
    def predict(self, data):
        """
        Make prediction
        data: dict with keys: previousOrders, avgOrderValue, fabricPreference, designComplexity
        """
        # Load model if not loaded
        if not hasattr(self.model, 'classes_'):
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
            else:
                raise Exception("Model not trained. Please train the model first.")
        
        # Prepare input
        features = np.array([[
            data['previousOrders'],
            data['avgOrderValue'],
            data['fabricPreference'],
            data['designComplexity']
        ]])
        
        # Predict
        prediction = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]
        confidence = probabilities[prediction]
        
        # Map prediction to label
        labels = ['Budget-Conscious', 'Quality-Focused', 'Luxury-Seeker']
        
        return {
            'preference': int(prediction),
            'preferenceLabel': labels[prediction],
            'confidence': float(confidence),
            'probabilities': {
                'budget': float(probabilities[0]),
                'quality': float(probabilities[1]),
                'luxury': float(probabilities[2])
            }
        }

if __name__ == '__main__':
    # Test the model
    model = CustomerPreferenceModel()
    
    # Train
    accuracy = model.train()
    
    # Test prediction
    test_data = {
        'previousOrders': 10,
        'avgOrderValue': 5000,
        'fabricPreference': 1,
        'designComplexity': 3
    }
    
    result = model.predict(test_data)
    print(f"\n🧪 Test Prediction:")
    print(f"   Input: {test_data}")
    print(f"   Prediction: {result['preferenceLabel']} (confidence: {result['confidence']:.2%})")








