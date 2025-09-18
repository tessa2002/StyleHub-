const express = require('express');
const { auth, allowRoles } = require('../middleware/auth');

// NOTE: Razorpay integration placeholder.
// For production, install `razorpay` SDK and configure with keys in env.

const router = express.Router();

// Create a payment order (Admin/Staff)
router.post('/create-order', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    // TODO: Use Razorpay SDK to create order and return order_id, etc.
    // This is a placeholder response structure.
    res.json({ success: true, order: { id: 'fake_order_id', amount, currency, receipt } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify payment webhook (placeholder)
router.post('/webhook', async (req, res) => {
  // TODO: Verify Razorpay signature and update payment status.
  res.json({ received: true });
});

module.exports = router;