const mongoose = require('mongoose');

const fabricSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  material: {
    type: String,
    required: false, // Make it optional
    trim: true,
    default: 'Fabric'
  },
  color: {
    type: String,
    required: false, // Make it optional
    trim: true,
    default: 'Various'
  },
  pattern: {
    type: String,
    default: 'solid'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  unit: {
    type: String,
    default: 'm',
    enum: ['meters', 'yards', 'pieces', 'm', 'units']
  },
  category: {
    type: String,
    required: false, // Make it optional
    enum: ['cotton', 'silk', 'linen', 'wool', 'polyester', 'denim', 'chiffon', 'georgette', 'premium fabric', 'wool blend', 'natural fiber', 'everyday cotton', 'linings', 'hardware', 'fasteners', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    trim: true
  },
  composition: {
    type: String,
    trim: true
  },
  width: {
    type: Number,
    min: 0
  },
  weight: {
    type: Number,
    min: 0
  },
  images: [{
    url: String,
    alt: String,
    filename: String,
    mimeType: String,
    size: Number
  }],
  supplier: {
    name: String,
    contact: String,
    address: String
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for search functionality
fabricSchema.index({ name: 'text', material: 'text', color: 'text', description: 'text' });
fabricSchema.index({ category: 1, isActive: 1 });

// Virtual for stock status
fabricSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out-of-stock';
  if (this.stock <= this.lowStockThreshold) return 'low-stock';
  return 'in-stock';
});

// Method to check if fabric is available
fabricSchema.methods.isAvailable = function(quantity = 1) {
  return this.isActive && this.stock >= quantity;
};

// Method to reduce stock
fabricSchema.methods.reduceStock = function(quantity) {
  if (this.stock >= quantity) {
    this.stock -= quantity;
    return this.save();
  }
  throw new Error('Insufficient stock');
};

// Method to add stock
fabricSchema.methods.addStock = function(quantity) {
  this.stock += quantity;
  return this.save();
};

// Static method to get low stock fabrics
fabricSchema.statics.getLowStockFabrics = function() {
  return this.find({
    isActive: true,
    $expr: { $lte: ['$stock', '$lowStockThreshold'] }
  });
};

// Static method to search fabrics
fabricSchema.statics.searchFabrics = function(query, filters = {}) {
  const searchQuery = {
    isActive: true,
    ...filters
  };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('Fabric', fabricSchema);