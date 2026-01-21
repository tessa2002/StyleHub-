/**
 * Backpropagation Neural Network (BPNN) - Customer Satisfaction Prediction
 * Predicts overall satisfaction (Low, Medium, High) after delivery
 * using data like fitting quality, delivery speed, and price
 */

// Use synaptic - Pure JavaScript neural network (no native dependencies)
const synaptic = require('synaptic');
const { Architect, Trainer } = synaptic;

class CustomerSatisfactionModel {
  constructor() {
    this.network = null;
    
    this.satisfactionMapping = {
      'low': 0,
      'medium': 1,
      'high': 2
    };
    
    this.reverseSatisfactionMapping = {
      0: 'Low',
      1: 'Medium',
      2: 'High'
    };
  }

  /**
   * Normalize value to 0-1 range
   */
  normalize(value, min, max) {
    return (value - min) / (max - min);
  }

  /**
   * Prepare features from customer feedback data
   * Features: [fittingQuality, deliverySpeed, priceValue, communication, 
   *           overallQuality, customizationSatisfaction, previousOrders]
   */
  prepareFeatures(feedbackData) {
    const features = [];
    
    for (const feedback of feedbackData) {
      // Normalize all features to 0-1 range
      const fittingQuality = this.normalize(feedback.fittingQuality || 5, 0, 10);
      const deliverySpeed = this.normalize(feedback.deliverySpeed || 5, 0, 10);
      const priceValue = this.normalize(feedback.priceValue || 5, 0, 10);
      const communication = this.normalize(feedback.communication || 5, 0, 10);
      const overallQuality = this.normalize(feedback.overallQuality || 5, 0, 10);
      const customizationSat = this.normalize(feedback.customizationSatisfaction || 5, 0, 10);
      const previousOrders = this.normalize(Math.min(feedback.previousOrders || 0, 20), 0, 20);
      
      features.push({
        input: [
          fittingQuality,
          deliverySpeed,
          priceValue,
          communication,
          overallQuality,
          customizationSat,
          previousOrders
        ]
      });
    }
    
    return features;
  }

  /**
   * Prepare training data with labels
   */
  prepareTrainingData(feedbackData) {
    const features = this.prepareFeatures(feedbackData);
    
    return features.map((feature, index) => {
      const satisfaction = feedbackData[index].satisfaction?.toLowerCase() || 'medium';
      const label = this.satisfactionMapping[satisfaction];
      
      // Convert label to one-hot encoding for neural network
      const output = [0, 0, 0];
      output[label] = 1;
      
      return {
        input: feature.input,
        output: output
      };
    });
  }

  /**
   * Train the BPNN model
   */
  train(trainingData) {
    const preparedData = this.prepareTrainingData(trainingData);
    
    // Create neural network with synaptic (pure JavaScript)
    // Architecture: 7 inputs -> 10 hidden -> 8 hidden -> 3 outputs
    this.network = new Architect.Perceptron(7, 10, 8, 3);
    
    // Create trainer
    const trainer = new Trainer(this.network);
    
    // Train the network
    const stats = trainer.train(preparedData, {
      rate: 0.1,
      iterations: 2000,
      error: 0.005,
      shuffle: true,
      log: false
    });
    
    return {
      success: true,
      message: 'BPNN model trained successfully',
      samplesCount: trainingData.length,
      trainingStats: {
        iterations: stats.iterations,
        error: stats.error.toFixed(6),
        learningRate: 0.1
      }
    };
  }

  /**
   * Predict customer satisfaction
   */
  predict(feedbackData) {
    if (!this.network) {
      throw new Error('Model not trained. Please train the model first.');
    }

    const features = this.prepareFeatures([feedbackData])[0];
    const output = this.network.activate(features.input);
    
    // Get the class with highest probability
    const maxIndex = output.indexOf(Math.max(...output));
    const satisfaction = this.reverseSatisfactionMapping[maxIndex];
    const confidence = output[maxIndex];
    
    // Calculate overall score (weighted average)
    const overallScore = this.calculateOverallScore(feedbackData);

    return {
      satisfaction,
      confidence: (confidence * 100).toFixed(2) + '%',
      probabilities: {
        Low: (output[0] * 100).toFixed(2) + '%',
        Medium: (output[1] * 100).toFixed(2) + '%',
        High: (output[2] * 100).toFixed(2) + '%'
      },
      overallScore: overallScore.toFixed(2),
      breakdown: this.getScoreBreakdown(feedbackData),
      insights: this.generateInsights(feedbackData, satisfaction)
    };
  }

  /**
   * Calculate overall satisfaction score (0-10)
   */
  calculateOverallScore(feedback) {
    const weights = {
      fittingQuality: 0.25,
      deliverySpeed: 0.20,
      priceValue: 0.15,
      communication: 0.15,
      overallQuality: 0.20,
      customizationSatisfaction: 0.05
    };
    
    let score = 0;
    score += (feedback.fittingQuality || 5) * weights.fittingQuality;
    score += (feedback.deliverySpeed || 5) * weights.deliverySpeed;
    score += (feedback.priceValue || 5) * weights.priceValue;
    score += (feedback.communication || 5) * weights.communication;
    score += (feedback.overallQuality || 5) * weights.overallQuality;
    score += (feedback.customizationSatisfaction || 5) * weights.customizationSatisfaction;
    
    return score;
  }

  /**
   * Get detailed score breakdown
   */
  getScoreBreakdown(feedback) {
    return {
      fittingQuality: {
        score: feedback.fittingQuality || 5,
        weight: '25%',
        impact: 'High'
      },
      deliverySpeed: {
        score: feedback.deliverySpeed || 5,
        weight: '20%',
        impact: 'High'
      },
      priceValue: {
        score: feedback.priceValue || 5,
        weight: '15%',
        impact: 'Medium'
      },
      communication: {
        score: feedback.communication || 5,
        weight: '15%',
        impact: 'Medium'
      },
      overallQuality: {
        score: feedback.overallQuality || 5,
        weight: '20%',
        impact: 'High'
      },
      customizationSatisfaction: {
        score: feedback.customizationSatisfaction || 5,
        weight: '5%',
        impact: 'Low'
      }
    };
  }

  /**
   * Generate insights and recommendations
   */
  generateInsights(feedback, predictedSatisfaction) {
    const insights = [];
    const recommendations = [];
    
    // Analyze each factor
    if ((feedback.fittingQuality || 5) < 6) {
      insights.push('Fitting quality is below expectations');
      recommendations.push('Schedule additional trials before final delivery');
    }
    
    if ((feedback.deliverySpeed || 5) < 6) {
      insights.push('Delivery time concerns detected');
      recommendations.push('Improve timeline estimates and communication');
    }
    
    if ((feedback.priceValue || 5) < 6) {
      insights.push('Price perception needs improvement');
      recommendations.push('Better communicate value proposition and quality');
    }
    
    if ((feedback.communication || 5) < 6) {
      insights.push('Communication gaps identified');
      recommendations.push('Implement regular status updates via SMS/WhatsApp');
    }
    
    if ((feedback.overallQuality || 5) < 6) {
      insights.push('Overall quality concerns');
      recommendations.push('Review quality control processes');
    }
    
    // Positive feedback
    if ((feedback.fittingQuality || 5) >= 8) {
      insights.push('Excellent fitting quality');
    }
    
    if ((feedback.deliverySpeed || 5) >= 8) {
      insights.push('Fast delivery appreciated');
    }
    
    if (insights.length === 0) {
      insights.push('Customer experience is satisfactory');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Maintain current service standards');
    }
    
    return {
      insights,
      recommendations,
      riskLevel: predictedSatisfaction === 'Low' ? 'High' : 
                 predictedSatisfaction === 'Medium' ? 'Medium' : 'Low'
    };
  }

  /**
   * Evaluate model performance
   */
  evaluate(testData) {
    const preparedData = this.prepareTrainingData(testData);
    let correct = 0;
    let totalMSE = 0;
    
    const confusionMatrix = {
      Low: { Low: 0, Medium: 0, High: 0 },
      Medium: { Low: 0, Medium: 0, High: 0 },
      High: { Low: 0, Medium: 0, High: 0 }
    };
    
    preparedData.forEach((data) => {
      const output = this.network.activate(data.input);
      const predictedIndex = output.indexOf(Math.max(...output));
      const actualIndex = data.output.indexOf(1);
      
      const predicted = this.reverseSatisfactionMapping[predictedIndex];
      const actual = this.reverseSatisfactionMapping[actualIndex];
      
      confusionMatrix[actual][predicted]++;
      
      if (predictedIndex === actualIndex) {
        correct++;
      }
      
      // Calculate MSE
      const mse = data.output.reduce((sum, val, i) => {
        return sum + Math.pow(val - output[i], 2);
      }, 0) / data.output.length;
      
      totalMSE += mse;
    });

    const accuracy = correct / testData.length;
    const avgMSE = totalMSE / testData.length;
    const f1Score = this.calculateF1ScoreFromMatrix(confusionMatrix);

    return {
      accuracy: (accuracy * 100).toFixed(2) + '%',
      mse: avgMSE.toFixed(6),
      f1Score: f1Score.toFixed(3),
      correctPredictions: correct,
      totalPredictions: testData.length,
      confusionMatrix
    };
  }

  /**
   * Calculate F1-Score from confusion matrix
   */
  calculateF1ScoreFromMatrix(confusionMatrix) {
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

  /**
   * Export trained model
   */
  exportModel() {
    if (!this.network) {
      throw new Error('No trained model to export');
    }
    
    return this.network.toJSON();
  }

  /**
   * Import trained model
   */
  importModel(modelJSON) {
    this.network = synaptic.Network.fromJSON(modelJSON);
  }
}

module.exports = CustomerSatisfactionModel;

