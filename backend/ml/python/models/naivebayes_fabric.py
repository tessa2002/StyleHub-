"""
Fabric Type Recommendation using Naive Bayes
Recommends fabric type based on season, occasion, price range, and skin tone
"""

import numpy as np
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

class FabricRecommendationModel:
    def __init__(self):
        self.model = GaussianNB()
        self.model_path = 'backend/ml/python/saved_models/naivebayes_fabric.pkl'
        
    def generate_training_data(self, n_samples=200):
        """Generate sample training data"""
        np.random.seed(42)
        data = []
        labels = []
        
        # Fabric types: 0=Cotton, 1=Silk, 2=Wool, 3=Linen
        # Season: 0=Spring, 1=Summer, 2=Fall, 3=Winter
        # Occasion: 0=Casual, 1=Formal, 2=Party
        # Price Range: 0=Budget, 1=Mid, 2=Premium
        # Skin Tone: 0=Fair, 1=Medium, 2=Dark
        
        for _ in range(n_samples):
            season = np.random.randint(0, 4)
            occasion = np.random.randint(0, 3)
            price_range = np.random.randint(0, 3)
            skin_tone = np.random.randint(0, 3)
            
            # Cotton - Summer, Casual, Budget
            if season == 1 and occasion == 0:
                fabric = 0
            # Silk - Formal, Premium, any season except winter
            elif occasion == 1 and price_range >= 1 and season != 3:
                fabric = 1
            # Wool - Winter, Fall
            elif season in [2, 3]:
                fabric = 2
            # Linen - Summer, Spring, Casual
            elif season in [0, 1] and occasion == 0:
                fabric = 3
            # Default based on price
            elif price_range == 0:
                fabric = 0  # Cotton
            else:
                fabric = 1  # Silk
                
            data.append([season, occasion, price_range, skin_tone])
            labels.append(fabric)
        
        return np.array(data), np.array(labels)
    
    def train(self):
        """Train the Naive Bayes model"""
        print("📊 Training Fabric Recommendation Model (Naive Bayes)...")
        
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
        data: dict with keys: season, occasion, priceRange, skinTone
        """
        # Load model if not loaded
        if not hasattr(self.model, 'classes_'):
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
            else:
                raise Exception("Model not trained. Please train the model first.")
        
        # Prepare input
        features = np.array([[
            data['season'],
            data['occasion'],
            data['priceRange'],
            data['skinTone']
        ]])
        
        # Predict
        prediction = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]
        confidence = probabilities[prediction]
        
        # Map prediction to label
        fabric_types = ['Cotton', 'Silk', 'Wool', 'Linen']
        
        return {
            'fabricType': int(prediction),
            'fabricLabel': fabric_types[prediction],
            'confidence': float(confidence),
            'probabilities': {
                'cotton': float(probabilities[0]),
                'silk': float(probabilities[1]),
                'wool': float(probabilities[2]),
                'linen': float(probabilities[3])
            }
        }

if __name__ == '__main__':
    # Test the model
    model = FabricRecommendationModel()
    
    # Train
    accuracy = model.train()
    
    # Test prediction
    test_data = {
        'season': 2,  # Fall
        'occasion': 1,  # Formal
        'priceRange': 2,  # Premium
        'skinTone': 1  # Medium
    }
    
    result = model.predict(test_data)
    print(f"\n🧪 Test Prediction:")
    print(f"   Input: {test_data}")
    print(f"   Recommendation: {result['fabricLabel']} (confidence: {result['confidence']:.2%})")








