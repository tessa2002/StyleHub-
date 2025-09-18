const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Who receives this notification
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Alternative field names for compatibility
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Notification content
  message: {
    type: String,
    required: true
  },
  
  content: {
    type: String
  },

  // Notification type for styling/categorization
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error'],
    default: 'info'
  },

  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Related entities
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },

  // Read status
  isRead: {
    type: Boolean,
    default: false
  },
  
  readAt: {
    type: Date
  },

  // Who created this notification
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Action URL (optional)
  actionUrl: {
    type: String
  },

  // Expiry date (optional)
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ staffId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ targetUser: 1, isRead: 1, createdAt: -1 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
});

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = new this({
      recipientId: data.recipientId || data.staffId || data.targetUser,
      staffId: data.staffId,
      targetUser: data.targetUser,
      message: data.message,
      content: data.content || data.message,
      type: data.type || 'info',
      priority: data.priority || 'medium',
      relatedOrder: data.relatedOrder,
      relatedAppointment: data.relatedAppointment,
      createdBy: data.createdBy,
      actionUrl: data.actionUrl,
      expiresAt: data.expiresAt
    });
    
    return await notification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
