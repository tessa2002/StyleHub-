const mongoose = require('mongoose');
const Order = require('../models/Order');
const Bill = require('../models/Bill');
const Customer = require('../models/Customer');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';

async function fixExistingOrders() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all orders with totalAmount = 0
    const orders = await Order.find({ totalAmount: 0 }).populate('customer');
    console.log(`\n📦 Found ${orders.length} orders with totalAmount = 0`);

    if (orders.length === 0) {
      console.log('✅ No orders need fixing!');
      process.exit(0);
    }

    let fixedCount = 0;
    let billsCreated = 0;

    for (const order of orders) {
      try {
        // Calculate totalAmount based on garment type
        const basePrices = {
          'shirt': 800,
          'pants': 600,
          'suit': 2000,
          'dress': 1200,
          'kurta': 1000,
          'blouse': 800,
          'lehenga': 2500,
          'jacket': 1500,
          'other': 1000
        };

        let totalAmount = 0;

        // Get base price from garment type
        const garmentType = (order.itemType || '').toLowerCase();
        const basePrice = basePrices[garmentType] || 1000;
        totalAmount += basePrice;

        // Add fabric cost if exists
        if (order.fabric && order.fabric.source === 'shop' && order.fabric.cost) {
          totalAmount += Number(order.fabric.cost);
        }

        // Add embroidery cost if exists
        if (order.customizations?.embroidery?.enabled) {
          const embroideryTotal = order.customizations.embroidery.pricing?.total || 0;
          totalAmount += embroideryTotal;
        }

        // Add urgency charge if exists (check in notes or separate field)
        if (order.urgency === 'urgent') {
          totalAmount += 500;
        }

        // If we still have 0, use items price as fallback
        if (totalAmount === 0 && order.items && order.items.length > 0) {
          totalAmount = order.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
        }

        // Default minimum if still 0
        if (totalAmount === 0) {
          totalAmount = 1000; // Default minimum order value
        }

        console.log(`\n📝 Order ${order._id.toString().slice(-6)}:`);
        console.log(`   Garment: ${order.itemType || 'Unknown'}`);
        console.log(`   Calculated Total: ₹${totalAmount}`);

        // Update the order
        order.totalAmount = totalAmount;
        await order.save();
        fixedCount++;

        // Check if bill exists
        const existingBill = await Bill.findOne({ order: order._id });
        
        if (!existingBill && order.customer) {
          // Create bill
          const bill = await Bill.create({
            order: order._id,
            customer: order.customer._id || order.customer,
            amount: totalAmount,
            paymentMethod: 'Razorpay',
            status: 'Pending',
            amountPaid: 0,
            payments: [],
          });
          console.log(`   ✅ Bill created: ${bill.billNumber} (₹${totalAmount})`);
          billsCreated++;
        } else if (existingBill) {
          // Update existing bill amount
          existingBill.amount = totalAmount;
          await existingBill.save();
          console.log(`   ✅ Bill updated: ${existingBill.billNumber} (₹${totalAmount})`);
        }

      } catch (err) {
        console.error(`   ❌ Error fixing order ${order._id}:`, err.message);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Fixed ${fixedCount} orders`);
    console.log(`💳 Created ${billsCreated} bills`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the fix
fixExistingOrders();

