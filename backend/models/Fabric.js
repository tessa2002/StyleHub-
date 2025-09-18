const mongoose = require('mongoose');

const fabricSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  color: { type: String, default: '', trim: true }, // Added color for tracking
  stock: { type: Number, default: 0, min: 0 },
  price: { type: Number, default: 0, min: 0 },
  supplier: { type: String, default: '', trim: true },
  description: { type: String, default: '', trim: true },
  status: { type: String, enum: ['Available', 'Out of Stock'], default: 'Available' },
  imageUrl: { type: String, default: '' },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Fabric', fabricSchema);