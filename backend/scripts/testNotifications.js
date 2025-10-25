const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';
const BASE_URL = 'http://localhost:5000';

async function testNotifications() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🧪 TESTING NOTIFICATION SYSTEM');
    console.log('═══════════════════════════════════════════════════\n');

    // Step 1: Login as tailor
    console.log('📝 Step 1: Login as tailor');
    console.log('─────────────────────────────────────────────────');
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'tailor@gmail.com',
      password: 'tailor123'
    });

    const { token } = loginResponse.data;
    console.log('✅ Tailor logged in successfully\n');

    // Step 2: Find an order to test
    console.log('📝 Step 2: Find an order to test');
    console.log('─────────────────────────────────────────────────');
    
    const tailor = await User.findOne({ email: 'tailor@gmail.com' });
    const order = await Order.findOne({ assignedTailor: tailor._id, status: 'Pending' });
    
    if (!order) {
      console.log('❌ No pending orders found for tailor!');
      console.log('   Assign some orders to the tailor first.');
      return;
    }

    console.log(`✅ Found order: #${order._id.toString().slice(-6)}`);
    console.log(`   Status: ${order.status}\n`);

    // Step 3: Clear old notifications
    console.log('📝 Step 3: Clear old notifications');
    console.log('─────────────────────────────────────────────────');
    
    await Notification.deleteMany({ relatedOrder: order._id });
    console.log('✅ Cleared old notifications\n');

    // Step 4: Start work on order
    console.log('📝 Step 4: Start work on order (this should send notifications)');
    console.log('─────────────────────────────────────────────────');
    
    const startWorkResponse = await axios.put(
      `${BASE_URL}/api/orders/${order._id}/start-work`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Work started on order!');
    console.log(`   Response: ${startWorkResponse.data.message}\n`);

    // Step 5: Check notifications were created
    console.log('📝 Step 5: Verify notifications were created');
    console.log('─────────────────────────────────────────────────');
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait a bit

    const notifications = await Notification.find({ relatedOrder: order._id })
      .populate('recipientId', 'name email role')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${notifications.length} notification(s):\n`);

    notifications.forEach((notif, idx) => {
      console.log(`${idx + 1}. To: ${notif.recipientId.name} (${notif.recipientId.role})`);
      console.log(`   Email: ${notif.recipientId.email}`);
      console.log(`   Message: ${notif.message}`);
      console.log(`   Type: ${notif.type}`);
      console.log(`   Priority: ${notif.priority}`);
      console.log(`   Created: ${notif.createdAt.toLocaleString()}`);
      console.log(`   Read: ${notif.isRead ? 'Yes' : 'No'}`);
      console.log('');
    });

    // Step 6: Count notifications by role
    console.log('📝 Step 6: Notification breakdown by recipient role');
    console.log('─────────────────────────────────────────────────');
    
    const adminNotifs = notifications.filter(n => n.recipientId.role === 'Admin');
    const customerNotifs = notifications.filter(n => n.recipientId.role === 'Customer');
    
    console.log(`Admin notifications: ${adminNotifs.length}`);
    console.log(`Customer notifications: ${customerNotifs.length}`);
    console.log('');

    // Step 7: Test mark as ready
    console.log('📝 Step 7: Mark order as ready (should send more notifications)');
    console.log('─────────────────────────────────────────────────');
    
    const markReadyResponse = await axios.put(
      `${BASE_URL}/api/orders/${order._id}/mark-ready`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Order marked as ready!');
    console.log(`   Response: ${markReadyResponse.data.message}\n`);

    await new Promise(resolve => setTimeout(resolve, 500)); // Wait a bit

    const allNotifications = await Notification.find({ relatedOrder: order._id })
      .populate('recipientId', 'name email role')
      .sort({ createdAt: -1 });

    console.log(`✅ Total notifications now: ${allNotifications.length}\n`);

    // Show recent notifications
    console.log('📝 Recent notifications:');
    console.log('─────────────────────────────────────────────────');
    
    const recentNotifs = allNotifications.slice(0, 5);
    recentNotifs.forEach((notif, idx) => {
      console.log(`${idx + 1}. ${notif.recipientId.role} - ${notif.recipientId.name}`);
      console.log(`   ${notif.message}`);
      console.log('');
    });

    // Summary
    console.log('\n✨ NOTIFICATION SYSTEM TEST COMPLETE!');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('✅ Summary:');
    console.log(`   - Order #${order._id.toString().slice(-6)} tested`);
    console.log(`   - Start Work: Created ${notifications.length} notifications`);
    console.log(`   - Mark Ready: Created ${allNotifications.length - notifications.length} more notifications`);
    console.log(`   - Total: ${allNotifications.length} notifications`);
    console.log('');

    if (allNotifications.length > 0) {
      console.log('✅ SUCCESS! Notifications are working correctly! 🎉');
      console.log('');
      console.log('📌 What happens now:');
      console.log('   1. Admins will see notifications in their dashboard');
      console.log('   2. Customers will see notifications in their portal');
      console.log('   3. Notifications show up with bell icon 🔔');
      console.log('');
    } else {
      console.log('❌ WARNING: No notifications were created!');
      console.log('   Check backend logs for errors.');
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Check if server is running first
axios.get(`${BASE_URL}/`)
  .then(() => {
    console.log('✅ Server is running\n');
    testNotifications();
  })
  .catch((error) => {
    console.error('❌ Cannot connect to server!');
    console.error('Please make sure the backend server is running on http://localhost:5000');
    console.error('Error:', error.message);
  });

