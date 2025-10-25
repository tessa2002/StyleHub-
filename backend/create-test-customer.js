const axios = require('axios');

async function createTestCustomer() {
  try {
    console.log('📝 Creating test customer account...');
    
    const customerData = {
      name: 'Test Customer',
      email: 'customer@test.com',
      password: 'password123',
      phone: '1234567890',
      role: 'Customer'
    };
    
    const response = await axios.post('http://localhost:5000/api/auth/register', customerData);
    console.log('✅ Customer created successfully!');
    console.log('📧 Email:', customerData.email);
    console.log('🔑 Password:', customerData.password);
    console.log('\n🎯 Now you can login with these credentials!');
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️  Customer already exists!');
      console.log('📧 Email: customer@test.com');
      console.log('🔑 Password: password123');
      console.log('\n🎯 You can login with these credentials!');
    } else {
      console.error('❌ Error:', error.response?.data?.message || error.message);
    }
  }
}

createTestCustomer();


