"""
Decision Tree Model for Tailor Allocation Optimization
Optimizes tailor assignment based on expertise, workload, and order complexity
"""

import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

class TailorAllocationModel:
    def __init__(self):
        self.model = DecisionTreeClassifier(
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        self.model_path = os.path.join(
            os.path.dirname(__file__), 
            '..', 
            'saved_models', 
            'decisiontree_tailor.pkl'
        )
        self.trained = False
        
    def generate_training_data(self, n_samples=500):
        """Generate synthetic training data for tailor allocation"""
        np.random.seed(42)
        
        data = {
            # Tailor expertise level (1-10)
            'expertise_level': np.random.randint(1, 11, n_samples),
            
            # Current workload (0-100%)
            'current_workload': np.random.randint(0, 101, n_samples),
            
            # Order complexity (1-10)
            'order_complexity': np.random.randint(1, 11, n_samples),
            
            # Days until deadline
            'deadline_days': np.random.randint(1, 31, n_samples),
            
            # Tailor specialization match (0-10)
            'specialization_match': np.random.randint(0, 11, n_samples),
            
            # Customer priority (1-5)
            'customer_priority': np.random.randint(1, 6, n_samples),
        }
        
        df = pd.DataFrame(data)
        
        # Generate labels based on business logic
        # Tailor is suitable (1) if:
        # - expertise >= complexity AND
        # - workload < 80 OR priority >= 4 AND
        # - specialization_match >= 5
        df['suitable'] = (
            (df['expertise_level'] >= df['order_complexity']) &
            ((df['current_workload'] < 80) | (df['customer_priority'] >= 4)) &
            (df['specialization_match'] >= 5)
        ).astype(int)
        
        return df
    
    def train(self):
        """Train the Decision Tree model"""
        # Generate training data
        df = self.generate_training_data(500)
        
        # Split features and labels
        X = df.drop('suitable', axis=1)
        y = df['suitable']
        
        # Split into train and test sets
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train the model
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Save the model
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        self.trained = True
        
        print(f"Decision Tree Model trained with accuracy: {accuracy:.2%}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=['Not Suitable', 'Suitable']))
        
        # Feature importance
        feature_names = X.columns
        importances = self.model.feature_importances_
        print("\nFeature Importance:")
        for name, importance in sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True):
            print(f"  {name}: {importance:.4f}")
        
        return accuracy
    
    def load(self):
        """Load the trained model"""
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            self.trained = True
            return True
        return False
    
    def predict(self, expertise_level, current_workload, order_complexity, 
                deadline_days, specialization_match, customer_priority):
        """
        Predict if tailor is suitable for the order
        
        Args:
            expertise_level: Tailor's skill level (1-10)
            current_workload: Current workload percentage (0-100)
            order_complexity: Order difficulty (1-10)
            deadline_days: Days until deadline (1-30)
            specialization_match: How well tailor specializes in this type (0-10)
            customer_priority: Customer priority level (1-5)
        
        Returns:
            dict with prediction and confidence
        """
        if not self.trained:
            self.load()
        
        # Prepare input
        X = np.array([[
            expertise_level,
            current_workload,
            order_complexity,
            deadline_days,
            specialization_match,
            customer_priority
        ]])
        
        # Predict
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]
        
        result = {
            'suitable': bool(prediction),
            'suitability': 'Suitable' if prediction == 1 else 'Not Suitable',
            'confidence': float(max(probabilities)),
            'recommendation': self._get_recommendation(
                prediction, expertise_level, current_workload, 
                order_complexity, specialization_match
            )
        }
        
        return result
    
    def _get_recommendation(self, prediction, expertise, workload, complexity, specialization):
        """Generate recommendation based on prediction"""
        if prediction == 1:
            return f"Tailor is well-suited for this order. Expertise ({expertise}) matches complexity ({complexity})."
        else:
            reasons = []
            if expertise < complexity:
                reasons.append(f"expertise level ({expertise}) is below order complexity ({complexity})")
            if workload >= 80:
                reasons.append(f"high workload ({workload}%)")
            if specialization < 5:
                reasons.append(f"low specialization match ({specialization}/10)")
            
            return f"Not recommended: {', '.join(reasons)}. Consider assigning to a different tailor."

if __name__ == '__main__':
    # Train and test the model
    model = TailorAllocationModel()
    model.train()
    
    # Test predictions
    print("\n" + "="*60)
    print("Test Predictions:")
    print("="*60)
    
    test_cases = [
        {
            'expertise_level': 9,
            'current_workload': 45,
            'order_complexity': 7,
            'deadline_days': 10,
            'specialization_match': 8,
            'customer_priority': 3
        },
        {
            'expertise_level': 4,
            'current_workload': 85,
            'order_complexity': 9,
            'deadline_days': 3,
            'specialization_match': 3,
            'customer_priority': 5
        }
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}:")
        print(f"  Inputs: {case}")
        result = model.predict(**case)
        print(f"  Result: {result}")








