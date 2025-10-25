const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Order = require('./backend/models/Order');
const Bill = require('./backend/models/Bill');

async function createBillsForOrders() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/stylehub');
    console.log('✅ Connected to MongoDB');

    // Find all customers
    const customers = await User.find({ role: 'Customer' });
    console.log(`👥 Found ${customers.length} customers`);

    for (const customer of customers) {
      console.log(`\n🔍 Processing customer: ${customer.email}`);
      
      // Find orders for this customer
      const orders = await Order.find({ customer: customer._id });
      console.log(`📦 Found ${orders.length} orders`);
      
      for (const order of orders) {
        console.log(`  📋 Order ${order._id}: ₹${order.totalAmount || 0} (${order.status})`);
        
        // Check if bill already exists
        const existingBill = await Bill.findOne({ order: order._id });
        if (existingBill) {
          console.log(`    ✅ Bill already exists: ${existingBill._id}`);
        } else {
          console.log(`    🆕 Creating bill...`);
          
          // Create bill
          const bill = await Bill.create({
            order: order._id,
            amount: order.totalAmount || 2000,
            paymentMethod: 'Cash',
            status: 'Unpaid',
            amountPaid: 0,
            payments: []
          });
          
          console.log(`    ✅ Created bill: ${bill._id} for ₹${bill.amount}`);
        }
      }
    }

    console.log('\n🎉 Bill creation process completed!');
    console.log('💡 Now try accessing your payments page - you should see bills available.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createBillsForOrders();
