const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('../models/Order');
const User = require('../models/User');
const Customer = require('../models/Customer');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';

async function debugTailorOrders() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all tailors
    const tailors = await User.find({ role: 'Tailor' }).select('_id name email role');
    console.log('👔 TAILORS IN SYSTEM:');
    console.log('─────────────────────────────────────────────────');
    
    if (tailors.length === 0) {
      console.log('❌ NO TAILORS FOUND!');
      process.exit(0);
    }

    tailors.forEach((tailor, index) => {
      console.log(`${index + 1}. Name: ${tailor.name}`);
      console.log(`   Email: ${tailor.email}`);
      console.log(`   ID: ${tailor._id}`);
      console.log(`   ID Type: ${typeof tailor._id}`);
      console.log(`   ID String: "${tailor._id.toString()}"`);
      console.log('');
    });

    // Get all orders
    const allOrders = await Order.find({})
      .populate('assignedTailor', 'name email role')
      .populate('customer', 'name phone')
      .lean();

    console.log('\n📦 ALL ORDERS IN SYSTEM:');
    console.log('─────────────────────────────────────────────────');
    console.log(`Total Orders: ${allOrders.length}\n`);

    if (allOrders.length === 0) {
      console.log('❌ NO ORDERS FOUND!');
      process.exit(0);
    }

    allOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order._id.toString().slice(-6)}`);
      console.log(`   Customer: ${order.customer?.name || 'Unknown'}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Item Type: ${order.itemType || 'N/A'}`);
      
      if (order.assignedTailor) {
        console.log(`   ✅ Assigned To: ${order.assignedTailor.name} (${order.assignedTailor.email})`);
        console.log(`   Tailor ID: ${order.assignedTailor._id}`);
        console.log(`   Tailor Role: ${order.assignedTailor.role}`);
      } else {
        console.log(`   ❌ NOT ASSIGNED (assignedTailor is: ${order.assignedTailor})`);
      }
      console.log('');
    });

    // For each tailor, check how many orders they should see
    console.log('\n🔍 ORDERS PER TAILOR (What they should see):');
    console.log('─────────────────────────────────────────────────');

    for (const tailor of tailors) {
      const tailorOrders = await Order.find({ assignedTailor: tailor._id })
        .populate('customer', 'name phone')
        .lean();

      console.log(`\n👤 ${tailor.name} (${tailor.email})`);
      console.log(`   Tailor ID: ${tailor._id}`);
      console.log(`   Orders Assigned: ${tailorOrders.length}`);
      
      if (tailorOrders.length > 0) {
        console.log('   Order Details:');
        tailorOrders.forEach((order, idx) => {
          console.log(`     ${idx + 1}. Order #${order._id.toString().slice(-6)}`);
          console.log(`        Customer: ${order.customer?.name || 'Unknown'}`);
          console.log(`        Status: ${order.status}`);
          console.log(`        Item: ${order.itemType || 'N/A'}`);
        });
      } else {
        console.log('   ⚠️ NO ORDERS ASSIGNED');
      }
    }

    // Check for any orders with invalid assignedTailor values
    console.log('\n\n🚨 CHECKING FOR INVALID ASSIGNMENTS:');
    console.log('─────────────────────────────────────────────────');
    
    const allOrdersRaw = await Order.find({}).select('_id assignedTailor status').lean();
    const tailorIds = tailors.map(t => t._id.toString());
    
    let invalidCount = 0;
    for (const order of allOrdersRaw) {
      if (order.assignedTailor) {
        const assignedIdStr = order.assignedTailor.toString();
        if (!tailorIds.includes(assignedIdStr)) {
          invalidCount++;
          console.log(`❌ Order ${order._id.toString().slice(-6)}: assignedTailor = ${assignedIdStr}`);
          console.log(`   This ID does not match any tailor in the system!`);
        }
      }
    }

    if (invalidCount === 0) {
      console.log('✅ All order assignments are valid!');
    } else {
      console.log(`\n⚠️ Found ${invalidCount} orders with invalid tailor assignments!`);
    }

    console.log('\n\n💡 RECOMMENDATIONS:');
    console.log('─────────────────────────────────────────────────');
    
    const unassignedCount = await Order.countDocuments({ 
      $or: [
        { assignedTailor: null },
        { assignedTailor: { $exists: false } }
      ]
    });

    if (unassignedCount > 0) {
      console.log(`📌 ${unassignedCount} orders are not assigned to any tailor`);
      console.log('   → Admin should assign these orders');
    }

    if (invalidCount > 0) {
      console.log(`📌 ${invalidCount} orders have invalid tailor assignments`);
      console.log('   → These need to be reassigned to valid tailors');
    }

    if (tailorOrders.length === 0 && allOrders.length > 0) {
      console.log('📌 No orders are assigned to any tailors');
      console.log('   → Admin needs to assign orders to tailors');
    }

    console.log('\n✅ Diagnostic Complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

debugTailorOrders();

