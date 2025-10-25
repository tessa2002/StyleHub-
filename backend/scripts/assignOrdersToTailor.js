require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Customer = require('../models/Customer');

async function assignOrdersToTailor() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/style_hub';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find all tailors
    const tailors = await User.find({ role: 'Tailor' }).select('_id name email');
    console.log(`\n📋 Found ${tailors.length} tailor(s):`);
    tailors.forEach(t => console.log(`   - ${t.name} (${t.email})`));

    if (tailors.length === 0) {
      console.log('\n❌ No tailors found! Please create a tailor user first.');
      process.exit(1);
    }

    // Use the first tailor (or you can specify which one)
    const tailor = tailors[0];
    console.log(`\n🎯 Using tailor: ${tailor.name} (${tailor.email})`);

    // Find all orders
    const allOrders = await Order.find()
      .populate('customer', 'name phone email')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`\n📦 Total orders in database: ${allOrders.length}`);

    // Check assigned vs unassigned
    const assignedOrders = allOrders.filter(o => o.assignedTailor);
    const unassignedOrders = allOrders.filter(o => !o.assignedTailor);

    console.log(`   - Assigned orders: ${assignedOrders.length}`);
    console.log(`   - Unassigned orders: ${unassignedOrders.length}`);

    if (allOrders.length === 0) {
      console.log('\n❌ No orders found! Please create some orders first from the customer portal.');
      process.exit(1);
    }

    // Assign unassigned orders to the tailor
    if (unassignedOrders.length > 0) {
      console.log(`\n🔧 Assigning ${unassignedOrders.length} unassigned orders to ${tailor.name}...`);
      
      for (const order of unassignedOrders) {
        await Order.findByIdAndUpdate(order._id, { 
          assignedTailor: tailor._id 
        });
        console.log(`   ✅ Order #${String(order._id).slice(-6)} (${order.itemType || 'Custom'}) → ${tailor.name}`);
      }
    } else {
      console.log('\n⚠️  All orders are already assigned.');
      console.log('📋 Showing currently assigned orders:');
      assignedOrders.forEach(order => {
        console.log(`   - Order #${String(order._id).slice(-6)} → Tailor ID: ${order.assignedTailor}`);
      });
    }

    // Show summary for this tailor
    const tailorOrders = await Order.find({ assignedTailor: tailor._id })
      .populate('customer', 'name phone')
      .lean();

    console.log(`\n📊 Summary for ${tailor.name}:`);
    console.log(`   Total Assigned: ${tailorOrders.length}`);
    
    const statusCounts = {};
    tailorOrders.forEach(order => {
      const status = order.status || 'Order Placed';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log(`   Status breakdown:`);
    Object.keys(statusCounts).forEach(status => {
      console.log(`      - ${status}: ${statusCounts[status]}`);
    });

    console.log('\n📋 Orders assigned to this tailor:');
    tailorOrders.forEach(order => {
      console.log(`   - Order #${String(order._id).slice(-6)}`);
      console.log(`     Customer: ${order.customer?.name || 'Unknown'}`);
      console.log(`     Garment: ${order.itemType || 'Custom Order'}`);
      console.log(`     Status: ${order.status || 'Order Placed'}`);
      console.log(`     Delivery: ${order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'Not set'}`);
      console.log('');
    });

    console.log('\n✅ Assignment complete! Refresh your tailor dashboard to see the orders.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

assignOrdersToTailor();

