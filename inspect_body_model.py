
import joblib
import os
import pandas as pd

def inspect_model(path):
    if not os.path.exists(path):
        print(f"Error: {path} not found")
        return

    print(f"Inspecting model at: {path}")
    try:
        model = joblib.load(path)
        print(f"Loaded successfully")
        print(f"Model type: {type(model)}")
        
        if hasattr(model, 'feature_names_in_'):
            print(f"Feature names: {model.feature_names_in_}")
        if hasattr(model, 'coef_'):
            print(f"Coefficients: {model.coef_}")
        if hasattr(model, 'intercept_'):
            print(f"Intercept: {model.intercept_}")

        # Try a sample prediction
        try:
            sample_data = {
                'Height_cm': [170],
                'Weight_kg': [70],
                'ShoulderWidth_cm': [45]
            }
            sample_df = pd.DataFrame(sample_data)
            p = model.predict(sample_df)[0]
            print(f"\nSample prediction for Height=170, Weight=70, Shoulder=45:")
            print(f"  Chest: {p[0]:.1f} cm")
            print(f"  Waist: {p[1]:.1f} cm")
            print(f"  Hips: {p[2]:.1f} cm")
        except Exception as e:
            print(f"Could not make prediction: {e}")
            
    except Exception as e:
        print(f"Error inspecting model: {e}")

if __name__ == "__main__":
    inspect_model('body_model.pkl')
