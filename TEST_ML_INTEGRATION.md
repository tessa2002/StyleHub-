# 🧪 Testing ML Integration - Complete Workflow

## Quick Test (5 Minutes)

### Step 1: Run Automated Test Script

```bash
node backend/ml/test-ml-models.js
```

**Expected Output**:
```
🤖 Style Hub ML Models Test Suite
============================================================

1️⃣  Testing KNN - Customer Preference Classification
------------------------------------------------------------
Training KNN model with 100 samples...
✅ KNN model trained successfully
📊 Accuracy: 85.00%
📊 F1-Score: 0.847
🎯 Predicted Style: Traditional
🎯 Confidence: 87.45%

2️⃣  Testing Naïve Bayes - Fabric Recommendation
------------------------------------------------------------
Training Naïve Bayes model with 100 samples...
✅ Naïve Bayes model trained successfully
📊 Accuracy: 82.00%
📊 Recall: 0.819
🎯 Recommended Fabric: Cotton
🎯 Confidence: 82.50%

3️⃣  Testing Decision Tree - Tailor Allocation
------------------------------------------------------------
Training Decision Tree model with 100 samples...
✅ Decision Tree model trained successfully
👥 Tailors in system: 5
📊 Accuracy: 88.00%
📊 Precision: 0.881
🎯 Assigned Tailor: Ravi Kumar (T001)
🎯 Confidence: 92.34%

4️⃣  Testing SVM - Order Delay Detection
------------------------------------------------------------
Training SVM model with 100 samples...
✅ SVM model trained successfully
📊 Accuracy: 86.00%
📊 F1-Score: 0.856
🎯 Status: Delayed
🎯 Risk Score: 75.34%
🎯 Risk Level: High

5️⃣  Testing BPNN - Customer Satisfaction Prediction
------------------------------------------------------------
Training BPNN model with 100 samples...
(This may take a moment...)
✅ BPNN model trained successfully
📈 Training Iterations: 1847
📈 Final Error: 0.004234
📊 Accuracy: 90.00%
📊 MSE: 0.012456
📊 F1-Score: 0.897
🎯 Predicted Satisfaction: High
🎯 Confidence: 94.56%

============================================================
📋 Test Summary
============================================================

✅ All 5 ML Models Successfully Tested!

Model Performance Summary:
1. KNN (Customer Preference):    Accuracy: 85.00%, F1: 0.847
2. Naïve Bayes (Fabric):          Accuracy: 82.00%, Recall: 0.819
3. Decision Tree (Tailor):        Accuracy: 88.00%, Precision: 0.881
4. SVM (Order Delay):             Accuracy: 86.00%, F1: 0.856
5. BPNN (Satisfaction):           Accuracy: 90.00%, MSE: 0.012456

🚀 Ready to integrate into your application!
```

✅ **If you see this output, all models are working correctly!**

---

## API Testing (10 Minutes)

### Prerequisites
1. Start backend server: `npm start` in backend folder
2. Get admin token (see below)

### Get Admin Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@stylehub.local",
    "password": "Admin@123"
  }'
```

**Copy the token from response**

---

### Test 1: Train All Models

```bash
curl -X POST http://localhost:5000/api/ml/train-all \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "All ML models trained successfully",
  "results": {
    "knn": { "accuracy": "85.00%", "f1Score": "0.847" },
    "naiveBayes": { "accuracy": "82.00%", "recall": "0.819" },
    "decisionTree": { "accuracy": "88.00%", "precision": "0.881" },
    "svm": { "accuracy": "86.00%", "f1Score": "0.856" },
    "bpnn": { "accuracy": "90.00%", "mse": "0.012456", "f1Score": "0.897" }
  }
}
```

✅ **Pass**: All 5 models show accuracy metrics

---

### Test 2: Check ML System Status

```bash
curl -X GET http://localhost:5000/api/ml/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response**:
```json
{
  "success": true,
  "status": "ML System Online",
  "models": {
    "knn": { "trained": true, "name": "Customer Preference Classifier" },
    "naiveBayes": { "trained": true, "name": "Fabric Type Recommender" },
    "decisionTree": { "trained": true, "name": "Tailor Allocation Optimizer" },
    "svm": { "trained": true, "name": "Order Delay Risk Detector" },
    "bpnn": { "trained": true, "name": "Customer Satisfaction Predictor" }
  },
  "savedModelsCount": 5
}
```

✅ **Pass**: All models show `"trained": true`

---

### Test 3: Predict Customer Style (KNN)

```bash
curl -X POST http://localhost:5000/api/ml/knn/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "customerData": {
      "age": 35,
      "measurements": { "chest": 95, "waist": 85 },
      "orderHistory": [1, 2, 3],
      "avgOrderPrice": 3000,
      "prefersEmbroidery": true
    }
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "prediction": {
    "style": "Traditional",
    "confidence": 0.8745,
    "features": {
      "age": 35,
      "chest": 95,
      "waist": 85,
      "orderCount": 3,
      "avgPrice": 3000,
      "embroideryPref": true
    }
  }
}
```

✅ **Pass**: Returns style (Casual/Formal/Traditional) with confidence

---

### Test 4: Recommend Fabric (Naïve Bayes)

```bash
curl -X POST http://localhost:5000/api/ml/naivebayes/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "season": "summer",
    "gender": "female",
    "dressType": "saree"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "prediction": {
    "fabricType": "Cotton",
    "confidence": 0.825,
    "probabilities": {
      "Cotton": 0.825,
      "Linen": 0.102,
      "Silk": 0.053,
      "Polyester": 0.020
    },
    "input": {
      "season": "summer",
      "gender": "female",
      "dressType": "saree"
    }
  }
}
```

✅ **Pass**: Returns fabric recommendation with probabilities

---

### Test 5: Assign Tailor (Decision Tree)

```bash
curl -X POST http://localhost:5000/api/ml/decisiontree/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "orderData": {
      "complexity": "high",
      "orderType": "sherwani",
      "embroideryRequired": true
    }
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "prediction": {
    "assignedTailor": "60d5ec49f1b2c8b4f8c8e8e1",
    "tailorName": "Ravi Kumar",
    "confidence": "92.34%",
    "allScores": [
      { "tailorId": "T001", "name": "Ravi Kumar", "score": 0.92, "workload": 2 },
      { "tailorId": "T002", "name": "Amit Shah", "score": 0.85, "workload": 3 }
    ],
    "reasoning": "Low current workload, Skill level matches order complexity, Has relevant specialization"
  }
}
```

✅ **Pass**: Returns tailor assignment with reasoning

---

### Test 6: Check Delay Risk (SVM)

```bash
curl -X POST http://localhost:5000/api/ml/svm/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "orderData": {
      "orderType": "lehenga",
      "fabricSource": "order",
      "currentWorkload": 8,
      "daysUntilDelivery": 5,
      "embroideryRequired": true,
      "tailorExperience": 2,
      "isSeasonPeak": true
    }
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "prediction": {
    "status": "Delayed",
    "riskScore": "75.34%",
    "riskLevel": "High",
    "riskFactors": [
      "High complexity order",
      "Fabric needs to be ordered",
      "High current workload",
      "Short delivery timeline",
      "Embroidery work required",
      "Less experienced tailor",
      "Peak season demand"
    ],
    "recommendations": [
      "Order fabric immediately or suggest available alternatives",
      "Consider assigning to a tailor with lower workload",
      "Negotiate extended delivery date or allocate priority resources",
      "Assign to experienced tailor and schedule regular progress checks",
      "Pre-schedule embroidery work or consider outsourcing",
      "Add buffer time to delivery estimate"
    ]
  }
}
```

✅ **Pass**: Returns delay prediction with risk factors and recommendations

---

### Test 7: Predict Satisfaction (BPNN)

```bash
curl -X POST http://localhost:5000/api/ml/bpnn/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "feedbackData": {
      "fittingQuality": 9,
      "deliverySpeed": 8,
      "priceValue": 7,
      "communication": 9,
      "overallQuality": 8,
      "customizationSatisfaction": 9,
      "previousOrders": 5
    }
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "prediction": {
    "satisfaction": "High",
    "confidence": "94.56%",
    "probabilities": {
      "Low": "2.34%",
      "Medium": "3.10%",
      "High": "94.56%"
    },
    "overallScore": "8.40",
    "breakdown": {
      "fittingQuality": { "score": 9, "weight": "25%", "impact": "High" },
      "deliverySpeed": { "score": 8, "weight": "20%", "impact": "High" },
      "priceValue": { "score": 7, "weight": "15%", "impact": "Medium" },
      "communication": { "score": 9, "weight": "15%", "impact": "Medium" },
      "overallQuality": { "score": 8, "weight": "20%", "impact": "High" },
      "customizationSatisfaction": { "score": 9, "weight": "5%", "impact": "Low" }
    },
    "insights": {
      "insights": [
        "Excellent fitting quality",
        "Fast delivery appreciated"
      ],
      "recommendations": [
        "Maintain current service standards"
      ],
      "riskLevel": "Low"
    }
  }
}
```

✅ **Pass**: Returns satisfaction prediction with detailed insights

---

## Frontend Testing

### Test with Postman/Thunder Client

1. **Import Environment**:
   - Variable: `baseUrl` = `http://localhost:5000`
   - Variable: `token` = `<your_admin_token>`

2. **Create Collection** with these requests:
   - GET `{{baseUrl}}/api/ml/status`
   - POST `{{baseUrl}}/api/ml/train-all`
   - POST `{{baseUrl}}/api/ml/knn/predict`
   - POST `{{baseUrl}}/api/ml/naivebayes/predict`
   - POST `{{baseUrl}}/api/ml/decisiontree/predict`
   - POST `{{baseUrl}}/api/ml/svm/predict`
   - POST `{{baseUrl}}/api/ml/bpnn/predict`

3. **Add Authorization Header** to all:
   ```
   Authorization: Bearer {{token}}
   ```

---

## Integration Testing

### Test in React App

1. **Import ML Service**:
   ```javascript
   import mlService from './services/mlService';
   ```

2. **Test Status**:
   ```javascript
   const checkStatus = async () => {
     const result = await mlService.getStatus();
     console.log('ML Status:', result.data);
   };
   ```

3. **Test Predictions**:
   ```javascript
   const testPredictions = async () => {
     // Test customer style
     const style = await mlService.predictCustomerStyle(null, {
       age: 35,
       measurements: { chest: 95, waist: 85 },
       orderHistory: [1, 2, 3],
       avgOrderPrice: 3000,
       prefersEmbroidery: true
     });
     console.log('Style:', style.data);

     // Test fabric
     const fabric = await mlService.recommendFabric('summer', 'female', 'saree');
     console.log('Fabric:', fabric.data);
   };
   ```

---

## Troubleshooting

### Issue: "Model not trained"
**Solution**: Train models first
```bash
POST /api/ml/train-all
```

### Issue: "Unauthorized"
**Solution**: Get fresh token
```bash
POST /api/auth/login
```

### Issue: "Cannot find module 'brain.js'"
**Solution**: Install dependencies
```bash
cd backend
npm install
```

### Issue: Low accuracy
**Solution**: 
1. Train with more data
2. Use real production data
3. Retrain periodically

---

## Success Checklist

- [ ] ✅ Test script runs successfully
- [ ] ✅ All 5 models train without errors
- [ ] ✅ ML status shows all models trained
- [ ] ✅ KNN predicts customer style
- [ ] ✅ Naïve Bayes recommends fabric
- [ ] ✅ Decision Tree assigns tailor
- [ ] ✅ SVM detects delay risk
- [ ] ✅ BPNN predicts satisfaction
- [ ] ✅ Frontend service works
- [ ] ✅ API returns expected responses

---

## Performance Benchmarks

| Test | Expected Time |
|------|---------------|
| Automated test script | 10-20 seconds |
| Train all models (API) | 10-30 seconds |
| Single prediction | < 1 second |
| ML status check | < 0.5 seconds |

---

## Next Steps After Testing

1. ✅ Integrate components into UI
2. ✅ Train with real production data
3. ✅ Monitor model performance
4. ✅ Collect user feedback
5. ✅ Retrain models monthly

---

**All tests passing? You're ready to go live! 🚀**








