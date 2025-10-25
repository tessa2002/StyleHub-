const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  offerType: {
    type: String,
    required: true,
    enum: ['discount', 'promotion', 'special', 'announcement', 'event'],
    default: 'promotion'
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'none'],
    default: 'none'
  },
  discountValue: {
    type: Number,
    min: 0,
    default: 0
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  targetAudience: {
    type: String,
    enum: ['all', 'customers', 'staff', 'tailors', 'specific'],
    default: 'all'
  },
  targetRoles: [{
    type: String,
    enum: ['Customer', 'Staff', 'Tailor', 'Admin']
  }],
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  conditions: {
    minOrderAmount: {
      type: Number,
      default: 0
    },
    applicableServices: [{
      type: String
    }],
    maxUsage: {
      type: Number,
      default: 0 // 0 means unlimited
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  image: {
    url: String,
    alt: String
  },
  actionUrl: {
    type: String,
    trim: true
  },
  actionText: {
    type: String,
    trim: true,
    default: 'View Details'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Track offer usage
  usageStats: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalClicks: {
      type: Number,
      default: 0
    },
    totalUsage: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
offerSchema.index({ validFrom: 1, validUntil: 1, isActive: 1 });
offerSchema.index({ targetAudience: 1, targetRoles: 1 });
offerSchema.index({ createdBy: 1, createdAt: -1 });

// Virtual for offer status
offerSchema.virtual('status').get(function() {
  const now = new Date();
  if (!this.isActive) return 'inactive';
  if (now < this.validFrom) return 'scheduled';
  if (now > this.validUntil) return 'expired';
  return 'active';
});

// Virtual for time remaining
offerSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const remaining = this.validUntil - now;
  if (remaining <= 0) return 'Expired';
  
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return 'Less than 1 hour';
});

// Method to check if offer is valid for a user
offerSchema.methods.isValidForUser = function(user) {
  if (!this.isActive) return false;
  
  const now = new Date();
  if (now < this.validFrom || now > this.validUntil) return false;
  
  // Check target audience
  if (this.targetAudience === 'all') return true;
  if (this.targetAudience === 'specific') {
    return this.targetUsers.includes(user._id);
  }
  if (this.targetAudience === 'customers' && user.role === 'Customer') return true;
  if (this.targetAudience === 'staff' && user.role === 'Staff') return true;
  if (this.targetAudience === 'tailors' && user.role === 'Tailor') return true;
  
  // Check target roles
  if (this.targetRoles && this.targetRoles.includes(user.role)) return true;
  
  return false;
};

// Method to increment view count
offerSchema.methods.incrementView = function() {
  this.usageStats.totalViews += 1;
  return this.save();
};

// Method to increment click count
offerSchema.methods.incrementClick = function() {
  this.usageStats.totalClicks += 1;
  return this.save();
};

// Method to increment usage count
offerSchema.methods.incrementUsage = function() {
  this.usageStats.totalUsage += 1;
  return this.save();
};

// Static method to get active offers for a user
offerSchema.statics.getActiveOffersForUser = function(user) {
  return this.find({
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() },
    $or: [
      { targetAudience: 'all' },
      { targetAudience: 'customers', targetRoles: { $in: [user.role] } },
      { targetAudience: 'specific', targetUsers: user._id }
    ]
  }).sort({ priority: -1, createdAt: -1 });
};

// Static method to get offer analytics
offerSchema.statics.getOfferAnalytics = function(offerId) {
  return this.findById(offerId).select('usageStats title createdAt');
};

module.exports = mongoose.model('Offer', offerSchema);





















