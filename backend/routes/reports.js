const express = require('express');
const router = express.Router();
const { auth, allowRoles } = require('../middleware/auth');
const Order = require('../models/Order');
const Bill = require('../models/Bill');
const Customer = require('../models/Customer');

// Get income reports
router.get('/income', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { from, to, type } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from);
      if (to) dateFilter.createdAt.$lte = new Date(to);
    }

    // Get all orders
    const orders = await Order.find(dateFilter)
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    // Get all bills
    const bills = await Bill.find(dateFilter)
      .populate({ path: 'order', populate: { path: 'customer', select: 'name' } });

    // Calculate total revenue (only from delivered/completed orders)
    const completedOrders = orders.filter(o => 
      o.status === 'Delivered' || o.status === 'Ready'
    );
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Count total orders
    const totalOrders = completedOrders.length;

    // Get total customers
    const totalCustomers = await Customer.countDocuments();

    // Calculate payment status totals
    const paidPayments = bills
      .filter(b => b.status === 'Paid')
      .reduce((sum, b) => sum + b.amount, 0);
    
    const partialPayments = bills
      .filter(b => b.status === 'Partial')
      .reduce((sum, b) => sum + b.amount, 0);
    
    const pendingPayments = bills
      .filter(b => b.status === 'Pending' || b.status === 'Unpaid')
      .reduce((sum, b) => sum + b.amount, 0);

    // Get top customers by revenue
    const customerRevenue = {};
    completedOrders.forEach(order => {
      const customerId = order.customer?._id?.toString();
      if (customerId) {
        if (!customerRevenue[customerId]) {
          customerRevenue[customerId] = {
            name: order.customer.name,
            totalSpent: 0,
            totalOrders: 0,
            lastOrder: order.createdAt
          };
        }
        customerRevenue[customerId].totalSpent += order.totalAmount || 0;
        customerRevenue[customerId].totalOrders += 1;
        if (new Date(order.createdAt) > new Date(customerRevenue[customerId].lastOrder)) {
          customerRevenue[customerId].lastOrder = order.createdAt;
        }
      }
    });

    const topCustomers = Object.values(customerRevenue)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Get monthly revenue breakdown
    const monthlyRevenue = {};
    completedOrders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!monthlyRevenue[month]) {
        monthlyRevenue[month] = { month, orders: 0, revenue: 0 };
      }
      monthlyRevenue[month].orders += 1;
      monthlyRevenue[month].revenue += order.totalAmount || 0;
    });

    const monthlyRevenueArray = Object.values(monthlyRevenue).slice(0, 12);

    // Get recent orders with payment status
    const recentOrders = orders.slice(0, 20).map(order => {
      const bill = bills.find(b => b.order?._id?.toString() === order._id.toString());
      return {
        ...order.toObject(),
        paymentStatus: bill?.status || 'Pending'
      };
    });

    res.json({
      success: true,
      report: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        paidPayments,
        partialPayments,
        pendingPayments,
        topCustomers,
        monthlyRevenue: monthlyRevenueArray,
        recentOrders
      }
    });

  } catch (error) {
    console.error('Error generating income report:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Download report (simplified - returns JSON, can be enhanced to PDF)
router.get('/download', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { from, to, format = 'json' } = req.query;
    
    // Reuse the income report logic
    const reportResponse = await require('axios').get(
      `http://localhost:${process.env.PORT || 5000}/api/reports/income?from=${from || ''}&to=${to || ''}`,
      { headers: { Authorization: req.headers.authorization } }
    );

    const reportData = reportResponse.data.report;

    if (format === 'pdf') {
      // For now, return JSON with instructions to implement PDF
      // You can use libraries like pdfkit or puppeteer for actual PDF generation
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=report.json');
      res.json({
        message: 'PDF generation not yet implemented. Use JSON for now.',
        data: reportData
      });
    } else {
      // JSON download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=report.json');
      res.json(reportData);
    }

  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
