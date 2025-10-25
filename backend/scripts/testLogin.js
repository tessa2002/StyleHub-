const axios = require('axios');

const PORT = process.env.PORT || 5000;
const API_URL = `http://localhost:${PORT}/api/auth/login`;

async function testLogin() {
  try {
    console.log(`🧪 Testing login at: ${API_URL}\n`);
    
    const response = await axios.post(API_URL, {
      email: 'admin@gmail.com',
      password: 'Admin@123'
    });

    console.log('✅ LOGIN SUCCESSFUL!\n');
    console.log('Response:');
    console.log('  Token:', response.data.token ? '✅ Generated' : '❌ Missing');
    console.log('  User:', response.data.user);
    console.log('\n🎉 Admin login is working correctly!');
    
  } catch (error) {
    console.error('❌ LOGIN FAILED!\n');
    
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Message:', error.response.data.message || error.response.data);
    } else if (error.request) {
      console.error('  No response from server!');
      console.error('  Make sure backend is running on port', PORT);
    } else {
      console.error('  Error:', error.message);
    }
  }
}

testLogin();

