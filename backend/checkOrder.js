// Quick diagnostic script to check order data
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

const ORDER_ID = 'ef1ba1';

async function checkOrder() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub');
    console.log('✅ Connected!\n');
    
    // Find order by the ID shown in UI
    console.log(`🔍 Searching for order with ID containing: ${ORDER_ID}\n`);
    
    const order = await Order.findOne({ 
      $or: [
        { _id: ORDER_ID },
        { orderNumber: { $regex: ORDER_ID, $options: 'i' } }
      ]
    }).lean();
    
    if (!order) {
      console.log('❌ Order not found!\n');
      
      // Show recent orders
      const recentOrders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('_id orderNumber itemType status measurementSnapshot measurements')
        .lean();
      
      console.log('📋 Recent orders in database:');
      recentOrders.forEach((o, i) => {
        console.log(`\n${i + 1}. Order ${o.orderNumber || o._id}`);
        console.log(`   Type: ${o.itemType}`);
        console.log(`   Has measurementSnapshot: ${o.measurementSnapshot ? 'YES ✅' : 'NO ❌'}`);
        console.log(`   Has measurements: ${o.measurements ? 'YES ✅' : 'NO ❌'}`);
        if (o.measurementSnapshot) {
          console.log(`   Measurement fields: ${Object.keys(o.measurementSnapshot).join(', ')}`);
        }
      });
      
      process.exit(0);
    }
    
    console.log('✅ ORDER FOUND!\n');
    console.log('📦 Order Details:');
    console.log(`   ID: ${order._id}`);
    console.log(`   Order Number: ${order.orderNumber}`);
    console.log(`   Type: ${order.itemType}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Customer: ${order.customer}`);
    console.log(`   Assigned Tailor: ${order.assignedTailor || 'Not assigned'}`);
    
    console.log('\n📏 MEASUREMENTS CHECK:');
    console.log(`   Has "measurements" field: ${order.measurements ? 'YES ✅' : 'NO ❌'}`);
    console.log(`   Has "measurementSnapshot" field: ${order.measurementSnapshot ? 'YES ✅' : 'NO ❌'}`);
    
    if (order.measurements && Object.keys(order.measurements).length > 0) {
      console.log('\n   ✅ "measurements" field data:');
      Object.entries(order.measurements).forEach(([key, value]) => {
        console.log(`      ${key}: ${value}`);
      });
    }
    
    if (order.measurementSnapshot && Object.keys(order.measurementSnapshot).length > 0) {
      console.log('\n   ✅ "measurementSnapshot" field data:');
      Object.entries(order.measurementSnapshot).forEach(([key, value]) => {
        console.log(`      ${key}: ${value}`);
      });
    }
    
    if ((!order.measurements || Object.keys(order.measurements).length === 0) &&
        (!order.measurementSnapshot || Object.keys(order.measurementSnapshot).length === 0)) {
      console.log('\n   ❌ NO MEASUREMENTS IN DATABASE!');
      console.log('   This order was created without measurements.');
      console.log('   Customer needs to provide measurements before tailor can work.');
    }
    
    console.log('\n🧵 FABRIC CHECK:');
    console.log(`   Has fabric: ${order.fabric ? 'YES ✅' : 'NO ❌'}`);
    if (order.fabric) {
      console.log(`   Fabric: ${JSON.stringify(order.fabric, null, 2)}`);
    }
    
    console.log('\n📝 NOTES CHECK:');
    console.log(`   Design Notes: ${order.designNotes || 'None'}`);
    console.log(`   Special Instructions: ${order.specialInstructions || order.notes || 'None'}`);
    
    console.log('\n✅ Done!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkOrder();

