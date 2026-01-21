/**
 * SVM Model - Order Delay Risk Detection
 * Predicts if an order will be On-Time or Delayed
 * based on order type, fabric arrival, and current workload
 */

const SVM = require('ml-svm');

class OrderDelayPredictionModel {
  constructor() {
    this.model = null;
    
    // Order type complexity mapping
    this.orderTypeMapping = {
      'simple': 0,
      'shirt': 1,
      'pant': 1,
      'kurta': 2,
      'suit': 3,
      'dress': 2,
      'blouse': 2,
      'saree': 3,
      'lehenga': 4,
      'sherwani': 4,
      'complex': 4
    };
    
    // Fabric source mapping
    this.fabricSourceMapping = {
      'shop': 0,      // Available immediately
      'customer': 1,  // Already provided
      'order': 2      // Needs to be ordered
    };
    
    // Status mapping
    this.statusMapping = {
      'on-time': 0,
      'delayed': 1
    };
    
    this.reverseStatusMapping = {
      0: 'On-Time',
      1: 'Delayed'
    };
  }

  /**
   * Prepare features from order data
   * Features: [orderComplexity, fabricAvailability, currentWorkload, 
   *           daysUntilDelivery, embroideryRequired, tailorExperience, seasonPeak]
   */
  prepareFeatures(orderData) {
    const features = [];
    
    for (const order of orderData) {
      const complexity = this.orderTypeMapping[order.orderType?.toLowerCase()] ?? 2;
      const fabricAvailability = this.fabricSourceMapping[order.fabricSource?.toLowerCase()] ?? 1;
      const workload = order.currentWorkload || 0;
      const daysUntilDelivery = order.daysUntilDelivery || 7;
      const embroideryReq = order.embroideryRequired ? 1 : 0;
      const tailorExp = order.tailorExperience || 2;
      const seasonPeak = order.isSeasonPeak ? 1 : 0;
      
      features.push([
        complexity, 
        fabricAvailability, 
        workload, 
        daysUntilDelivery, 
        embroideryReq, 
        tailorExp,
        seasonPeak
      ]);
    }
    
    return features;
  }

  /**
   * Train the SVM model
   */
  train(trainingData) {
    const features = this.prepareFeatures(trainingData);
    const labels = trainingData.map(d => {
      const status = d.deliveryStatus?.toLowerCase() || 'on-time';
      return this.statusMapping[status] ?? 0;
    });
    
    // Train SVM with RBF kernel
    const options = {
      kernel: 'rbf',
      type: 'C_SVC',
      gamma: 0.5,
      cost: 1
    };
    
    this.model = new SVM(options);
    this.model.train(features, labels);
    
    return {
      success: true,
      message: 'SVM model trained successfully',
      samplesCount: trainingData.length,
      options
    };
  }

  /**
   * Predict if order will be delayed
   */
  predict(orderData) {
    if (!this.model) {
      throw new Error('Model not trained. Please train the model first.');
    }

    const features = this.prepareFeatures([orderData])[0];
    const prediction = this.model.predict([features])[0];
    const status = this.reverseStatusMapping[prediction];
    
    // Calculate risk score
    const riskScore = this.calculateRiskScore(features);
    
    // Generate risk factors
    const riskFactors = this.identifyRiskFactors(orderData, features);

    return {
      status,
      riskScore: (riskScore * 100).toFixed(2) + '%',
      riskLevel: this.getRiskLevel(riskScore),
      riskFactors,
      recommendations: this.generateRecommendations(riskFactors, orderData),
      features: {
        orderComplexity: features[0],
        fabricAvailability: features[1],
        currentWorkload: features[2],
        daysUntilDelivery: features[3],
        embroideryRequired: features[4] === 1,
        tailorExperience: features[5],
        seasonPeak: features[6] === 1
      }
    };
  }

  /**
   * Calculate risk score (0-1, higher = more risk)
   */
  calculateRiskScore(features) {
    const [complexity, fabricAvail, workload, daysLeft, embroidery, experience, seasonPeak] = features;
    
    let risk = 0;
    
    // Complexity contribution (0-0.25)
    risk += (complexity / 4) * 0.25;
    
    // Fabric availability (0-0.2)
    risk += (fabricAvail / 2) * 0.2;
    
    // Workload (0-0.2)
    risk += Math.min(workload / 10, 1) * 0.2;
    
    // Time pressure (0-0.2)
    risk += Math.max(0, 1 - (daysLeft / 14)) * 0.2;
    
    // Embroidery (0-0.1)
    risk += embroidery * 0.1;
    
    // Tailor experience (reduces risk, -0.1 to 0)
    risk -= Math.min(experience / 10, 1) * 0.1;
    
    // Season peak (0-0.05)
    risk += seasonPeak * 0.05;
    
    return Math.max(0, Math.min(1, risk));
  }

  /**
   * Get risk level category
   */
  getRiskLevel(riskScore) {
    if (riskScore < 0.3) return 'Low';
    if (riskScore < 0.6) return 'Medium';
    if (riskScore < 0.8) return 'High';
    return 'Critical';
  }

  /**
   * Identify specific risk factors
   */
  identifyRiskFactors(orderData, features) {
    const factors = [];
    const [complexity, fabricAvail, workload, daysLeft, embroidery, experience, seasonPeak] = features;
    
    if (complexity >= 3) {
      factors.push('High complexity order');
    }
    
    if (fabricAvail >= 2) {
      factors.push('Fabric needs to be ordered');
    }
    
    if (workload >= 5) {
      factors.push('High current workload');
    }
    
    if (daysLeft < 7) {
      factors.push('Short delivery timeline');
    }
    
    if (embroidery === 1) {
      factors.push('Embroidery work required');
    }
    
    if (experience < 2) {
      factors.push('Less experienced tailor');
    }
    
    if (seasonPeak === 1) {
      factors.push('Peak season demand');
    }
    
    return factors.length > 0 ? factors : ['No significant risk factors'];
  }

  /**
   * Generate recommendations to mitigate delay risk
   */
  generateRecommendations(riskFactors, orderData) {
    const recommendations = [];
    
    if (riskFactors.includes('Fabric needs to be ordered')) {
      recommendations.push('Order fabric immediately or suggest available alternatives');
    }
    
    if (riskFactors.includes('High current workload')) {
      recommendations.push('Consider assigning to a tailor with lower workload');
    }
    
    if (riskFactors.includes('Short delivery timeline')) {
      recommendations.push('Negotiate extended delivery date or allocate priority resources');
    }
    
    if (riskFactors.includes('High complexity order')) {
      recommendations.push('Assign to experienced tailor and schedule regular progress checks');
    }
    
    if (riskFactors.includes('Embroidery work required')) {
      recommendations.push('Pre-schedule embroidery work or consider outsourcing');
    }
    
    if (riskFactors.includes('Peak season demand')) {
      recommendations.push('Add buffer time to delivery estimate');
    }
    
    return recommendations.length > 0 ? recommendations : ['Order should proceed normally'];
  }

  /**
   * Evaluate model performance
   */
  evaluate(testData) {
    const features = this.prepareFeatures(testData);
    const actualLabels = testData.map(d => {
      const status = d.deliveryStatus?.toLowerCase() || 'on-time';
      return this.statusMapping[status] ?? 0;
    });
    const predictions = this.model.predict(features);

    let tp = 0, tn = 0, fp = 0, fn = 0;
    
    for (let i = 0; i < predictions.length; i++) {
      const predicted = predictions[i];
      const actual = actualLabels[i];
      
      if (predicted === 1 && actual === 1) tp++;
      else if (predicted === 0 && actual === 0) tn++;
      else if (predicted === 1 && actual === 0) fp++;
      else if (predicted === 0 && actual === 1) fn++;
    }

    const accuracy = (tp + tn) / predictions.length;
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    return {
      accuracy: (accuracy * 100).toFixed(2) + '%',
      f1Score: f1Score.toFixed(3),
      precision: precision.toFixed(3),
      recall: recall.toFixed(3),
      confusionMatrix: {
        truePositive: tp,
        trueNegative: tn,
        falsePositive: fp,
        falseNegative: fn
      },
      totalPredictions: predictions.length
    };
  }
}

module.exports = OrderDelayPredictionModel;








