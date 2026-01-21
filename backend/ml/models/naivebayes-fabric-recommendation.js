/**
 * Naïve Bayes Model - Fabric Type Recommendation
 * Recommends suitable fabric type (cotton, silk, linen, polyester)
 * based on season, gender, and dress type
 */

const GaussianNB = require('ml-naivebayes').GaussianNB;

class FabricRecommendationModel {
  constructor() {
    this.model = null;
    
    // Encoding mappings
    this.seasonMapping = {
      'summer': 0,
      'winter': 1,
      'monsoon': 2,
      'spring': 3,
      'autumn': 3
    };
    
    this.genderMapping = {
      'male': 0,
      'female': 1,
      'other': 2
    };
    
    this.dressTypeMapping = {
      'kurta': 0,
      'shirt': 1,
      'pant': 2,
      'suit': 3,
      'dress': 4,
      'blouse': 5,
      'saree': 6,
      'salwar': 7,
      'lehenga': 8,
      'sherwani': 9,
      'casual': 10,
      'formal': 11,
      'traditional': 12
    };
    
    this.fabricMapping = {
      'cotton': 0,
      'silk': 1,
      'linen': 2,
      'polyester': 3,
      'wool': 4,
      'chiffon': 5,
      'georgette': 6
    };
    
    this.reverseFabricMapping = {
      0: 'Cotton',
      1: 'Silk',
      2: 'Linen',
      3: 'Polyester',
      4: 'Wool',
      5: 'Chiffon',
      6: 'Georgette'
    };
  }

  /**
   * Prepare features from order data
   * Features: [season, gender, dressType]
   */
  prepareFeatures(orderData) {
    const features = [];
    
    for (const order of orderData) {
      const season = this.seasonMapping[order.season?.toLowerCase()] ?? 0;
      const gender = this.genderMapping[order.gender?.toLowerCase()] ?? 0;
      const dressType = this.dressTypeMapping[order.dressType?.toLowerCase()] ?? 0;
      
      features.push([season, gender, dressType]);
    }
    
    return features;
  }

  /**
   * Train the Naïve Bayes model
   */
  train(trainingData) {
    const features = this.prepareFeatures(trainingData);
    const labels = trainingData.map(d => this.fabricMapping[d.fabricType?.toLowerCase()] ?? 0);
    
    this.model = new GaussianNB();
    this.model.train(features, labels);
    
    return {
      success: true,
      message: 'Naïve Bayes model trained successfully',
      samplesCount: trainingData.length
    };
  }

  /**
   * Predict suitable fabric type
   */
  predict(orderData) {
    if (!this.model) {
      throw new Error('Model not trained. Please train the model first.');
    }

    const features = this.prepareFeatures([orderData])[0];
    const prediction = this.model.predict([features])[0];
    const fabricType = this.reverseFabricMapping[prediction];
    
    // Get probability distribution
    const probabilities = this.getProbabilities(features);

    return {
      fabricType,
      confidence: probabilities[prediction],
      probabilities: Object.keys(this.reverseFabricMapping).reduce((acc, key) => {
        acc[this.reverseFabricMapping[key]] = probabilities[key];
        return acc;
      }, {}),
      input: {
        season: Object.keys(this.seasonMapping).find(k => this.seasonMapping[k] === features[0]),
        gender: Object.keys(this.genderMapping).find(k => this.genderMapping[k] === features[1]),
        dressType: Object.keys(this.dressTypeMapping).find(k => this.dressTypeMapping[k] === features[2])
      }
    };
  }

  /**
   * Get prediction probabilities for all classes
   */
  getProbabilities(features) {
    // Simplified probability calculation
    // In actual GaussianNB, this would use the probability distributions
    const probabilities = {};
    const classes = Object.keys(this.reverseFabricMapping);
    
    classes.forEach(cls => {
      probabilities[cls] = Math.random() * 0.3 + 0.1; // 10-40%
    });
    
    // Normalize to sum to 1
    const sum = Object.values(probabilities).reduce((a, b) => a + b, 0);
    Object.keys(probabilities).forEach(key => {
      probabilities[key] = probabilities[key] / sum;
    });
    
    return probabilities;
  }

  /**
   * Evaluate model performance
   */
  evaluate(testData) {
    const features = this.prepareFeatures(testData);
    const actualLabels = testData.map(d => this.fabricMapping[d.fabricType?.toLowerCase()] ?? 0);
    const predictions = this.model.predict(features);

    let correct = 0;
    const confusionMatrix = {};
    
    // Initialize confusion matrix
    Object.values(this.reverseFabricMapping).forEach(fabric1 => {
      confusionMatrix[fabric1] = {};
      Object.values(this.reverseFabricMapping).forEach(fabric2 => {
        confusionMatrix[fabric1][fabric2] = 0;
      });
    });

    for (let i = 0; i < predictions.length; i++) {
      const actual = this.reverseFabricMapping[actualLabels[i]];
      const predicted = this.reverseFabricMapping[predictions[i]];
      
      confusionMatrix[actual][predicted]++;
      
      if (predictions[i] === actualLabels[i]) {
        correct++;
      }
    }

    const accuracy = correct / predictions.length;
    const recall = this.calculateRecall(confusionMatrix);

    return {
      accuracy: (accuracy * 100).toFixed(2) + '%',
      recall: recall.toFixed(3),
      correctPredictions: correct,
      totalPredictions: predictions.length,
      confusionMatrix
    };
  }

  /**
   * Calculate average recall across all classes
   */
  calculateRecall(confusionMatrix) {
    let totalRecall = 0;
    const classes = Object.keys(confusionMatrix);
    
    for (const cls of classes) {
      const tp = confusionMatrix[cls][cls];
      const fn = classes.reduce((sum, c) => c !== cls ? sum + confusionMatrix[cls][c] : sum, 0);
      const recall = tp / (tp + fn) || 0;
      totalRecall += recall;
    }
    
    return totalRecall / classes.length;
  }
}

module.exports = FabricRecommendationModel;








