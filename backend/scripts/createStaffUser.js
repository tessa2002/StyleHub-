const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';

async function createStaffUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if staff user already exists
    let staffUser = await User.findOne({ email: 'staff@gmail.com' });
    
    if (staffUser) {
      console.log('Staff user already exists:', staffUser.email);
      console.log('You can login with:');
      console.log('Email: staff@gmail.com');
      console.log('Password: Staff@123');
      return;
    }

    // Create staff user
    const hashedPassword = await bcrypt.hash('Staff@123', 10);
    
    staffUser = await User.create({
      name: 'John Staff',
      email: 'staff@gmail.com',
      password: hashedPassword,
      role: 'Staff',
      phone: '+1234567890',
      address: '123 Main St, City',
      status: 'Active'
    });

    console.log('✅ Staff user created successfully!');
    console.log('Email:', staffUser.email);
    console.log('Password: Staff@123');
    console.log('Role:', staffUser.role);
    
  } catch (error) {
    console.error('Error creating staff user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  createStaffUser();
}

module.exports = createStaffUser;
