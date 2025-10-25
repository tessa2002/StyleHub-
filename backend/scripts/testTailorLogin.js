const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/User');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

async function testTailorLogin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the tailor
    const tailor = await User.findOne({ email: 'tailor@gmail.com' });
    
    if (!tailor) {
      console.log('❌ Tailor not found with email: tailor@gmail.com');
      return;
    }

    console.log('👤 TAILOR USER:');
    console.log('─────────────────────────────────────────────────');
    console.log(`Name: ${tailor.name}`);
    console.log(`Email: ${tailor.email}`);
    console.log(`Role: "${tailor.role}"`);
    console.log(`Role Type: ${typeof tailor.role}`);
    console.log(`Role Length: ${tailor.role.length}`);
    console.log(`User ID: ${tailor._id}`);
    console.log(`User ID Type: ${typeof tailor._id}`);
    console.log(`User ID String: "${tailor._id.toString()}"`);

    // Generate a token (simulate login)
    const token = jwt.sign(
      { 
        id: tailor._id.toString(),
        email: tailor.email,
        role: tailor.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('\n🔐 GENERATED TOKEN:');
    console.log('─────────────────────────────────────────────────');
    console.log(token.substring(0, 50) + '...');

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('\n✅ TOKEN DECODED:');
    console.log('─────────────────────────────────────────────────');
    console.log(`User ID from token: ${decoded.id}`);
    console.log(`User ID Type: ${typeof decoded.id}`);
    console.log(`Email from token: ${decoded.email}`);
    console.log(`Role from token: "${decoded.role}"`);

    // Now simulate what the /api/orders/assigned endpoint does
    console.log('\n📦 SIMULATING /api/orders/assigned ENDPOINT:');
    console.log('─────────────────────────────────────────────────');
    
    const userId = decoded.id;
    console.log(`Query User ID: ${userId}`);
    console.log(`Query User ID Type: ${typeof userId}`);
    
    // Convert to ObjectId (as the backend does)
    const userObjectId = new mongoose.Types.ObjectId(userId);
    console.log(`ObjectId: ${userObjectId}`);
    console.log(`ObjectId Type: ${typeof userObjectId}`);

    const query = { assignedTailor: userObjectId };
    console.log(`\nQuery:`, JSON.stringify(query, null, 2));

    const orders = await Order.find(query)
      .populate('assignedTailor', 'name')
      .populate('customer', 'name phone')
      .sort({ expectedDelivery: 1, createdAt: -1 })
      .lean();

    console.log(`\n✅ ORDERS FOUND: ${orders.length}`);
    console.log('─────────────────────────────────────────────────');

    if (orders.length > 0) {
      orders.forEach((order, idx) => {
        console.log(`\n${idx + 1}. Order ID: ${order._id.toString().slice(-6)}`);
        console.log(`   Customer: ${order.customer?.name || 'Unknown'}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Item Type: ${order.itemType || 'N/A'}`);
        console.log(`   Assigned Tailor: ${order.assignedTailor?.name || 'N/A'}`);
      });
    } else {
      console.log('⚠️ No orders found for this tailor!');
      console.log('\nPossible reasons:');
      console.log('1. Orders are not assigned to this tailor');
      console.log('2. User ID mismatch');
      console.log('3. Database query issue');
    }

    // Double-check by querying directly with the tailor's _id
    console.log('\n\n🔍 DIRECT QUERY CHECK:');
    console.log('─────────────────────────────────────────────────');
    const directOrders = await Order.find({ assignedTailor: tailor._id })
      .populate('customer', 'name')
      .lean();
    
    console.log(`Direct query result: ${directOrders.length} orders`);
    
    if (directOrders.length !== orders.length) {
      console.log('⚠️ MISMATCH! Direct query and token-based query return different results!');
      console.log(`Direct: ${directOrders.length} orders`);
      console.log(`Token-based: ${orders.length} orders`);
    } else {
      console.log('✅ Both queries return the same number of orders');
    }

    console.log('\n\n💡 SUMMARY:');
    console.log('─────────────────────────────────────────────────');
    console.log(`✅ Tailor exists: ${tailor.name}`);
    console.log(`✅ Token can be generated`);
    console.log(`✅ Token can be decoded`);
    console.log(`✅ Orders query returns ${orders.length} orders`);
    
    if (orders.length > 0) {
      console.log('\n✨ TAILOR LOGIN IS WORKING CORRECTLY!');
      console.log('The tailor should be able to see their orders.');
      console.log('\nIf the tailor is not seeing orders in the frontend:');
      console.log('1. Check if they are logged in with the correct email');
      console.log('2. Check browser console for errors');
      console.log('3. Check network tab to see the API response');
      console.log('4. Verify the token is being sent in requests');
    } else {
      console.log('\n⚠️ NO ORDERS FOUND FOR THIS TAILOR');
      console.log('The admin needs to assign orders to this tailor.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n\nDisconnected from MongoDB');
  }
}

testTailorLogin();

