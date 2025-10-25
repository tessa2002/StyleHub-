const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';

async function removeTestCustomers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test customer emails to remove
    const testEmails = [
      'priya.sharma@example.com',
      'rahul.verma@example.com',
      'anita.desai@example.com',
      'vikram.singh@example.com',
      'meera.patel@example.com'
    ];

    console.log('🗑️  Removing test customers...\n');

    // Remove test customers
    const customersResult = await Customer.deleteMany({
      email: { $in: testEmails }
    });
    console.log(`✅ Deleted ${customersResult.deletedCount} test customers`);

    // Remove test user accounts
    const usersResult = await User.deleteMany({
      email: { $in: testEmails }
    });
    console.log(`✅ Deleted ${usersResult.deletedCount} test user accounts`);

    // Show remaining counts
    const customerCount = await Customer.countDocuments();
    const userCount = await User.countDocuments({ role: 'Customer' });

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Remaining in database:`);
    console.log(`   Customers: ${customerCount}`);
    console.log(`   Customer Users: ${userCount}`);
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

removeTestCustomers();

