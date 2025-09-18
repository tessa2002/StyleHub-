const express = require('express');
const Customer = require('../models/Customer');
const MeasurementHistory = require('../models/MeasurementHistory');
const { auth, allowRoles } = require('../middleware/auth');

const router = express.Router();

// Create or update customer's current measurements with style notes (Admin/Staff)
router.put('/customer/:id', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { measurements = {}, styleNotes = '' } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { measurements, styleNotes },
      { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    // Create history record (source: manual)
    await MeasurementHistory.create({ customer: customer._id, measurements, styleNotes, source: 'manual' });

    res.json({ success: true, customer });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Read customer's current measurements
router.get('/customer/:id', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('name measurements styleNotes');
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, customer });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get measurement history for a customer
router.get('/history/:customerId', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const rows = await MeasurementHistory.find({ customer: req.params.customerId }).sort({ createdAt: -1 });
    res.json({ success: true, history: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;