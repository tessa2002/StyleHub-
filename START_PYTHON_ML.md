# 🚀 START HERE - Python ML

## ⚡ Quick Commands

### Step 1: Install
```powershell
cd C:\Users\HP\style_hub\backend\ml\python
pip install -r requirements.txt
```

### Step 2: Train
```powershell
python train_all_models.py
```

### Step 3: Start API
```powershell
python api.py
```

### Step 4: Test
```powershell
curl http://localhost:5001/health
```

---

## 📸 What You'll See

### After Training:
```
🤖 TRAINING ALL ML MODELS - Python Edition
============================================================

1️⃣  Customer Preference Classification (KNN)
✅ Model trained successfully!
   Accuracy: 85.50%

2️⃣  Fabric Recommendation (Naive Bayes)
✅ Model trained successfully!
   Accuracy: 82.30%

🎉 ALL MODELS TRAINED SUCCESSFULLY!
```

### After Starting API:
```
🐍 Python ML API Server
Starting server on http://localhost:5001

Available endpoints:
  POST /predict/customer-preference
  POST /predict/fabric-recommendation
```

---

## 🎯 Where Everything Is

| What | Where | Command |
|------|-------|---------|
| **Train Models** | Terminal | `python train_all_models.py` |
| **See Predictions** | Browser/API | `http://localhost:5001/predict/*` |
| **Frontend UI** | Browser | `http://localhost:3000/admin/ml` |

---

**Full guide:** See `PYTHON_ML_SETUP.md`








