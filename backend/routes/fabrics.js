const express = require('express');
const { auth, allowRoles } = require('../middleware/auth');
const Fabric = require('../models/Fabric');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// upload setup
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, unique + '-' + safe);
  }
});
const upload = multer({ storage });

// Create fabric (Admin/Staff)
router.post('/', auth, allowRoles('Admin', 'Staff'), upload.single('image'), async (req, res) => {
  try {
    const { name, type, color = '', stock = 0, price = 0, supplier = '', description = '', status = 'Available', tags } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    if (!type) return res.status(400).json({ success: false, message: 'Type is required' });
    const imageUrl = req.file ? ((process.env.PUBLIC_URL || '') + '/uploads/' + req.file.filename) : '';
    const parsedTags = typeof tags === 'string' ? tags.split(',').map(s => s.trim()).filter(Boolean) : Array.isArray(tags) ? tags : [];

    const fabric = await Fabric.create({ name, type, color, stock, price, supplier, description, status, imageUrl, tags: parsedTags });
    res.status(201).json({ success: true, fabric });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// List fabrics (All roles incl. Tailor & Customer). Supports search & pagination
router.get('/', auth, allowRoles('Admin', 'Staff', 'Tailor', 'Customer'), async (req, res) => {
  try {
    const { q = '', page = 1, limit = 10, inStock } = req.query;
    const p = Math.max(1, Number(page));
    const l = Math.max(1, Math.min(100, Number(limit)));
    const skip = (p - 1) * l;

    const base = q
      ? { $or: [
          { name: { $regex: q, $options: 'i' } },
          { type: { $regex: q, $options: 'i' } },
          { color: { $regex: q, $options: 'i' } },
          { supplier: { $regex: q, $options: 'i' } },
        ] }
      : {};

    const query = (inStock === '1' || inStock === 'true') ? { ...base, stock: { $gt: 0 } } : base;

    const [items, total] = await Promise.all([
      Fabric.find(query).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
      Fabric.countDocuments(query),
    ]);

    res.json({ success: true, items, total, page: p, pages: Math.ceil(total / l) });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get one fabric
router.get('/:id', auth, allowRoles('Admin', 'Staff', 'Tailor'), async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);
    if (!fabric) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, fabric });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update fabric (Admin/Staff)
router.put('/:id', auth, allowRoles('Admin', 'Staff'), upload.single('image'), async (req, res) => {
  try {
    const { name, type, color, stock, price, supplier, description, status, tags } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (type !== undefined) update.type = type;
    if (color !== undefined) update.color = color;
    if (stock !== undefined) update.stock = stock;
    if (price !== undefined) update.price = price;
    if (supplier !== undefined) update.supplier = supplier;
    if (description !== undefined) update.description = description;
    if (status !== undefined) update.status = status;
    if (tags !== undefined) update.tags = typeof tags === 'string' ? tags.split(',').map(s => s.trim()).filter(Boolean) : tags;
    if (req.file) update.imageUrl = ((process.env.PUBLIC_URL || '') + '/uploads/' + req.file.filename);

    const fabric = await Fabric.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!fabric) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, fabric });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Use fabric (decrement stock) - Admin/Staff/Tailor can record usage
router.post('/:id/use', auth, allowRoles('Admin', 'Staff', 'Tailor'), async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const qty = Math.max(0, Number(quantity));
    if (!qty) return res.status(400).json({ success: false, message: 'Quantity must be > 0' });

    const fabric = await Fabric.findById(req.params.id);
    if (!fabric) return res.status(404).json({ success: false, message: 'Not found' });
    if (fabric.stock < qty) return res.status(400).json({ success: false, message: 'Insufficient stock' });

    fabric.stock -= qty;
    await fabric.save();
    res.json({ success: true, fabric });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete fabric (Admin/Staff)
router.delete('/:id', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const fabric = await Fabric.findByIdAndDelete(req.params.id);
    if (!fabric) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;