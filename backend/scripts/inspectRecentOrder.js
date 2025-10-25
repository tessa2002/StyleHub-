const mongoose = require('mongoose');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';

async function inspectRecentOrder() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get the most recent order
    const order = await Order.findOne()
      .sort({ createdAt: -1 })
      .populate('customer', 'name phone email')
      .lean();

    if (order) {
      console.log('📦 Most Recent Order:\n');
      console.log('Order ID:', order._id);
      console.log('Customer:', order.customer?.name);
      console.log('Status:', order.status);
      console.log('Total Amount:', order.totalAmount);
      console.log('Item Type:', order.itemType);
      console.log('Order Type:', order.orderType);
      console.log('Created:', new Date(order.createdAt).toLocaleString());
      console.log('\nFull Document:');
      console.log(JSON.stringify(order, null, 2));
    } else {
      console.log('❌ No orders found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

inspectRecentOrder();

