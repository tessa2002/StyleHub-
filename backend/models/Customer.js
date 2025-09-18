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
    chest: { type: Number },
    waist: { type: Number },
    hips: { type: Number },
    shoulder: { type: Number },
    sleeve: { type: Number }, // alias for arm length
    armLength: { type: Number }, // kept for backward compatibility
    legLength: { type: Number },
    neck: { type: Number },
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