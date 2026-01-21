"""
Support Vector Machine Model for Order Delay Risk Detection
Predicts likelihood of order delays based on various factors
"""

import numpy as np
import pandas as pd
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

class OrderDelayModel:
    def __init__(self):
        self.model = SVC(
            kernel='rbf',
            C=1.0,
            gamma='scale',
            probability=True,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.model_path = os.path.join(
            os.path.dirname(__file__), 
            '..', 
            'saved_models', 
            'svm_order_delay.pkl'
        )
        self.scaler_path = os.path.join(
            os.path.dirname(__file__), 
            '..', 
            'saved_models', 
            'svm_scaler.pkl'
        )
        self.trained = False
        
    def generate_training_data(self, n_samples=500):
        """Generate synthetic training data for order delay prediction"""
        np.random.seed(42)
        
        data = {
            # Order complexity (1-10)
            'order_complexity': np.random.randint(1, 11, n_samples),
            
            # Number of items in order
            'item_count': np.random.randint(1, 11, n_samples),
            
            # Tailor availability score (0-10)
            'tailor_availability': np.random.randint(0, 11, n_samples),
            
            # Material stock level (0-100%)
            'material_stock': np.random.randint(0, 101, n_samples),
            
            # Lead time in days
            'lead_time': np.random.randint(1, 31, n_samples),
            
            # Customer priority (1-5)
            'customer_priority': np.random.randint(1, 6, n_samples),
            
            # Rush order (0 or 1)
            'is_rush_order': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
        }
        
        df = pd.DataFrame(data)
        
        # Generate labels based on business logic
        # Order will be delayed (1) if:
        # - complexity > 7 AND lead_time < 7 OR
        # - material_stock < 30 OR
        # - tailor_availability < 4 AND complexity > 5 OR
        # - is_rush_order AND (complexity > 5 OR material_stock < 50)
        df['will_delay'] = (
            ((df['order_complexity'] > 7) & (df['lead_time'] < 7)) |
            (df['material_stock'] < 30) |
            ((df['tailor_availability'] < 4) & (df['order_complexity'] > 5)) |
            (df['is_rush_order'] & ((df['order_complexity'] > 5) | (df['material_stock'] < 50)))
        ).astype(int)
        
        return df
    
    def train(self):
        """Train the SVM model"""
        # Generate training data
        df = self.generate_training_data(500)
        
        # Split features and labels
        X = df.drop('will_delay', axis=1)
        y = df['will_delay']
        
        # Split into train and test sets
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features (important for SVM)
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train the model
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Save the model and scaler
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
        self.trained = True
        
        print(f"SVM Model trained with accuracy: {accuracy:.2%}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=['On Time', 'Delayed']))
        
        return accuracy
    
    def load(self):
        """Load the trained model and scaler"""
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            self.trained = True
            return True
        return False
    
    def predict(self, order_complexity, item_count, tailor_availability,
                material_stock, lead_time, customer_priority, is_rush_order):
        """
        Predict if order will be delayed
        
        Args:
            order_complexity: Order difficulty level (1-10)
            item_count: Number of items (1-10)
            tailor_availability: Availability score (0-10)
            material_stock: Material stock level (0-100%)
            lead_time: Lead time in days (1-30)
            customer_priority: Priority level (1-5)
            is_rush_order: Rush order flag (0 or 1)
        
        Returns:
            dict with prediction and risk level
        """
        if not self.trained:
            self.load()
        
        # Prepare input
        X = np.array([[
            order_complexity,
            item_count,
            tailor_availability,
            material_stock,
            lead_time,
            customer_priority,
            is_rush_order
        ]])
        
        # Scale input
        X_scaled = self.scaler.transform(X)
        
        # Predict
        prediction = self.model.predict(X_scaled)[0]
        probabilities = self.model.predict_proba(X_scaled)[0]
        delay_risk = probabilities[1]  # Probability of delay
        
        # Determine risk level
        if delay_risk < 0.3:
            risk_level = 'Low'
        elif delay_risk < 0.6:
            risk_level = 'Medium'
        else:
            risk_level = 'High'
        
        result = {
            'will_delay': bool(prediction),
            'status': 'Likely Delayed' if prediction == 1 else 'On Track',
            'delay_risk': float(delay_risk),
            'risk_level': risk_level,
            'recommendation': self._get_recommendation(
                delay_risk, order_complexity, material_stock, 
                tailor_availability, lead_time, is_rush_order
            )
        }
        
        return result
    
    def _get_recommendation(self, risk, complexity, stock, availability, lead_time, rush):
        """Generate recommendation based on delay risk"""
        if risk < 0.3:
            return "Order is on track. Continue with normal processing."
        elif risk < 0.6:
            recommendations = []
            if stock < 50:
                recommendations.append("ensure material availability")
            if availability < 5:
                recommendations.append("allocate additional tailors")
            if lead_time < 7 and complexity > 5:
                recommendations.append("prioritize this order")
            
            return f"Medium risk detected. Recommended actions: {', '.join(recommendations)}."
        else:
            actions = []
            if stock < 30:
                actions.append("URGENT: Order materials immediately")
            if availability < 4:
                actions.append("Assign multiple tailors")
            if rush:
                actions.append("Notify customer about potential delay")
            if lead_time < 5:
                actions.append("Consider expedited processing")
            
            return f"HIGH RISK! Critical actions needed: {', '.join(actions)}."

if __name__ == '__main__':
    # Train and test the model
    model = OrderDelayModel()
    model.train()
    
    # Test predictions
    print("\n" + "="*60)
    print("Test Predictions:")
    print("="*60)
    
    test_cases = [
        {
            'order_complexity': 3,
            'item_count': 2,
            'tailor_availability': 8,
            'material_stock': 80,
            'lead_time': 14,
            'customer_priority': 2,
            'is_rush_order': 0
        },
        {
            'order_complexity': 9,
            'item_count': 5,
            'tailor_availability': 3,
            'material_stock': 25,
            'lead_time': 3,
            'customer_priority': 5,
            'is_rush_order': 1
        }
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}:")
        print(f"  Inputs: {case}")
        result = model.predict(**case)
        print(f"  Result: {result}")








