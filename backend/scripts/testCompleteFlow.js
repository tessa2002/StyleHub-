const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testCompleteFlow() {
  console.log('🧪 TESTING COMPLETE TAILOR FLOW');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Step 1: Login as tailor
    console.log('📝 Step 1: Login as tailor');
    console.log('─────────────────────────────────────────────────');
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'tailor@gmail.com',
      password: 'tailor123'
    });

    const { token, user } = loginResponse.data;
    
    console.log('✅ Login successful!');
    console.log(`   User: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: "${user.role}"`);
    console.log(`   User ID: ${user._id || user.id}`);
    console.log(`   Token: ${token.substring(0, 50)}...`);

    // Step 2: Verify token
    console.log('\n📝 Step 2: Verify token');
    console.log('─────────────────────────────────────────────────');
    
    const verifyResponse = await axios.get(`${BASE_URL}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Token verified!');
    console.log(`   User: ${verifyResponse.data.user.name}`);
    console.log(`   Role: "${verifyResponse.data.user.role}"`);

    // Step 3: Fetch assigned orders
    console.log('\n📝 Step 3: Fetch assigned orders');
    console.log('─────────────────────────────────────────────────');
    
    const ordersResponse = await axios.get(`${BASE_URL}/api/orders/assigned`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Orders fetched successfully!');
    console.log(`   Response status: ${ordersResponse.status}`);
    console.log(`   Orders count: ${ordersResponse.data.orders?.length || ordersResponse.data.length || 0}`);
    
    const orders = ordersResponse.data.orders || ordersResponse.data || [];
    
    if (orders.length > 0) {
      console.log('\n📦 Order Details:');
      orders.forEach((order, idx) => {
        console.log(`   ${idx + 1}. Order #${order._id?.toString().slice(-6) || 'N/A'}`);
        console.log(`      Status: ${order.status}`);
        console.log(`      Item: ${order.itemType || 'N/A'}`);
        console.log(`      Customer: ${order.customer?.name || 'N/A'}`);
      });
    } else {
      console.log('\n⚠️  NO ORDERS RETURNED!');
      console.log('\nFull response data:', JSON.stringify(ordersResponse.data, null, 2));
    }

    // Step 4: Test other tailor endpoints
    console.log('\n📝 Step 4: Test tailor stats endpoint');
    console.log('─────────────────────────────────────────────────');
    
    try {
      const statsResponse = await axios.get(`${BASE_URL}/api/tailor/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Stats fetched successfully!');
      console.log(`   Total Orders: ${statsResponse.data.totalOrders}`);
      console.log(`   Pending Orders: ${statsResponse.data.pendingOrders}`);
      console.log(`   Completed Orders: ${statsResponse.data.completedOrders}`);
    } catch (statsError) {
      console.log('❌ Stats endpoint failed:', statsError.response?.data?.message || statsError.message);
    }

    console.log('\n\n✨ COMPLETE FLOW TEST FINISHED!');
    console.log('═══════════════════════════════════════════════════\n');

    if (orders.length > 0) {
      console.log('✅ SUCCESS: Tailor can see their assigned orders!');
      console.log(`\n📌 The tailor has ${orders.length} orders assigned to them.`);
      console.log('   If they are not seeing these orders in the frontend:');
      console.log('   1. Check browser console for errors');
      console.log('   2. Check Network tab to verify the request is being made');
      console.log('   3. Verify they are logged in as tailor@gmail.com');
      console.log('   4. Try clearing browser cache and localStorage');
      console.log('   5. Try logging out and logging back in');
    } else {
      console.log('⚠️  WARNING: No orders returned from API');
      console.log('   This means either:');
      console.log('   1. No orders are assigned to this tailor (check database)');
      console.log('   2. The query is not working correctly (bug in backend)');
      console.log('   3. The authentication is not passing the correct user ID');
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    console.error('\nFull error:', error);
  }
}

// Check if server is running first
axios.get(`${BASE_URL}/`)
  .then(() => {
    console.log('✅ Server is running\n');
    testCompleteFlow();
  })
  .catch((error) => {
    console.error('❌ Cannot connect to server!');
    console.error('Please make sure the backend server is running on http://localhost:5000');
    console.error('Error:', error.message);
  });

