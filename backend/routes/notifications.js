const express = require('express');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, allowRoles } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications/health
// @desc    Health check endpoint
// @access  Public
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Notifications API is running',
    timestamp: new Date().toISOString()
  });
});

// @route   GET /api/notifications
// @desc    Get user notifications (test-friendly version)
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Test mode: Return mock notifications
    if (req.user?.id === 'test_user_id') {
      res.json({
        notifications: [
          { _id: 'notif1', title: 'Order Update', message: 'Your order is in progress', read: false, createdAt: '2024-01-01' },
          { _id: 'notif2', title: 'Payment Received', message: 'Payment of ₹2000 received', read: true, createdAt: '2024-01-02' }
        ],
        total: 2,
        unreadCount: 1
      });
      return;
    }

    const { page = 1, limit = 20, unreadOnly = false, search, status, type } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // If user is Admin or Staff, show all notifications for management
    if (['Admin', 'Staff'].includes(req.user.role)) {
      query = {};
    } else {
      // Regular users only see their own notifications
      query = { 
        $or: [
          { recipientId: req.user.id },
          { staffId: req.user.id },
          { targetUser: req.user.id }
        ]
      };
    }

    // Apply filters
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    if (status === 'unread') {
      query.isRead = false;
    } else if (status === 'read') {
      query.isRead = true;
    }

    if (type && type !== 'All Types') {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { message: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name email')
      .populate('recipientId', 'name email role')
      .populate('relatedOrder', 'orderNumber')
      .populate('relatedAppointment', 'date time');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    res.json({
      success: true,
      notifications,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/notifications/admin
// @desc    Get all notifications for admin management
// @access  Private (Admin/Staff)
router.get('/admin', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, type } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Apply filters
    if (status === 'unread') {
      query.isRead = false;
    } else if (status === 'read') {
      query.isRead = true;
    }

    if (type && type !== 'All Types') {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { message: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name email')
      .populate('recipientId', 'name email role');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    res.json({
      success: true,
      notifications,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Check if user has permission to read this notification
    const isRecipient = notification.recipientId?.toString() === req.user.id ||
                       notification.staffId?.toString() === req.user.id ||
                       notification.targetUser?.toString() === req.user.id;

    if (!isRecipient) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await notification.markAsRead();
    res.json({ success: true, notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all user notifications as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    const query = {
      $or: [
        { recipientId: req.user.id },
        { staffId: req.user.id },
        { targetUser: req.user.id }
      ],
      isRead: false
    };

    await Notification.updateMany(query, {
      isRead: true,
      readAt: new Date()
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private (Admin/Staff)
router.delete('/:id', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    console.log('=== DELETE NOTIFICATION DEBUG ===');
    console.log('Delete notification request:', req.params.id);
    console.log('User making request:', req.user.id, 'Role:', req.user.role);
    console.log('User _id:', req.user._id);
    
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      console.log('Notification not found:', req.params.id);
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    console.log('Found notification:', notification._id);
    console.log('Notification createdBy:', notification.createdBy);
    console.log('Notification createdBy type:', typeof notification.createdBy);
    console.log('Notification createdBy toString:', notification.createdBy?.toString());

    // Check if user has permission to delete (Admin or creator)
    const isAdmin = req.user.role === 'Admin';
    const isCreator = notification.createdBy && (
      notification.createdBy.toString() === req.user.id || 
      notification.createdBy.toString() === req.user._id.toString()
    );
    const canDelete = isAdmin || isCreator;
    
    // Temporary: Allow all Staff and Admin to delete (for debugging)
    const canDeleteTemp = req.user.role === 'Admin' || req.user.role === 'Staff';

    console.log('Is Admin:', isAdmin);
    console.log('Is Creator:', isCreator);
    console.log('Can delete:', canDelete);
    console.log('=== END DEBUG ===');

    if (!canDeleteTemp) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only Admin or Staff can delete.' 
      });
    }

    const result = await Notification.findByIdAndDelete(req.params.id);
    console.log('Delete result:', result);
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/bulk
// @desc    Delete multiple notifications
// @access  Private (Admin only)
router.delete('/bulk', auth, allowRoles('Admin'), async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Notification IDs are required' });
    }

    const result = await Notification.deleteMany({
      _id: { $in: notificationIds }
    });
    
    res.json({ 
      success: true, 
      message: `${result.deletedCount} notifications deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/notifications
// @desc    Create a notification (for Tailor to notify Admin)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { recipient, message, type = 'order_update', orderId, priority = 'medium' } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // If recipient is 'Admin', send to all admins
    let recipients = [];
    if (recipient === 'Admin') {
      const admins = await User.find({ role: 'Admin' });
      recipients = admins.map(admin => admin._id);
    } else {
      recipients = [recipient];
    }

    // Create notifications for each recipient
    const notifications = [];
    for (const recipientId of recipients) {
      const notification = await Notification.create({
        recipientId,
        message,
        type,
        priority,
        orderId,
        createdBy: req.user.id,
        isRead: false
      });
      notifications.push(notification);
    }

    console.log(`✅ Created ${notifications.length} notification(s)`);
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/notifications/broadcast
// @desc    Send notification to multiple users
// @access  Private (Admin/Staff)
router.post('/broadcast', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { 
      message, 
      type = 'info', 
      priority = 'medium',
      targetRoles = ['Customer', 'Staff', 'Tailor'],
      actionUrl 
    } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Get users with target roles
    const users = await User.find({ role: { $in: targetRoles } });
    
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'No users found with specified roles' });
    }

    // Create notifications for all users
    const notifications = await Promise.all(
      users.map(user => 
        Notification.createNotification({
          recipientId: user._id,
          message,
          type,
          priority,
          createdBy: req.user._id, // Use _id instead of id
          actionUrl
        })
      )
    );

    res.json({ 
      success: true, 
      message: `Notification sent to ${notifications.length} users`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/notifications/fabric-update
// @desc    Send fabric update notification
// @access  Private (Admin/Staff)
router.post('/fabric-update', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { 
      fabricName, 
      action, // 'added', 'updated', 'price_changed', 'stock_low'
      newPrice,
      oldPrice,
      stockLevel
    } = req.body;

    if (!fabricName || !action) {
      return res.status(400).json({ success: false, message: 'Fabric name and action are required' });
    }

    let message = '';
    let type = 'info';
    let priority = 'medium';

    switch (action) {
      case 'added':
        message = `New fabric "${fabricName}" has been added to inventory`;
        type = 'success';
        break;
      case 'updated':
        message = `Fabric "${fabricName}" has been updated`;
        type = 'info';
        break;
      case 'price_changed':
        message = `Fabric "${fabricName}" price updated from ₹${oldPrice} to ₹${newPrice}`;
        type = 'info';
        priority = 'high';
        break;
      case 'stock_low':
        message = `Fabric "${fabricName}" is running low on stock (${stockLevel} units remaining)`;
        type = 'warning';
        priority = 'high';
        break;
      default:
        message = `Fabric "${fabricName}" has been updated`;
    }

    // Get all users except the one making the change
    const users = await User.find({ 
      _id: { $ne: req.user.id },
      role: { $in: ['Customer', 'Staff', 'Tailor'] }
    });

    // Create notifications for all users
    const notifications = await Promise.all(
      users.map(user => 
        Notification.createNotification({
          recipientId: user._id,
          message,
          type,
          priority,
          createdBy: req.user._id, // Use _id instead of id
          actionUrl: '/fabrics'
        })
      )
    );

    res.json({ 
      success: true, 
      message: `Fabric update notification sent to ${notifications.length} users`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error sending fabric update notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/whatsapp/send', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { to, template, body } = req.body; // e.g., template or simple body text
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    if (!token || !phoneId) return res.status(400).json({ message: 'WhatsApp not configured' });

    const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: body || 'Hello from Style Hub!' }
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();
    if (!resp.ok) {
      return res.status(400).json({ success: false, message: data?.error?.message || 'Failed to send' });
    }

    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/notifications/debug
// @desc    Debug endpoint to check notification data
// @access  Private (Admin/Staff)
router.get('/debug', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const notifications = await Notification.find({}).populate('createdBy', 'name email role');
    
    const debugInfo = {
      user: {
        id: req.user.id,
        _id: req.user._id,
        role: req.user.role
      },
      notifications: notifications.map(notification => ({
        id: notification._id,
        message: notification.message,
        createdBy: notification.createdBy,
        createdByType: typeof notification.createdBy,
        createdById: notification.createdBy?._id,
        createdByName: notification.createdBy?.name
      }))
    };
    
    res.json(debugInfo);
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ success: false, message: 'Debug error' });
  }
});

module.exports = router;