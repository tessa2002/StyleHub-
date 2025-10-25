const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';

async function createAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with this email!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      
      // Update password if needed
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'Admin';
      existingAdmin.status = 'Active';
      await existingAdmin.save();
      
      console.log('✅ Password reset to: Admin@123');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const adminUser = await User.create({
      name: 'Administrator',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'Admin',
      phone: '+91 99999 99999',
      address: 'Admin Office, Style Hub',
      status: 'Active'
    });

    console.log('\n🎉 Admin user created successfully!\n');
    console.log('═══════════════════════════════════');
    console.log('Email:    admin@gmail.com');
    console.log('Password: Admin@123');
    console.log('Role:     Admin');
    console.log('═══════════════════════════════════\n');
    console.log('✅ You can now login with these credentials!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
createAdminUser();

