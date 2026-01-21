"""
Backpropagation Neural Network for Customer Satisfaction Prediction
Predicts customer satisfaction scores based on service metrics
"""

import numpy as np
import pandas as pd
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import os

class CustomerSatisfactionModel:
    def __init__(self):
        self.model = MLPRegressor(
            hidden_layer_sizes=(20, 15, 10),  # 3 hidden layers
            activation='relu',
            solver='adam',
            learning_rate_init=0.001,
            max_iter=1000,
            random_state=42,
            early_stopping=True,
            validation_fraction=0.1
        )
        self.scaler = StandardScaler()
        self.model_path = os.path.join(
            os.path.dirname(__file__), 
            '..', 
            'saved_models', 
            'bpnn_satisfaction.pkl'
        )
        self.scaler_path = os.path.join(
            os.path.dirname(__file__), 
            '..', 
            'saved_models', 
            'bpnn_scaler.pkl'
        )
        self.trained = False
        
    def generate_training_data(self, n_samples=500):
        """Generate synthetic training data for satisfaction prediction"""
        np.random.seed(42)
        
        # Generate features based on assignment requirements
        delivery_time = np.random.uniform(1, 30, n_samples)  # Days (1-30)
        order_accuracy = np.random.uniform(50, 100, n_samples)  # % match (50-100%)
        fabric_quality = np.random.uniform(1, 10, n_samples)  # Rating (1-10)
        tailor_communication = np.random.uniform(1, 10, n_samples)  # Rating (1-10)
        price_fairness = np.random.uniform(1, 5, n_samples)  # Rating (1-5)
        
        data = {
            'delivery_time': delivery_time,
            'order_accuracy': order_accuracy,
            'fabric_quality': fabric_quality,
            'tailor_communication': tailor_communication,
            'price_fairness': price_fairness,
        }
        
        df = pd.DataFrame(data)
        
        # Generate satisfaction score (1-5 stars) with weighted combination + noise
        # Faster delivery = higher satisfaction (inverse relationship)
        # Higher accuracy, quality, communication, fairness = higher satisfaction
        df['satisfaction'] = (
            0.25 * (31 - delivery_time) / 6 +  # Faster delivery is better (normalized to 1-5 scale)
            0.30 * (order_accuracy / 20) +  # Accuracy normalized to 1-5 scale
            0.25 * (fabric_quality / 2) +  # Quality normalized to 1-5 scale
            0.10 * (tailor_communication / 2) +  # Communication normalized to 1-5 scale
            0.10 * price_fairness +  # Price fairness already 1-5
            np.random.normal(0, 0.3, n_samples)  # Add some noise
        )
        
        # Clip to valid range (1-5 stars)
        df['satisfaction'] = df['satisfaction'].clip(1, 5)
        
        return df
    
    def train(self):
        """Train the BPNN model"""
        # Generate training data
        df = self.generate_training_data(500)
        
        # Split features and labels
        X = df.drop('satisfaction', axis=1)
        y = df['satisfaction']
        
        # Split into train and test sets
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features (important for neural networks)
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train the model
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        # Calculate accuracy as percentage of predictions within 1 point
        accuracy = np.mean(np.abs(y_test - y_pred) <= 1.0) * 100
        
        # Save the model and scaler
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
        self.trained = True
        
        print(f"BPNN Model trained successfully!")
        print(f"  RMSE: {rmse:.4f}")
        print(f"  MAE: {mae:.4f}")
        print(f"  R² Score: {r2:.4f}")
        print(f"  Accuracy (±1 point): {accuracy:.2f}%")
        print(f"  Training iterations: {self.model.n_iter_}")
        
        return accuracy
    
    def load(self):
        """Load the trained model and scaler"""
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            self.trained = True
            return True
        return False
    
    def predict(self, delivery_time, order_accuracy, fabric_quality,
                tailor_communication, price_fairness):
        """
        Predict customer satisfaction score
        
        Args:
            delivery_time: Delivery time in days (1-30)
            order_accuracy: Order accuracy as % match with customer request (50-100%)
            fabric_quality: Fabric quality rating (1-10)
            tailor_communication: Tailor communication rating (1-10)
            price_fairness: Price fairness rating (1-5)
        
        Returns:
            dict with predicted satisfaction score (1-5 stars) and level
        """
        if not self.trained:
            self.load()
        
        # Prepare input
        X = np.array([[
            delivery_time,
            order_accuracy,
            fabric_quality,
            tailor_communication,
            price_fairness
        ]])
        
        # Scale input
        X_scaled = self.scaler.transform(X)
        
        # Predict
        satisfaction = self.model.predict(X_scaled)[0]
        
        # Clip to valid range (1-5 stars)
        satisfaction = np.clip(satisfaction, 1, 5)
        
        # Determine satisfaction level
        if satisfaction >= 4.5:
            level = '⭐⭐⭐⭐⭐ Excellent'
        elif satisfaction >= 3.5:
            level = '⭐⭐⭐⭐ Good'
        elif satisfaction >= 2.5:
            level = '⭐⭐⭐ Average'
        elif satisfaction >= 1.5:
            level = '⭐⭐ Below Average'
        else:
            level = '⭐ Poor'
        
        result = {
            'satisfaction_stars': round(float(satisfaction), 2),
            'satisfaction_level': level,
            'stars_rounded': round(float(satisfaction)),
            'recommendation': self._get_recommendation(
                satisfaction, delivery_time, order_accuracy,
                fabric_quality, tailor_communication, price_fairness
            )
        }
        
        return result
    
    def _get_recommendation(self, score, delivery_time, order_accuracy, fabric_quality, 
                            tailor_communication, price_fairness):
        """Generate recommendation based on satisfaction prediction"""
        if score >= 4.5:
            return "⭐⭐⭐⭐⭐ Excellent! Customer will be highly satisfied. Likely to provide 5-star review and recommend to others."
        elif score >= 3.5:
            improvements = []
            if delivery_time > 15:
                improvements.append("reduce delivery time")
            if order_accuracy < 90:
                improvements.append("improve order accuracy")
            if fabric_quality < 7:
                improvements.append("enhance fabric quality")
            
            if improvements:
                return f"⭐⭐⭐⭐ Good experience expected. To reach excellence: {', '.join(improvements)}."
            return "⭐⭐⭐⭐ Good experience expected. Customer will be satisfied."
        elif score >= 2.5:
            issues = []
            if delivery_time > 20:
                issues.append(f"delivery too slow ({int(delivery_time)} days)")
            if order_accuracy < 85:
                issues.append(f"low accuracy ({int(order_accuracy)}%)")
            if fabric_quality < 6:
                issues.append("fabric quality below expectations")
            if tailor_communication < 6:
                issues.append("poor communication")
            if price_fairness < 3:
                issues.append("pricing concerns")
            
            return f"⭐⭐⭐ Average satisfaction. Priority fixes: {', '.join(issues[:2])}."
        elif score >= 1.5:
            return f"⭐⭐ Below average! URGENT: Delivery time: {int(delivery_time)} days, Accuracy: {int(order_accuracy)}%. Immediate improvement needed to avoid negative review."
        else:
            return "⭐ Poor experience predicted! CRITICAL: Customer dissatisfaction likely. Contact customer proactively, offer compensation, and address all quality issues immediately."

if __name__ == '__main__':
    # Train and test the model
    model = CustomerSatisfactionModel()
    model.train()
    
    # Test predictions
    print("\n" + "="*60)
    print("Test Predictions:")
    print("="*60)
    
    test_cases = [
        {
            'delivery_time': 5,
            'order_accuracy': 98,
            'fabric_quality': 9.0,
            'tailor_communication': 9.0,
            'price_fairness': 4.5
        },
        {
            'delivery_time': 25,
            'order_accuracy': 70,
            'fabric_quality': 4.0,
            'tailor_communication': 5.0,
            'price_fairness': 2.0
        }
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}:")
        print(f"  Inputs: {case}")
        result = model.predict(**case)
        print(f"  Result: {result}")

