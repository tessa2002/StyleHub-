const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Bill = require('./models/Bill');

async function testBills() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub');
    console.log('✅ Connected to MongoDB');

    // Find all customers
    const customers = await User.find({ role: 'Customer' });
    console.log('👥 Found customers:', customers.length);
    
    for (const customer of customers) {
      console.log(`\n🔍 Checking customer: ${customer.email}`);
      
      // Find orders for this customer
      const orders = await Order.find({ customer: customer._id });
      console.log(`📦 Orders found: ${orders.length}`);
      
      for (const order of orders) {
        console.log(`  - Order ${order._id}: ${order.totalAmount || 0} (${order.status})`);
        
        // Check if bill exists
        const existingBill = await Bill.findOne({ order: order._id });
        if (existingBill) {
          console.log(`    ✅ Bill exists: ${existingBill._id} (${existingBill.status})`);
        } else {
          console.log(`    ❌ No bill found - creating one...`);
          
          // Create bill
          const bill = await Bill.create({
            order: order._id,
            amount: order.totalAmount || 0,
            paymentMethod: 'Cash',
            status: 'Unpaid',
            amountPaid: 0,
            payments: []
          });
          
          console.log(`    ✅ Created bill: ${bill._id}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testBills();
