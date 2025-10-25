require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');

async function unassignSomeOrders() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/style_hub';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get all assigned orders
    const assignedOrders = await Order.find({ assignedTailor: { $exists: true, $ne: null } })
      .sort({ createdAt: -1 })
      .limit(10); // Get 10 most recent

    if (assignedOrders.length === 0) {
      console.log('❌ No assigned orders found!');
      process.exit(0);
    }

    console.log(`\n📦 Found ${assignedOrders.length} assigned orders`);
    console.log('\n🔧 Unassigning 5 orders for testing...\n');

    // Unassign the first 5 orders
    for (let i = 0; i < 5 && i < assignedOrders.length; i++) {
      const order = assignedOrders[i];
      await Order.findByIdAndUpdate(order._id, { $unset: { assignedTailor: 1 } });
      console.log(`   ✅ Order #${String(order._id).slice(-6)} - UNASSIGNED`);
    }

    console.log('\n✅ Complete! Now you can test assigning orders in the admin dashboard.');
    console.log('   Go to: Admin Dashboard → Orders');
    console.log('   Look for orders with blue "Assign" button');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

unassignSomeOrders();

