const express = require('express');
const Loyalty = require('../models/Loyalty');
const { auth, allowRoles } = require('../middleware/auth');

const router = express.Router();

// Get points for a customer
router.get('/:customerId', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  const row = await Loyalty.findOne({ customer: req.params.customerId });
  res.json({ success: true, points: row?.points || 0 });
});

// Adjust points (add or subtract)
router.post('/:customerId/adjust', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  const { delta } = req.body; // number
  const row = await Loyalty.findOneAndUpdate(
    { customer: req.params.customerId },
    { $inc: { points: Number(delta || 0) } },
    { upsert: true, new: true }
  );
  res.json({ success: true, points: row.points });
});

module.exports = router;