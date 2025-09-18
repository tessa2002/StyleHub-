const mongoose = require('mongoose');

const loyaltySchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  points: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Loyalty', loyaltySchema);