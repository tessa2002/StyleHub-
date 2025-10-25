const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/style_hub')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import models
const Order = require('./backend/models/Order');
const User = require('./backend/models/User');

async function checkTailorOrders() {
  try {
    // Find all tailors
    const tailors = await User.find({ role: 'Tailor' }).select('_id name email');
    console.log('\n📋 Tailors in database:', tailors.length);
    
    for (const tailor of tailors) {
      console.log(`\n👤 Tailor: ${tailor.name} (${tailor.email})`);
      console.log(`   ID: ${tailor._id}`);
      
      // Check orders assigned to this tailor
      const orders = await Order.find({ assignedTailor: tailor._id })
        .select('_id orderNumber itemType status assignedTailor')
        .lean();
      
      console.log(`   📦 Assigned orders: ${orders.length}`);
      
      if (orders.length > 0) {
        orders.forEach((order, idx) => {
          console.log(`   ${idx + 1}. Order #${order._id.toString().slice(-6)} - ${order.itemType} - ${order.status}`);
        });
      }
    }
    
    // Check for orders with assignedTailor as string (incorrect)
    const ordersWithStringTailor = await Order.find({ 
      assignedTailor: { $type: 'string' } 
    }).select('_id orderNumber assignedTailor').lean();
    
    if (ordersWithStringTailor.length > 0) {
      console.log(`\n⚠️  Found ${ordersWithStringTailor.length} orders with STRING assignedTailor (should be ObjectId):`);
      ordersWithStringTailor.forEach(order => {
        console.log(`   - Order ${order._id}: assignedTailor = "${order.assignedTailor}"`);
      });
    }
    
    console.log('\n✅ Check complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Wait for connection then run
setTimeout(checkTailorOrders, 1000);




