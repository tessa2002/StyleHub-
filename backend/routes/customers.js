const express = require('express');
const Customer = require('../models/Customer');
const { auth, allowRoles } = require('../middleware/auth');
const router = express.Router();

// GET /api/customers - Get all customers (Admin/Staff)
router.get('/', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/customers - Create new customer (Admin/Staff)
router.post('/', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json({ success: true, customer });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'Phone number already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
});

// GET /api/customers/:id - Get single customer (Admin/Staff)
router.get('/:id', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/customers/:id - Update customer (Admin/Staff)
router.put('/:id', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/customers/:id - Delete customer (Admin/Staff)
router.delete('/:id', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;