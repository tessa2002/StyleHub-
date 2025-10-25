const express = require('express');
const router = express.Router();
const Fabric = require('../models/Fabric');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route   GET /api/fabrics
// @desc    Get all fabrics with search and filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, inStock, page = 1, limit = 20 } = req.query;
    
    let query = { isActive: true };
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }
    
    const skip = (page - 1) * limit;
    
    const fabrics = await Fabric.find(query)
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    const total = await Fabric.countDocuments(query);
    
    res.json({
      success: true,
      fabrics,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching fabrics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/fabrics/:id
// @desc    Get single fabric
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!fabric) {
      return res.status(404).json({ success: false, message: 'Fabric not found' });
    }
    
    res.json({ success: true, fabric });
  } catch (error) {
    console.error('Error fetching fabric:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/fabrics
// @desc    Create new fabric
// @access  Private (Admin/Staff)
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      material,
      color,
      pattern,
      price,
      stock,
      unit,
      category,
      description,
      images,
      supplier,
      lowStockThreshold
    } = req.body;
    
    // Check if user has permission (Admin or Staff)
    if (!['Admin', 'Staff'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const fabric = new Fabric({
      name,
      material,
      color,
      pattern,
      price,
      stock,
      unit,
      category,
      description,
      images,
      supplier,
      lowStockThreshold,
      createdBy: req.user.id
    });
    
    await fabric.save();
    
    // Send notification to all users about new fabric
    try {
      const users = await User.find({ 
        _id: { $ne: req.user.id },
        role: { $in: ['Customer', 'Staff', 'Tailor'] }
      });

      await Promise.all(
        users.map(user => 
          Notification.createNotification({
            recipientId: user._id,
            message: `New fabric "${fabric.name}" has been added to inventory`,
            type: 'success',
            priority: 'medium',
            createdBy: req.user.id,
            actionUrl: '/fabrics'
          })
        )
      );
    } catch (notificationError) {
      console.error('Error sending fabric notification:', notificationError);
      // Don't fail the fabric creation if notification fails
    }
    
    res.status(201).json({ success: true, fabric });
  } catch (error) {
    console.error('Error creating fabric:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/fabrics/:id
// @desc    Update fabric
// @access  Private (Admin/Staff)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user has permission
    if (!['Admin', 'Staff'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const fabric = await Fabric.findById(req.params.id);
    if (!fabric) {
      return res.status(404).json({ success: false, message: 'Fabric not found' });
    }
    
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };
    
    const updatedFabric = await Fabric.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Send notification about fabric update
    try {
      const users = await User.find({ 
        _id: { $ne: req.user.id },
        role: { $in: ['Customer', 'Staff', 'Tailor'] }
      });

      let message = `Fabric "${updatedFabric.name}" has been updated`;
      let type = 'info';
      let priority = 'medium';

      // Check if price was changed
      if (req.body.price && req.body.price !== fabric.price) {
        message = `Fabric "${updatedFabric.name}" price updated from ₹${fabric.price} to ₹${req.body.price}`;
        type = 'info';
        priority = 'high';
      }

      await Promise.all(
        users.map(user => 
          Notification.createNotification({
            recipientId: user._id,
            message,
            type,
            priority,
            createdBy: req.user.id,
            actionUrl: '/fabrics'
          })
        )
      );
    } catch (notificationError) {
      console.error('Error sending fabric update notification:', notificationError);
      // Don't fail the fabric update if notification fails
    }
    
    res.json({ success: true, fabric: updatedFabric });
  } catch (error) {
    console.error('Error updating fabric:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/fabrics/:id
// @desc    Delete fabric (soft delete)
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const fabric = await Fabric.findById(req.params.id);
    if (!fabric) {
      return res.status(404).json({ success: false, message: 'Fabric not found' });
    }
    
    // Soft delete
    fabric.isActive = false;
    fabric.updatedBy = req.user.id;
    await fabric.save();
    
    res.json({ success: true, message: 'Fabric deleted successfully' });
  } catch (error) {
    console.error('Error deleting fabric:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/fabrics/inventory/low-stock
// @desc    Get low stock fabrics
// @access  Private (Admin/Staff)
router.get('/inventory/low-stock', auth, async (req, res) => {
  try {
    if (!['Admin', 'Staff'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const lowStockFabrics = await Fabric.getLowStockFabrics();
    
    res.json({ success: true, fabrics: lowStockFabrics });
  } catch (error) {
    console.error('Error fetching low stock fabrics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/fabrics/:id/stock
// @desc    Update fabric stock
// @access  Private (Admin/Staff)
router.put('/:id/stock', auth, async (req, res) => {
  try {
    if (!['Admin', 'Staff'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const { action, quantity } = req.body; // action: 'add' or 'reduce'
    
    const fabric = await Fabric.findById(req.params.id);
    if (!fabric) {
      return res.status(404).json({ success: false, message: 'Fabric not found' });
    }
    
    if (action === 'add') {
      await fabric.addStock(quantity);
    } else if (action === 'reduce') {
      await fabric.reduceStock(quantity);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    
    res.json({ success: true, fabric });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

module.exports = router;