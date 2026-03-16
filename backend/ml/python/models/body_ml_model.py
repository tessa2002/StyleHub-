
import joblib
import os
import pandas as pd

class BodyMLModel:
    def __init__(self):
        self.model_path = os.path.join(
            os.path.dirname(__file__), 
            '..', 
            '..', 
            'body_model.pkl'
        )
        self.model = None
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                print(f"✅ Loaded Body ML model from {self.model_path}")
            except Exception as e:
                print(f"⚠️ Could not load Body ML model: {e}")

    def predict(self, height_cm, weight_kg, shoulder_width_cm):
        if self.model is None:
            return {'error': 'Model not loaded'}
        
        try:
            # Features: ['Height_cm', 'Weight_kg', 'ShoulderWidth_cm']
            features = pd.DataFrame([[height_cm, weight_kg, shoulder_width_cm]], 
                                 columns=['Height_cm', 'Weight_kg', 'ShoulderWidth_cm'])
            predictions = self.model.predict(features)[0]
            
            return {
                'chest_cm': round(float(predictions[0]), 1),
                'waist_cm': round(float(predictions[1]), 1),
                'hips_cm': round(float(predictions[2]), 1),
                'height_cm': height_cm,
                'weight_kg': weight_kg,
                'shoulder_cm': shoulder_width_cm
            }
        except Exception as e:
            return {'error': str(e)}
