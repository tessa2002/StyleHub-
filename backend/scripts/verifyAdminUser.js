const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';

async function verifyAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check all admin users
    const admins = await User.find({ role: 'Admin' });
    console.log(`Found ${admins.length} admin user(s):\n`);
    
    admins.forEach((admin, index) => {
      console.log(`Admin ${index + 1}:`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Name: ${admin.name}`);
      console.log(`  Role: ${admin.role}`);
      console.log(`  Status: ${admin.status}`);
      console.log(`  Created: ${admin.createdAt}`);
      console.log('');
    });

    // Test password for admin@gmail.com
    const testUser = await User.findOne({ email: 'admin@gmail.com' });
    if (testUser) {
      const testPassword = 'Admin@123';
      const isMatch = await bcrypt.compare(testPassword, testUser.password);
      
      console.log('🔐 Password Test for admin@gmail.com:');
      console.log(`  Password "Admin@123": ${isMatch ? '✅ CORRECT' : '❌ WRONG'}`);
      
      if (!isMatch) {
        console.log('\n⚠️  Password mismatch! Resetting password...');
        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        testUser.password = hashedPassword;
        await testUser.save();
        console.log('✅ Password has been reset to: Admin@123');
      }
    } else {
      console.log('❌ No user found with email: admin@gmail.com');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

verifyAdminUser();

