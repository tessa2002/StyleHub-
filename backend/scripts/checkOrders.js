const mongoose = require('mongoose');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';

async function checkOrders() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Count orders
    const orderCount = await Order.countDocuments();
    console.log(`📦 Total Orders: ${orderCount}\n`);

    if (orderCount > 0) {
      // Get all orders with customer populated
      const orders = await Order.find()
        .populate('customer', 'name phone email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      console.log('📋 Recent Orders:\n' + '='.repeat(80));
      orders.forEach((order, index) => {
        console.log(`\n${index + 1}. Order ID: ${order._id}`);
        console.log(`   Customer: ${order.customer?.name || 'N/A'} (${order.customer?.phone || 'N/A'})`);
        console.log(`   Garment: ${order.itemType || order.garmentType || 'N/A'}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Total: ₹${order.totalAmount || 0}`);
        console.log(`   Date: ${new Date(order.createdAt).toLocaleDateString()}`);
      });
      console.log('\n' + '='.repeat(80));
    }

    // Count bills
    const billCount = await Bill.countDocuments();
    console.log(`\n💳 Total Bills: ${billCount}`);

    if (billCount > 0) {
      const bills = await Bill.find()
        .populate('customer', 'name')
        .populate('order')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      console.log('\n💵 Recent Bills:\n' + '='.repeat(80));
      bills.forEach((bill, index) => {
        console.log(`\n${index + 1}. Bill ID: ${bill._id}`);
        console.log(`   Bill Number: ${bill.billNumber || 'N/A'}`);
        console.log(`   Customer: ${bill.customer?.name || 'N/A'}`);
        console.log(`   Amount: ₹${bill.amount || 0}`);
        console.log(`   Status: ${bill.status}`);
        console.log(`   Amount Paid: ₹${bill.amountPaid || 0}`);
      });
      console.log('\n' + '='.repeat(80));
    }

    // Count payments
    const paymentCount = await Payment.countDocuments();
    console.log(`\n💰 Total Payments: ${paymentCount}`);

    if (paymentCount > 0) {
      const payments = await Payment.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      console.log('\n💸 Recent Payments:\n' + '='.repeat(80));
      payments.forEach((payment, index) => {
        console.log(`\n${index + 1}. Payment ID: ${payment._id}`);
        console.log(`   Transaction ID: ${payment.transactionId || payment.razorpayOrderId || 'N/A'}`);
        console.log(`   Amount: ₹${payment.amount || 0}`);
        console.log(`   Status: ${payment.status}`);
        console.log(`   Method: ${payment.paymentMethod || 'N/A'}`);
      });
      console.log('\n' + '='.repeat(80));
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY:');
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Bills: ${billCount}`);
    console.log(`   Payments: ${paymentCount}`);
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkOrders();

