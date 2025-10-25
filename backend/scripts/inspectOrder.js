const mongoose = require('mongoose');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';

async function inspectOrder() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get one order with all fields
    const order = await Order.findOne()
      .populate('customer', 'name phone email')
      .lean();

    if (order) {
      console.log('📦 Sample Order Document:\n');
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

inspectOrder();

