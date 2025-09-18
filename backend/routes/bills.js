const express = require('express');
const { auth, allowRoles } = require('../middleware/auth');
const Bill = require('../models/Bill');
const Order = require('../models/Order');

const router = express.Router();

// Generate a bill for an order (Admin/Staff)
router.post('/generate', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const existing = await Bill.findOne({ order: orderId });
    if (existing) return res.status(400).json({ success: false, message: 'Bill already exists for this order' });

    const bill = await Bill.create({
      order: orderId,
      amount: amount ?? order.totalAmount ?? 0,
      paymentMethod: paymentMethod || 'Cash',
      status: 'Unpaid',
      amountPaid: 0,
      payments: [],
    });

    res.status(201).json({ success: true, bill });
  } catch (e) {
    console.error('Generate bill error:', e.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// List bills with filters and pagination
// GET /api/bills?status=Paid|Partial|Unpaid&q=term&page=1&limit=10
router.get('/', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { status, q = '', page = 1, limit = 10 } = req.query;
    const p = Math.max(1, Number(page));
    const l = Math.max(1, Math.min(100, Number(limit)));
    const skip = (p - 1) * l;

    const filter = {};
    if (status && ['Paid', 'Partial', 'Unpaid'].includes(status)) filter.status = status;

    // Basic text search over status/amount and order id string
    const term = String(q || '').trim();
    if (term) {
      const mongoose = require('mongoose');
      const maybeId = mongoose.isValidObjectId(term) ? [term] : [];
      filter.$or = [
        { status: { $regex: term, $options: 'i' } },
        { amount: isNaN(Number(term)) ? -1 : Number(term) },
        ...(maybeId.length ? [{ order: { $in: maybeId } }, { _id: { $in: maybeId } }] : []),
      ];
    }

    const [items, total] = await Promise.all([
      Bill.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .populate({ path: 'order', select: 'customer totalAmount createdAt', populate: { path: 'customer', select: 'name phone' } })
        .lean(),
      Bill.countDocuments(filter),
    ]);

    res.json({ success: true, items, total, page: p, pages: Math.ceil(total / l) });
  } catch (e) {
    console.error('List bills error:', e.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get bill by id
router.get('/:id', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate({ path: 'order', populate: { path: 'customer', select: 'name phone email' } });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, bill });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get bill by order id
router.get('/by-order/:orderId', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const bill = await Bill.findOne({ order: req.params.orderId }).populate({ path: 'order', populate: { path: 'customer', select: 'name phone email' } });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, bill });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Record a payment against a bill
router.post('/:id/payments', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { amount, method, reference } = req.body;
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });
    if (!['Cash','Card','UPI'].includes(method)) return res.status(400).json({ success: false, message: 'Invalid method' });

    bill.payments.push({ amount, method, reference });
    bill.amountPaid = (bill.amountPaid || 0) + Number(amount);
    bill.recomputeStatus();
    await bill.save();

    res.json({ success: true, bill });
  } catch (e) {
    console.error('Record payment error:', e.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;