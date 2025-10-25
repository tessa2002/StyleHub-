const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://stylehub:tessa123@cluster0.satblbp.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

async function createTestOrder() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = require('../models/User');
    const Customer = require('../models/Customer');
    const Order = require('../models/Order');
    const Bill = require('../models/Bill');
    const Payment = require('../models/Payment');

    // Find customer@test.com user
    let user = await User.findOne({ email: 'customer@test.com' });
    
    if (!user) {
      console.log('Creating test customer user...');
      user = await User.create({
        email: 'customer@test.com',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoMye.IKisVm8FQXfxBKwQlXoN4pxUC7Nfii', // password123
        role: 'Customer',
        name: 'Test Customer'
      });
    }

    // Find or create customer profile
    let customer = await Customer.findOne({ user: user._id });
    
    if (!customer) {
      console.log('Creating customer profile...');
      customer = await Customer.create({
        user: user._id,
        name: 'Test Customer',
        email: 'customer@test.com',
        phone: '9876543210',
        address: '123 Test Street, Test City'
      });
    }

    console.log('✅ Customer found/created:', customer._id);

    // Create a test order
    const order = await Order.create({
      customer: customer._id,
      items: [
        {
          name: 'Custom Kurta',
          itemType: 'Kurta',
          quantity: 1,
          price: 1500,
          fabric: 'Cotton',
          color: 'Blue'
        }
      ],
      status: 'Order Placed',
      totalAmount: 1500,
      expectedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      measurementSnapshot: {
        chest: 38,
        waist: 32,
        shoulder: 16,
        length: 42
      },
      notes: 'Test order with payment'
    });

    console.log('✅ Order created:', order._id);

    // Create a bill for the order
    const bill = await Bill.create({
      order: order._id,
      customer: customer._id,
      amount: 1500,
      amountPaid: 1500,
      status: 'Paid',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    console.log('✅ Bill created:', bill._id);

    // Create a payment record
    const payment = await Payment.create({
      bill: bill._id,
      customer: customer._id,
      amount: 1500,
      method: 'Razorpay',
      status: 'completed',
      razorpayOrderId: 'order_test_' + Date.now(),
      razorpayPaymentId: 'pay_test_' + Date.now(),
      razorpaySignature: 'sig_test_' + Date.now(),
      transactionId: 'TXN' + Date.now(),
      paidAt: new Date()
    });

    console.log('✅ Payment created:', payment._id);

    console.log('\n🎉 Test order created successfully!');
    console.log('Order ID:', order._id);
    console.log('Bill ID:', bill._id);
    console.log('Payment ID:', payment._id);
    console.log('\nYou can now login as customer@test.com (password: password123) to see the order!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestOrder();








