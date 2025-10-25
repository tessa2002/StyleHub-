const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bill: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Bill', 
    required: true 
  },
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  method: { 
    type: String, 
    enum: ['Cash', 'Card', 'UPI', 'Net Banking', 'Razorpay', 'Other'],
    default: 'Razorpay'
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  // Razorpay specific fields
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  // General transaction details
  transactionId: String,
  paymentMode: String, // Additional mode info (e.g., 'card', 'netbanking', 'upi')
  
  paidAt: Date,
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);








