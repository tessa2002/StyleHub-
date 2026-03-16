/**
 * ML Service - Frontend Integration
 * Helper functions to interact with all ML models
 */

import axios from 'axios';

// Configure API URL based on environment
// In production, if REACT_APP_API_URL is not set, use empty string (same domain)
// In development, use localhost:5000
const API_BASE = process.env.REACT_APP_API_URL !== undefined 
  ? process.env.REACT_APP_API_URL 
  : (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

// Create axios instance with auth
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests - always get fresh token from localStorage
api.interceptors.request.use(
  (config) => {
    // Always get fresh token from localStorage to avoid stale tokens
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 ML Service Request - ${config.method?.toUpperCase()} ${config.url} - Token: Present`);
    } else {
      // If no token, remove Authorization header
      delete config.headers.Authorization;
      console.warn(`⚠️ ML Service Request - ${config.method?.toUpperCase()} ${config.url} - Token: Missing!`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors - let AuthContext handle token refresh/redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let the global axios interceptor in AuthContext handle 401s
    // This interceptor just passes through
    return Promise.reject(error);
  }
);

const mlService = {
  // =============================================
  // 1. KNN - Customer Preference Classification
  // =============================================

  /**
   * Predict customer's preferred clothing style
   * @param {string} customerId - Customer ID (optional)
   * @param {object} customerData - Customer data with age, measurements, etc.
   * @returns {Promise<object>} Prediction result with style and confidence
   */
  predictCustomerStyle: async (customerId, customerData = null) => {
    try {
      const response = await api.post('/api/ml/knn/predict', {
        customerId,
        customerData
      });
      return {
        success: true,
        data: response.data.prediction
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to predict style'
      };
    }
  },

  /**
   * Train KNN model (Admin only)
   */
  trainKNN: async (trainingData = null, testData = null) => {
    try {
      const response = await api.post('/api/ml/knn/train', {
        trainingData,
        testData
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to train KNN model'
      };
    }
  },

  // =============================================
  // 2. Naïve Bayes - Fabric Recommendation
  // =============================================

  /**
   * Recommend fabric type based on season, gender, and dress type
   * @param {string} season - summer, winter, monsoon, spring
   * @param {string} gender - male, female, other
   * @param {string} dressType - kurta, shirt, dress, etc.
   * @returns {Promise<object>} Fabric recommendation with confidence
   */
  recommendFabric: async (season, gender, dressType) => {
    try {
      const response = await api.post('/api/ml/naivebayes/predict', {
        season,
        gender,
        dressType
      });
      return {
        success: true,
        data: response.data.prediction
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to recommend fabric'
      };
    }
  },

  /**
   * Train Naïve Bayes model (Admin only)
   */
  trainNaiveBayes: async (trainingData = null, testData = null) => {
    try {
      const response = await api.post('/api/ml/naivebayes/train', {
        trainingData,
        testData
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to train Naïve Bayes model'
      };
    }
  },

  // =============================================
  // 3. Decision Tree - Tailor Allocation
  // =============================================

  /**
   * Get best tailor for an order
   * @param {string} orderId - Order ID (optional)
   * @param {object} orderData - Order details with complexity, type, etc.
   * @returns {Promise<object>} Best tailor assignment with reasoning
   */
  getBestTailor: async (orderId = null, orderData = null) => {
    try {
      const response = await api.post('/api/ml/decisiontree/predict', {
        orderId,
        orderData
      });
      return {
        success: true,
        data: response.data.prediction
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get tailor recommendation'
      };
    }
  },

  /**
   * Train Decision Tree model (Admin only)
   */
  trainDecisionTree: async () => {
    try {
      const response = await api.post('/api/ml/decisiontree/train');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to train Decision Tree model'
      };
    }
  },

  // =============================================
  // 4. SVM - Order Delay Risk Detection
  // =============================================

  /**
   * Predict order delay risk
   * @param {string} orderId - Order ID (optional)
   * @param {object} orderData - Order details
   * @param {boolean} isSeasonPeak - Whether it's peak season
   * @returns {Promise<object>} Delay prediction with risk factors and recommendations
   */
  checkDelayRisk: async (orderId = null, orderData = null, isSeasonPeak = false) => {
    try {
      const response = await api.post('/api/ml/svm/predict', {
        orderId,
        orderData,
        isSeasonPeak
      });
      return {
        success: true,
        data: response.data.prediction
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to check delay risk'
      };
    }
  },

  /**
   * Train SVM model (Admin only)
   */
  trainSVM: async (trainingData = null, testData = null) => {
    try {
      const response = await api.post('/api/ml/svm/train', {
        trainingData,
        testData
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to train SVM model'
      };
    }
  },

  // =============================================
  // 5. BPNN - Customer Satisfaction Prediction
  // =============================================

  /**
   * Predict customer satisfaction
   * @param {object} feedbackData - Feedback scores (0-10) for various factors
   * @returns {Promise<object>} Satisfaction prediction with insights
   */
  predictSatisfaction: async (feedbackData) => {
    try {
      const response = await api.post('/api/ml/bpnn/predict', {
        feedbackData
      });
      return {
        success: true,
        data: response.data.prediction
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to predict satisfaction'
      };
    }
  },

  /**
   * Train BPNN model (Admin only)
   */
  trainBPNN: async (trainingData = null, testData = null) => {
    try {
      const response = await api.post('/api/ml/bpnn/train', {
        trainingData,
        testData
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to train BPNN model'
      };
    }
  },

  // =============================================
  // 6. Body Measurement - ML Integration
  // =============================================

  /**
   * Predict body measurements (Chest, Waist, Hips) using ML
   * @param {number} height_cm - User height in cm
   * @param {number} weight_kg - User weight in kg
   * @param {number} shoulder_width_cm - Detected shoulder width in cm
   * @param {string} image - Optional base64 image from webcam
   * @returns {Promise<object>} Measurement prediction result
   */
  predictBodyMeasurements: async (height_cm, weight_kg, shoulder_width_cm = null, image = null) => {
    try {
      const response = await api.post('/api/ml/body/predict', {
        height_cm,
        weight_kg,
        shoulder_width_cm,
        image
      });
      return {
        success: true,
        data: response.data.prediction
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to predict body measurements'
      };
    }
  },

  // =============================================
  // General ML System Functions
  // =============================================

  /**
   * Train all models at once (Admin only)
   */
  trainAllModels: async () => {
    try {
      const response = await api.post('/api/ml/train-all');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to train models'
      };
    }
  },

  /**
   * Get ML system status
   */
  getStatus: async () => {
    try {
      const response = await api.get('/api/ml/status');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get status'
      };
    }
  },

  /**
   * Get all saved ML models
   */
  getAllModels: async () => {
    try {
      const response = await api.get('/api/ml/models');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get models'
      };
    }
  },

  /**
   * Get all ML models status from backend API (authenticated)
   */
  getAllModelsStatus: async () => {
    try {
      // Get basic status from backend
      const statusResponse = await api.get('/api/ml/status');
      const basicStatus = statusResponse.data.models || {};
      
      // Get detailed model information from database
      const modelsResponse = await api.get('/api/ml/models');
      const savedModels = modelsResponse.data.models || [];
      console.log('Saved models from database:', savedModels);
      
      // Map backend camelCase keys to frontend lowercase keys
      const keyMapping = {
        knn: 'knn',
        naiveBayes: 'naivebayes',
        decisionTree: 'decisiontree',
        svm: 'svm',
        bpnn: 'bpnn'
      };
      
      // Build detailed status object
      const detailedStatus = {};
      
      // Initialize with basic status, converting keys to lowercase
      Object.keys(basicStatus).forEach(key => {
        const modelKey = keyMapping[key] || key.toLowerCase();
        detailedStatus[modelKey] = {
          trained: basicStatus[key].trained || false,
          accuracy: null,
          predictionCount: 0,
          lastTrained: null
        };
      });
      
      // Enhance with saved model data
      savedModels.forEach(model => {
        const modelType = model.modelType?.toLowerCase();
        if (modelType && detailedStatus[modelType]) {
          detailedStatus[modelType].trained = true;
          // Extract accuracy - handle both number and string formats
          if (model.trainingStats?.accuracy !== undefined && model.trainingStats?.accuracy !== null) {
            let accuracy = model.trainingStats.accuracy;
            // If it's a string like "85.23%", extract the number
            if (typeof accuracy === 'string') {
              accuracy = parseFloat(accuracy.replace('%', '')) || 0;
            }
            detailedStatus[modelType].accuracy = accuracy;
          }
          // Use createdAt as lastTrained
          if (model.createdAt) {
            detailedStatus[modelType].lastTrained = model.createdAt;
          } else if (model.updatedAt) {
            detailedStatus[modelType].lastTrained = model.updatedAt;
          }
        }
      });
      
      // Get the most recent training for each model type
      savedModels
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .forEach(model => {
          const modelType = model.modelType?.toLowerCase();
          if (modelType && detailedStatus[modelType] && model.createdAt) {
            const existingDate = detailedStatus[modelType].lastTrained 
              ? new Date(detailedStatus[modelType].lastTrained) 
              : null;
            const newDate = new Date(model.createdAt);
            if (!existingDate || newDate > existingDate) {
              detailedStatus[modelType].lastTrained = model.createdAt;
              if (model.trainingStats?.accuracy !== undefined && model.trainingStats?.accuracy !== null) {
                let accuracy = model.trainingStats.accuracy;
                if (typeof accuracy === 'string') {
                  accuracy = parseFloat(accuracy.replace('%', '')) || 0;
                }
                detailedStatus[modelType].accuracy = accuracy;
              }
            }
          }
        });
      
      console.log('Final detailed status:', detailedStatus);
      return detailedStatus;
    } catch (error) {
      console.error('Error fetching ML status:', error);
      // If error is 401, it's an auth issue
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }
      throw error;
    }
  },

  /**
   * Predict customer preference using backend KNN
   */
  predictCustomerPreference: async (data) => {
    try {
      // Transform test data format to match backend expectations
      const customerData = {
        age: data.age || 30,
        measurements: data.measurements || { chest: 40, waist: 32, hips: 38 },
        orderHistory: [],
        avgOrderPrice: data.avgOrderValue || data.avgOrderPrice || 1500,
        prefersEmbroidery: data.fabricPreference > 2 || false,
        previousOrders: data.previousOrders || 10,
        designComplexity: data.designComplexity || 3
      };
      const response = await api.post('/api/ml/knn/predict', { customerData });
      return response.data.prediction;
    } catch (error) {
      console.error('Error predicting customer preference:', error);
      throw error;
    }
  },

  /**
   * Recommend fabric type using backend Naive Bayes
   */
  recommendFabricType: async (data) => {
    try {
      // Transform test data format to match backend expectations
      const seasonMap = { 0: 'summer', 1: 'monsoon', 2: 'fall', 3: 'winter', 4: 'spring' };
      const occasionMap = { 0: 'casual', 1: 'formal', 2: 'traditional', 3: 'party' };
      const genderMap = { 0: 'male', 1: 'female', 2: 'other' };
      
      const season = seasonMap[data.season] || 'winter';
      const occasion = occasionMap[data.occasion] || 'formal';
      const gender = genderMap[data.gender] || 'male';
      const dressType = data.dressType || 'kurta';
      
      const response = await api.post('/api/ml/naivebayes/predict', {
        season,
        gender,
        dressType
      });
      return response.data.prediction;
    } catch (error) {
      console.error('Error recommending fabric:', error);
      throw error;
    }
  },

  /**
   * Predict tailor allocation using backend Decision Tree
   */
  predictTailorAllocation: async (data) => {
    try {
      // Transform test data format to match backend expectations
      const orderData = {
        complexity: data.order_complexity > 7 ? 'high' : data.order_complexity > 4 ? 'medium' : 'low',
        orderType: 'shirt',
        embroideryRequired: false
      };
      const response = await api.post('/api/ml/decisiontree/predict', { orderData });
      return response.data.prediction;
    } catch (error) {
      console.error('Error predicting tailor allocation:', error);
      throw error;
    }
  },

  /**
   * Predict order delay using backend SVM
   */
  predictOrderDelay: async (data) => {
    try {
      // Transform test data format to match backend expectations
      const orderData = {
        orderType: data.order_complexity > 5 ? 'complex' : 'simple',
        fabricSource: 'shop',
        currentWorkload: data.tailor_availability || 5,
        daysUntilDelivery: data.lead_time || 7,
        embroideryRequired: data.is_rush_order === 1,
        tailorExperience: 5,
        isSeasonPeak: data.customer_priority > 5
      };
      const response = await api.post('/api/ml/svm/predict', { orderData });
      return response.data.prediction;
    } catch (error) {
      console.error('Error predicting order delay:', error);
      throw error;
    }
  },

  /**
   * Predict customer satisfaction using backend BPNN
   */
  predictCustomerSatisfaction: async (data) => {
    try {
      // Verify token exists before making request
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Transform test data format to match backend expectations
      const feedbackData = {
        fittingQuality: data.order_accuracy || 95,
        deliverySpeed: data.delivery_time || 7,
        priceValue: data.price_fairness || 4.0,
        communication: data.tailor_communication || 8.0,
        overallQuality: data.fabric_quality || 8.5,
        customizationSatisfaction: data.order_accuracy || 95
      };
      
      // Use api instance which has interceptor to add token automatically
      const response = await api.post('/api/ml/bpnn/predict', { feedbackData });
      return response.data.prediction;
    } catch (error) {
      console.error('Error predicting customer satisfaction:', error);
      // Check if it's a token error
      if (error.response?.status === 401 || error.response?.data?.message?.includes('token') || error.response?.data?.message?.includes('Invalid token')) {
        const errorMsg = error.response?.data?.message || 'Authentication expired. Please refresh the page and log in again.';
        throw new Error(errorMsg);
      }
      throw error;
    }
  }
};

export default mlService;

// Export individual functions for convenience
export const {
  predictCustomerStyle,
  recommendFabric,
  getBestTailor,
  checkDelayRisk,
  predictSatisfaction,
  trainAllModels,
  getStatus,
  getAllModels
} = mlService;

