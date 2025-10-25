const mongoose = require('mongoose');
const User = require('../models/User');
const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create test admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@stylehub.com',
      password: adminPassword,
      role: 'Admin',
      phone: '+91-9876543210'
    });
    await adminUser.save();
    console.log('✅ Created Admin user: admin@stylehub.com / admin123');

    // Create test customer user
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customerUser = new User({
      name: 'Test Customer',
      email: 'customer@stylehub.com',
      password: customerPassword,
      role: 'Customer',
      phone: '+91-9876543211'
    });
    await customerUser.save();

    // Create customer profile
    const customerProfile = new Customer({
      name: 'Test Customer',
      email: 'customer@stylehub.com',
      phone: '+91-9876543211',
      address: '123 Test Street, Test City',
      user: customerUser._id
    });
    await customerProfile.save();
    console.log('✅ Created Customer user: customer@stylehub.com / customer123');

    // Create test staff user
    const staffPassword = await bcrypt.hash('staff123', 10);
    const staffUser = new User({
      name: 'Staff User',
      email: 'staff@stylehub.com',
      password: staffPassword,
      role: 'Staff',
      phone: '+91-9876543212'
    });
    await staffUser.save();
    console.log('✅ Created Staff user: staff@stylehub.com / staff123');

    console.log('\n🎉 Test users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@stylehub.com / admin123');
    console.log('Customer: customer@stylehub.com / customer123');
    console.log('Staff: staff@stylehub.com / staff123');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

// Run the function
if (require.main === module) {
  createTestUser();
}

module.exports = createTestUser;

