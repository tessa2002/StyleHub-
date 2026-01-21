const mongoose = require('mongoose');

const mlModelSchema = new mongoose.Schema({
  modelType: {
    type: String,
    enum: ['knn', 'naivebayes', 'decisiontree', 'svm', 'bpnn'],
    required: true
  },
  modelName: {
    type: String,
    required: true
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  description: {
    type: String,
    default: ''
  },
  trainingStats: {
    samplesCount: Number,
    accuracy: String,
    metrics: mongoose.Schema.Types.Mixed
  },
  modelData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  trainedAt: {
    type: Date,
    default: Date.now
  },
  trainedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster lookups
mlModelSchema.index({ modelType: 1, isActive: 1 });

module.exports = mongoose.model('MLModel', mlModelSchema);








