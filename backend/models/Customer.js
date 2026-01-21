const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    lowercase: true
  },
  address: {
    type: String
  },
  measurements: {
    height: { type: Number },
    chest: { type: Number }, // Chest Width
    waist: { type: Number }, // Waist (Pant Line)
    upperWaist: { type: Number },
    hips: { type: Number }, // Hip Circumference
    shoulder: { type: Number },
    sleeve: { type: Number }, // Sleeve Length
    armLength: { type: Number }, // kept for backward compatibility
    legLength: { type: Number },
    neck: { type: Number }, // Neck Circumference
    inseam: { type: Number },
    outseam: { type: Number },
    shoulderSlope: { type: String, default: 'Normal' },
    postureProfile: { type: String, default: 'Standard / Erect' },
    armholeFit: { type: String, default: 'Standard' },
  },
  notes: {
    type: String
  },
  styleNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);