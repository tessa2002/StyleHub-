const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  service: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  notes: String,
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);