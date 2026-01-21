# Frontend Integration Examples

## Using ML Service in React Components

### Setup

The ML service is already created at `frontend/src/services/mlService.js`. Import it in your components:

```javascript
import mlService from '../services/mlService';
```

---

## Example Components

### 1. Customer Style Predictor

**Use Case**: When registering a new customer, predict their style preference

```javascript
import React, { useState } from 'react';
import mlService from '../services/mlService';

function CustomerStylePredictor({ customerId, age }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const predictStyle = async () => {
    setLoading(true);
    const result = await mlService.predictCustomerStyle(customerId, { age });
    
    if (result.success) {
      setPrediction(result.data);
    } else {
      console.error(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="style-predictor">
      <button onClick={predictStyle} disabled={loading}>
        {loading ? 'Predicting...' : 'Predict Style Preference'}
      </button>
      
      {prediction && (
        <div className="prediction-result">
          <h3>Predicted Style: {prediction.style}</h3>
          <p>Confidence: {prediction.confidence}</p>
          <div className="recommendations">
            <p>💡 Recommended categories based on {prediction.style} style:</p>
            {prediction.style === 'Traditional' && (
              <ul>
                <li>Kurtas & Sherwanis</li>
                <li>Traditional Embroidery</li>
                <li>Premium Silk Fabrics</li>
              </ul>
            )}
            {prediction.style === 'Formal' && (
              <ul>
                <li>Business Suits</li>
                <li>Formal Shirts & Pants</li>
                <li>Premium Wool & Cotton</li>
              </ul>
            )}
            {prediction.style === 'Casual' && (
              <ul>
                <li>Casual Wear</li>
                <li>Cotton & Linen</li>
                <li>Simple Designs</li>
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerStylePredictor;
```

---

### 2. Fabric Recommender

**Use Case**: In order creation form, suggest fabric based on selections

```javascript
import React, { useState, useEffect } from 'react';
import mlService from '../services/mlService';

function FabricRecommender({ season, gender, dressType }) {
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    // Auto-recommend when all fields are filled
    if (season && gender && dressType) {
      recommendFabric();
    }
  }, [season, gender, dressType]);

  const recommendFabric = async () => {
    const result = await mlService.recommendFabric(season, gender, dressType);
    
    if (result.success) {
      setRecommendation(result.data);
    }
  };

  return (
    <div className="fabric-recommender">
      {recommendation && (
        <div className="recommendation-card">
          <div className="recommendation-header">
            <span className="icon">🎨</span>
            <h4>AI Recommendation</h4>
          </div>
          <div className="recommendation-body">
            <p className="fabric-name">
              <strong>{recommendation.fabricType}</strong>
            </p>
            <p className="confidence">
              Confidence: {(recommendation.confidence * 100).toFixed(0)}%
            </p>
            <div className="probabilities">
              <p>Other Options:</p>
              <ul>
                {Object.entries(recommendation.probabilities)
                  .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))
                  .slice(0, 3)
                  .map(([fabric, prob]) => (
                    <li key={fabric}>
                      {fabric}: {prob}
                    </li>
                  ))
                }
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FabricRecommender;
```

---

### 3. Tailor Assignment Helper

**Use Case**: In admin dashboard, suggest best tailor for an order

```javascript
import React, { useState } from 'react';
import mlService from '../services/mlService';

function TailorAssignmentHelper({ orderId, orderComplexity }) {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const getSuggestion = async () => {
    setLoading(true);
    const result = await mlService.getBestTailor(orderId, {
      complexity: orderComplexity
    });
    
    if (result.success) {
      setSuggestion(result.data);
    } else {
      console.error(result.error);
    }
    setLoading(false);
  };

  const assignTailor = (tailorId) => {
    // Call your existing order assignment API
    console.log('Assigning order to tailor:', tailorId);
  };

  return (
    <div className="tailor-assignment">
      <button onClick={getSuggestion} disabled={loading}>
        🤖 Get AI Suggestion
      </button>

      {suggestion && (
        <div className="suggestion-result">
          <div className="recommended-tailor">
            <h4>Recommended Tailor</h4>
            <div className="tailor-card primary">
              <h3>{suggestion.tailorName}</h3>
              <p className="tailor-id">ID: {suggestion.assignedTailor}</p>
              <p className="confidence">Confidence: {suggestion.confidence}</p>
              <p className="reasoning">📝 {suggestion.reasoning}</p>
              <button 
                onClick={() => assignTailor(suggestion.assignedTailor)}
                className="btn-primary"
              >
                Assign This Tailor
              </button>
            </div>
          </div>

          {suggestion.allScores && suggestion.allScores.length > 1 && (
            <div className="alternative-tailors">
              <h4>Other Options</h4>
              {suggestion.allScores.slice(1).map((tailor, idx) => (
                <div key={idx} className="tailor-card secondary">
                  <h4>{tailor.name}</h4>
                  <p>Score: {(tailor.score * 100).toFixed(0)}%</p>
                  <p>Workload: {tailor.workload} orders</p>
                  <p>Skill: {tailor.skillLevel}</p>
                  <button 
                    onClick={() => assignTailor(tailor.tailorId)}
                    className="btn-secondary"
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TailorAssignmentHelper;
```

---

### 4. Delay Risk Alert

**Use Case**: Show delay risk when creating/viewing an order

```javascript
import React, { useState, useEffect } from 'react';
import mlService from '../services/mlService';

function DelayRiskAlert({ orderId, isSeasonPeak = false }) {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkRisk();
  }, [orderId]);

  const checkRisk = async () => {
    setLoading(true);
    const result = await mlService.checkDelayRisk(orderId, null, isSeasonPeak);
    
    if (result.success) {
      setRiskData(result.data);
    }
    setLoading(false);
  };

  const getRiskColor = (level) => {
    const colors = {
      'Low': 'green',
      'Medium': 'orange',
      'High': 'red',
      'Critical': 'darkred'
    };
    return colors[level] || 'gray';
  };

  if (loading) return <div>Checking delay risk...</div>;
  if (!riskData) return null;

  return (
    <div className={`delay-risk-alert risk-${riskData.riskLevel.toLowerCase()}`}>
      <div className="alert-header">
        <span className="icon">⚠️</span>
        <h3>Delivery Risk Assessment</h3>
      </div>

      <div className="risk-status" style={{ color: getRiskColor(riskData.riskLevel) }}>
        <h2>{riskData.status}</h2>
        <p className="risk-score">Risk Score: {riskData.riskScore}</p>
        <p className="risk-level">Risk Level: {riskData.riskLevel}</p>
      </div>

      {riskData.riskFactors && riskData.riskFactors.length > 0 && (
        <div className="risk-factors">
          <h4>⚠️ Risk Factors:</h4>
          <ul>
            {riskData.riskFactors.map((factor, idx) => (
              <li key={idx}>{factor}</li>
            ))}
          </ul>
        </div>
      )}

      {riskData.recommendations && riskData.recommendations.length > 0 && (
        <div className="recommendations">
          <h4>💡 Recommendations:</h4>
          <ul>
            {riskData.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="risk-details">
        <h4>Order Details:</h4>
        <ul>
          <li>Order Type: {riskData.features?.orderType || 'N/A'}</li>
          <li>Days Until Delivery: {riskData.features?.daysUntilDelivery || 'N/A'}</li>
          <li>Current Workload: {riskData.features?.currentWorkload || 0}</li>
          <li>Embroidery Required: {riskData.features?.embroideryRequired ? 'Yes' : 'No'}</li>
        </ul>
      </div>
    </div>
  );
}

export default DelayRiskAlert;
```

---

### 5. Satisfaction Predictor

**Use Case**: After delivery, predict satisfaction before formal feedback

```javascript
import React, { useState } from 'react';
import mlService from '../services/mlService';

function SatisfactionPredictor() {
  const [scores, setScores] = useState({
    fittingQuality: 7,
    deliverySpeed: 7,
    priceValue: 7,
    communication: 7,
    overallQuality: 7,
    customizationSatisfaction: 7,
    previousOrders: 1
  });
  const [prediction, setPrediction] = useState(null);

  const updateScore = (field, value) => {
    setScores({ ...scores, [field]: parseFloat(value) });
  };

  const predict = async () => {
    const result = await mlService.predictSatisfaction(scores);
    
    if (result.success) {
      setPrediction(result.data);
    }
  };

  const getSatisfactionColor = (level) => {
    const colors = {
      'Low': '#ff4444',
      'Medium': '#ffaa00',
      'High': '#44ff44'
    };
    return colors[level] || '#888';
  };

  return (
    <div className="satisfaction-predictor">
      <h2>Customer Satisfaction Prediction</h2>
      
      <div className="score-inputs">
        {Object.entries(scores).map(([field, value]) => (
          <div key={field} className="score-input">
            <label>
              {field.replace(/([A-Z])/g, ' $1').trim()}:
              <span className="score-value">{value}</span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={value}
              onChange={(e) => updateScore(field, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button onClick={predict} className="btn-predict">
        🤖 Predict Satisfaction
      </button>

      {prediction && (
        <div className="prediction-result">
          <div 
            className="satisfaction-badge"
            style={{ backgroundColor: getSatisfactionColor(prediction.satisfaction) }}
          >
            <h2>{prediction.satisfaction} Satisfaction</h2>
            <p>Confidence: {prediction.confidence}</p>
            <p>Overall Score: {prediction.overallScore}/10</p>
          </div>

          <div className="probabilities">
            <h4>Probability Distribution:</h4>
            <div className="prob-bars">
              {Object.entries(prediction.probabilities).map(([level, prob]) => (
                <div key={level} className="prob-bar">
                  <span className="level">{level}</span>
                  <div className="bar-container">
                    <div 
                      className="bar-fill"
                      style={{ 
                        width: prob,
                        backgroundColor: getSatisfactionColor(level)
                      }}
                    ></div>
                  </div>
                  <span className="percentage">{prob}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="insights">
            <div className="insights-section">
              <h4>📊 Insights:</h4>
              <ul>
                {prediction.insights.insights.map((insight, idx) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </div>

            <div className="recommendations-section">
              <h4>💡 Recommendations:</h4>
              <ul>
                {prediction.insights.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className={`risk-level risk-${prediction.insights.riskLevel.toLowerCase()}`}>
              <h4>Risk Level: {prediction.insights.riskLevel}</h4>
            </div>
          </div>

          <div className="score-breakdown">
            <h4>Score Breakdown:</h4>
            <table>
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>Score</th>
                  <th>Weight</th>
                  <th>Impact</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(prediction.breakdown).map(([factor, data]) => (
                  <tr key={factor}>
                    <td>{factor.replace(/([A-Z])/g, ' $1').trim()}</td>
                    <td>{data.score}/10</td>
                    <td>{data.weight}</td>
                    <td>{data.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SatisfactionPredictor;
```

---

### 6. ML Dashboard (Admin)

**Use Case**: Admin panel to view and manage ML system

```javascript
import React, { useState, useEffect } from 'react';
import mlService from '../services/mlService';

function MLDashboard() {
  const [status, setStatus] = useState(null);
  const [models, setModels] = useState([]);
  const [training, setTraining] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const statusResult = await mlService.getStatus();
    const modelsResult = await mlService.getAllModels();

    if (statusResult.success) setStatus(statusResult.data);
    if (modelsResult.success) setModels(modelsResult.data.models);
  };

  const trainAll = async () => {
    setTraining(true);
    const result = await mlService.trainAllModels();
    
    if (result.success) {
      alert('All models trained successfully!');
      loadData();
    } else {
      alert('Training failed: ' + result.error);
    }
    setTraining(false);
  };

  return (
    <div className="ml-dashboard">
      <h1>🤖 ML System Dashboard</h1>

      {status && (
        <div className="system-status">
          <h2>System Status: {status.status}</h2>
          
          <div className="models-status">
            {Object.entries(status.models).map(([key, model]) => (
              <div key={key} className={`model-card ${model.trained ? 'trained' : 'not-trained'}`}>
                <h3>{model.name}</h3>
                <p>Status: {model.trained ? '✅ Trained' : '❌ Not Trained'}</p>
              </div>
            ))}
          </div>

          <button 
            onClick={trainAll} 
            disabled={training}
            className="btn-train-all"
          >
            {training ? '⏳ Training...' : '🚀 Train All Models'}
          </button>
        </div>
      )}

      {models.length > 0 && (
        <div className="saved-models">
          <h2>Saved Models ({models.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Model Name</th>
                <th>Type</th>
                <th>Version</th>
                <th>Accuracy</th>
                <th>Samples</th>
                <th>Trained At</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model._id}>
                  <td>{model.modelName}</td>
                  <td>{model.modelType.toUpperCase()}</td>
                  <td>{model.version}</td>
                  <td>{model.trainingStats?.accuracy || 'N/A'}</td>
                  <td>{model.trainingStats?.samplesCount || 'N/A'}</td>
                  <td>{new Date(model.trainedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MLDashboard;
```

---

## Integration in Existing Pages

### In Customer Registration Page
```javascript
import CustomerStylePredictor from './components/CustomerStylePredictor';

// In your form component
<CustomerStylePredictor customerId={newCustomerId} age={formData.age} />
```

### In Order Creation Page
```javascript
import FabricRecommender from './components/FabricRecommender';
import DelayRiskAlert from './components/DelayRiskAlert';

// In your order form
<FabricRecommender 
  season={formData.season} 
  gender={customer.gender} 
  dressType={formData.dressType} 
/>

<DelayRiskAlert orderId={orderId} isSeasonPeak={false} />
```

### In Admin Order Assignment
```javascript
import TailorAssignmentHelper from './components/TailorAssignmentHelper';

// In admin dashboard
<TailorAssignmentHelper 
  orderId={selectedOrder._id} 
  orderComplexity="high" 
/>
```

---

## CSS Styling Examples

```css
/* Fabric Recommender */
.recommendation-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  margin: 15px 0;
}

/* Risk Alert */
.delay-risk-alert.risk-high {
  border-left: 5px solid #ff4444;
  background: #fff5f5;
}

.delay-risk-alert.risk-low {
  border-left: 5px solid #44ff44;
  background: #f5fff5;
}

/* Satisfaction Badge */
.satisfaction-badge {
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  color: white;
  margin: 20px 0;
}

/* Model Status Cards */
.model-card.trained {
  background: #d4edda;
  border-color: #28a745;
}

.model-card.not-trained {
  background: #f8d7da;
  border-color: #dc3545;
}
```

---

## Tips for Integration

1. **Error Handling**: Always check `result.success` before using data
2. **Loading States**: Show loading indicators during predictions
3. **Caching**: Cache predictions to avoid repeated API calls
4. **User Feedback**: Show confidence scores to build trust
5. **Fallbacks**: Have manual options if ML prediction fails

Happy integrating! 🚀








