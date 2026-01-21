/**
 * ML Models API Routes
 * Provides endpoints for all 5 machine learning models
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const MLModel = require('../models/MLModel');

// Import ML model classes
const CustomerPreferenceClassifier = require('../ml/models/knn-customer-preference');
const FabricRecommendationModel = require('../ml/models/naivebayes-fabric-recommendation');
const TailorAllocationModel = require('../ml/models/decisiontree-tailor-allocation');
const OrderDelayPredictionModel = require('../ml/models/svm-order-delay');
const CustomerSatisfactionModel = require('../ml/models/bpnn-satisfaction-prediction');

// Import training data generator
const {
  generateKNNData,
  generateNaiveBayesData,
  generateDecisionTreeData,
  generateSVMData,
  generateBPNNData,
  generateAllTrainingData
} = require('../ml/data/training-data-generator');

// Import models for data access
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

// Initialize model instances
let knnModel = new CustomerPreferenceClassifier();
let nbModel = new FabricRecommendationModel();
let dtModel = new TailorAllocationModel();
let svmModel = new OrderDelayPredictionModel();
let bpnnModel = new CustomerSatisfactionModel();

// ======================
// 1. KNN - Customer Preference Classification
// ======================

/**
 * @route   POST /api/ml/knn/train
 * @desc    Train KNN model for customer preference classification
 * @access  Admin only
 */
router.post('/knn/train', auth, async (req, res) => {
  try {
    // Check admin permission
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Use provided data or generate sample data
    const trainingData = req.body.trainingData || generateKNNData(100);
    const testData = req.body.testData || generateKNNData(50);

    // Train model
    const trainResult = knnModel.train(trainingData);

    // Evaluate model
    const evaluation = knnModel.evaluate(testData);

    // Save model to database (simplified - KNN doesn't serialize well)
    const savedModel = new MLModel({
      modelType: 'knn',
      modelName: 'Customer Preference Classifier',
      version: '1.0.0',
      description: 'Predicts customer preferred clothing style (casual, formal, traditional)',
      trainingStats: {
        samplesCount: trainResult.samplesCount,
        accuracy: evaluation.accuracy,
        metrics: {
          f1Score: evaluation.f1Score,
          confusionMatrix: evaluation.confusionMatrix
        }
      },
      modelData: { trained: true, k: 5 },
      trainedBy: req.user._id
    });

    await savedModel.save();

    res.json({
      success: true,
      message: 'KNN model trained successfully',
      training: trainResult,
      evaluation,
      modelId: savedModel._id
    });
  } catch (error) {
    console.error('KNN training error:', error);
    res.status(500).json({ message: 'Error training KNN model', error: error.message });
  }
});

/**
 * @route   POST /api/ml/knn/predict
 * @desc    Predict customer's preferred style
 * @access  Private
 */
router.post('/knn/predict', auth, async (req, res) => {
  try {
    // Check if model is trained
    if (!knnModel.model || knnModel.model === null) {
      return res.status(400).json({ 
        message: 'KNN model is not trained. Please train the model first using POST /api/ml/knn/train' 
      });
    }

    const { customerId, customerData } = req.body;

    let inputData = customerData;

    // If customerId provided, fetch customer data
    if (customerId && !customerData) {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const orders = await Order.find({ customer: customerId });
      
      inputData = {
        age: req.body.age || 30,
        measurements: customer.measurements,
        orderHistory: orders,
        avgOrderPrice: orders.length > 0 
          ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length 
          : 1500,
        prefersEmbroidery: orders.some(o => o.customizations?.embroidery?.enabled) || false
      };
    }

    // If no input data provided, use defaults
    if (!inputData) {
      inputData = {
        age: 30,
        measurements: { chest: 40, waist: 32, hips: 38 },
        orderHistory: [],
        avgOrderPrice: 1500,
        prefersEmbroidery: false,
        previousOrders: 10,
        designComplexity: 3
      };
    }

    console.log('KNN Prediction - Input data:', JSON.stringify(inputData, null, 2));
    const prediction = knnModel.predict(inputData);
    console.log('KNN Prediction - Result:', JSON.stringify(prediction, null, 2));

    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    console.error('KNN prediction error:', error);
    console.error('Error stack:', error.stack);
    // If error message contains "not trained", return it as is
    if (error.message && error.message.includes('not trained')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ 
      message: 'Error making prediction', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ======================
// 2. Naïve Bayes - Fabric Recommendation
// ======================

/**
 * @route   POST /api/ml/naivebayes/train
 * @desc    Train Naïve Bayes model for fabric recommendation
 * @access  Admin only
 */
router.post('/naivebayes/train', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const trainingData = req.body.trainingData || generateNaiveBayesData(100);
    const testData = req.body.testData || generateNaiveBayesData(50);

    const trainResult = nbModel.train(trainingData);
    const evaluation = nbModel.evaluate(testData);

    const savedModel = new MLModel({
      modelType: 'naivebayes',
      modelName: 'Fabric Type Recommender',
      version: '1.0.0',
      description: 'Recommends suitable fabric based on season, gender, and dress type',
      trainingStats: {
        samplesCount: trainResult.samplesCount,
        accuracy: evaluation.accuracy,
        metrics: {
          recall: evaluation.recall,
          confusionMatrix: evaluation.confusionMatrix
        }
      },
      modelData: { trained: true },
      trainedBy: req.user._id
    });

    await savedModel.save();

    res.json({
      success: true,
      message: 'Naïve Bayes model trained successfully',
      training: trainResult,
      evaluation,
      modelId: savedModel._id
    });
  } catch (error) {
    console.error('Naïve Bayes training error:', error);
    res.status(500).json({ message: 'Error training model', error: error.message });
  }
});

/**
 * @route   POST /api/ml/naivebayes/predict
 * @desc    Recommend fabric type for an order
 * @access  Private
 */
router.post('/naivebayes/predict', auth, async (req, res) => {
  try {
    // Check if model is trained
    if (!nbModel.model || nbModel.model === null) {
      return res.status(400).json({ 
        message: 'Naïve Bayes model is not trained. Please train the model first using POST /api/ml/naivebayes/train' 
      });
    }

    const { season, gender, dressType } = req.body;

    if (!season || !gender || !dressType) {
      return res.status(400).json({ 
        message: 'Please provide season, gender, and dressType' 
      });
    }

    console.log('Naive Bayes Prediction - Input:', { season, gender, dressType });
    const prediction = nbModel.predict({ season, gender, dressType });
    console.log('Naive Bayes Prediction - Result:', JSON.stringify(prediction, null, 2));

    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    console.error('Naïve Bayes prediction error:', error);
    console.error('Error stack:', error.stack);
    // If error message contains "not trained", return it as is
    if (error.message && error.message.includes('not trained')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ 
      message: 'Error making prediction', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ======================
// 3. Decision Tree - Tailor Allocation
// ======================

/**
 * @route   POST /api/ml/decisiontree/train
 * @desc    Train Decision Tree model for tailor allocation
 * @access  Admin only
 */
router.post('/decisiontree/train', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Get actual tailors from database
    const tailors = await User.find({ role: 'Tailor', status: 'Active' })
      .select('name email')
      .lean();

    const tailorsData = tailors.map((t, index) => ({
      tailorId: t._id.toString(),
      name: t.name,
      skillLevel: ['beginner', 'intermediate', 'advanced', 'expert'][index % 4],
      experience: 1 + (index * 2)
    }));

    const { data: trainingData, tailors: sampleTailors } = generateDecisionTreeData(
      100, 
      tailorsData.length > 0 ? tailorsData : undefined
    );
    const { data: testData } = generateDecisionTreeData(50, sampleTailors);

    const trainResult = dtModel.train(trainingData, sampleTailors);
    const evaluation = dtModel.evaluate(testData);

    const savedModel = new MLModel({
      modelType: 'decisiontree',
      modelName: 'Tailor Allocation Optimizer',
      version: '1.0.0',
      description: 'Assigns best tailor based on complexity, skill level, and workload',
      trainingStats: {
        samplesCount: trainResult.samplesCount,
        accuracy: evaluation.accuracy,
        metrics: {
          precision: evaluation.precision,
          tailorsCount: trainResult.tailorsCount
        }
      },
      modelData: { trained: true, tailors: sampleTailors },
      trainedBy: req.user._id
    });

    await savedModel.save();

    res.json({
      success: true,
      message: 'Decision Tree model trained successfully',
      training: trainResult,
      evaluation,
      modelId: savedModel._id
    });
  } catch (error) {
    console.error('Decision Tree training error:', error);
    res.status(500).json({ message: 'Error training model', error: error.message });
  }
});

/**
 * @route   POST /api/ml/decisiontree/predict
 * @desc    Get best tailor for an order
 * @access  Private (Admin/Staff)
 */
router.post('/decisiontree/predict', auth, async (req, res) => {
  try {
    // Check if model is trained
    if (!dtModel.model || dtModel.model === null) {
      return res.status(400).json({ 
        message: 'Decision Tree model is not trained. Please train the model first using POST /api/ml/decisiontree/train' 
      });
    }

    const { orderId, orderData } = req.body;

    let orderInfo = orderData;

    // If orderId provided, fetch order details
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      orderInfo = {
        complexity: req.body.complexity || 'medium',
        orderType: order.orderType || order.itemType,
        embroideryRequired: order.customizations?.embroidery?.enabled || false
      };
    }

    // Get available tailors
    const availableTailors = await User.find({ role: 'Tailor', status: 'Active' });
    
    // Get current workload for each tailor
    const tailorsWithWorkload = await Promise.all(
      availableTailors.map(async (tailor) => {
        const activeOrders = await Order.countDocuments({
          assignedTailor: tailor._id,
          status: { $nin: ['Delivered', 'Cancelled'] }
        });

        return {
          tailorId: tailor._id.toString(),
          _id: tailor._id.toString(),
          name: tailor.name,
          skillLevel: req.body.tailorSkills?.[tailor._id.toString()] || 'intermediate',
          currentWorkload: activeOrders,
          experience: req.body.tailorExperience?.[tailor._id.toString()] || 3,
          specializations: req.body.tailorSpecializations?.[tailor._id.toString()] || []
        };
      })
    );

    if (tailorsWithWorkload.length === 0) {
      return res.status(404).json({ message: 'No available tailors found' });
    }

    console.log('Decision Tree Prediction - Input:', { orderInfo, tailorsCount: tailorsWithWorkload.length });
    const prediction = dtModel.predict(orderInfo, tailorsWithWorkload);
    console.log('Decision Tree Prediction - Result:', JSON.stringify(prediction, null, 2));

    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    console.error('Decision Tree prediction error:', error);
    console.error('Error stack:', error.stack);
    // If error message contains "not trained", return it as is
    if (error.message && error.message.includes('not trained')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ 
      message: 'Error making prediction', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ======================
// 4. SVM - Order Delay Detection
// ======================

/**
 * @route   POST /api/ml/svm/train
 * @desc    Train SVM model for order delay prediction
 * @access  Admin only
 */
router.post('/svm/train', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const trainingData = req.body.trainingData || generateSVMData(100);
    const testData = req.body.testData || generateSVMData(50);

    const trainResult = svmModel.train(trainingData);
    const evaluation = svmModel.evaluate(testData);

    const savedModel = new MLModel({
      modelType: 'svm',
      modelName: 'Order Delay Risk Detector',
      version: '1.0.0',
      description: 'Predicts if order will be On-Time or Delayed',
      trainingStats: {
        samplesCount: trainResult.samplesCount,
        accuracy: evaluation.accuracy,
        metrics: {
          f1Score: evaluation.f1Score,
          precision: evaluation.precision,
          recall: evaluation.recall,
          confusionMatrix: evaluation.confusionMatrix
        }
      },
      modelData: { trained: true, options: trainResult.options },
      trainedBy: req.user._id
    });

    await savedModel.save();

    res.json({
      success: true,
      message: 'SVM model trained successfully',
      training: trainResult,
      evaluation,
      modelId: savedModel._id
    });
  } catch (error) {
    console.error('SVM training error:', error);
    res.status(500).json({ message: 'Error training model', error: error.message });
  }
});

/**
 * @route   POST /api/ml/svm/predict
 * @desc    Predict order delay risk
 * @access  Private
 */
router.post('/svm/predict', auth, async (req, res) => {
  try {
    // Check if model is trained
    if (!svmModel.model || svmModel.model === null) {
      return res.status(400).json({ 
        message: 'SVM model is not trained. Please train the model first using POST /api/ml/svm/train' 
      });
    }

    const { orderId, orderData } = req.body;

    let inputData = orderData;

    // If orderId provided, fetch order details
    if (orderId) {
      const order = await Order.findById(orderId).populate('assignedTailor');
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const daysUntilDelivery = order.expectedDelivery 
        ? Math.ceil((new Date(order.expectedDelivery) - new Date()) / (1000 * 60 * 60 * 24))
        : 7;

      const tailorOrders = order.assignedTailor 
        ? await Order.countDocuments({
            assignedTailor: order.assignedTailor._id,
            status: { $nin: ['Delivered', 'Cancelled'] }
          })
        : 0;

      inputData = {
        orderType: order.orderType || order.itemType || 'simple',
        fabricSource: order.fabric?.source || 'shop',
        currentWorkload: tailorOrders,
        daysUntilDelivery,
        embroideryRequired: order.customizations?.embroidery?.enabled || false,
        tailorExperience: req.body.tailorExperience || 3,
        isSeasonPeak: req.body.isSeasonPeak || false
      };
    }

    console.log('SVM Prediction - Input:', JSON.stringify(inputData, null, 2));
    const prediction = svmModel.predict(inputData);
    console.log('SVM Prediction - Result:', JSON.stringify(prediction, null, 2));

    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    console.error('SVM prediction error:', error);
    console.error('Error stack:', error.stack);
    // If error message contains "not trained", return it as is
    if (error.message && error.message.includes('not trained')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ 
      message: 'Error making prediction', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ======================
// 5. BPNN - Customer Satisfaction Prediction
// ======================

/**
 * @route   POST /api/ml/bpnn/train
 * @desc    Train BPNN model for customer satisfaction prediction
 * @access  Admin only
 */
router.post('/bpnn/train', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const trainingData = req.body.trainingData || generateBPNNData(100);
    const testData = req.body.testData || generateBPNNData(50);

    const trainResult = bpnnModel.train(trainingData);
    const evaluation = bpnnModel.evaluate(testData);

    // Export trained network
    const exportedModel = bpnnModel.exportModel();

    const savedModel = new MLModel({
      modelType: 'bpnn',
      modelName: 'Customer Satisfaction Predictor',
      version: '1.0.0',
      description: 'Predicts customer satisfaction (Low, Medium, High) after delivery',
      trainingStats: {
        samplesCount: trainResult.samplesCount,
        accuracy: evaluation.accuracy,
        metrics: {
          mse: evaluation.mse,
          f1Score: evaluation.f1Score,
          confusionMatrix: evaluation.confusionMatrix,
          trainingStats: trainResult.trainingStats
        }
      },
      modelData: exportedModel,
      trainedBy: req.user._id
    });

    await savedModel.save();

    res.json({
      success: true,
      message: 'BPNN model trained successfully',
      training: trainResult,
      evaluation,
      modelId: savedModel._id
    });
  } catch (error) {
    console.error('BPNN training error:', error);
    res.status(500).json({ message: 'Error training model', error: error.message });
  }
});

/**
 * @route   POST /api/ml/bpnn/predict
 * @desc    Predict customer satisfaction
 * @access  Private
 */
router.post('/bpnn/predict', auth, async (req, res) => {
  try {
    console.log('BPNN Predict - Request received');
    console.log('BPNN Predict - User:', req.user ? { id: req.user.id, role: req.user.role } : 'No user');
    console.log('BPNN Predict - Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
    
    // Check if model is trained
    if (!bpnnModel.network || bpnnModel.network === null) {
      return res.status(400).json({ 
        message: 'BPNN model is not trained. Please train the model first using POST /api/ml/bpnn/train' 
      });
    }

    const { feedbackData } = req.body;

    if (!feedbackData) {
      return res.status(400).json({ 
        message: 'Please provide feedback data with scores (0-10) for: fittingQuality, deliverySpeed, priceValue, communication, overallQuality, customizationSatisfaction' 
      });
    }

    console.log('BPNN Prediction - Input:', JSON.stringify(feedbackData, null, 2));
    const prediction = bpnnModel.predict(feedbackData);
    console.log('BPNN Prediction - Result:', JSON.stringify(prediction, null, 2));

    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    console.error('BPNN prediction error:', error);
    console.error('Error stack:', error.stack);
    // If error message contains "not trained", return it as is
    if (error.message && error.message.includes('not trained')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ 
      message: 'Error making prediction', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ======================
// General ML Routes
// ======================

/**
 * @route   POST /api/ml/train-all
 * @desc    Train all ML models at once
 * @access  Admin only
 */
router.post('/train-all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const allData = generateAllTrainingData();
    const results = {};
    const modelIds = {};

    // Train KNN
    knnModel = new CustomerPreferenceClassifier();
    const knnTrainResult = knnModel.train(allData.knn.training);
    results.knn = knnModel.evaluate(allData.knn.testing);
    
    // Save KNN to database
    const savedKNN = new MLModel({
      modelType: 'knn',
      modelName: 'Customer Preference Classifier',
      version: '1.0.0',
      description: 'Predicts customer preferred clothing style (casual, formal, traditional)',
      trainingStats: {
        samplesCount: knnTrainResult.samplesCount,
        accuracy: typeof results.knn.accuracy === 'string' 
          ? parseFloat(results.knn.accuracy.replace('%', '')) 
          : (results.knn.accuracy || 0),
        metrics: {
          f1Score: results.knn.f1Score,
          confusionMatrix: results.knn.confusionMatrix
        }
      },
      modelData: { trained: true, k: 5 },
      trainedBy: req.user._id
    });
    await savedKNN.save();
    modelIds.knn = savedKNN._id;

    // Train Naïve Bayes
    nbModel = new FabricRecommendationModel();
    const nbTrainResult = nbModel.train(allData.naiveBayes.training);
    results.naiveBayes = nbModel.evaluate(allData.naiveBayes.testing);
    
    // Save Naive Bayes to database
    const savedNB = new MLModel({
      modelType: 'naivebayes',
      modelName: 'Fabric Type Recommender',
      version: '1.0.0',
      description: 'Recommends suitable fabric based on season, gender, and dress type',
      trainingStats: {
        samplesCount: nbTrainResult.samplesCount,
        accuracy: typeof results.naiveBayes.accuracy === 'string' 
          ? parseFloat(results.naiveBayes.accuracy.replace('%', '')) 
          : (results.naiveBayes.accuracy || 0),
        metrics: {
          recall: results.naiveBayes.recall,
          confusionMatrix: results.naiveBayes.confusionMatrix
        }
      },
      modelData: { trained: true },
      trainedBy: req.user._id
    });
    await savedNB.save();
    modelIds.naivebayes = savedNB._id;

    // Train Decision Tree
    dtModel = new TailorAllocationModel();
    const dtTrainResult = dtModel.train(allData.decisionTree.training, allData.decisionTree.tailors);
    results.decisionTree = dtModel.evaluate(allData.decisionTree.testing);
    
    // Save Decision Tree to database
    const savedDT = new MLModel({
      modelType: 'decisiontree',
      modelName: 'Tailor Allocation Optimizer',
      version: '1.0.0',
      description: 'Assigns best tailor based on complexity, skill level, and workload',
      trainingStats: {
        samplesCount: dtTrainResult.samplesCount,
        accuracy: typeof results.decisionTree.accuracy === 'string' 
          ? parseFloat(results.decisionTree.accuracy.replace('%', '')) 
          : (results.decisionTree.accuracy || 0),
        metrics: {
          precision: results.decisionTree.precision,
          tailorsCount: dtTrainResult.tailorsCount
        }
      },
      modelData: { trained: true, tailors: allData.decisionTree.tailors },
      trainedBy: req.user._id
    });
    await savedDT.save();
    modelIds.decisiontree = savedDT._id;

    // Train SVM
    svmModel = new OrderDelayPredictionModel();
    const svmTrainResult = svmModel.train(allData.svm.training);
    results.svm = svmModel.evaluate(allData.svm.testing);
    
    // Save SVM to database
    const savedSVM = new MLModel({
      modelType: 'svm',
      modelName: 'Order Delay Risk Detector',
      version: '1.0.0',
      description: 'Predicts if order will be On-Time or Delayed',
      trainingStats: {
        samplesCount: svmTrainResult.samplesCount,
        accuracy: typeof results.svm.accuracy === 'string' 
          ? parseFloat(results.svm.accuracy.replace('%', '')) 
          : (results.svm.accuracy || 0),
        metrics: {
          f1Score: results.svm.f1Score,
          precision: results.svm.precision,
          recall: results.svm.recall,
          confusionMatrix: results.svm.confusionMatrix
        }
      },
      modelData: { trained: true, options: svmTrainResult.options },
      trainedBy: req.user._id
    });
    await savedSVM.save();
    modelIds.svm = savedSVM._id;

    // Train BPNN
    bpnnModel = new CustomerSatisfactionModel();
    const bpnnTrainResult = bpnnModel.train(allData.bpnn.training);
    results.bpnn = bpnnModel.evaluate(allData.bpnn.testing);
    
    // Export trained network
    const exportedBPNN = bpnnModel.exportModel();
    
    // Save BPNN to database
    const savedBPNN = new MLModel({
      modelType: 'bpnn',
      modelName: 'Customer Satisfaction Predictor',
      version: '1.0.0',
      description: 'Predicts customer satisfaction (Low, Medium, High) after delivery',
      trainingStats: {
        samplesCount: bpnnTrainResult.samplesCount,
        accuracy: typeof results.bpnn.accuracy === 'string' 
          ? parseFloat(results.bpnn.accuracy.replace('%', '')) 
          : (results.bpnn.accuracy || 0),
        metrics: {
          mse: results.bpnn.mse,
          f1Score: results.bpnn.f1Score,
          confusionMatrix: results.bpnn.confusionMatrix,
          trainingStats: bpnnTrainResult.trainingStats
        }
      },
      modelData: exportedBPNN,
      trainedBy: req.user._id
    });
    await savedBPNN.save();
    modelIds.bpnn = savedBPNN._id;

    res.json({
      success: true,
      message: 'All ML models trained successfully',
      results,
      modelIds
    });
  } catch (error) {
    console.error('Train all error:', error);
    res.status(500).json({ message: 'Error training models', error: error.message });
  }
});

/**
 * @route   GET /api/ml/models
 * @desc    Get all saved ML models
 * @access  Private
 */
router.get('/models', auth, async (req, res) => {
  try {
    const models = await MLModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select('-modelData')
      .populate('trainedBy', 'name email');

    res.json({
      success: true,
      count: models.length,
      models
    });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ message: 'Error fetching models', error: error.message });
  }
});

/**
 * @route   GET /api/ml/status
 * @desc    Get ML system status
 * @access  Private
 */
router.get('/status', auth, async (req, res) => {
  try {
    const modelStatus = {
      knn: { trained: knnModel.model !== null, name: 'Customer Preference Classifier' },
      naiveBayes: { trained: nbModel.model !== null, name: 'Fabric Type Recommender' },
      decisionTree: { trained: dtModel.model !== null, name: 'Tailor Allocation Optimizer' },
      svm: { trained: svmModel.model !== null, name: 'Order Delay Risk Detector' },
      bpnn: { trained: bpnnModel.network !== null, name: 'Customer Satisfaction Predictor' }
    };

    const savedModels = await MLModel.countDocuments({ isActive: true });

    res.json({
      success: true,
      status: 'ML System Online',
      models: modelStatus,
      savedModelsCount: savedModels
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ message: 'Error getting status', error: error.message });
  }
});

module.exports = router;

