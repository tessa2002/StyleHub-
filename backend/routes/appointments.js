const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// POST /api/appointments
router.post('/', async (req, res) => {
  try {
    const { service, datetime, notes } = req.body;
    if (!service || !datetime) {
      return res.status(400).json({ message: 'Service and datetime are required.' });
    }
    const appointment = new Appointment({
      service,
      scheduledAt: new Date(datetime),
      notes
    });
    await appointment.save();
    return res.status(201).json({ message: 'Appointment booked successfully!', appointment });
  } catch (err) {
    console.error('Error saving appointment:', err);
    return res.status(500).json({ message: 'Server error while saving appointment' });
  }
});

module.exports = router;
