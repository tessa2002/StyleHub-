const axios = require('axios');

async function testStaffLogin() {
  try {
    console.log('Testing staff login...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'staff@stylehub.local',
      password: 'Staff@123'
    });
    
    console.log('✅ Login successful!');
    console.log('User:', response.data.user);
    console.log('Token:', response.data.token ? 'Present' : 'Missing');
    
    // Test staff API access
    const staffResponse = await axios.get('http://localhost:5000/api/staff/orders?staffId=' + response.data.user.id, {
      headers: {
        'Authorization': `Bearer ${response.data.token}`
      }
    });
    
    console.log('✅ Staff API access successful!');
    console.log('Orders:', staffResponse.data.length, 'orders found');
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testStaffLogin();
