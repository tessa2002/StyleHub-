# 🚀 Quick Install Guide - ML Integration

## Installation Steps

### 1. Install Dependencies (5 minutes)

```bash
cd backend
npm install
```

This will install the new ML packages:
- brain.js
- ml-knn
- ml-naivebayes
- ml-cart
- ml-svm

### 2. Test ML Models (2 minutes)

```bash
node backend/ml/test-ml-models.js
```

You should see:
```
🤖 Style Hub ML Models Test Suite
============================================================

1️⃣  Testing KNN - Customer Preference Classification
------------------------------------------------------------
Training KNN model with 100 samples...
✅ KNN model trained successfully
📊 Accuracy: 85.00%
📊 F1-Score: 0.847
...

✅ All 5 ML Models Successfully Tested!
```

### 3. Start Server (1 minute)

```bash
cd backend
npm start
```

Server should start with ML routes loaded.

### 4. Login as Admin

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@stylehub.local",
  "password": "Admin@123"
}
```

Copy the token from response.

### 5. Train All Models (1 minute)

```bash
POST http://localhost:5000/api/ml/train-all
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

Response:
```json
{
  "success": true,
  "message": "All ML models trained successfully",
  "results": {
    "knn": { "accuracy": "85.00%" },
    "naiveBayes": { "accuracy": "82.00%" },
    "decisionTree": { "accuracy": "88.00%" },
    "svm": { "accuracy": "86.00%" },
    "bpnn": { "accuracy": "90.00%" }
  }
}
```

### 6. Check Status

```bash
GET http://localhost:5000/api/ml/status
Authorization: Bearer YOUR_TOKEN_HERE
```

Response:
```json
{
  "success": true,
  "status": "ML System Online",
  "models": {
    "knn": { "trained": true },
    "naiveBayes": { "trained": true },
    "decisionTree": { "trained": true },
    "svm": { "trained": true },
    "bpnn": { "trained": true }
  }
}
```

## ✅ Installation Complete!

Your ML system is now ready to use!

## Quick Test Each Model

### 1. Test KNN (Customer Style)
```bash
POST http://localhost:5000/api/ml/knn/predict
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "customerData": {
    "age": 35,
    "measurements": { "chest": 95, "waist": 85 },
    "orderHistory": [1, 2, 3],
    "avgOrderPrice": 3000,
    "prefersEmbroidery": true
  }
}
```

### 2. Test Naïve Bayes (Fabric)
```bash
POST http://localhost:5000/api/ml/naivebayes/predict
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "season": "summer",
  "gender": "female",
  "dressType": "saree"
}
```

### 3. Test Decision Tree (Tailor)
```bash
POST http://localhost:5000/api/ml/decisiontree/predict
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "orderData": {
    "complexity": "high",
    "orderType": "sherwani",
    "embroideryRequired": true
  }
}
```

### 4. Test SVM (Delay Risk)
```bash
POST http://localhost:5000/api/ml/svm/predict
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "orderData": {
    "orderType": "lehenga",
    "fabricSource": "order",
    "currentWorkload": 8,
    "daysUntilDelivery": 5,
    "embroideryRequired": true,
    "tailorExperience": 2,
    "isSeasonPeak": true
  }
}
```

### 5. Test BPNN (Satisfaction)
```bash
POST http://localhost:5000/api/ml/bpnn/predict
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "feedbackData": {
    "fittingQuality": 9,
    "deliverySpeed": 8,
    "priceValue": 7,
    "communication": 9,
    "overallQuality": 8,
    "customizationSatisfaction": 9,
    "previousOrders": 5
  }
}
```

## Using Postman or Thunder Client?

Import this collection:

1. Create new request
2. Set method to POST
3. Set URL to `http://localhost:5000/api/ml/[endpoint]`
4. Add header: `Authorization: Bearer YOUR_TOKEN`
5. Add header: `Content-Type: application/json`
6. Add body with JSON from examples above

## Troubleshooting

### "Cannot find module 'brain.js'"
```bash
cd backend
npm install brain.js ml-knn ml-naivebayes ml-cart ml-svm --save
```

### "Model not trained"
First train the model:
```bash
POST /api/ml/train-all
# or individually
POST /api/ml/knn/train
```

### "Unauthorized"
Make sure you:
1. Login first to get token
2. Include token in Authorization header
3. Token is valid and not expired

## Next Steps

1. ✅ Read full documentation: `ML_INTEGRATION_COMPLETE.md`
2. ✅ Review API details: `backend/ml/README.md`
3. ✅ Integrate into frontend (examples provided)
4. ✅ Train with real production data

## Need Help?

Check these files:
- `ML_INTEGRATION_COMPLETE.md` - Complete overview
- `backend/ml/README.md` - API documentation
- `backend/ml/test-ml-models.js` - Working examples

---

**Total Installation Time: ~10 minutes**

🎉 Enjoy your new ML-powered Style Hub!








