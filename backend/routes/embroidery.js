const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { auth, allowRoles } = require('../middleware/auth');
const EmbroideryPattern = require('../models/EmbroideryPattern');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `emb-${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.mimetype);
    cb(ok ? null : new Error('Invalid file type'), ok);
  }
});

// GET /api/embroidery - list patterns with optional search/sort/filter
router.get('/', auth, allowRoles('Admin', 'Staff', 'Customer'), async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = category;

    let query = EmbroideryPattern.find(filter);
    if (sort === 'price_asc') query = query.sort({ price: 1 });
    else if (sort === 'price_desc') query = query.sort({ price: -1 });
    else query = query.sort({ createdAt: -1 });

    const patterns = await query.exec();
    res.json({ success: true, patterns });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/embroidery - create pattern (optional image)
router.post('/', auth, allowRoles('Admin', 'Staff'), upload.single('image'), async (req, res) => {
  try {
    const { name, category, price } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    let image = undefined;
    if (req.file) {
      const protocol = req.protocol;
      const host = req.get('host');
      const baseUrl = process.env.NODE_ENV === 'production' ? '/uploads/' : `${protocol}://${host}/uploads/`;
      image = {
        filename: req.file.filename,
        url: baseUrl + req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size
      };
    } else if (req.body.imageUrl) {
      image = {
        url: req.body.imageUrl
      };
    }

    const pattern = await EmbroideryPattern.create({
      name,
      category: category || 'Floral',
      price: price ? parseFloat(price) : 0,
      image,
      createdBy: req.user.id
    });
    res.status(201).json({ success: true, pattern });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/embroidery/:id - update fields (name, category, price, active) and optional new image
router.put('/:id', auth, allowRoles('Admin', 'Staff'), upload.single('image'), async (req, res) => {
  try {
    const updates = {};
    ['name', 'category', 'active'].forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });
    if (req.body.price !== undefined) updates.price = parseFloat(req.body.price);

    if (req.file) {
      const protocol = req.protocol;
      const host = req.get('host');
      const baseUrl = process.env.NODE_ENV === 'production' ? '/uploads/' : `${protocol}://${host}/uploads/`;
      updates.image = {
        filename: req.file.filename,
        url: baseUrl + req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size
      };
    } else if (req.body.imageUrl) {
      updates.image = { url: req.body.imageUrl };
    }

    const pattern = await EmbroideryPattern.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!pattern) return res.status(404).json({ success: false, message: 'Pattern not found' });
    res.json({ success: true, pattern });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/embroidery/:id - delete pattern
router.delete('/:id', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const pattern = await EmbroideryPattern.findByIdAndDelete(req.params.id);
    if (!pattern) return res.status(404).json({ success: false, message: 'Pattern not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
