const express = require('express');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const MeasurementHistory = require('../models/MeasurementHistory');
const Fabric = require('../models/Fabric');
const { auth, allowRoles } = require('../middleware/auth');

const router = express.Router();

// Create a new order (Admin/Staff)
router.post('/', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { customerId, items = [], measurementSnapshot = {}, notes, orderType, assignedTailor, fabric, orderDate, expectedDelivery, customizations } = req.body;
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    // Handle fabric stock if shop fabric is selected
    let fabricInfo = fabric || {};
    if (fabric && fabric.source === 'shop' && fabric.fabricId) {
      const qty = Math.max(0, Number(fabric.quantity || 0));
      if (!qty) return res.status(400).json({ success: false, message: 'Fabric quantity must be > 0' });
      const fb = await Fabric.findOneAndUpdate(
        { _id: fabric.fabricId, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
      );
      if (!fb) return res.status(400).json({ success: false, message: 'Insufficient fabric stock' });
      const unitPrice = Number(fb.price || 0);
      const cost = unitPrice * qty;
      fabricInfo = {
        source: 'shop',
        fabricId: fb._id,
        name: fb.name,
        code: '',
        color: fb.color || '',
        quantity: qty,
        unit: 'm',
        unitPrice,
        cost,
        notes: fabric.notes || ''
      };
    }

    // Embroidery pricing (simple rules)
    let embroideryPricing = { unitPrice: 0, quantity: 1, total: 0 };
    if (customizations?.embroidery?.enabled) {
      const emb = customizations.embroidery;
      const base = { machine: 300, hand: 800, zardosi: 1200, aari: 1000, bead: 900, thread: 500 };
      const perPlacement = { collar: 150, sleeves: 200, neckline: 250, hem: 300, full: 1200, custom: 300 };
      const perExtraColor = 50;
      const t = base[emb.type] || 0;
      const p = (emb.placements || []).reduce((sum, pl) => sum + (perPlacement[pl] || 0), 0);
      const extraColors = Math.max(0, (emb.colors?.length || 0) - 1);
      const total = t + p + (extraColors * perExtraColor);
      embroideryPricing = { unitPrice: total, quantity: 1, total };
      // Add charge item for embroidery
      items.push({ name: `Embroidery (${emb.type}, ${(emb.placements||[]).join('/') || 'n/a'}, ${emb.pattern})`, quantity: 1, price: total });
    }

    const totalAmount = items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0);

    const order = await Order.create({
      customer: customerId,
      items,
      status: 'Pending',
      totalAmount,
      measurementSnapshot,
      notes,
      orderType: orderType || '',
      assignedTailor: assignedTailor || null,
      fabric: fabricInfo,
      customizations: customizations?.embroidery ? { embroidery: { ...customizations.embroidery, pricing: embroideryPricing } } : undefined,
      orderDate: orderDate || Date.now(),
      expectedDelivery: expectedDelivery || null,
    });

    // Save measurement history snapshot if provided (source: order)
    if (measurementSnapshot && Object.keys(measurementSnapshot).length) {
      await MeasurementHistory.create({ customer: customerId, measurements: measurementSnapshot, source: 'order' });
    }

    res.status(201).json({ success: true, order });
  } catch (e) {
    console.error('Create order error:', e.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// List orders (Admin/Staff) with filters
router.get('/', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { status, customerId, staffId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (customerId) filter.customer = customerId;
    if (staffId) filter.assignedTailor = staffId;

    const orders = await Order.find(filter).populate('customer', 'name phone').sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get order by id
router.get('/:id', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Tailor-specific orders
router.get('/tailor/:tailorId', auth, allowRoles('Admin', 'Staff', 'Tailor'), async (req, res) => {
  try {
    const { tailorId } = req.params;
    const orders = await Order.find({ assignedTailor: tailorId }).populate('customer', 'name');
    res.json(orders);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Order history for a customer
router.get('/by-customer/:customerId', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { customerId } = req.params;
    const orders = await Order.find({ customer: customerId })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update order status or details
router.put('/:id', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const update = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update status shorthand
router.put('/:id/status', auth, allowRoles('Admin', 'Staff', 'Tailor'), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Assign tailor
router.put('/:id/assign', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { tailorId } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { assignedTailor: tailorId }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Append note (simple string)
router.post('/:id/notes', auth, allowRoles('Admin', 'Staff', 'Tailor'), async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) return res.status(400).json({ success: false, message: 'Note required' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.notes = [ ...(Array.isArray(order.notes) ? order.notes : (order.notes ? [order.notes] : [])), note ];
    await order.save();
    res.json({ success: true, notes: order.notes });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark embroidery complete -> move to Finishing stage
router.put('/:id/embroidery/complete', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const emb = order.customizations?.embroidery;
    if (!emb || !emb.enabled) return res.status(400).json({ success: false, message: 'Embroidery not enabled for this order' });
    order.customizations.embroidery.status = 'complete';
    order.stage = 'Finishing';
    await order.save();
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete order
router.delete('/:id', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;