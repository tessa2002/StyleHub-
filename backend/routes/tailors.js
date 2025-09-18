const express = require('express');
const { auth, allowRoles } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// List tailors (Admin/Staff)
router.get('/', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const tailors = await User.find({ role: 'Tailor' }).select('_id name email');
    res.json(tailors);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



