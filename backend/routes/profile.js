const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get my profile
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('name email role');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});

// Update my profile (name, email) — no password here per requirement
router.put('/me', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    ).select('name email role');
    res.json({ user: updated });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;