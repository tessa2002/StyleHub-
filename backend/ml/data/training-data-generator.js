/**
 * Training Data Generator for ML Models
 * Generates sample training data for all 5 ML models
 */

/**
 * Generate KNN training data - Customer Preference Classification
 */
function generateKNNData(count = 100) {
  const styles = ['casual', 'formal', 'traditional'];
  const data = [];
  
  for (let i = 0; i < count; i++) {
    const style = styles[Math.floor(Math.random() * styles.length)];
    
    // Generate realistic data based on style
    let age, chest, waist, orderCount, avgPrice, prefersEmbroidery;
    
    if (style === 'casual') {
      age = 18 + Math.random() * 25; // 18-43
      chest = 85 + Math.random() * 15; // 85-100
      waist = 70 + Math.random() * 15; // 70-85
      orderCount = 1 + Math.floor(Math.random() * 3);
      avgPrice = 800 + Math.random() * 700; // 800-1500
      prefersEmbroidery = Math.random() < 0.2;
    } else if (style === 'formal') {
      age = 25 + Math.random() * 30; // 25-55
      chest = 90 + Math.random() * 20; // 90-110
      waist = 75 + Math.random() * 20; // 75-95
      orderCount = 2 + Math.floor(Math.random() * 5);
      avgPrice = 2000 + Math.random() * 2000; // 2000-4000
      prefersEmbroidery = Math.random() < 0.3;
    } else { // traditional
      age = 30 + Math.random() * 40; // 30-70
      chest = 88 + Math.random() * 22; // 88-110
      waist = 78 + Math.random() * 22; // 78-100
      orderCount = 3 + Math.floor(Math.random() * 7);
      avgPrice = 2500 + Math.random() * 3500; // 2500-6000
      prefersEmbroidery = Math.random() < 0.7;
    }
    
    data.push({
      age: Math.round(age),
      measurements: {
        chest: Math.round(chest),
        waist: Math.round(waist)
      },
      orderHistory: new Array(orderCount).fill(null),
      avgOrderPrice: Math.round(avgPrice),
      prefersEmbroidery,
      preferredStyle: style
    });
  }
  
  return data;
}

/**
 * Generate Naïve Bayes training data - Fabric Recommendation
 */
function generateNaiveBayesData(count = 100) {
  const seasons = ['summer', 'winter', 'monsoon', 'spring'];
  const genders = ['male', 'female', 'other'];
  const dressTypes = ['kurta', 'shirt', 'pant', 'suit', 'dress', 'blouse', 'saree', 'salwar', 'lehenga'];
  const fabrics = ['cotton', 'silk', 'linen', 'polyester', 'wool', 'chiffon', 'georgette'];
  
  const data = [];
  
  // Define fabric preferences based on season and type
  const fabricRules = {
    summer: { preferred: ['cotton', 'linen'], avoid: ['wool'] },
    winter: { preferred: ['wool', 'silk'], avoid: ['linen'] },
    monsoon: { preferred: ['polyester', 'cotton'], avoid: ['silk'] },
    spring: { preferred: ['cotton', 'silk', 'chiffon'], avoid: [] }
  };
  
  for (let i = 0; i < count; i++) {
    const season = seasons[Math.floor(Math.random() * seasons.length)];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const dressType = dressTypes[Math.floor(Math.random() * dressTypes.length)];
    
    // Select fabric based on season preferences
    const preferred = fabricRules[season].preferred;
    const fabricType = Math.random() < 0.7 
      ? preferred[Math.floor(Math.random() * preferred.length)]
      : fabrics[Math.floor(Math.random() * fabrics.length)];
    
    data.push({
      season,
      gender,
      dressType,
      fabricType
    });
  }
  
  return data;
}

/**
 * Generate Decision Tree training data - Tailor Allocation
 */
function generateDecisionTreeData(count = 100, tailors) {
  const complexities = ['low', 'medium', 'high', 'very high'];
  const data = [];
  
  // If no tailors provided, create sample tailors
  if (!tailors || tailors.length === 0) {
    tailors = [
      { tailorId: 'T001', name: 'Ravi Kumar', skillLevel: 'expert', experience: 10 },
      { tailorId: 'T002', name: 'Amit Shah', skillLevel: 'advanced', experience: 7 },
      { tailorId: 'T003', name: 'Priya Singh', skillLevel: 'intermediate', experience: 4 },
      { tailorId: 'T004', name: 'Suresh Patel', skillLevel: 'expert', experience: 12 },
      { tailorId: 'T005', name: 'Anjali Mehta', skillLevel: 'beginner', experience: 2 }
    ];
  }
  
  for (let i = 0; i < count; i++) {
    const complexity = complexities[Math.floor(Math.random() * complexities.length)];
    
    // Select appropriate tailor based on complexity
    let selectedTailor;
    if (complexity === 'very high' || complexity === 'high') {
      // Prefer expert/advanced tailors
      selectedTailor = tailors.filter(t => 
        t.skillLevel === 'expert' || t.skillLevel === 'advanced'
      )[Math.floor(Math.random() * 2)] || tailors[0];
    } else if (complexity === 'medium') {
      // Any intermediate or higher
      selectedTailor = tailors.filter(t => 
        t.skillLevel !== 'beginner'
      )[Math.floor(Math.random() * 3)] || tailors[0];
    } else {
      // Any tailor
      selectedTailor = tailors[Math.floor(Math.random() * tailors.length)];
    }
    
    data.push({
      orderComplexity: complexity,
      tailorSkillLevel: selectedTailor.skillLevel,
      currentWorkload: Math.floor(Math.random() * 8),
      tailorExperience: selectedTailor.experience,
      embroideryRequired: Math.random() < 0.3,
      hasSpecialization: Math.random() < 0.4,
      assignedTailor: selectedTailor.tailorId
    });
  }
  
  return { data, tailors };
}

/**
 * Generate SVM training data - Order Delay Prediction
 */
function generateSVMData(count = 100) {
  const orderTypes = ['shirt', 'pant', 'kurta', 'suit', 'dress', 'lehenga', 'sherwani'];
  const fabricSources = ['shop', 'customer', 'order'];
  const statuses = ['on-time', 'delayed'];
  
  const data = [];
  
  for (let i = 0; i < count; i++) {
    const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
    const fabricSource = fabricSources[Math.floor(Math.random() * fabricSources.length)];
    const currentWorkload = Math.floor(Math.random() * 10);
    const daysUntilDelivery = 3 + Math.floor(Math.random() * 25);
    const embroideryRequired = Math.random() < 0.3;
    const tailorExperience = 1 + Math.floor(Math.random() * 10);
    const isSeasonPeak = Math.random() < 0.3;
    
    // Calculate if order will be delayed based on factors
    const complexOrder = ['suit', 'lehenga', 'sherwani'].includes(orderType);
    const fabricDelay = fabricSource === 'order';
    const highWorkload = currentWorkload > 6;
    const shortTime = daysUntilDelivery < 7;
    const lowExperience = tailorExperience < 3;
    
    const delayFactors = [
      complexOrder, fabricDelay, highWorkload, 
      shortTime, embroideryRequired, lowExperience, isSeasonPeak
    ].filter(Boolean).length;
    
    // More factors = higher chance of delay
    const isDelayed = delayFactors >= 3 || (delayFactors >= 2 && Math.random() < 0.6);
    
    data.push({
      orderType,
      fabricSource,
      currentWorkload,
      daysUntilDelivery,
      embroideryRequired,
      tailorExperience,
      isSeasonPeak,
      deliveryStatus: isDelayed ? 'delayed' : 'on-time'
    });
  }
  
  return data;
}

/**
 * Generate BPNN training data - Customer Satisfaction
 */
function generateBPNNData(count = 100) {
  const satisfactionLevels = ['low', 'medium', 'high'];
  const data = [];
  
  for (let i = 0; i < count; i++) {
    const satisfaction = satisfactionLevels[Math.floor(Math.random() * satisfactionLevels.length)];
    
    let fittingQuality, deliverySpeed, priceValue, communication;
    let overallQuality, customizationSatisfaction, previousOrders;
    
    if (satisfaction === 'low') {
      fittingQuality = 2 + Math.random() * 3; // 2-5
      deliverySpeed = 2 + Math.random() * 3;
      priceValue = 2 + Math.random() * 3;
      communication = 2 + Math.random() * 4;
      overallQuality = 2 + Math.random() * 3;
      customizationSatisfaction = 2 + Math.random() * 3;
      previousOrders = Math.floor(Math.random() * 2);
    } else if (satisfaction === 'medium') {
      fittingQuality = 5 + Math.random() * 3; // 5-8
      deliverySpeed = 5 + Math.random() * 3;
      priceValue = 5 + Math.random() * 3;
      communication = 5 + Math.random() * 3;
      overallQuality = 5 + Math.random() * 3;
      customizationSatisfaction = 5 + Math.random() * 3;
      previousOrders = 1 + Math.floor(Math.random() * 5);
    } else { // high
      fittingQuality = 8 + Math.random() * 2; // 8-10
      deliverySpeed = 8 + Math.random() * 2;
      priceValue = 7 + Math.random() * 3;
      communication = 8 + Math.random() * 2;
      overallQuality = 8 + Math.random() * 2;
      customizationSatisfaction = 7 + Math.random() * 3;
      previousOrders = 3 + Math.floor(Math.random() * 10);
    }
    
    data.push({
      fittingQuality: Math.round(fittingQuality * 10) / 10,
      deliverySpeed: Math.round(deliverySpeed * 10) / 10,
      priceValue: Math.round(priceValue * 10) / 10,
      communication: Math.round(communication * 10) / 10,
      overallQuality: Math.round(overallQuality * 10) / 10,
      customizationSatisfaction: Math.round(customizationSatisfaction * 10) / 10,
      previousOrders,
      satisfaction
    });
  }
  
  return data;
}

/**
 * Generate all training data
 */
function generateAllTrainingData() {
  const knnData = generateKNNData(150);
  const naiveBayesData = generateNaiveBayesData(150);
  const { data: decisionTreeData, tailors } = generateDecisionTreeData(150);
  const svmData = generateSVMData(150);
  const bpnnData = generateBPNNData(150);
  
  return {
    knn: {
      training: knnData.slice(0, 100),
      testing: knnData.slice(100)
    },
    naiveBayes: {
      training: naiveBayesData.slice(0, 100),
      testing: naiveBayesData.slice(100)
    },
    decisionTree: {
      training: decisionTreeData.slice(0, 100),
      testing: decisionTreeData.slice(100),
      tailors
    },
    svm: {
      training: svmData.slice(0, 100),
      testing: svmData.slice(100)
    },
    bpnn: {
      training: bpnnData.slice(0, 100),
      testing: bpnnData.slice(100)
    }
  };
}

module.exports = {
  generateKNNData,
  generateNaiveBayesData,
  generateDecisionTreeData,
  generateSVMData,
  generateBPNNData,
  generateAllTrainingData
};








