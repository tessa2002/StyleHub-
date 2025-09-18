const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);