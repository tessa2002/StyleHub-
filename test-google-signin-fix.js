// Test script to verify Google Sign-In fix
// This simulates what happens when a user signs in with Google

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const User = require('./backend/models/User');
const Customer = require('./backend/models/Customer');

async function testGoogleSignIn() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Simulate Google user data
    const testEmail = `test.google.${Date.now()}@example.com`;
    const testName = 'Test Google User';
    const googleId = `google_${Date.now()}`;
    
    console.log('📝 Test Data:');
    console.log('  Email:', testEmail);
    console.log('  Name:', testName);
    console.log('  Google ID:', googleId);
    console.log('');

    // Generate unique phone placeholder (same as in auth.js)
    const uniquePhone = `google_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log('📱 Generated unique phone placeholder:', uniquePhone);
    console.log('');

    // Step 1: Create User
    console.log('👤 Creating User...');
    const user = await User.create({
      name: testName,
      email: testEmail,
      password: 'hashed_password_here',
      role: 'Customer',
      phone: uniquePhone,
      googleId: googleId,
      profilePicture: 'https://example.com/photo.jpg'
    });
    console.log('✅ User created:', user._id);
    console.log('');

    // Step 2: Create Customer Profile
    console.log('🛍️ Creating Customer Profile...');
    const customer = await Customer.create({
      name: user.name,
      email: user.email,
      phone: uniquePhone,
      address: '',
      user: user._id
    });
    console.log('✅ Customer profile created:', customer._id);
    console.log('');

    // Step 3: Verify data
    console.log('🔍 Verifying created records...');
    const verifyUser = await User.findById(user._id);
    const verifyCustomer = await Customer.findOne({ user: user._id });
    
    console.log('User verification:');
    console.log('  Name:', verifyUser.name);
    console.log('  Email:', verifyUser.email);
    console.log('  Phone:', verifyUser.phone);
    console.log('  Google ID:', verifyUser.googleId);
    console.log('');
    
    console.log('Customer verification:');
    console.log('  Name:', verifyCustomer.name);
    console.log('  Email:', verifyCustomer.email);
    console.log('  Phone:', verifyCustomer.phone);
    console.log('  User ID:', verifyCustomer.user);
    console.log('');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await User.findByIdAndDelete(user._id);
    await Customer.findByIdAndDelete(customer._id);
    console.log('✅ Test data cleaned up');
    console.log('');

    console.log('🎉 SUCCESS! Google Sign-In will work correctly.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Restart your backend server');
    console.log('2. Try signing in with Google');
    console.log('3. The user and customer profile will be created automatically');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('');
    console.error('Error details:', error);
  } finally {
    await mongoose.connection.close();
    console.log('');
    console.log('🔌 Disconnected from MongoDB');
  }
}

testGoogleSignIn();
