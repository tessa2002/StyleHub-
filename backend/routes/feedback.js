const express = require('express');
const Feedback = require('../models/Feedback');
const { auth, allowRoles } = require('../middleware/auth');

const router = express.Router();

// Submit feedback (Admin/Staff can also record on behalf of customer)
router.post('/', auth, async (req, res) => {
  try {
    const { customerId, orderId, rating, comment } = req.body;
    const row = await Feedback.create({ customer: customerId, order: orderId, rating, comment });
    res.status(201).json({ success: true, feedback: row });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// List feedback (Admin/Staff)
router.get('/', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  const rows = await Feedback.find().populate('customer', 'name').populate('order', '_id').sort({ createdAt: -1 });
  res.json({ success: true, feedback: rows });
});

module.exports = router;