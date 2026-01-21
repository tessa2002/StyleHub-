/**
 * Decision Tree Model - Tailor Allocation Optimization
 * Assigns the best tailor for an order based on complexity,
 * tailor skill level, and workload
 */

const DecisionTreeClassifier = require('ml-cart').DecisionTreeClassifier;

class TailorAllocationModel {
  constructor() {
    this.model = null;
    this.tailorIdMapping = {};
    this.reverseTailorMapping = {};
    
    // Complexity mapping
    this.complexityMapping = {
      'low': 0,
      'medium': 1,
      'high': 2,
      'very high': 3
    };
    
    // Skill level mapping
    this.skillMapping = {
      'beginner': 0,
      'intermediate': 1,
      'advanced': 2,
      'expert': 3
    };
  }

  /**
   * Initialize tailor mappings
   */
  initializeTailorMappings(tailors) {
    tailors.forEach((tailor, index) => {
      const tailorId = tailor.tailorId || tailor._id || `T${String(index + 1).padStart(3, '0')}`;
      this.tailorIdMapping[tailorId] = index;
      this.reverseTailorMapping[index] = tailorId;
    });
  }

  /**
   * Prepare features from order and tailor data
   * Features: [orderComplexity, tailorSkillLevel, currentWorkload, 
   *           experience, embroideryRequired, hasSpecialization]
   */
  prepareFeatures(allocationData) {
    const features = [];
    
    for (const data of allocationData) {
      const complexity = this.complexityMapping[data.orderComplexity?.toLowerCase()] ?? 1;
      const skillLevel = this.skillMapping[data.tailorSkillLevel?.toLowerCase()] ?? 1;
      const workload = data.currentWorkload || 0;
      const experience = data.tailorExperience || 1; // in years
      const embroideryReq = data.embroideryRequired ? 1 : 0;
      const hasSpecialization = data.hasSpecialization ? 1 : 0;
      
      features.push([complexity, skillLevel, workload, experience, embroideryReq, hasSpecialization]);
    }
    
    return features;
  }

  /**
   * Train the Decision Tree model
   */
  train(trainingData, tailors) {
    // Initialize tailor mappings
    this.initializeTailorMappings(tailors);
    
    const features = this.prepareFeatures(trainingData);
    const labels = trainingData.map(d => {
      const tailorId = d.assignedTailor;
      return this.tailorIdMapping[tailorId] ?? 0;
    });
    
    // Train decision tree
    this.model = new DecisionTreeClassifier({
      gainFunction: 'gini',
      maxDepth: 10,
      minNumSamples: 3
    });
    
    this.model.train(features, labels);
    
    return {
      success: true,
      message: 'Decision Tree model trained successfully',
      samplesCount: trainingData.length,
      tailorsCount: Object.keys(this.tailorIdMapping).length
    };
  }

  /**
   * Predict best tailor for an order
   */
  predict(orderData, availableTailors) {
    if (!this.model) {
      throw new Error('Model not trained. Please train the model first.');
    }

    // For each available tailor, calculate a score
    const tailorScores = availableTailors.map(tailor => {
      const features = this.prepareFeatures([{
        orderComplexity: orderData.complexity,
        tailorSkillLevel: tailor.skillLevel,
        currentWorkload: tailor.currentWorkload || 0,
        tailorExperience: tailor.experience || 1,
        embroideryRequired: orderData.embroideryRequired || false,
        hasSpecialization: this.checkSpecialization(tailor, orderData)
      }])[0];
      
      const prediction = this.model.predict([features])[0];
      const tailorId = tailor.tailorId || tailor._id;
      
      // Calculate score based on multiple factors
      const score = this.calculateTailorScore(tailor, orderData, prediction);
      
      return {
        tailorId,
        name: tailor.name,
        score,
        skillLevel: tailor.skillLevel,
        workload: tailor.currentWorkload || 0,
        prediction
      };
    });

    // Sort by score (descending)
    tailorScores.sort((a, b) => b.score - a.score);
    
    const bestTailor = tailorScores[0];

    return {
      assignedTailor: bestTailor.tailorId,
      tailorName: bestTailor.name,
      confidence: (bestTailor.score * 100).toFixed(2) + '%',
      allScores: tailorScores.slice(0, 3), // Top 3 tailors
      reasoning: this.generateReasoning(bestTailor, orderData)
    };
  }

  /**
   * Check if tailor has relevant specialization
   */
  checkSpecialization(tailor, orderData) {
    if (!tailor.specializations || tailor.specializations.length === 0) {
      return false;
    }
    
    const orderType = orderData.orderType?.toLowerCase() || '';
    return tailor.specializations.some(spec => 
      orderType.includes(spec.toLowerCase())
    );
  }

  /**
   * Calculate overall score for tailor
   */
  calculateTailorScore(tailor, orderData, prediction) {
    const complexityWeight = this.complexityMapping[orderData.complexity?.toLowerCase()] ?? 1;
    const skillWeight = this.skillMapping[tailor.skillLevel?.toLowerCase()] ?? 1;
    const workloadPenalty = (tailor.currentWorkload || 0) / 10; // Reduce score for high workload
    const experienceBonus = Math.min((tailor.experience || 1) / 10, 0.3); // Max 30% bonus
    const specializationBonus = this.checkSpecialization(tailor, orderData) ? 0.2 : 0;
    
    // Base score from skill matching complexity
    let score = (skillWeight + 1) / (complexityWeight + 1);
    
    // Apply modifiers
    score = score * (1 + experienceBonus + specializationBonus - workloadPenalty);
    
    // Normalize to 0-1
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Generate human-readable reasoning
   */
  generateReasoning(tailor, orderData) {
    const reasons = [];
    
    if (tailor.workload < 3) {
      reasons.push('Low current workload');
    }
    
    if (this.skillMapping[tailor.skillLevel?.toLowerCase()] >= 
        this.complexityMapping[orderData.complexity?.toLowerCase()]) {
      reasons.push('Skill level matches order complexity');
    }
    
    if (tailor.hasSpecialization) {
      reasons.push('Has relevant specialization');
    }
    
    return reasons.join(', ') || 'Best available match';
  }

  /**
   * Evaluate model performance
   */
  evaluate(testData) {
    const features = this.prepareFeatures(testData);
    const actualLabels = testData.map(d => this.tailorIdMapping[d.assignedTailor] ?? 0);
    const predictions = this.model.predict(features);

    let correct = 0;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i] === actualLabels[i]) {
        correct++;
      }
    }

    const accuracy = correct / predictions.length;
    const precision = this.calculatePrecision(predictions, actualLabels);

    return {
      accuracy: (accuracy * 100).toFixed(2) + '%',
      precision: precision.toFixed(3),
      correctPredictions: correct,
      totalPredictions: predictions.length
    };
  }

  /**
   * Calculate precision
   */
  calculatePrecision(predictions, actualLabels) {
    let tp = 0, fp = 0;
    
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i] === actualLabels[i]) {
        tp++;
      } else {
        fp++;
      }
    }
    
    return tp / (tp + fp) || 0;
  }
}

module.exports = TailorAllocationModel;








