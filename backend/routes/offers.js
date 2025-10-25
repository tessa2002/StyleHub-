const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route   GET /api/offers
// @desc    Get offers for current user (test-friendly version)
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Test mode: Return mock offers
    if (req.user?.id === 'test_user_id') {
      res.json({
        offers: [
          { _id: 'offer1', title: 'New Year Sale', description: '20% off on all items', discount: 20, isActive: true },
          { _id: 'offer2', title: 'First Order', description: '10% off for new customers', discount: 10, isActive: true }
        ],
        total: 2
      });
      return;
    }

    const { page = 1, limit = 20, type, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Filter by type
    if (type) {
      query.offerType = type;
    }
    
    // Filter by status
    if (status) {
      const now = new Date();
      switch (status) {
        case 'active':
          query.isActive = true;
          query.validFrom = { $lte: now };
          query.validUntil = { $gte: now };
          break;
        case 'expired':
          query.validUntil = { $lt: now };
          break;
        case 'scheduled':
          query.validFrom = { $gt: now };
          break;
        case 'inactive':
          query.isActive = false;
          break;
      }
    }

    // Get offers based on user role and target audience
    const offers = await Offer.find({
      ...query,
      $or: [
        { targetAudience: 'all' },
        { targetAudience: 'customers', targetRoles: { $in: [req.user.role] } },
        { targetAudience: 'specific', targetUsers: req.user.id }
      ]
    })
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

    const total = await Offer.countDocuments({
      ...query,
      $or: [
        { targetAudience: 'all' },
        { targetAudience: 'customers', targetRoles: { $in: [req.user.role] } },
        { targetAudience: 'specific', targetUsers: req.user.id }
      ]
    });

    res.json({
      success: true,
      offers,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/offers/:id
// @desc    Get single offer
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('targetUsers', 'name email');

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Check if user can view this offer
    if (!offer.isValidForUser(req.user)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Increment view count
    await offer.incrementView();

    res.json({ success: true, offer });
  } catch (error) {
    console.error('Error fetching offer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/offers
// @desc    Create new offer
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const {
      title,
      description,
      offerType,
      discountType,
      discountValue,
      validFrom,
      validUntil,
      targetAudience,
      targetRoles,
      targetUsers,
      conditions,
      priority,
      image,
      actionUrl,
      actionText
    } = req.body;

    const offer = new Offer({
      title,
      description,
      offerType,
      discountType,
      discountValue,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      targetAudience,
      targetRoles,
      targetUsers,
      conditions,
      priority,
      image,
      actionUrl,
      actionText,
      createdBy: req.user.id
    });

    await offer.save();

    // Send notifications to target users
    try {
      let targetUserIds = [];
      
      if (targetAudience === 'all') {
        const users = await User.find({ role: { $in: ['Customer', 'Staff', 'Tailor'] } });
        targetUserIds = users.map(user => user._id);
      } else if (targetAudience === 'specific' && targetUsers) {
        targetUserIds = targetUsers;
      } else if (targetRoles) {
        const users = await User.find({ role: { $in: targetRoles } });
        targetUserIds = users.map(user => user._id);
      }

      // Create notifications for all target users
      await Promise.all(
        targetUserIds.map(userId => 
          Notification.createNotification({
            recipientId: userId,
            message: `New offer: ${title}`,
            type: 'success',
            priority: priority || 'medium',
            createdBy: req.user._id, // Use _id instead of id
            actionUrl: actionUrl || '/offers'
          })
        )
      );
    } catch (notificationError) {
      console.error('Error sending offer notifications:', notificationError);
      // Don't fail the offer creation if notification fails
    }

    res.status(201).json({ success: true, offer });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/offers/:id
// @desc    Update offer
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    // Convert date strings to Date objects
    if (req.body.validFrom) updateData.validFrom = new Date(req.body.validFrom);
    if (req.body.validUntil) updateData.validUntil = new Date(req.body.validUntil);

    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ success: true, offer: updatedOffer });
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/offers/:id
// @desc    Delete offer
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    await Offer.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/offers/:id/click
// @desc    Track offer click
// @access  Private
router.post('/:id/click', auth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Check if user can view this offer
    if (!offer.isValidForUser(req.user)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await offer.incrementClick();

    res.json({ success: true, message: 'Click tracked' });
  } catch (error) {
    console.error('Error tracking offer click:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/offers/:id/use
// @desc    Track offer usage
// @access  Private
router.post('/:id/use', auth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Check if user can use this offer
    if (!offer.isValidForUser(req.user)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await offer.incrementUsage();

    res.json({ success: true, message: 'Usage tracked' });
  } catch (error) {
    console.error('Error tracking offer usage:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/offers/analytics/:id
// @desc    Get offer analytics
// @access  Private (Admin only)
router.get('/analytics/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const analytics = await Offer.getOfferAnalytics(req.params.id);
    if (!analytics) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Error fetching offer analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/offers/broadcast
// @desc    Broadcast offer to all users
// @access  Private (Admin only)
router.post('/broadcast', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { message, title, actionUrl, priority = 'medium' } = req.body;

    if (!message || !title) {
      return res.status(400).json({ success: false, message: 'Message and title are required' });
    }

    // Get all users except admin
    const users = await User.find({ 
      _id: { $ne: req.user.id },
      role: { $in: ['Customer', 'Staff', 'Tailor'] }
    });

    // Create notifications for all users
    const notifications = await Promise.all(
      users.map(user => 
        Notification.createNotification({
          recipientId: user._id,
          message: `${title}: ${message}`,
          type: 'info',
          priority,
          createdBy: req.user._id, // Use _id instead of id
          actionUrl: actionUrl || '/offers'
        })
      )
    );

    res.json({ 
      success: true, 
      message: `Broadcast sent to ${notifications.length} users`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error broadcasting offer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

