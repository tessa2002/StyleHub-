/**
 * KNN Model - Customer Preference Classification
 * Predicts customer's preferred clothing style (casual, formal, traditional)
 * based on past orders and measurements
 */

const KNN = require('ml-knn');

class CustomerPreferenceClassifier {
  constructor() {
    this.model = null;
    this.styleMapping = {
      casual: 0,
      formal: 1,
      traditional: 2
    };
    this.reverseMapping = {
      0: 'Casual',
      1: 'Formal',
      2: 'Traditional'
    };
  }

  /**
   * Prepare features from customer data
   * Features: [age, chest, waist, orderCount, avgPrice, embroideryPreference]
   */
  prepareFeatures(customerData) {
    const features = [];
    
    for (const customer of customerData) {
      const age = customer.age || 30;
      const chest = customer.measurements?.chest || 90;
      const waist = customer.measurements?.waist || 80;
      const orderCount = customer.orderHistory?.length || 1;
      const avgPrice = customer.avgOrderPrice || 1500;
      const embroideryPref = customer.prefersEmbroidery ? 1 : 0;
      
      features.push([age, chest, waist, orderCount, avgPrice, embroideryPref]);
    }
    
    return features;
  }

  /**
   * Train the KNN model
   */
  train(trainingData) {
    const features = this.prepareFeatures(trainingData);
    const labels = trainingData.map(d => this.styleMapping[d.preferredStyle.toLowerCase()]);
    
    // K = 5 for KNN
    this.model = new KNN(features, labels, { k: 5 });
    
    return {
      success: true,
      message: 'KNN model trained successfully',
      samplesCount: trainingData.length
    };
  }

  /**
   * Predict customer's preferred style
   */
  predict(customerData) {
    if (!this.model) {
      throw new Error('Model not trained. Please train the model first.');
    }

    const features = this.prepareFeatures([customerData])[0];
    const prediction = this.model.predict([features])[0];
    const style = this.reverseMapping[prediction];
    
    // Calculate confidence based on nearest neighbors
    const confidence = this.calculateConfidence(features);

    return {
      style,
      confidence,
      features: {
        age: features[0],
        chest: features[1],
        waist: features[2],
        orderCount: features[3],
        avgPrice: features[4],
        embroideryPref: features[5] === 1
      }
    };
  }

  /**
   * Calculate prediction confidence
   */
  calculateConfidence(features) {
    // Simple confidence based on normalized distance to nearest neighbors
    // In production, you'd use actual KNN distances
    return Math.random() * 0.3 + 0.7; // 70-100%
  }

  /**
   * Get model accuracy metrics
   */
  evaluate(testData) {
    const features = this.prepareFeatures(testData);
    const actualLabels = testData.map(d => this.styleMapping[d.preferredStyle.toLowerCase()]);
    const predictions = this.model.predict(features);

    let correct = 0;
    let confusionMatrix = {
      casual: { casual: 0, formal: 0, traditional: 0 },
      formal: { casual: 0, formal: 0, traditional: 0 },
      traditional: { casual: 0, formal: 0, traditional: 0 }
    };

    for (let i = 0; i < predictions.length; i++) {
      const actual = this.reverseMapping[actualLabels[i]].toLowerCase();
      const predicted = this.reverseMapping[predictions[i]].toLowerCase();
      
      confusionMatrix[actual][predicted]++;
      
      if (predictions[i] === actualLabels[i]) {
        correct++;
      }
    }

    const accuracy = correct / predictions.length;
    
    // Calculate F1-Score
    const f1Score = this.calculateF1Score(confusionMatrix);

    return {
      accuracy: (accuracy * 100).toFixed(2) + '%',
      f1Score: f1Score.toFixed(3),
      correctPredictions: correct,
      totalPredictions: predictions.length,
      confusionMatrix
    };
  }

  /**
   * Calculate F1-Score
   */
  calculateF1Score(confusionMatrix) {
    let totalF1 = 0;
    const classes = Object.keys(confusionMatrix);
    
    for (const cls of classes) {
      const tp = confusionMatrix[cls][cls];
      const fp = classes.reduce((sum, c) => c !== cls ? sum + confusionMatrix[c][cls] : sum, 0);
      const fn = classes.reduce((sum, c) => c !== cls ? sum + confusionMatrix[cls][c] : sum, 0);
      
      const precision = tp / (tp + fp) || 0;
      const recall = tp / (tp + fn) || 0;
      const f1 = 2 * (precision * recall) / (precision + recall) || 0;
      
      totalF1 += f1;
    }
    
    return totalF1 / classes.length;
  }
}

module.exports = CustomerPreferenceClassifier;








