const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Middleware to ensure user is staff
const ensureStaff = (req, res, next) => {
  if (!req.user || req.user.role !== 'Staff') {
    return res.status(403).json({ message: 'Access denied. Staff role required.' });
  }
  next();
};

// Get orders assigned to specific staff member
router.get('/orders', auth, ensureStaff, async (req, res) => {
  try {
    console.log('Staff orders request - req.user:', req.user);
    
    // Add null checks for req.user
    if (!req.user || !req.user.id) {
      console.error('Missing user or user ID:', req.user);
      return res.status(401).json({ message: 'Unauthorized: Missing user ID' });
    }

    const staffId = req.query.staffId || req.user.id;
    console.log('Staff ID for orders query:', staffId);
    
    // Ensure staff can only see their own orders
    if (staffId !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied. Can only view your own orders.' });
    }

    const orders = await Order.find({
      $or: [
        { assignedStaff: staffId },
        { staffId: staffId },
        { assignedTo: staffId }
      ]
    })
    .populate('customerId', 'name email phone')
    .sort({ createdAt: -1 });

    // Transform data to include customer name
    const transformedOrders = orders.map(order => ({
      ...order.toObject(),
      customerName: order.customerId?.name || order.customerName || 'Unknown Customer'
    }));

    res.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching staff orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get appointments assigned to specific staff member
router.get('/appointments', auth, ensureStaff, async (req, res) => {
  try {
    // Add null checks for req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: Missing user ID' });
    }

    const staffId = req.query.staffId || req.user.id;
    
    // Ensure staff can only see their own appointments
    if (staffId !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied. Can only view your own appointments.' });
    }

    const appointments = await Appointment.find({
      $or: [
        { assignedStaff: staffId },
        { staffId: staffId },
        { assignedTo: staffId }
      ]
    })
    .populate('customerId', 'name email phone')
    .sort({ scheduledAt: 1 });

    // Transform data to include customer name
    const transformedAppointments = appointments.map(appointment => ({
      ...appointment.toObject(),
      customerName: appointment.customerId?.name || appointment.customerName || 'Unknown Customer'
    }));

    res.json(transformedAppointments);
  } catch (error) {
    console.error('Error fetching staff appointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get notifications for specific staff member
router.get('/notifications', auth, ensureStaff, async (req, res) => {
  try {
    // Add null checks for req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: Missing user ID' });
    }

    const staffId = req.query.staffId || req.user.id;
    
    // Ensure staff can only see their own notifications
    if (staffId !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied. Can only view your own notifications.' });
    }

    const notifications = await Notification.find({
      $or: [
        { recipientId: staffId },
        { staffId: staffId },
        { targetUser: staffId }
      ],
      isRead: { $ne: true }
    })
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching staff notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', auth, ensureStaff, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const staffId = req.body.staffId || req.user.id;
    
    // Ensure staff can only mark their own notifications as read
    if (staffId !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        $or: [
          { recipientId: staffId },
          { staffId: staffId },
          { targetUser: staffId }
        ]
      },
      { 
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or access denied.' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get staff dashboard stats
router.get('/stats', auth, ensureStaff, async (req, res) => {
  try {
    const staffId = req.user.id;

    // Get orders assigned to this staff member
    const orders = await Order.find({
      $or: [
        { assignedStaff: staffId },
        { staffId: staffId },
        { assignedTo: staffId }
      ]
    });

    // Get appointments assigned to this staff member
    const appointments = await Appointment.find({
      $or: [
        { assignedStaff: staffId },
        { staffId: staffId },
        { assignedTo: staffId }
      ],
      scheduledAt: { $gte: new Date() }
    });

    const stats = {
      totalOrders: orders.length,
      upcomingAppointments: appointments.length,
      pendingTasks: orders.filter(order => 
        order.status === 'Pending' || order.status === 'Assigned'
      ).length,
      completedJobs: orders.filter(order => 
        order.status === 'Completed' || order.status === 'Delivered'
      ).length,
      inProgressOrders: orders.filter(order => 
        order.status === 'In Progress'
      ).length
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching staff stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (staff can only update their assigned orders)
router.put('/orders/:id/status', auth, ensureStaff, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const staffId = req.user.id;

    // Find order and ensure it's assigned to this staff member
    const order = await Order.findOne({
      _id: orderId,
      $or: [
        { assignedStaff: staffId },
        { staffId: staffId },
        { assignedTo: staffId }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not assigned to you.' });
    }

    // Update order status
    order.status = status;
    order.lastUpdatedBy = staffId;
    order.updatedAt = new Date();

    // Add status change to order history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: status,
      changedBy: staffId,
      changedAt: new Date(),
      note: `Status updated by staff member`
    });

    await order.save();

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get staff profile
router.get('/profile', auth, ensureStaff, async (req, res) => {
  try {
    const staff = await User.findById(req.user.id).select('-password');
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
