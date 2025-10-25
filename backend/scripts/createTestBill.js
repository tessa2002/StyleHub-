const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Bill = require('../models/Bill');

async function createTestBill() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub');
    console.log('Connected to MongoDB');

    // Find a customer user
    const customer = await User.findOne({ role: 'Customer' });
    if (!customer) {
      console.log('No customer found. Please create a customer first.');
      return;
    }

    console.log('Found customer:', customer.email);

    // Find or create an order for this customer
    let order = await Order.findOne({ customer: customer._id });
    if (!order) {
      console.log('No order found. Creating a test order...');
      order = await Order.create({
        customer: customer._id,
        items: [{ name: 'Test Shirt', quantity: 1, price: 2000 }],
        status: 'Pending',
        totalAmount: 2000,
        notes: 'Test order for bill creation'
      });
      console.log('Created test order:', order._id);
    } else {
      console.log('Found existing order:', order._id);
    }

    // Check if bill already exists
    const existingBill = await Bill.findOne({ order: order._id });
    if (existingBill) {
      console.log('Bill already exists for this order:', existingBill._id);
      return;
    }

    // Create a bill for the order
    const bill = await Bill.create({
      order: order._id,
      amount: order.totalAmount || 2000,
      paymentMethod: 'Cash',
      status: 'Unpaid',
      amountPaid: 0,
      payments: []
    });

    console.log('✅ Created bill:', bill._id);
    console.log('Bill amount:', bill.amount);
    console.log('Bill status:', bill.status);

  } catch (error) {
    console.error('Error creating test bill:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestBill();
