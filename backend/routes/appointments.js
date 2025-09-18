const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// POST /api/appointments - Legacy route, use /api/portal/appointments instead
router.post('/', async (req, res) => {
  try {
    console.log('⚠️ Legacy appointments route called. Use /api/portal/appointments instead.');
    const { service, datetime, scheduledAt, notes } = req.body;
    
    // Support both datetime (legacy) and scheduledAt (new) field names
    const appointmentDate = scheduledAt || datetime;
    
    if (!service || !appointmentDate) {
      return res.status(400).json({ message: 'Service and date/time are required.' });
    }
    
    // This route doesn't have customer authentication, so it's incomplete
    // Redirect to use the proper portal route
    return res.status(400).json({ 
      message: 'Please use the customer portal to book appointments. This endpoint requires authentication.' 
    });
  } catch (err) {
    console.error('Error in legacy appointments route:', err);
    return res.status(500).json({ message: 'Server error while saving appointment' });
  }
});

module.exports = router;
