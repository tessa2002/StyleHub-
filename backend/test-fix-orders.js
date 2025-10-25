const axios = require('axios');

// You need to update this token with your actual customer token
// To get your token:
// 1. Login at http://localhost:3000/login
// 2. Open browser console (F12)
// 3. Type: localStorage.getItem('token')
// 4. Copy the token and paste it below

const TOKEN = 'YOUR_TOKEN_HERE'; // Replace with your actual token

async function fixOrders() {
  try {
    console.log('🔧 Calling fix-orders endpoint...\n');
    
    const response = await axios.post(
      'http://localhost:5000/api/portal/admin/fix-orders',
      {},
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log('✅ SUCCESS!');
      console.log('─'.repeat(50));
      console.log(`Fixed Orders: ${response.data.fixedCount}`);
      console.log(`Bills Created: ${response.data.billsCreated}`);
      console.log(`Message: ${response.data.message}`);
      console.log('─'.repeat(50));
      console.log('\n✨ Your orders page should now show correct amounts!');
      console.log('🔄 Refresh your browser to see the changes.\n');
    } else {
      console.error('❌ Failed:', response.data.message);
    }

  } catch (error) {
    console.error('❌ Error calling API:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message || error.response.data);
    } else {
      console.error(error.message);
    }
    
    console.log('\n💡 Make sure:');
    console.log('  1. Backend server is running (npm run server)');
    console.log('  2. You have updated TOKEN variable with your actual token');
    console.log('  3. You are logged in as a customer');
  }
}

// Run the fix
if (TOKEN === 'YOUR_TOKEN_HERE') {
  console.log('⚠️  Please update the TOKEN variable first!');
  console.log('\nHow to get your token:');
  console.log('1. Login at http://localhost:3000/login');
  console.log('2. Open browser console (F12)');
  console.log('3. Type: localStorage.getItem("token")');
  console.log('4. Copy the token and paste it in this file\n');
} else {
  fixOrders();
}

