# 🐍 Python ML Models for Style Hub

## Overview

This directory contains **Python-based machine learning models** using scikit-learn and TensorFlow.

**Why Python?**
- More powerful ML libraries (scikit-learn, TensorFlow)
- Better accuracy and performance
- Industry-standard for ML/AI
- Easier to train and maintain

---

## 📁 Structure

```
python/
├── requirements.txt              # Python dependencies
├── train_all_models.py          # Train all models
├── api.py                       # Flask API server
├── models/                      # ML model implementations
│   ├── knn_customer_preference.py
│   ├── naivebayes_fabric.py
│   └── ... (more models)
└── saved_models/                # Trained model files (.pkl)
    ├── knn_customer_preference.pkl
    └── naivebayes_fabric.pkl
```

---

## 🚀 Quick Start

### Step 1: Install Python Dependencies

```powershell
# Make sure you have Python 3.8+ installed
python --version

# Navigate to the python directory
cd C:\Users\HP\style_hub\backend\ml\python

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Train Models

```powershell
# Train all ML models
python train_all_models.py
```

**Output:**
```
🤖 TRAINING ALL ML MODELS - Python Edition
============================================================

1️⃣  Customer Preference Classification (KNN)
------------------------------------------------------------
📊 Training Customer Preference Model (KNN)...
✅ Model trained successfully!
   Accuracy: 85.50%
   Model saved to: backend/ml/python/saved_models/knn_customer_preference.pkl

2️⃣  Fabric Recommendation (Naive Bayes)
------------------------------------------------------------
📊 Training Fabric Recommendation Model (Naive Bayes)...
✅ Model trained successfully!
   Accuracy: 82.30%
   Model saved to: backend/ml/python/saved_models/naivebayes_fabric.pkl

🎉 ALL MODELS TRAINED SUCCESSFULLY!
```

### Step 3: Start Python API Server

```powershell
# Start the Flask API server
python api.py
```

**Server will run on:** `http://localhost:5001`

### Step 4: Test Predictions

**Option A: Using curl**
```powershell
curl -X POST http://localhost:5001/predict/customer-preference ^
  -H "Content-Type: application/json" ^
  -d "{\"previousOrders\":10,\"avgOrderValue\":5000,\"fabricPreference\":1,\"designComplexity\":3}"
```

**Option B: Using browser/Postman**
```
POST http://localhost:5001/predict/customer-preference
Body: {
  "previousOrders": 10,
  "avgOrderValue": 5000,
  "fabricPreference": 1,
  "designComplexity": 3
}
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "preference": 1,
    "preferenceLabel": "Quality-Focused",
    "confidence": 0.87,
    "probabilities": {
      "budget": 0.05,
      "quality": 0.87,
      "luxury": 0.08
    }
  }
}
```

---

## 🎯 ML Models

### 1. Customer Preference (KNN)

**File:** `models/knn_customer_preference.py`

**Purpose:** Classify customers into Budget-Conscious, Quality-Focused, or Luxury-Seeker

**Input:**
- `previousOrders`: Number of previous orders (1-30)
- `avgOrderValue`: Average order value in ₹ (1000-15000)
- `fabricPreference`: Preferred fabric type (0-3)
- `designComplexity`: Design complexity level (1-5)

**Output:**
- `preference`: 0 (Budget), 1 (Quality), 2 (Luxury)
- `preferenceLabel`: Human-readable label
- `confidence`: Prediction confidence (0-1)
- `probabilities`: Probability for each category

**API Endpoint:**
```
POST http://localhost:5001/predict/customer-preference
```

---

### 2. Fabric Recommendation (Naive Bayes)

**File:** `models/naivebayes_fabric.py`

**Purpose:** Recommend best fabric type based on occasion and preferences

**Input:**
- `season`: 0 (Spring), 1 (Summer), 2 (Fall), 3 (Winter)
- `occasion`: 0 (Casual), 1 (Formal), 2 (Party)
- `priceRange`: 0 (Budget), 1 (Mid), 2 (Premium)
- `skinTone`: 0 (Fair), 1 (Medium), 2 (Dark)

**Output:**
- `fabricType`: 0 (Cotton), 1 (Silk), 2 (Wool), 3 (Linen)
- `fabricLabel`: Human-readable label
- `confidence`: Prediction confidence (0-1)
- `probabilities`: Probability for each fabric type

**API Endpoint:**
```
POST http://localhost:5001/predict/fabric-recommendation
```

---

## 🔗 Integration with Node.js Backend

### Update Node.js ML Routes

Modify `backend/routes/ml.js` to call Python API:

```javascript
const axios = require('axios');

// Python API base URL
const PYTHON_API = 'http://localhost:5001';

// Customer Preference Prediction
router.post('/knn/predict', auth, async (req, res) => {
  try {
    const response = await axios.post(
      `${PYTHON_API}/predict/customer-preference`,
      req.body
    );
    res.json(response.data.prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fabric Recommendation
router.post('/naivebayes/predict', auth, async (req, res) => {
  try {
    const response = await axios.post(
      `${PYTHON_API}/predict/fabric-recommendation`,
      req.body
    );
    res.json(response.data.prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📊 Training Custom Data

### Add Your Own Data

Edit the `generate_training_data()` method in each model file:

```python
# In models/knn_customer_preference.py

def generate_training_data(self, n_samples=200):
    # Load from CSV or database
    import pandas as pd
    
    # Example: Load from CSV
    df = pd.read_csv('your_customer_data.csv')
    X = df[['previousOrders', 'avgOrderValue', 'fabricPreference', 'designComplexity']].values
    y = df['customerType'].values
    
    return X, y
```

---

## 🧪 Testing Models

### Test Individual Model

```powershell
# Test Customer Preference Model
python backend/ml/python/models/knn_customer_preference.py

# Test Fabric Recommendation Model
python backend/ml/python/models/naivebayes_fabric.py
```

### Test API Endpoints

```powershell
# Check API health
curl http://localhost:5001/health

# Check models status
curl http://localhost:5001/models/status
```

---

## 📦 Deployment

### Production Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Train models:**
```bash
python train_all_models.py
```

3. **Run with production server (Gunicorn):**
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 api:app
```

---

## 🐛 Troubleshooting

### Issue: `ModuleNotFoundError`
```powershell
# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: Model not trained
```powershell
# Train models
python train_all_models.py
```

### Issue: Port 5001 already in use
```powershell
# Kill process on port 5001
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

---

## 📚 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/models/status` | Get all models status |
| POST | `/predict/customer-preference` | Predict customer type |
| POST | `/predict/fabric-recommendation` | Recommend fabric |

---

## ✅ Next Steps

1. ✅ Install Python dependencies
2. ✅ Train ML models
3. ✅ Start Python API server
4. ✅ Test predictions
5. ⬜ Integrate with Node.js backend
6. ⬜ Update frontend to use Python predictions
7. ⬜ Deploy to production

---

**Happy ML Training! 🐍🤖**








