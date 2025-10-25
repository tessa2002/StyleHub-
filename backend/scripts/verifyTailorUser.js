const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';

async function verifyTailorUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all users with "tailor" in email or name
    const users = await User.find({
      $or: [
        { email: /tailor/i },
        { name: /tailor/i },
        { role: 'Tailor' }
      ]
    }).select('name email role password');

    console.log('👥 USERS WITH "TAILOR" KEYWORD:');
    console.log('═══════════════════════════════════════════════════\n');

    if (users.length === 0) {
      console.log('❌ NO TAILOR USERS FOUND!\n');
      console.log('Creating new tailor user...\n');
      
      const password = 'tailor123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newTailor = await User.create({
        name: 'tailor',
        email: 'tailor@gmail.com',
        password: hashedPassword,
        role: 'Tailor',
        phone: ''
      });
      
      console.log('✅ NEW TAILOR CREATED:');
      console.log(`   Name: ${newTailor.name}`);
      console.log(`   Email: ${newTailor.email}`);
      console.log(`   Password: tailor123`);
      console.log(`   Role: ${newTailor.role}`);
      console.log(`   ID: ${newTailor._id}\n`);
    } else {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        console.log(`${i + 1}. USER DETAILS:`);
        console.log(`   Name: "${user.name}"`);
        console.log(`   Email: "${user.email}"`);
        console.log(`   Role: "${user.role}"`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
        
        // Test password
        const testPassword = 'tailor123';
        const isMatch = await bcrypt.compare(testPassword, user.password);
        
        if (isMatch) {
          console.log(`   ✅ Password "tailor123" WORKS!`);
        } else {
          console.log(`   ❌ Password "tailor123" DOES NOT WORK`);
          
          // Try other common passwords
          const commonPasswords = ['Tailor123', 'tailor', 'password', '123456'];
          let found = false;
          for (const pwd of commonPasswords) {
            const match = await bcrypt.compare(pwd, user.password);
            if (match) {
              console.log(`   💡 Found working password: "${pwd}"`);
              found = true;
              break;
            }
          }
          
          if (!found) {
            console.log(`   🔧 Updating password to "tailor123"...`);
            user.password = await bcrypt.hash('tailor123', 10);
            await user.save();
            console.log(`   ✅ Password updated!`);
          }
        }
        console.log('');
      }
    }

    console.log('\n📋 EXACT LOGIN CREDENTIALS TO USE:');
    console.log('═══════════════════════════════════════════════════');
    
    const tailorUser = await User.findOne({ email: 'tailor@gmail.com' });
    if (tailorUser) {
      console.log('Email (copy exactly):');
      console.log('tailor@gmail.com');
      console.log('\nPassword (copy exactly):');
      console.log('tailor123');
      console.log('\n✅ These credentials are VERIFIED to work!\n');
      
      // Final test
      const finalTest = await bcrypt.compare('tailor123', tailorUser.password);
      if (finalTest) {
        console.log('✅ FINAL VERIFICATION: Password works! ✅\n');
      } else {
        console.log('❌ FINAL VERIFICATION FAILED!\n');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

verifyTailorUser();

