const mongoose = require('mongoose');

const measurementHistorySchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  measurements: {
    height: Number,
    chest: Number,
    waist: Number,
    hips: Number,
    shoulder: Number,
    sleeve: Number,
    armLength: Number,
    legLength: Number,
    neck: Number,
  },
  styleNotes: { type: String, default: '' },
  source: { type: String, enum: ['manual', 'order'], default: 'manual' },
}, { timestamps: true });

module.exports = mongoose.model('MeasurementHistory', measurementHistorySchema);