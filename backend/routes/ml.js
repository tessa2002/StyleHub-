/**
 * ML Models API Routes (Simplified for Body Estimation)
 * Provides endpoints for the body measurement ML model
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const axios = require('axios');

const PYTHON_ML_API = process.env.PYTHON_ML_API || 'http://localhost:5001';

// ======================
// Body Measurement - ML Integration
// ======================

/**
 * @route   POST /api/ml/body/predict
 * @desc    Predict body measurements using Python ML model
 * @access  Private
 */
router.post('/body/predict', auth, async (req, res) => {
  try {
    const { height_cm, weight_kg, shoulder_width_cm, image } = req.body;

    console.log('Body Measurement Prediction Request:', { 
      height: height_cm, 
      weight: weight_kg, 
      shoulder: shoulder_width_cm,
      hasImage: !!image 
    });

    if (!image && (!height_cm || !weight_kg || !shoulder_width_cm)) {
      return res.status(400).json({ 
        message: 'Please provide either an image OR height_cm, weight_kg, and shoulder_width_cm' 
      });
    }

    console.log('Body Measurement Prediction - Forwarding to Python API');
    
    try {
      const response = await axios.post(`${PYTHON_ML_API}/predict/body-measurement`, {
        height_cm,
        weight_kg,
        shoulder_width_cm,
        image
      });

      console.log('Body Measurement Prediction - Python API Response:', JSON.stringify(response.data, null, 2));

      res.json({
        success: true,
        prediction: response.data.prediction
      });
    } catch (pythonError) {
      console.error('Python ML API Error:', pythonError.message);
      
      if (pythonError.code === 'ECONNREFUSED') {
        return res.status(503).json({ 
          message: 'Python ML API is currently unavailable. Please ensure the Python server is running.',
          error: pythonError.message
        });
      }

      res.status(pythonError.response?.status || 500).json({
        message: 'Error from Python ML API',
        error: pythonError.response?.data?.error || pythonError.message
      });
    }
  } catch (error) {
    console.error('Body measurement prediction error:', error);
    res.status(500).json({ 
      message: 'Error making prediction', 
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ml/status
 * @desc    Get ML system status
 * @access  Private
 */
router.get('/status', auth, async (req, res) => {
  try {
    let pythonApiStatus = { 
      status: 'unknown', 
      message: 'Could not connect to Python ML API' 
    };

    try {
      const response = await axios.get(`${PYTHON_ML_API}/health`);
      pythonApiStatus = {
        status: 'online',
        message: response.data.message,
        details: response.data
      };
    } catch (e) {
      pythonApiStatus.error = e.message;
    }

    res.json({
      success: true,
      status: 'ML System Online',
      bodyMeasurementApi: pythonApiStatus
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ message: 'Error getting status', error: error.message });
  }
});

module.exports = router;
