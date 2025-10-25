const express = require('express');
const { auth, allowRoles } = require('../middleware/auth');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Feedback = require('../models/Feedback');
const Bill = require('../models/Bill');
const Fabric = require('../models/Fabric');
const Appointment = require('../models/Appointment');

const router = express.Router();

// GET /api/admin/activities - Get recent activities
router.get('/activities', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const [recentOrders, recentCustomers, recentBills] = await Promise.all([
      Order.find().populate('customer', 'name').sort({ createdAt: -1 }).limit(5),
      Customer.find().sort({ createdAt: -1 }).limit(3),
      Bill.find().populate('order').sort({ createdAt: -1 }).limit(3)
    ]);

    const activities = [
      ...recentOrders.map(order => ({
        id: order._id,
        type: 'order',
        description: `New Order from ${order.customer?.name || 'Unknown Customer'}`,
        timestamp: new Date(order.createdAt).toLocaleString()
      })),
      ...recentCustomers.map(customer => ({
        id: customer._id,
        type: 'customer',
        description: `New Customer: ${customer.name}`,
        timestamp: new Date(customer.createdAt).toLocaleString()
      })),
      ...recentBills.map(bill => ({
        id: bill._id,
        type: 'payment',
        description: `Bill Generated: ₹${bill.amount}`,
        timestamp: new Date(bill.createdAt).toLocaleString()
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.json({ success: true, activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/settings - Get admin settings
router.get('/settings', auth, allowRoles('Admin'), async (req, res) => {
  try {
    // For now, return default settings
    // In a real app, you'd store these in a database
    const defaultSettings = {
      shopName: 'Style Hub',
      shopAddress: '',
      shopPhone: '',
      shopEmail: '',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      workingHours: '9:00 AM - 6:00 PM',
      emailNotifications: true,
      smsNotifications: false,
      orderNotifications: true,
      paymentNotifications: true,
      sessionTimeout: 30,
      requirePasswordChange: false,
      twoFactorAuth: false,
      theme: 'light',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30
    };

    res.json({ success: true, settings: defaultSettings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/admin/settings - Update admin settings
router.put('/settings', auth, allowRoles('Admin'), async (req, res) => {
  try {
    const settings = req.body;
    
    // In a real app, you'd save these to a database
    // For now, just return success
    console.log('Settings updated:', settings);
    
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/dashboard - key metrics for admin/staff
router.get('/dashboard', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const [userCount, customerCount, activeOrders, revenueAgg, todayOrders, pendingOrders, totalOrders, completedOrders, pendingPayments] = await Promise.all([
      User.countDocuments({}),
      Customer.countDocuments({}),
      Order.countDocuments({ status: { $in: ['Pending', 'In Progress'] } }),
      Order.aggregate([
        { $match: { status: { $in: ['Ready', 'Delivered'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({}),
      Order.countDocuments({ status: { $in: ['Ready', 'Delivered'] } }),
      require('../models/Bill').countDocuments({ status: { $in: ['Unpaid', 'Partial'] } }),
    ]);

    const revenue = revenueAgg?.[0]?.total || 0;

    // Payment status snapshots
    const [paidBills, partialBills, unpaidBills] = await Promise.all([
      Bill.countDocuments({ status: 'Paid' }),
      Bill.countDocuments({ status: 'Partial' }),
      Bill.countDocuments({ status: 'Unpaid' }),
    ]);

    const recentOrders = await Order.find({})
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const topFeedback = await Feedback.find({})
      .sort({ rating: -1, createdAt: -1 })
      .limit(5)
      .lean();

    // Low stock fabrics (threshold = 5)
    const lowStockItems = await Fabric.find({ stock: { $lt: 5 } })
      .select('name stock')
      .sort({ stock: 1 })
      .limit(5)
      .lean();
    const lowStockCount = await Fabric.countDocuments({ stock: { $lt: 5 } });

    res.json({
      users: userCount,
      customers: customerCount,
      activeOrders,
      revenue,
      todayOrders,
      pendingOrders,
      totalOrders,
      completedOrders,
      pendingPayments,
      payments: { paid: paidBills, partial: partialBills, unpaid: unpaidBills },
      lowStock: { count: lowStockCount, items: lowStockItems },
      recentOrders: recentOrders.map(o => ({
        id: o._id,
        customer: o.customer?.name || '-',
        phone: o.customer?.phone || '-',
        amount: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt,
      })),
      topFeedback: topFeedback.map(f => ({ id: f._id, rating: f.rating, comment: f.comment, createdAt: f.createdAt })),
    });
  } catch (e) {
    console.error('Admin dashboard error:', e.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/users - create staff/tailor/admin
router.post('/users', auth, allowRoles('Admin'), async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    if (!['Admin', 'Tailor', 'Staff'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role, phone: phone || '' });

    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    console.error('Create member error:', e.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users - list users with filters, search, pagination, sorting
router.get('/users', auth, allowRoles('Admin'), async (req, res) => {
  try {
    const { 
      role, 
      status, 
      q, 
      from, 
      to, 
      sort = 'createdAt', 
      order = 'desc', 
      page = 1, 
      limit = 10 
    } = req.query;

    // Build filter
    const filter = {};
    
    // Role filter - now includes Customer, Staff, Tailor
    if (role && ['Customer', 'Staff', 'Tailor', 'Admin'].includes(role)) {
      filter.role = role;
    }
    
    // Status filter
    if (status && ['Active', 'Suspended', 'Pending'].includes(status)) {
      filter.status = status;
    }
    
    // Search by name or email
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }
    
    // Date range filter
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(new Date(to).getTime() + 24*60*60*1000 - 1);
    }

    // Sorting
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = ['createdAt', 'name', 'email'].includes(sort) ? sort : 'createdAt';
    
    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .select('name email role phone address status createdAt')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter)
    ]);

    res.json({ 
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (e) {
    console.error('List users error:', e.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/users/:id - update staff/tailor/admin
router.put('/users/:id', auth, allowRoles('Admin'), async (req, res) => {
  try {
    const { name, email, role, phone, password } = req.body;
    if (role && !['Admin', 'Tailor', 'Staff'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const update = { };
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (role !== undefined) update.role = role;
    if (phone !== undefined) update.phone = phone;

    if (password) {
      const bcrypt = require('bcryptjs');
      update.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select('name email role phone');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (e) {
    console.error('Update user error:', e.message);
    // Handle duplicate email
    if (e.code === 11000) return res.status(400).json({ message: 'Email already registered' });
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/users/:id/status - update user status
router.patch('/users/:id/status', auth, allowRoles('Admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Suspended', 'Pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true, runValidators: true }
    ).select('name email role status');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (e) {
    console.error('Update user status error:', e.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users/:id - get single user details
router.get('/users/:id', auth, allowRoles('Admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email role phone address status createdAt updatedAt')
      .lean();
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (e) {
    console.error('Get user error:', e.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/users/:id - delete staff/tailor/admin
router.delete('/users/:id', auth, allowRoles('Admin'), async (req, res) => {
  try {
    const target = await User.findById(req.params.id).select('role');
    if (!target) return res.status(404).json({ message: 'User not found' });

    // Prevent deleting yourself
    if (String(req.user.id) === String(req.params.id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Optional: Prevent deleting last admin
    if (target.role === 'Admin') {
      const countAdmins = await User.countDocuments({ role: 'Admin', _id: { $ne: req.params.id } });
      if (countAdmins === 0) {
        return res.status(400).json({ message: 'Cannot delete the last admin' });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (e) {
    console.error('Delete user error:', e.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/metrics/overview - dashboard summary metrics
router.get('/metrics/overview', auth, allowRoles('Admin'), async (req, res) => {
  try {
    const [
      customers,
      staff,
      tailors,
      orders,
      upcomingAppointments,
      revenueAgg,
      pendingPayments
    ] = await Promise.all([
      User.countDocuments({ role: 'Customer' }),
      User.countDocuments({ role: 'Staff' }),
      User.countDocuments({ role: 'Tailor' }),
      Order.countDocuments({}),
      Appointment.countDocuments({ 
        scheduledAt: { $gte: new Date() } 
      }),
      Bill.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Bill.countDocuments({ status: { $in: ['Unpaid', 'Partial'] } })
    ]);

    const revenue = revenueAgg?.[0]?.total || 0;
    const notificationsCount = pendingPayments; // Simple notification count

    res.json({
      customers,
      staff,
      tailors,
      orders,
      upcomingAppointments,
      revenue,
      pendingPayments,
      notificationsCount
    });
  } catch (e) {
    console.error('Metrics overview error:', e.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/metrics/charts - dashboard charts data
router.get('/metrics/charts', auth, allowRoles('Admin'), async (req, res) => {
  try {
    const { from, to } = req.query;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Revenue over time (last 6 months)
    const revenueOverTime = await Bill.aggregate([
      {
        $match: {
          status: 'Paid',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Order status distribution
    const orderStatusData = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Customer growth (last 6 months)
    const customerGrowth = await User.aggregate([
      {
        $match: {
          role: 'Customer',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          customers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format data for charts
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const formattedRevenue = revenueOverTime.map(item => ({
      month: monthNames[item._id.month - 1],
      revenue: item.revenue
    }));

    const statusColors = {
      'Completed': '#10b981',
      'In Progress': '#3b82f6',
      'Pending': '#f59e0b',
      'Cancelled': '#ef4444'
    };

    const formattedOrderStatus = orderStatusData.map(item => ({
      name: item._id || 'Unknown',
      value: item.count,
      color: statusColors[item._id] || '#6b7280'
    }));

    const formattedCustomerGrowth = customerGrowth.map(item => ({
      month: monthNames[item._id.month - 1],
      customers: item.customers
    }));

    res.json({
      revenueOverTime: formattedRevenue,
      orderStatus: formattedOrderStatus,
      customerGrowth: formattedCustomerGrowth
    });
  } catch (e) {
    console.error('Charts data error:', e.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create appointment for a customer (Admin)
router.post('/appointments', auth, allowRoles('Admin'), async (req, res) => {
  try {
    const { customerId, service, scheduledAt, notes } = req.body;
    if (!customerId || !service || !scheduledAt) {
      return res.status(400).json({ message: 'customerId, service and scheduledAt are required' });
    }
    const customer = await Customer.findById(customerId).select('_id');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    const appt = await Appointment.create({ customer: customer._id, service, scheduledAt, notes });
    res.status(201).json({ appointment: appt });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DEBUG: Check and fix tailor role
router.get('/debug/fix-tailor-role', auth, allowRoles('Admin'), async (req, res) => {
  try {
    console.log('\n🔧 ===== FIX TAILOR ROLE DEBUG ENDPOINT =====');
    console.log('Requested by:', req.user.name);
    
    const TAILOR_ID = '68ca325eaa09cbfa7239892a';
    
    // Get all users for reference
    const allUsers = await User.find({}).select('name email role');
    console.log('\n📋 All users in database:');
    allUsers.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.name} (${u.email}) - Role: "${u.role}"`);
    });
    
    // Find the specific tailor
    const tailor = await User.findById(TAILOR_ID).select('name email role');
    
    if (!tailor) {
      console.log(`\n❌ Tailor with ID ${TAILOR_ID} not found!`);
      return res.status(404).json({ 
        success: false, 
        message: `Tailor user with ID ${TAILOR_ID} not found`,
        allUsers: allUsers.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role }))
      });
    }
    
    console.log('\n🔍 Found tailor user:');
    console.log(`   Name: ${tailor.name}`);
    console.log(`   Email: ${tailor.email}`);
    console.log(`   Current Role: "${tailor.role}"`);
    console.log(`   Role Type: ${typeof tailor.role}`);
    
    const correctRole = 'Tailor';
    const needsFix = tailor.role !== correctRole;
    
    console.log(`\n📊 Analysis:`);
    console.log(`   Expected: "${correctRole}"`);
    console.log(`   Actual: "${tailor.role}"`);
    console.log(`   Needs Fix: ${needsFix ? '❌ YES' : '✅ NO'}`);
    
    if (!needsFix) {
      console.log('\n✅ Role is already correct!');
      return res.json({
        success: true,
        message: 'Tailor role is already correct',
        tailor: { id: tailor._id, name: tailor.name, email: tailor.email, role: tailor.role },
        needsFix: false
      });
    }
    
    // Fix the role
    console.log(`\n🔧 Fixing role from "${tailor.role}" to "${correctRole}"...`);
    
    tailor.role = correctRole;
    await tailor.save();
    
    console.log('✅ SUCCESS! Role updated!');
    
    // Verify
    const verified = await User.findById(TAILOR_ID).select('name email role');
    console.log(`\n🔍 Verification:`);
    console.log(`   Role is now: "${verified.role}"`);
    console.log(`   Match: ${verified.role === correctRole ? '✅ CORRECT' : '❌ STILL WRONG'}`);
    
    console.log('\n✅ Done! User should logout and login again.\n');
    
    res.json({
      success: true,
      message: 'Tailor role fixed successfully! User should logout and login again.',
      before: tailor.role,
      after: verified.role,
      tailor: { id: verified._id, name: verified.name, email: verified.email, role: verified.role }
    });
    
  } catch (error) {
    console.error('❌ Error in fix-tailor-role endpoint:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

module.exports = router;