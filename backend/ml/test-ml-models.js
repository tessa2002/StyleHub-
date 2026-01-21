/**
 * ML Models Test Script
 * Run this script to test all ML models with sample data
 * 
 * Usage: node backend/ml/test-ml-models.js
 */

const CustomerPreferenceClassifier = require('./models/knn-customer-preference');
const FabricRecommendationModel = require('./models/naivebayes-fabric-recommendation');
const TailorAllocationModel = require('./models/decisiontree-tailor-allocation');
const OrderDelayPredictionModel = require('./models/svm-order-delay');
const CustomerSatisfactionModel = require('./models/bpnn-satisfaction-prediction');

const {
  generateKNNData,
  generateNaiveBayesData,
  generateDecisionTreeData,
  generateSVMData,
  generateBPNNData
} = require('./data/training-data-generator');

console.log('🤖 Style Hub ML Models Test Suite\n');
console.log('=' .repeat(60));

// Test 1: KNN - Customer Preference Classification
console.log('\n1️⃣  Testing KNN - Customer Preference Classification');
console.log('-'.repeat(60));

const knnModel = new CustomerPreferenceClassifier();
const knnTrainingData = generateKNNData(100);
const knnTestData = generateKNNData(20);

console.log('Training KNN model with 100 samples...');
const knnTrainResult = knnModel.train(knnTrainingData);
console.log('✅', knnTrainResult.message);

console.log('\nEvaluating on 20 test samples...');
const knnEvaluation = knnModel.evaluate(knnTestData);
console.log('📊 Accuracy:', knnEvaluation.accuracy);
console.log('📊 F1-Score:', knnEvaluation.f1Score);

console.log('\nMaking sample prediction...');
const sampleCustomer = {
  age: 35,
  measurements: { chest: 95, waist: 85 },
  orderHistory: [1, 2, 3],
  avgOrderPrice: 3000,
  prefersEmbroidery: true
};
const knnPrediction = knnModel.predict(sampleCustomer);
console.log('🎯 Predicted Style:', knnPrediction.style);
console.log('🎯 Confidence:', (knnPrediction.confidence * 100).toFixed(2) + '%');

// Test 2: Naïve Bayes - Fabric Recommendation
console.log('\n\n2️⃣  Testing Naïve Bayes - Fabric Recommendation');
console.log('-'.repeat(60));

const nbModel = new FabricRecommendationModel();
const nbTrainingData = generateNaiveBayesData(100);
const nbTestData = generateNaiveBayesData(20);

console.log('Training Naïve Bayes model with 100 samples...');
const nbTrainResult = nbModel.train(nbTrainingData);
console.log('✅', nbTrainResult.message);

console.log('\nEvaluating on 20 test samples...');
const nbEvaluation = nbModel.evaluate(nbTestData);
console.log('📊 Accuracy:', nbEvaluation.accuracy);
console.log('📊 Recall:', nbEvaluation.recall);

console.log('\nMaking sample prediction...');
const sampleOrder = {
  season: 'summer',
  gender: 'female',
  dressType: 'saree'
};
const nbPrediction = nbModel.predict(sampleOrder);
console.log('🎯 Recommended Fabric:', nbPrediction.fabricType);
console.log('🎯 Confidence:', (nbPrediction.confidence * 100).toFixed(2) + '%');
console.log('🎯 Input:', nbPrediction.input);

// Test 3: Decision Tree - Tailor Allocation
console.log('\n\n3️⃣  Testing Decision Tree - Tailor Allocation');
console.log('-'.repeat(60));

const dtModel = new TailorAllocationModel();
const sampleTailors = [
  { tailorId: 'T001', name: 'Ravi Kumar', skillLevel: 'expert', experience: 10 },
  { tailorId: 'T002', name: 'Amit Shah', skillLevel: 'advanced', experience: 7 },
  { tailorId: 'T003', name: 'Priya Singh', skillLevel: 'intermediate', experience: 4 },
  { tailorId: 'T004', name: 'Suresh Patel', skillLevel: 'expert', experience: 12 },
  { tailorId: 'T005', name: 'Anjali Mehta', skillLevel: 'beginner', experience: 2 }
];

const { data: dtTrainingData } = generateDecisionTreeData(100, sampleTailors);
const { data: dtTestData } = generateDecisionTreeData(20, sampleTailors);

console.log('Training Decision Tree model with 100 samples...');
const dtTrainResult = dtModel.train(dtTrainingData, sampleTailors);
console.log('✅', dtTrainResult.message);
console.log('👥 Tailors in system:', dtTrainResult.tailorsCount);

console.log('\nEvaluating on 20 test samples...');
const dtEvaluation = dtModel.evaluate(dtTestData);
console.log('📊 Accuracy:', dtEvaluation.accuracy);
console.log('📊 Precision:', dtEvaluation.precision);

console.log('\nMaking sample prediction...');
const sampleOrderForTailor = {
  complexity: 'high',
  orderType: 'sherwani',
  embroideryRequired: true
};
const availableTailors = sampleTailors.map(t => ({
  ...t,
  currentWorkload: Math.floor(Math.random() * 5),
  specializations: ['traditional', 'wedding']
}));
const dtPrediction = dtModel.predict(sampleOrderForTailor, availableTailors);
console.log('🎯 Assigned Tailor:', dtPrediction.tailorName, `(${dtPrediction.assignedTailor})`);
console.log('🎯 Confidence:', dtPrediction.confidence);
console.log('🎯 Reasoning:', dtPrediction.reasoning);
console.log('🎯 Top 3 Tailors:');
dtPrediction.allScores.forEach((t, i) => {
  console.log(`   ${i + 1}. ${t.name} - Score: ${(t.score * 100).toFixed(2)}%, Workload: ${t.workload}`);
});

// Test 4: SVM - Order Delay Detection
console.log('\n\n4️⃣  Testing SVM - Order Delay Detection');
console.log('-'.repeat(60));

const svmModel = new OrderDelayPredictionModel();
const svmTrainingData = generateSVMData(100);
const svmTestData = generateSVMData(20);

console.log('Training SVM model with 100 samples...');
const svmTrainResult = svmModel.train(svmTrainingData);
console.log('✅', svmTrainResult.message);

console.log('\nEvaluating on 20 test samples...');
const svmEvaluation = svmModel.evaluate(svmTestData);
console.log('📊 Accuracy:', svmEvaluation.accuracy);
console.log('📊 F1-Score:', svmEvaluation.f1Score);
console.log('📊 Precision:', svmEvaluation.precision);
console.log('📊 Recall:', svmEvaluation.recall);

console.log('\nMaking sample prediction (High Risk)...');
const highRiskOrder = {
  orderType: 'lehenga',
  fabricSource: 'order',
  currentWorkload: 8,
  daysUntilDelivery: 5,
  embroideryRequired: true,
  tailorExperience: 2,
  isSeasonPeak: true
};
const svmPrediction1 = svmModel.predict(highRiskOrder);
console.log('🎯 Status:', svmPrediction1.status);
console.log('🎯 Risk Score:', svmPrediction1.riskScore);
console.log('🎯 Risk Level:', svmPrediction1.riskLevel);
console.log('🎯 Risk Factors:');
svmPrediction1.riskFactors.forEach(f => console.log('   -', f));
console.log('🎯 Recommendations:');
svmPrediction1.recommendations.forEach(r => console.log('   -', r));

console.log('\nMaking sample prediction (Low Risk)...');
const lowRiskOrder = {
  orderType: 'shirt',
  fabricSource: 'shop',
  currentWorkload: 2,
  daysUntilDelivery: 14,
  embroideryRequired: false,
  tailorExperience: 8,
  isSeasonPeak: false
};
const svmPrediction2 = svmModel.predict(lowRiskOrder);
console.log('🎯 Status:', svmPrediction2.status);
console.log('🎯 Risk Score:', svmPrediction2.riskScore);
console.log('🎯 Risk Level:', svmPrediction2.riskLevel);

// Test 5: BPNN - Customer Satisfaction Prediction
console.log('\n\n5️⃣  Testing BPNN - Customer Satisfaction Prediction');
console.log('-'.repeat(60));

const bpnnModel = new CustomerSatisfactionModel();
const bpnnTrainingData = generateBPNNData(100);
const bpnnTestData = generateBPNNData(20);

console.log('Training BPNN model with 100 samples...');
console.log('(This may take a moment...)');
const bpnnTrainResult = bpnnModel.train(bpnnTrainingData);
console.log('✅', bpnnTrainResult.message);
console.log('📈 Training Iterations:', bpnnTrainResult.trainingStats.iterations);
console.log('📈 Final Error:', bpnnTrainResult.trainingStats.error);

console.log('\nEvaluating on 20 test samples...');
const bpnnEvaluation = bpnnModel.evaluate(bpnnTestData);
console.log('📊 Accuracy:', bpnnEvaluation.accuracy);
console.log('📊 MSE:', bpnnEvaluation.mse);
console.log('📊 F1-Score:', bpnnEvaluation.f1Score);

console.log('\nMaking sample prediction (High Satisfaction)...');
const highSatFeedback = {
  fittingQuality: 9,
  deliverySpeed: 8.5,
  priceValue: 8,
  communication: 9,
  overallQuality: 8.5,
  customizationSatisfaction: 9,
  previousOrders: 5
};
const bpnnPrediction1 = bpnnModel.predict(highSatFeedback);
console.log('🎯 Predicted Satisfaction:', bpnnPrediction1.satisfaction);
console.log('🎯 Confidence:', bpnnPrediction1.confidence);
console.log('🎯 Overall Score:', bpnnPrediction1.overallScore, '/ 10');
console.log('🎯 Probabilities:', JSON.stringify(bpnnPrediction1.probabilities, null, 2));
console.log('🎯 Insights:');
bpnnPrediction1.insights.insights.forEach(i => console.log('   -', i));
console.log('🎯 Recommendations:');
bpnnPrediction1.insights.recommendations.forEach(r => console.log('   -', r));

console.log('\nMaking sample prediction (Low Satisfaction)...');
const lowSatFeedback = {
  fittingQuality: 4,
  deliverySpeed: 3,
  priceValue: 4,
  communication: 3.5,
  overallQuality: 3,
  customizationSatisfaction: 4,
  previousOrders: 0
};
const bpnnPrediction2 = bpnnModel.predict(lowSatFeedback);
console.log('🎯 Predicted Satisfaction:', bpnnPrediction2.satisfaction);
console.log('🎯 Confidence:', bpnnPrediction2.confidence);
console.log('🎯 Overall Score:', bpnnPrediction2.overallScore, '/ 10');
console.log('🎯 Risk Level:', bpnnPrediction2.insights.riskLevel);
console.log('🎯 Insights:');
bpnnPrediction2.insights.insights.forEach(i => console.log('   -', i));
console.log('🎯 Recommendations:');
bpnnPrediction2.insights.recommendations.forEach(r => console.log('   -', r));

// Summary
console.log('\n\n' + '='.repeat(60));
console.log('📋 Test Summary');
console.log('='.repeat(60));

console.log('\n✅ All 5 ML Models Successfully Tested!\n');

console.log('Model Performance Summary:');
console.log(`1. KNN (Customer Preference):    Accuracy: ${knnEvaluation.accuracy}, F1: ${knnEvaluation.f1Score}`);
console.log(`2. Naïve Bayes (Fabric):          Accuracy: ${nbEvaluation.accuracy}, Recall: ${nbEvaluation.recall}`);
console.log(`3. Decision Tree (Tailor):        Accuracy: ${dtEvaluation.accuracy}, Precision: ${dtEvaluation.precision}`);
console.log(`4. SVM (Order Delay):             Accuracy: ${svmEvaluation.accuracy}, F1: ${svmEvaluation.f1Score}`);
console.log(`5. BPNN (Satisfaction):           Accuracy: ${bpnnEvaluation.accuracy}, MSE: ${bpnnEvaluation.mse}`);

console.log('\n🚀 Ready to integrate into your application!');
console.log('📚 See backend/ml/README.md for API documentation');
console.log('\n');








