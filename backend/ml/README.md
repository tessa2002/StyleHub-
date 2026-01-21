# Machine Learning Integration Guide

## Overview

This ML integration adds 5 powerful machine learning models to Style Hub for intelligent decision-making and predictions.

## Models Implemented

### 1. K-Nearest Neighbors (KNN) - Customer Preference Classification
**Purpose**: Predicts a customer's preferred clothing style (Casual, Formal, Traditional)

**Input Features**:
- Customer age
- Measurements (chest, waist)
- Order history count
- Average order price
- Embroidery preference

**Output**: "Casual", "Formal", or "Traditional"

**Metrics**: Accuracy, F1-Score

**API Endpoint**: 
```
POST /api/ml/knn/predict
{
  "customerId": "customer_id_here",
  "age": 30
}
```

---

### 2. Naïve Bayes - Fabric Type Recommendation
**Purpose**: Recommends suitable fabric type based on season, gender, and dress type

**Input Features**:
- Season (summer, winter, monsoon, spring)
- Gender (male, female, other)
- Dress type (kurta, shirt, dress, etc.)

**Output**: "Cotton", "Silk", "Linen", "Polyester", "Wool", "Chiffon", "Georgette"

**Metrics**: Accuracy, Recall

**API Endpoint**:
```
POST /api/ml/naivebayes/predict
{
  "season": "summer",
  "gender": "female",
  "dressType": "saree"
}
```

---

### 3. Decision Tree - Tailor Allocation Optimization
**Purpose**: Assigns the best tailor for an order based on complexity and tailor capabilities

**Input Features**:
- Order complexity (low, medium, high, very high)
- Tailor skill level
- Current workload
- Tailor experience
- Embroidery requirement
- Specialization match

**Output**: Tailor ID with confidence score and reasoning

**Metrics**: Accuracy, Precision

**API Endpoint**:
```
POST /api/ml/decisiontree/predict
{
  "orderId": "order_id_here",
  "complexity": "high"
}
```

---

### 4. Support Vector Machine (SVM) - Order Delay Risk Detection
**Purpose**: Predicts if an order will be On-Time or Delayed

**Input Features**:
- Order type complexity
- Fabric availability
- Current workload
- Days until delivery
- Embroidery required
- Tailor experience
- Season peak status

**Output**: "On-Time" or "Delayed" with risk score and recommendations

**Metrics**: Accuracy, F1-Score

**API Endpoint**:
```
POST /api/ml/svm/predict
{
  "orderId": "order_id_here",
  "isSeasonPeak": false
}
```

---

### 5. Backpropagation Neural Network (BPNN) - Customer Satisfaction Prediction
**Purpose**: Predicts overall customer satisfaction after delivery

**Input Features** (all rated 0-10):
- Fitting quality
- Delivery speed
- Price value
- Communication
- Overall quality
- Customization satisfaction
- Previous orders count

**Output**: "Low", "Medium", or "High" satisfaction with detailed insights

**Metrics**: Accuracy, MSE, F1-Score

**API Endpoint**:
```
POST /api/ml/bpnn/predict
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

---

## Setup and Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

This will install:
- `brain.js` - Neural network library
- `ml-knn` - K-Nearest Neighbors
- `ml-naivebayes` - Naïve Bayes
- `ml-cart` - Decision Tree (CART algorithm)
- `ml-svm` - Support Vector Machine

### 2. Train All Models
You can train all models at once with sample data:

**API Call**:
```
POST /api/ml/train-all
Authorization: Bearer <admin_token>
```

**Response**:
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

### 3. Train Individual Models

Each model can be trained separately:

```bash
# KNN
POST /api/ml/knn/train

# Naïve Bayes
POST /api/ml/naivebayes/train

# Decision Tree
POST /api/ml/decisiontree/train

# SVM
POST /api/ml/svm/train

# BPNN
POST /api/ml/bpnn/train
```

---

## Usage Examples

### Example 1: Predict Customer Style Preference

**Scenario**: New customer walks in, you want to know their style preference

```javascript
// Frontend code
const predictStyle = async (customerId, age) => {
  const response = await fetch('/api/ml/knn/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      customerId,
      age
    })
  });
  
  const result = await response.json();
  console.log(result.prediction);
  /*
  {
    style: "Traditional",
    confidence: "87.45%",
    features: {
      age: 45,
      chest: 95,
      waist: 85,
      orderCount: 5,
      avgPrice: 3500,
      embroideryPref: true
    }
  }
  */
};
```

### Example 2: Recommend Fabric

**Scenario**: Customer wants a summer dress

```javascript
const recommendFabric = async () => {
  const response = await fetch('/api/ml/naivebayes/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      season: "summer",
      gender: "female",
      dressType: "dress"
    })
  });
  
  const result = await response.json();
  console.log(result.prediction.fabricType); // "Cotton"
};
```

### Example 3: Assign Tailor to Order

**Scenario**: Admin assigns order to best tailor

```javascript
const assignBestTailor = async (orderId) => {
  const response = await fetch('/api/ml/decisiontree/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      orderId,
      complexity: "high"
    })
  });
  
  const result = await response.json();
  /*
  {
    assignedTailor: "60d5ec49f1b2c8b4f8c8e8e1",
    tailorName: "Ravi Kumar",
    confidence: "92.34%",
    reasoning: "Low current workload, Skill level matches order complexity, Has relevant specialization"
  }
  */
};
```

### Example 4: Check Delay Risk

**Scenario**: Check if order might be delayed

```javascript
const checkDelayRisk = async (orderId) => {
  const response = await fetch('/api/ml/svm/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      orderId,
      isSeasonPeak: false
    })
  });
  
  const result = await response.json();
  /*
  {
    status: "Delayed",
    riskScore: "75.34%",
    riskLevel: "High",
    riskFactors: ["High complexity order", "Short delivery timeline"],
    recommendations: [
      "Assign to experienced tailor and schedule regular progress checks",
      "Negotiate extended delivery date or allocate priority resources"
    ]
  }
  */
};
```

### Example 5: Predict Satisfaction

**Scenario**: After delivery, predict customer satisfaction

```javascript
const predictSatisfaction = async (feedbackScores) => {
  const response = await fetch('/api/ml/bpnn/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      feedbackData: {
        fittingQuality: 9,
        deliverySpeed: 8,
        priceValue: 7,
        communication: 9,
        overallQuality: 8,
        customizationSatisfaction: 9,
        previousOrders: 5
      }
    })
  });
  
  const result = await response.json();
  /*
  {
    satisfaction: "High",
    confidence: "94.56%",
    probabilities: {
      Low: "2.34%",
      Medium: "3.10%",
      High: "94.56%"
    },
    overallScore: "8.40",
    insights: {
      insights: ["Excellent fitting quality", "Fast delivery appreciated"],
      recommendations: ["Maintain current service standards"],
      riskLevel: "Low"
    }
  }
  */
};
```

---

## System Status

Check ML system status:

```
GET /api/ml/status
Authorization: Bearer <token>
```

Response:
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

---

## Get Saved Models

View all trained models:

```
GET /api/ml/models
Authorization: Bearer <token>
```

---

## File Structure

```
backend/
├── ml/
│   ├── models/
│   │   ├── knn-customer-preference.js
│   │   ├── naivebayes-fabric-recommendation.js
│   │   ├── decisiontree-tailor-allocation.js
│   │   ├── svm-order-delay.js
│   │   └── bpnn-satisfaction-prediction.js
│   ├── data/
│   │   └── training-data-generator.js
│   └── README.md (this file)
├── models/
│   └── MLModel.js (MongoDB schema)
└── routes/
    └── ml.js (API routes)
```

---

## Best Practices

1. **Train models regularly** with real data from your database
2. **Monitor accuracy** and retrain when accuracy drops
3. **Use predictions as suggestions** not absolute decisions
4. **Combine with human judgment** for critical decisions
5. **Collect feedback** to improve model performance over time

---

## Future Enhancements

- Automated retraining based on new data
- A/B testing for model versions
- Real-time prediction streaming
- Model performance dashboards
- Export/import trained models
- Integration with customer portal for personalized recommendations

---

## Support

For issues or questions:
1. Check the API endpoint documentation above
2. Review the model implementation files
3. Test with sample data first
4. Monitor server logs for errors

---

## License

Part of Style Hub Boutique Management System








