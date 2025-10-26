const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { auth, allowRoles } = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();

// ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, unique + '-' + safe);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// POST /api/uploads/order/:orderId - upload files and attach to order
router.post('/order/:orderId', auth, allowRoles('Admin', 'Staff'), upload.array('files', 10), async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const category = req.body.category || 'Other';
    const baseUrl = (process.env.PUBLIC_URL || '') + '/uploads/';
    const attachments = (req.files || []).map(f => ({
      filename: f.filename,
      url: baseUrl + f.filename,
      mimeType: f.mimetype,
      size: f.size,
      category,
    }));

    order.attachments = [...(order.attachments || []), ...attachments];
    await order.save();

    res.status(201).json({ success: true, attachments: order.attachments });
  } catch (e) {
    console.error('Upload error:', e.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/uploads/reference - upload reference images for customers
router.post('/reference', auth, allowRoles('Customer', 'Admin', 'Staff'), upload.array('referenceImages', 5), async (req, res) => {
  try {
    // Generate proper URL that works in both development and production
    // In production, backend serves frontend so relative URLs work
    // In development, we need full URL with backend port
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? '/uploads/' 
      : `${protocol}://${host}/uploads/`;
    
    const attachments = (req.files || []).map(f => ({
      filename: f.filename,
      url: baseUrl + f.filename,
      mimeType: f.mimetype,
      size: f.size,
      category: 'Sketch', // Reference images category
    }));

    console.log('✅ Reference images uploaded:', attachments.length);
    console.log('📸 Image URLs:', attachments.map(a => a.url));

    res.status(201).json({ success: true, attachments });
  } catch (e) {
    console.error('Upload error:', e.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;