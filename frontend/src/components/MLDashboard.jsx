import React, { useState, useEffect } from 'react';
import mlService from '../services/mlService';
import './MLDashboard.css';

const MLDashboard = () => {
  const [mlStatus, setMlStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    fetchMLStatus();
  }, []);

  const fetchMLStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = await mlService.getAllModelsStatus();
      setMlStatus(status);
    } catch (err) {
      console.error('ML Status Error:', err);
      // Check for authentication errors
      if (err.response?.status === 401 || err.message?.includes('Authentication')) {
        setError('Authentication required. Please log in to view ML models status.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Admin access required to view ML models status.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to fetch ML models status. Please make sure you are logged in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const trainAllModels = async () => {
    try {
      setTestResults('Training models...');
      const result = await mlService.trainAllModels();
      
      if (result.success) {
        setTestResults({ 
          success: true, 
          message: 'All models trained successfully!',
          results: result.data
        });
        // Refresh status after training
        await fetchMLStatus();
      } else {
        setTestResults({ error: result.error || 'Failed to train models' });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to train models';
      setTestResults({ error: errorMsg });
    }
  };

  const runQuickTest = async () => {
    try {
      setTestResults('Testing...');
      
      const results = {};
      const errors = {};
      
      // Test 1: Customer Preference
      try {
        results.preference = await mlService.predictCustomerPreference({
          previousOrders: 10,
          avgOrderValue: 5000,
          fabricPreference: 1,
          designComplexity: 3
        });
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to predict customer preference';
        errors.preference = errorMsg.includes('not trained') 
          ? `${errorMsg} Train the model first.` 
          : errorMsg;
      }

      // Test 2: Fabric Recommendation
      try {
        results.fabric = await mlService.recommendFabricType({
          season: 2, // Fall
          occasion: 1, // Formal
          priceRange: 2, // Premium
          skinTone: 1 // Medium
        });
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to recommend fabric';
        errors.fabric = errorMsg.includes('not trained') 
          ? `${errorMsg} Train the model first.` 
          : errorMsg;
      }

      // Test 3: Tailor Allocation
      try {
        results.tailor = await mlService.predictTailorAllocation({
          expertise_level: 8,
          current_workload: 50,
          order_complexity: 6,
          deadline_days: 10,
          specialization_match: 7,
          customer_priority: 3
        });
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to predict tailor allocation';
        errors.tailor = errorMsg.includes('not trained') 
          ? `${errorMsg} Train the model first.` 
          : errorMsg;
      }

      // Test 4: Order Delay Detection
      try {
        results.delay = await mlService.predictOrderDelay({
          order_complexity: 5,
          item_count: 3,
          tailor_availability: 7,
          material_stock: 70,
          lead_time: 12,
          customer_priority: 3,
          is_rush_order: 0
        });
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to predict order delay';
        errors.delay = errorMsg.includes('not trained') 
          ? `${errorMsg} Train the model first.` 
          : errorMsg;
      }

      // Test 5: Customer Satisfaction
      try {
        results.satisfaction = await mlService.predictCustomerSatisfaction({
          delivery_time: 7,
          order_accuracy: 95,
          fabric_quality: 8.5,
          tailor_communication: 8.0,
          price_fairness: 4.0
        });
      } catch (err) {
        let errorMsg = err.response?.data?.message || err.message || 'Failed to predict customer satisfaction';
        if (err.response?.status === 401 || errorMsg.includes('token') || errorMsg.includes('Invalid token')) {
          errorMsg = 'Authentication expired. Please refresh the page and log in again.';
        } else if (errorMsg.includes('not trained')) {
          errorMsg = `${errorMsg} Train the model first.`;
        }
        errors.satisfaction = errorMsg;
      }

      // Show results even if some tests failed
      if (Object.keys(errors).length > 0 && Object.keys(results).length === 0) {
        // All tests failed
        setTestResults({ 
          error: Object.values(errors)[0] || 'All tests failed. Make sure models are trained and backend is running.',
          errors 
        });
      } else {
        setTestResults({ ...results, errors: Object.keys(errors).length > 0 ? errors : undefined });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Network error. Make sure the backend server is running.';
      setTestResults({ error: errorMessage });
    }
  };

  const getModelIcon = (modelName) => {
    const icons = {
      knn: '🎯',
      naivebayes: '🧵',
      decisiontree: '👷',
      svm: '⚠️',
      bpnn: '😊'
    };
    return icons[modelName] || '🤖';
  };

  const getModelTitle = (modelName) => {
    const titles = {
      knn: 'Customer Preference (KNN)',
      naivebayes: 'Fabric Recommendation (Naïve Bayes)',
      decisiontree: 'Tailor Allocation (Decision Tree)',
      svm: 'Delay Risk Detection (SVM)',
      bpnn: 'Satisfaction Prediction (Neural Network)'
    };
    return titles[modelName] || modelName;
  };

  if (loading) {
    return (
      <div className="ml-dashboard">
        <div className="ml-dashboard-header">
          <h2>🤖 AI/ML Models Dashboard</h2>
        </div>
        <div className="ml-loading">
          <div className="spinner"></div>
          <p>Loading ML models status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-dashboard">
        <div className="ml-dashboard-header">
          <h2>🤖 AI/ML Models Dashboard</h2>
          <button onClick={fetchMLStatus} className="btn-refresh">🔄 Retry</button>
        </div>
        <div className="ml-error">
          <p>⚠️ {error}</p>
          <button onClick={fetchMLStatus} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-dashboard">
      <div className="ml-dashboard-header">
        <div>
          <h2>🤖 AI/ML Models Dashboard</h2>
          <p className="ml-subtitle">Intelligent features powered by machine learning</p>
        </div>
        <div className="ml-actions">
          <button onClick={trainAllModels} className="btn-train">
            🎓 Train All Models
          </button>
          <button onClick={runQuickTest} className="btn-test">
            🧪 Run Quick Test
          </button>
          <button onClick={fetchMLStatus} className="btn-refresh">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Models Grid */}
      <div className="ml-models-grid">
        {mlStatus && Object.entries(mlStatus).map(([modelName, status]) => (
          <div 
            key={modelName} 
            className={`ml-model-card ${status.trained ? 'trained' : 'not-trained'}`}
          >
            <div className="model-header">
              <span className="model-icon">{getModelIcon(modelName)}</span>
              <h3>{getModelTitle(modelName)}</h3>
            </div>
            
            <div className="model-status">
              <div className="status-indicator">
                <span className={`status-dot ${status.trained ? 'active' : 'inactive'}`}></span>
                <span>{status.trained ? 'Trained & Active' : 'Not Trained'}</span>
              </div>
            </div>

            {status.trained && (
              <div className="model-stats">
                <div className="stat">
                  <span className="stat-label">Accuracy</span>
                  <span className="stat-value">
                    {status.accuracy !== null && status.accuracy !== undefined 
                      ? `${typeof status.accuracy === 'number' ? status.accuracy.toFixed(1) : status.accuracy}%` 
                      : 'N/A'}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Predictions</span>
                  <span className="stat-value">{status.predictionCount || 0}</span>
                </div>
                <div className="stat-full">
                  <span className="stat-label">Last Trained</span>
                  <span className="stat-value">
                    {status.lastTrained ? new Date(status.lastTrained).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            )}

            {!status.trained && (
              <div className="model-notice">
                <p>⚠️ Model needs training</p>
                <small>Run backend training script to activate</small>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Test Results / Training Results */}
      {testResults && (
        <div className="ml-test-results">
          <h3>{testResults.success ? '🎓 Training Results' : '🧪 Test Results'}</h3>
          {testResults.error ? (
            <div className="test-error">
              <p>❌ {testResults.error}</p>
            </div>
          ) : testResults === 'Testing...' || testResults === 'Training models...' ? (
            <div className="test-loading">
              <div className="spinner"></div>
              <p>{testResults === 'Training models...' ? 'Training models...' : 'Running tests...'}</p>
            </div>
          ) : testResults.success && testResults.message ? (
            <div className="test-success">
              <div className="test-result">
                <h4>✅ {testResults.message}</h4>
                {testResults.results && (
                  <pre>{JSON.stringify(testResults.results, null, 2)}</pre>
                )}
              </div>
            </div>
          ) : (
            <div className="test-success">
              {testResults.preference ? (
                <div className="test-result">
                  <h4>🎯 Customer Preference Prediction</h4>
                  <pre>{JSON.stringify(testResults.preference, null, 2)}</pre>
                </div>
              ) : testResults.errors?.preference ? (
                <div className="test-error">
                  <h4>🎯 Customer Preference Prediction</h4>
                  <p>❌ {testResults.errors.preference}</p>
                </div>
              ) : null}
              
              {testResults.fabric ? (
                <div className="test-result">
                  <h4>🧵 Fabric Recommendation</h4>
                  <pre>{JSON.stringify(testResults.fabric, null, 2)}</pre>
                </div>
              ) : testResults.errors?.fabric ? (
                <div className="test-error">
                  <h4>🧵 Fabric Recommendation</h4>
                  <p>❌ {testResults.errors.fabric}</p>
                </div>
              ) : null}
              
              {testResults.tailor ? (
                <div className="test-result">
                  <h4>👷 Tailor Allocation</h4>
                  <pre>{JSON.stringify(testResults.tailor, null, 2)}</pre>
                </div>
              ) : testResults.errors?.tailor ? (
                <div className="test-error">
                  <h4>👷 Tailor Allocation</h4>
                  <p>❌ {testResults.errors.tailor}</p>
                </div>
              ) : null}
              
              {testResults.delay ? (
                <div className="test-result">
                  <h4>⚠️ Order Delay Detection</h4>
                  <pre>{JSON.stringify(testResults.delay, null, 2)}</pre>
                </div>
              ) : testResults.errors?.delay ? (
                <div className="test-error">
                  <h4>⚠️ Order Delay Detection</h4>
                  <p>❌ {testResults.errors.delay}</p>
                </div>
              ) : null}
              
              {testResults.satisfaction ? (
                <div className="test-result">
                  <h4>😊 Customer Satisfaction</h4>
                  <pre>{JSON.stringify(testResults.satisfaction, null, 2)}</pre>
                </div>
              ) : testResults.errors?.satisfaction ? (
                <div className="test-error">
                  <h4>😊 Customer Satisfaction</h4>
                  <p>❌ {testResults.errors.satisfaction}</p>
                </div>
              ) : null}
              
              {testResults.errors && Object.keys(testResults.errors).length > 0 && (
                <div className="test-notice">
                  <p>ℹ️ Some tests failed. Make sure models are trained before running predictions.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Usage Guide */}
      <div className="ml-usage-guide">
        <h3>💡 How to Use ML Features</h3>
        <div className="usage-cards">
          <div className="usage-card">
            <span className="usage-icon">🎯</span>
            <h4>Customer Insights</h4>
            <p>Automatically classify customers based on their preferences and order history</p>
          </div>
          <div className="usage-card">
            <span className="usage-icon">🧵</span>
            <h4>Smart Fabric Suggestions</h4>
            <p>Get AI-powered fabric recommendations in the order form based on season and occasion</p>
          </div>
          <div className="usage-card">
            <span className="usage-icon">👷</span>
            <h4>Auto Tailor Assignment</h4>
            <p>Automatically allocate orders to the best-suited tailor based on complexity and workload</p>
          </div>
          <div className="usage-card">
            <span className="usage-icon">⚠️</span>
            <h4>Delay Alerts</h4>
            <p>Get early warnings about potential order delays to take proactive action</p>
          </div>
          <div className="usage-card">
            <span className="usage-icon">😊</span>
            <h4>Satisfaction Forecasts</h4>
            <p>Predict customer satisfaction scores to improve service quality</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLDashboard;

