# 🤖 Machine Learning Workflow Guide

## Complete ML Integration Workflow for Style Hub

This guide provides a step-by-step workflow for using the 5 integrated ML models in your Style Hub application.

---

## 📊 Overview of ML Models

| Model | Purpose | Input | Output | Use Case |
|-------|---------|-------|--------|----------|
| **KNN** | Customer Preference Classification | Order history, preferences | Preference category (0-2) | Recommend similar products |
| **Naïve Bayes** | Fabric Type Recommendation | Season, occasion, price, skin tone | Fabric type (0-3) | Suggest best fabric |
| **Decision Tree** | Tailor Allocation | Order complexity, fabric, deadline | Tailor ID (1-5) | Assign orders efficiently |
| **SVM** | Order Delay Risk Detection | Complexity, availability, workload | Delay risk (0-1) | Predict delivery issues |
| **BPNN** | Customer Satisfaction Prediction | Quality metrics, experience | Satisfaction score (0-1) | Improve service quality |

---

## 🔄 Complete Workflow

### Phase 1: Setup and Training (One-time/Periodic)

#### Step 1: Start Backend Server
```powershell
# Terminal 1
cd C:\Users\HP\style_hub\backend
npm start
```

#### Step 2: Train All ML Models

**Option A: Automated Training (Recommended for first time)**
```powershell
# In a new terminal
cd C:\Users\HP\style_hub\backend
node ml/test-ml-models.js
```

This will:
- Generate sample training data
- Train all 5 models
- Test predictions
- Save models to MongoDB
- Display accuracy metrics

**Expected Output:**
```
🧪 Testing Machine Learning Models Integration
================================================

📊 Testing Customer Preference Classification (KNN)
------------------------------------------------
✅ Model trained successfully
   Accuracy: 85.5%
   Training time: 1.2s
   Sample prediction: { preference: 1, confidence: 0.87 }

📊 Testing Fabric Type Recommendation (Naïve Bayes)
------------------------------------------------
✅ Model trained successfully
   Accuracy: 82.3%
   ... (similar for other models)
```

**Option B: Train Individual Models via API**
```javascript
// Using Postman or frontend
POST http://localhost:5000/api/ml/knn/train
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "trainingData": [
    {
      "features": [10, 5000, 1, 3],
      "label": 1
    },
    // ... more data
  ]
}
```

#### Step 3: Verify Model Status
```javascript
// Check if all models are trained
GET http://localhost:5000/api/ml/all-models-status

// Response:
{
  "knn": { "trained": true, "accuracy": 85.5, "lastTrained": "2025-10-29T..." },
  "naivebayes": { "trained": true, "accuracy": 82.3, ... },
  "decisiontree": { "trained": true, "accuracy": 88.1, ... },
  "svm": { "trained": true, "accuracy": 79.8, ... },
  "bpnn": { "trained": true, "accuracy": 83.2, ... }
}
```

---

### Phase 2: Frontend Integration

#### Step 1: Start Frontend
```powershell
# Terminal 2
cd C:\Users\HP\style_hub\frontend
npm start
```

#### Step 2: Create ML-Enhanced Components

**Example 1: Customer Preference Predictor**

Create `frontend/src/components/CustomerPreferenceWidget.js`:

```javascript
import React, { useState } from 'react';
import mlService from '../services/mlService';

const CustomerPreferenceWidget = ({ customerId }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const predictPreference = async (customerData) => {
    setLoading(true);
    try {
      const result = await mlService.predictCustomerPreference({
        previousOrders: customerData.orderCount || 0,
        avgOrderValue: customerData.avgSpend || 0,
        fabricPreference: customerData.lastFabricType || 0,
        designComplexity: customerData.avgComplexity || 1
      });
      
      setPrediction(result);
    } catch (error) {
      console.error('Prediction failed:', error);
    }
    setLoading(false);
  };

  return (
    <div className="ml-widget">
      <h3>Customer Preference Analysis</h3>
      {loading && <p>Analyzing...</p>}
      {prediction && (
        <div className="prediction-result">
          <p>Predicted Preference: {getPreferenceLabel(prediction.preference)}</p>
          <p>Confidence: {(prediction.confidence * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
};

const getPreferenceLabel = (value) => {
  const labels = ['Budget-Conscious', 'Quality-Focused', 'Luxury-Seeker'];
  return labels[value] || 'Unknown';
};

export default CustomerPreferenceWidget;
```

**Example 2: Fabric Recommendation in Order Form**

Update `frontend/src/pages/portal/NewOrder.js`:

```javascript
import React, { useState, useEffect } from 'react';
import mlService from '../../services/mlService';

const NewOrder = () => {
  const [orderForm, setOrderForm] = useState({
    season: '',
    occasion: '',
    priceRange: '',
    skinTone: ''
  });
  const [recommendedFabric, setRecommendedFabric] = useState(null);

  // Auto-recommend fabric when form changes
  useEffect(() => {
    if (orderForm.season && orderForm.occasion && orderForm.priceRange) {
      recommendFabric();
    }
  }, [orderForm]);

  const recommendFabric = async () => {
    try {
      const result = await mlService.recommendFabricType({
        season: parseInt(orderForm.season),
        occasion: parseInt(orderForm.occasion),
        priceRange: parseInt(orderForm.priceRange),
        skinTone: parseInt(orderForm.skinTone || 1)
      });

      setRecommendedFabric(result);
    } catch (error) {
      console.error('Fabric recommendation failed:', error);
    }
  };

  return (
    <div className="new-order-form">
      <h2>Create New Order</h2>
      
      <select 
        value={orderForm.season} 
        onChange={(e) => setOrderForm({...orderForm, season: e.target.value})}
      >
        <option value="">Select Season</option>
        <option value="0">Spring</option>
        <option value="1">Summer</option>
        <option value="2">Fall</option>
        <option value="3">Winter</option>
      </select>

      <select 
        value={orderForm.occasion} 
        onChange={(e) => setOrderForm({...orderForm, occasion: e.target.value})}
      >
        <option value="">Select Occasion</option>
        <option value="0">Casual</option>
        <option value="1">Formal</option>
        <option value="2">Party</option>
      </select>

      <select 
        value={orderForm.priceRange} 
        onChange={(e) => setOrderForm({...orderForm, priceRange: e.target.value})}
      >
        <option value="">Select Price Range</option>
        <option value="0">Budget (₹0-₹2000)</option>
        <option value="1">Mid-range (₹2000-₹5000)</option>
        <option value="2">Premium (₹5000+)</option>
      </select>

      {/* ML Recommendation Display */}
      {recommendedFabric && (
        <div className="ml-recommendation">
          <h4>🤖 AI Recommendation</h4>
          <p>Suggested Fabric: <strong>{getFabricName(recommendedFabric.fabricType)}</strong></p>
          <p>Confidence: {(recommendedFabric.confidence * 100).toFixed(1)}%</p>
          <button onClick={() => selectFabric(recommendedFabric.fabricType)}>
            Use Recommendation
          </button>
        </div>
      )}

      {/* Rest of the form... */}
    </div>
  );
};

const getFabricName = (type) => {
  const fabrics = ['Cotton', 'Silk', 'Wool', 'Linen'];
  return fabrics[type] || 'Unknown';
};

export default NewOrder;
```

**Example 3: Tailor Allocation Dashboard**

Create `frontend/src/pages/admin/TailorAllocation.js`:

```javascript
import React, { useState, useEffect } from 'react';
import mlService from '../../services/mlService';

const TailorAllocation = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [allocations, setAllocations] = useState({});

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    // Fetch from your orders API
    const response = await fetch('/api/orders?status=pending');
    const orders = await response.json();
    setPendingOrders(orders);

    // Auto-allocate using ML
    autoAllocateAll(orders);
  };

  const autoAllocateAll = async (orders) => {
    const newAllocations = {};
    
    for (const order of orders) {
      try {
        const result = await mlService.allocateTailor({
          orderComplexity: calculateComplexity(order),
          fabricType: order.fabricType,
          deadline: calculateDeadline(order.deliveryDate),
          specialRequirements: order.customizations?.length || 0
        });

        newAllocations[order._id] = result;
      } catch (error) {
        console.error(`Allocation failed for order ${order._id}:`, error);
      }
    }

    setAllocations(newAllocations);
  };

  const confirmAllocation = async (orderId, tailorId) => {
    // Update order with allocated tailor
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedTailor: tailorId })
    });

    // Refresh list
    fetchPendingOrders();
  };

  return (
    <div className="tailor-allocation-dashboard">
      <h2>🤖 AI-Powered Tailor Allocation</h2>
      
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Complexity</th>
            <th>Deadline</th>
            <th>Recommended Tailor</th>
            <th>Confidence</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pendingOrders.map(order => (
            <tr key={order._id}>
              <td>{order.orderNumber}</td>
              <td>{order.customerName}</td>
              <td>{calculateComplexity(order)}/5</td>
              <td>{formatDate(order.deliveryDate)}</td>
              <td>
                {allocations[order._id] && (
                  <span>Tailor #{allocations[order._id].tailorId}</span>
                )}
              </td>
              <td>
                {allocations[order._id] && (
                  <span>{(allocations[order._id].confidence * 100).toFixed(0)}%</span>
                )}
              </td>
              <td>
                <button 
                  onClick={() => confirmAllocation(
                    order._id, 
                    allocations[order._id]?.tailorId
                  )}
                  disabled={!allocations[order._id]}
                >
                  Confirm
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const calculateComplexity = (order) => {
  // Your complexity calculation logic
  return order.designComplexity || 2;
};

const calculateDeadline = (deliveryDate) => {
  const days = Math.ceil((new Date(deliveryDate) - new Date()) / (1000 * 60 * 60 * 24));
  return days;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export default TailorAllocation;
```

**Example 4: Order Delay Risk Alert**

Update `frontend/src/pages/admin/Orders.js`:

```javascript
import React, { useState, useEffect } from 'react';
import mlService from '../../services/mlService';

const OrdersWithDelayDetection = () => {
  const [orders, setOrders] = useState([]);
  const [delayRisks, setDelayRisks] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const response = await fetch('/api/orders');
    const data = await response.json();
    setOrders(data);

    // Check delay risk for active orders
    checkDelayRisks(data.filter(o => o.status === 'in-progress'));
  };

  const checkDelayRisks = async (activeOrders) => {
    const risks = {};

    for (const order of activeOrders) {
      try {
        const result = await mlService.detectOrderDelay({
          orderComplexity: order.complexity || 2,
          fabricAvailability: order.fabricInStock ? 1 : 0,
          tailorWorkload: await getTailorWorkload(order.assignedTailor),
          seasonalDemand: getCurrentSeasonalDemand(),
          customizationLevel: order.customizations?.length || 0
        });

        risks[order._id] = result;
      } catch (error) {
        console.error(`Risk check failed for order ${order._id}:`, error);
      }
    }

    setDelayRisks(risks);
  };

  const getTailorWorkload = async (tailorId) => {
    // Fetch tailor's current workload
    const response = await fetch(`/api/tailors/${tailorId}/workload`);
    const data = await response.json();
    return data.activeOrders || 0;
  };

  const getCurrentSeasonalDemand = () => {
    // Calculate based on current month
    const month = new Date().getMonth();
    if ([9, 10, 11].includes(month)) return 3; // High demand (festival season)
    if ([3, 4, 5].includes(month)) return 2;   // Medium
    return 1; // Low
  };

  return (
    <div className="orders-dashboard">
      <h2>Orders Dashboard with AI Delay Detection</h2>

      {orders.map(order => (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <h3>Order #{order.orderNumber}</h3>
            
            {/* Delay Risk Alert */}
            {delayRisks[order._id] && delayRisks[order._id].delayRisk === 1 && (
              <div className="alert alert-warning">
                ⚠️ High Delay Risk Detected!
                <p>Confidence: {(delayRisks[order._id].confidence * 100).toFixed(0)}%</p>
                <button onClick={() => handleDelayRisk(order)}>
                  Take Action
                </button>
              </div>
            )}
          </div>

          {/* Order details... */}
        </div>
      ))}
    </div>
  );
};

export default OrdersWithDelayDetection;
```

**Example 5: Customer Satisfaction Predictor**

Create `frontend/src/components/SatisfactionPredictor.js`:

```javascript
import React, { useState, useEffect } from 'react';
import mlService from '../services/mlService';

const SatisfactionPredictor = ({ order }) => {
  const [predictedSatisfaction, setPredictedSatisfaction] = useState(null);

  useEffect(() => {
    if (order.status === 'completed') {
      predictSatisfaction();
    }
  }, [order]);

  const predictSatisfaction = async () => {
    try {
      const result = await mlService.predictCustomerSatisfaction({
        orderAccuracy: calculateAccuracy(order),
        deliveryTime: calculateDeliveryTime(order),
        fabricQuality: order.fabricQualityRating || 4,
        designComplexity: order.complexity || 3,
        priceValue: order.priceRating || 4,
        customerService: order.serviceRating || 5,
        previousExperience: await getPreviousExperience(order.customerId)
      });

      setPredictedSatisfaction(result);

      // If low satisfaction predicted, trigger follow-up
      if (result.satisfactionScore < 0.7) {
        scheduleFollowUp(order);
      }
    } catch (error) {
      console.error('Satisfaction prediction failed:', error);
    }
  };

  const calculateAccuracy = (order) => {
    // Compare delivered vs requested
    return 0.95; // Example
  };

  const calculateDeliveryTime = (order) => {
    const promised = new Date(order.deliveryDate);
    const actual = new Date(order.completedDate);
    return Math.ceil((actual - promised) / (1000 * 60 * 60 * 24));
  };

  const getPreviousExperience = async (customerId) => {
    const response = await fetch(`/api/customers/${customerId}/average-rating`);
    const data = await response.json();
    return data.averageRating || 4;
  };

  const scheduleFollowUp = (order) => {
    // Trigger notification to admin
    console.log(`Low satisfaction predicted for order ${order.orderNumber}`);
    // Send notification...
  };

  return (
    <div className="satisfaction-predictor">
      {predictedSatisfaction && (
        <div className={`prediction ${predictedSatisfaction.satisfactionScore < 0.7 ? 'warning' : 'success'}`}>
          <h4>Predicted Customer Satisfaction</h4>
          <div className="score">
            {(predictedSatisfaction.satisfactionScore * 100).toFixed(0)}%
          </div>
          <p className="category">
            {getSatisfactionCategory(predictedSatisfaction.satisfactionCategory)}
          </p>
          <p className="confidence">
            Confidence: {(predictedSatisfaction.confidence * 100).toFixed(0)}%
          </p>

          {predictedSatisfaction.satisfactionScore < 0.7 && (
            <div className="alert">
              ⚠️ Low satisfaction predicted - Follow-up recommended
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const getSatisfactionCategory = (category) => {
  const categories = ['Unsatisfied', 'Neutral', 'Satisfied'];
  return categories[category] || 'Unknown';
};

export default SatisfactionPredictor;
```

---

### Phase 3: Admin Dashboard Integration

**Create ML Dashboard**: `frontend/src/pages/admin/MLDashboard.js`

```javascript
import React, { useState, useEffect } from 'react';
import mlService from '../../services/mlService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const MLDashboard = () => {
  const [modelsStatus, setModelsStatus] = useState(null);
  const [stats, setStats] = useState({
    totalPredictions: 0,
    accuracyTrend: [],
    modelUsage: []
  });

  useEffect(() => {
    fetchMLStatus();
    fetchMLStats();
  }, []);

  const fetchMLStatus = async () => {
    try {
      const response = await fetch('/api/ml/all-models-status');
      const data = await response.json();
      setModelsStatus(data);
    } catch (error) {
      console.error('Failed to fetch ML status:', error);
    }
  };

  const fetchMLStats = async () => {
    // Fetch your ML usage statistics from backend
    // This is custom to your implementation
  };

  const retrainModel = async (modelName) => {
    try {
      await fetch(`/api/ml/${modelName}/train`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      fetchMLStatus(); // Refresh
    } catch (error) {
      console.error(`Failed to retrain ${modelName}:`, error);
    }
  };

  return (
    <div className="ml-dashboard">
      <h1>🤖 Machine Learning Dashboard</h1>

      {/* Model Status Cards */}
      <div className="models-grid">
        {modelsStatus && Object.entries(modelsStatus).map(([modelName, status]) => (
          <div key={modelName} className="model-card">
            <h3>{formatModelName(modelName)}</h3>
            <div className="status-badge">
              {status.trained ? '✅ Trained' : '❌ Not Trained'}
            </div>
            {status.trained && (
              <>
                <p>Accuracy: {status.accuracy?.toFixed(1)}%</p>
                <p>Last Trained: {new Date(status.lastTrained).toLocaleString()}</p>
                <p>Predictions: {status.predictionCount || 0}</p>
              </>
            )}
            <button onClick={() => retrainModel(modelName)}>
              Retrain Model
            </button>
          </div>
        ))}
      </div>

      {/* Usage Statistics */}
      <div className="stats-section">
        <h2>Model Usage Statistics</h2>
        <BarChart width={600} height={300} data={stats.modelUsage}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="model" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="predictions" fill="#8884d8" />
        </BarChart>
      </div>

      {/* Accuracy Trend */}
      <div className="accuracy-section">
        <h2>Accuracy Trend</h2>
        <LineChart width={600} height={300} data={stats.accuracyTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" />
        </LineChart>
      </div>
    </div>
  );
};

const formatModelName = (name) => {
  const names = {
    knn: 'Customer Preference (KNN)',
    naivebayes: 'Fabric Recommendation (Naïve Bayes)',
    decisiontree: 'Tailor Allocation (Decision Tree)',
    svm: 'Delay Detection (SVM)',
    bpnn: 'Satisfaction Prediction (Neural Network)'
  };
  return names[name] || name;
};

export default MLDashboard;
```

---

## 🎯 Workflow Summary

### Daily Operations

```
1. Morning: Start servers
   ├── cd backend && npm start
   └── cd frontend && npm start

2. New Order Received
   ├── Customer fills order form
   ├── ML recommends fabric (Naïve Bayes)
   ├── System allocates tailor (Decision Tree)
   └── System checks delay risk (SVM)

3. Order Processing
   ├── Tailor works on order
   ├── System monitors progress
   └── Alerts if delay risk detected

4. Order Completion
   ├── ML predicts customer satisfaction (BPNN)
   ├── If low satisfaction predicted → Schedule follow-up
   └── Collect actual feedback for retraining

5. Customer Analysis
   ├── ML analyzes preference (KNN)
   ├── Recommend personalized products
   └── Update customer profile
```

### Weekly/Monthly Tasks

```
1. Review ML Dashboard
   ├── Check model accuracies
   ├── Review prediction counts
   └── Identify improvement areas

2. Retrain Models (if needed)
   ├── Collect new data from completed orders
   ├── Run training scripts
   └── Validate new accuracy

3. A/B Testing
   ├── Compare ML recommendations vs manual
   ├── Measure business impact
   └── Adjust parameters
```

---

## 📈 Business Impact Tracking

### Metrics to Monitor

1. **Tailor Allocation Efficiency**
   - Average allocation time: ML vs Manual
   - Accuracy of allocation
   - Tailor utilization rate

2. **Order Delay Prevention**
   - % of delayed orders (before vs after ML)
   - Early detection rate
   - Mitigation success rate

3. **Customer Satisfaction**
   - Predicted vs actual satisfaction correlation
   - Follow-up success rate
   - Retention improvement

4. **Fabric Recommendations**
   - Acceptance rate of ML recommendations
   - Customer feedback on fabric choice
   - Return/exchange rate

5. **Customer Preference**
   - Upsell/cross-sell success rate
   - Personalization effectiveness
   - Customer lifetime value improvement

---

## 🔄 Continuous Improvement

### Model Retraining Workflow

```javascript
// Collect feedback and retrain monthly
const retrainAllModels = async () => {
  // 1. Collect recent data
  const recentOrders = await fetch('/api/orders?since=last-month');
  const feedback = await fetch('/api/feedback?since=last-month');
  
  // 2. Prepare training data
  const trainingData = prepareTrainingData(recentOrders, feedback);
  
  // 3. Retrain each model
  for (const model of ['knn', 'naivebayes', 'decisiontree', 'svm', 'bpnn']) {
    await fetch(`/api/ml/${model}/train`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ trainingData: trainingData[model] })
    });
  }
  
  // 4. Validate new models
  const newStatus = await fetch('/api/ml/all-models-status');
  console.log('Retraining complete:', newStatus);
};
```

---

## ✅ Success Checklist

### Implementation Complete When:

- [ ] All 5 ML models trained and showing >75% accuracy
- [ ] ML service integrated in at least 3 frontend components
- [ ] Admin dashboard shows ML statistics
- [ ] Order form uses fabric recommendation
- [ ] Tailor allocation is automated
- [ ] Delay alerts are displayed in order dashboard
- [ ] Satisfaction predictions trigger follow-ups
- [ ] ML status monitored in admin panel
- [ ] Retraining workflow established
- [ ] Business metrics being tracked

---

## 🎓 Next Steps

1. **Start servers and test**: Follow Phase 1 above
2. **Integrate one component at a time**: Start with fabric recommendation
3. **Monitor results**: Use ML dashboard
4. **Collect feedback**: From admins and customers
5. **Iterate and improve**: Retrain models monthly

---

**🚀 You now have a complete ML-powered tailoring management system!**

For technical details, see `backend/ml/README.md`
For deployment, see `DEPLOYMENT_GUIDE.md`








