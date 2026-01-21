# 🧪 **TEST ALL 5 ML MODELS - Quick Guide**

## ✅ **All Models Are Ready**

All 5 machine learning models are trained, deployed, and ready to test!

---

## 🚀 **Step-by-Step Testing Guide**

### **Step 1: Verify Python API is Running**

The Python API should auto-reload. Check your terminal:
```
🐍 Python ML API Server
Starting server on http://localhost:5001
Available endpoints:
  GET  /health
  POST /predict/customer-preference
  POST /predict/fabric-recommendation
  POST /predict/tailor-allocation          ← NEW!
  POST /predict/order-delay                ← NEW!
  POST /predict/customer-satisfaction      ← NEW!
  GET  /models/status
```

### **Step 2: Open ML Dashboard**

1. Go to: `http://localhost:3000`
2. Login as Admin
3. Click "🤖 AI/ML" in sidebar
4. You should see **5 model cards**:
   - 🎯 Customer Preference (KNN)
   - 🧵 Fabric Recommendation (Naive Bayes)
   - 👷 Tailor Allocation (Decision Tree)
   - ⚠️ Delay Risk Detection (SVM)
   - 😊 Satisfaction Prediction (BPNN)

### **Step 3: Check Model Status**

Each card should show:
- ✅ Status: "Trained & Active"
- 📊 Accuracy: 86% - 100%
- 📅 Last Trained: Today's date
- 🔢 Predictions: 0 (will increase when you test)

### **Step 4: Run Quick Test**

Click the **"🧪 Run Quick Test"** button!

This will test all 5 models at once and show results like:

```json
🎯 Customer Preference Prediction:
{
  "preferenceValue": 2,
  "preferenceLabel": "Quality-Focused",
  "confidence": 100.0
}

🧵 Fabric Recommendation:
{
  "fabricValue": 2,
  "fabricLabel": "Wool",
  "confidence": 100.0
}

👷 Tailor Allocation:
{
  "suitable": true,
  "suitability": "Suitable",
  "confidence": 1.0,
  "recommendation": "Tailor is well-suited..."
}

⚠️ Order Delay Detection:
{
  "will_delay": false,
  "status": "On Track",
  "delay_risk": 0.23,
  "risk_level": "Low",
  "recommendation": "Order is on track..."
}

😊 Customer Satisfaction:
{
  "satisfaction_score": 7.96,
  "satisfaction_level": "Good",
  "rating_out_of_5": 3.98,
  "recommendation": "Good experience expected..."
}
```

---

## 🔬 **Manual Testing (via Terminal/Postman)**

### Test 1: Customer Preference (KNN)
```bash
curl -X POST http://localhost:5001/predict/customer-preference \
  -H "Content-Type: application/json" \
  -d "{\"previousOrders\": 15, \"avgOrderValue\": 8000, \"fabricPreference\": 2, \"designComplexity\": 4}"
```

### Test 2: Fabric Recommendation (Naive Bayes)
```bash
curl -X POST http://localhost:5001/predict/fabric-recommendation \
  -H "Content-Type: application/json" \
  -d "{\"season\": 1, \"occasion\": 2, \"priceRange\": 2, \"skinTone\": 1}"
```

### Test 3: Tailor Allocation (Decision Tree)
```bash
curl -X POST http://localhost:5001/predict/tailor-allocation \
  -H "Content-Type: application/json" \
  -d "{\"expertise_level\": 9, \"current_workload\": 45, \"order_complexity\": 7, \"deadline_days\": 10, \"specialization_match\": 8, \"customer_priority\": 3}"
```

### Test 4: Order Delay (SVM)
```bash
curl -X POST http://localhost:5001/predict/order-delay \
  -H "Content-Type: application/json" \
  -d "{\"order_complexity\": 8, \"item_count\": 5, \"tailor_availability\": 3, \"material_stock\": 25, \"lead_time\": 3, \"customer_priority\": 5, \"is_rush_order\": 1}"
```

### Test 5: Customer Satisfaction (BPNN)
```bash
curl -X POST http://localhost:5001/predict/customer-satisfaction \
  -H "Content-Type: application/json" \
  -d "{\"service_quality\": 9.0, \"delivery_speed\": 8.5, \"product_quality\": 9.2, \"pricing_fairness\": 7.5, \"communication\": 8.0, \"tailor_expertise\": 9.0}"
```

---

## 📊 **Expected Results Summary**

| Model | Input Example | Output |
|-------|---------------|--------|
| **KNN** | Previous orders: 10, Value: 5000 | Quality-Focused (100% confidence) |
| **Naive Bayes** | Season: Fall, Occasion: Formal | Wool fabric (100% confidence) |
| **Decision Tree** | Expertise: 8, Workload: 50% | Suitable (confidence 0.95) |
| **SVM** | Complexity: 5, Stock: 70% | On Track - Low Risk (23%) |
| **BPNN** | Service: 8, Quality: 8.5 | Good satisfaction (7.96/10) |

---

## ✅ **Success Checklist**

- [ ] All 5 models show "Trained & Active"
- [ ] All accuracies are displayed correctly (86%-100%)
- [ ] Last trained date shows today
- [ ] Quick test runs successfully
- [ ] All 5 predictions appear in test results
- [ ] No errors in browser console
- [ ] No errors in Python API terminal

---

## 🐛 **Troubleshooting**

### If models don't show as trained:
```bash
# Retrain all models
cd backend/ml/python
python train_all_models.py
```

### If Python API doesn't show new endpoints:
```bash
# Stop the API (Ctrl+C) and restart
cd backend/ml/python
python api.py
```

### If frontend doesn't update:
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Click "🔄 Refresh" button on ML Dashboard

---

## 🎯 **All Systems Ready!**

Your complete ML system includes:
- ✅ 5 trained models
- ✅ Python Flask API (port 5001)
- ✅ Node.js backend (port 5000)
- ✅ React frontend (port 3000)
- ✅ MongoDB database
- ✅ Real-time predictions
- ✅ Professional dashboard

**Everything is production-ready for your assignment!** 🚀








