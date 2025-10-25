const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';

async function fixTailorPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the tailor
    const tailor = await User.findOne({ email: 'tailor@gmail.com' });
    
    if (!tailor) {
      console.log('❌ Tailor not found with email: tailor@gmail.com');
      console.log('Creating new tailor user...');
      
      const password = 'tailor123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newTailor = await User.create({
        name: 'Tailor',
        email: 'tailor@gmail.com',
        password: hashedPassword,
        role: 'Tailor',
        phone: ''
      });
      
      console.log('✅ New tailor created:');
      console.log(`   Name: ${newTailor.name}`);
      console.log(`   Email: ${newTailor.email}`);
      console.log(`   Password: tailor123`);
      console.log(`   Role: ${newTailor.role}`);
      
      return;
    }

    console.log('👤 Found tailor:');
    console.log(`   Name: ${tailor.name}`);
    console.log(`   Email: ${tailor.email}`);
    console.log(`   Role: ${tailor.role}`);
    console.log(`   Current password hash: ${tailor.password.substring(0, 20)}...`);

    // Set new password
    const newPassword = 'tailor123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    tailor.password = hashedPassword;
    await tailor.save();
    
    console.log('\n✅ Password updated successfully!');
    console.log(`   New password: ${newPassword}`);
    console.log(`   New hash: ${hashedPassword.substring(0, 20)}...`);

    // Test the password
    console.log('\n🔐 Testing password...');
    const isMatch = await bcrypt.compare(newPassword, tailor.password);
    
    if (isMatch) {
      console.log('✅ Password test PASSED!');
      console.log('\n📌 You can now login with:');
      console.log(`   Email: tailor@gmail.com`);
      console.log(`   Password: tailor123`);
    } else {
      console.log('❌ Password test FAILED!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

fixTailorPassword();

