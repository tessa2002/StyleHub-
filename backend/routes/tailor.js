const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// Middleware to ensure user is a Tailor
const requireTailor = (req, res, next) => {
  if (req.user.role !== 'Tailor') {
    return res.status(403).json({ message: 'Access denied. Tailor role required.' });
  }
  next();
};

// Dashboard Statistics
router.get('/stats', auth, requireTailor, async (req, res) => {
  try {
    const tailorId = req.user._id;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get orders statistics
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      todayOrders,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
      totalRevenue
    ] = await Promise.all([
      Order.countDocuments({ assignedTailor: tailorId }),
      Order.countDocuments({ assignedTailor: tailorId, status: 'Pending' }),
      Order.countDocuments({ assignedTailor: tailorId, status: 'Completed' }),
      Order.countDocuments({ 
        assignedTailor: tailorId, 
        createdAt: { $gte: startOfDay } 
      }),
      Order.aggregate([
        { 
          $match: { 
            assignedTailor: tailorId, 
            createdAt: { $gte: startOfDay },
            status: 'Completed'
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            assignedTailor: tailorId, 
            createdAt: { $gte: startOfWeek },
            status: 'Completed'
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            assignedTailor: tailorId, 
            createdAt: { $gte: startOfMonth },
            status: 'Completed'
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            assignedTailor: tailorId,
            status: 'Completed'
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // Get pending payments count
    const pendingPayments = await Order.countDocuments({
      assignedTailor: tailorId,
      $expr: { $gt: ['$amount', '$advancePayment'] }
    });

    // Get total customers count (customers who have orders with this tailor)
    const totalCustomers = await Order.distinct('customerId', { assignedTailor: tailorId }).then(ids => ids.length);

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      todayOrders,
      totalCustomers,
      pendingPayments,
      lowStockItems: 0, // This would come from inventory system
      todayRevenue: todayRevenue[0]?.total || 0,
      weeklyRevenue: weeklyRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching tailor stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders for tailor
router.get('/orders', auth, requireTailor, async (req, res) => {
  try {
    const tailorId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = { assignedTailor: tailorId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Format orders with customer info
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customerId?.name || 'Unknown Customer',
      customerPhone: order.customerId?.phone || '',
      serviceType: order.serviceType,
      status: order.status,
      deliveryDate: order.deliveryDate,
      amount: order.amount,
      advancePayment: order.advancePayment || 0,
      createdAt: order.createdAt,
      description: order.description,
      measurements: order.measurements
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching tailor orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent orders for dashboard
router.get('/orders/recent', auth, requireTailor, async (req, res) => {
  try {
    const tailorId = req.user._id;
    
    const orders = await Order.find({ assignedTailor: tailorId })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customerId?.name || 'Unknown Customer',
      serviceType: order.serviceType,
      status: order.status,
      deliveryDate: order.deliveryDate,
      amount: order.amount
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new order
router.post('/orders', auth, requireTailor, async (req, res) => {
  try {
    const tailorId = req.user._id;
    const orderData = {
      ...req.body,
      assignedTailor: tailorId,
      createdBy: tailorId
    };

    const order = new Order(orderData);
    await order.save();

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
router.put('/orders/:id/status', auth, requireTailor, async (req, res) => {
  try {
    const tailorId = req.user._id;
    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, assignedTailor: tailorId },
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not assigned to you' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete order
router.delete('/orders/:id', auth, requireTailor, async (req, res) => {
  try {
    const tailorId = req.user._id;

    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      assignedTailor: tailorId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not assigned to you' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get customers statistics
router.get('/customers/stats', auth, requireTailor, async (req, res) => {
  try {
    const tailorId = req.user._id;
    
    // Get unique customers who have orders with this tailor
    const customerIds = await Order.distinct('customerId', { assignedTailor: tailorId });
    const totalCustomers = customerIds.length;

    res.json({ totalCustomers });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent customers
router.get('/customers/recent', auth, requireTailor, async (req, res) => {
  try {
    const tailorId = req.user._id;
    
    // Get recent customers who have orders with this tailor
    const recentOrders = await Order.find({ assignedTailor: tailorId })
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(10);

    // Group by customer and get unique customers
    const customerMap = new Map();
    recentOrders.forEach(order => {
      if (order.customerId && !customerMap.has(order.customerId._id.toString())) {
        customerMap.set(order.customerId._id.toString(), {
          _id: order.customerId._id,
          name: order.customerId.name,
          email: order.customerId.email,
          phone: order.customerId.phone,
          lastOrder: order.createdAt,
          totalOrders: 1
        });
      } else if (order.customerId) {
        const customer = customerMap.get(order.customerId._id.toString());
        customer.totalOrders++;
      }
    });

    // Get total orders count for each customer
    for (let [customerId, customer] of customerMap) {
      const totalOrders = await Order.countDocuments({
        assignedTailor: tailorId,
        customerId: customerId
      });
      customer.totalOrders = totalOrders;
    }

    const customers = Array.from(customerMap.values()).slice(0, 5);
    res.json(customers);
  } catch (error) {
    console.error('Error fetching recent customers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all customers for tailor
router.get('/customers', auth, requireTailor, async (req, res) => {
  try {
    const tailorId = req.user._id;
    
    // Get customers who have orders with this tailor
    const customerIds = await Order.distinct('customerId', { assignedTailor: tailorId });
    const customers = await Customer.find({ _id: { $in: customerIds } });

    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payments statistics
router.get('/payments/stats', auth, requireTailor, async (req, res) => {
  try {
    const tailorId = req.user._id;
    
    const pendingPayments = await Order.countDocuments({
      assignedTailor: tailorId,
      $expr: { $gt: ['$amount', { $ifNull: ['$advancePayment', 0] }] }
    });

    res.json({ pendingPayments });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notifications for tailor
router.get('/notifications', auth, requireTailor, async (req, res) => {
  try {
    const tailorId = req.user._id;
    
    const notifications = await Notification.find({
      $or: [
        { recipient: tailorId },
        { recipientRole: 'Tailor' },
        { recipient: 'all' }
      ],
      isRead: false
    }).sort({ createdAt: -1 }).limit(10);

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', auth, requireTailor, async (req, res) => {
  try {
    const tailorId = req.user._id;
    
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.id,
        $or: [
          { recipient: tailorId },
          { recipientRole: 'Tailor' },
          { recipient: 'all' }
        ]
      },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get fabrics (for order creation)
router.get('/fabrics', auth, requireTailor, async (req, res) => {
  try {
    // This would come from a Fabric model when implemented
    // For now, return empty array
    res.json([]);
  } catch (error) {
    console.error('Error fetching fabrics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
