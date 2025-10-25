require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');

async function removeTeTailor() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/style_hub';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find the "te" tailor
    const teTailor = await User.findOne({ email: 'te@gmail.com', role: 'Tailor' });

    if (!teTailor) {
      console.log('❌ Tailor "te" not found!');
      process.exit(0);
    }

    console.log(`\n📋 Found tailor: ${teTailor.name} (${teTailor.email})`);
    console.log(`   ID: ${teTailor._id}`);

    // Find all orders assigned to this tailor
    const assignedOrders = await Order.find({ assignedTailor: teTailor._id });
    console.log(`\n📦 Orders assigned to "te": ${assignedOrders.length}`);

    if (assignedOrders.length > 0) {
      console.log('\n🔧 Unassigning all orders from "te"...');
      await Order.updateMany(
        { assignedTailor: teTailor._id },
        { $unset: { assignedTailor: 1 } }
      );
      console.log(`   ✅ Unassigned ${assignedOrders.length} orders`);
    }

    // Delete the tailor user
    console.log('\n🗑️  Deleting tailor "te"...');
    await User.findByIdAndDelete(teTailor._id);
    console.log('   ✅ Tailor "te" deleted successfully!');

    // Show remaining tailors
    const remainingTailors = await User.find({ role: 'Tailor' }).select('name email');
    console.log('\n📋 Remaining Tailors:');
    if (remainingTailors.length === 0) {
      console.log('   ⚠️  No tailors remaining!');
    } else {
      remainingTailors.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.name} (${t.email})`);
      });
    }

    console.log('\n✅ Complete! Tailor "te" has been removed from the system.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeTeTailor();

