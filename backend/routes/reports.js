const express = require('express');
const { auth, allowRoles } = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();

// GET /api/reports/daily-sales?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/daily-sales', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { from, to } = req.query;
    const end = to ? new Date(to) : new Date();
    end.setHours(23, 59, 59, 999);
    const start = from ? new Date(from) : new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);

    const pipeline = [
      { $match: { status: { $in: ['Ready', 'Delivered'] }, createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$totalAmount' } } },
      { $sort: { _id: 1 } },
    ];

    const rows = await Order.aggregate(pipeline);
    res.json({ success: true, rows });
  } catch (e) {
    console.error('daily-sales error:', e.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/reports/pending-orders
router.get('/pending-orders', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const [pending, inProgress] = await Promise.all([
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: 'In Progress' }),
    ]);
    res.json({ success: true, pending, inProgress, total: pending + inProgress });
  } catch (e) {
    console.error('pending-orders error:', e.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/reports/top-customers?limit=5
router.get('/top-customers', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(50, Number(req.query.limit || 5)));
    const pipeline = [
      { $match: { status: { $in: ['Ready', 'Delivered'] } } },
      { $group: { _id: '$customer', total: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: limit },
    ];
    const agg = await Order.aggregate(pipeline);

    // Populate customer names/phones
    const mongoose = require('mongoose');
    const Customer = require('../models/Customer');
    const ids = agg.map(a => new mongoose.Types.ObjectId(a._id));
    const customers = await Customer.find({ _id: { $in: ids } }).select('name phone').lean();
    const byId = Object.fromEntries(customers.map(c => [String(c._id), c]));

    const rows = agg.map(a => ({ id: String(a._id), total: a.total, orders: a.orders, customer: byId[String(a._id)] || { name: 'Unknown', phone: '' } }));
    res.json({ success: true, rows });
  } catch (e) {
    console.error('top-customers error:', e.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;