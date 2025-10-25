const axios = require('axios');

// Test Razorpay Integration
async function testRazorpayIntegration() {
  console.log('🧪 Testing Razorpay Integration...\n');
  
  try {
    // Test 1: Check if backend is running
    console.log('1. Testing backend connectivity...');
    const healthCheck = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
    console.log('✅ Backend is running');
  } catch (err) {
    console.log('❌ Backend not running. Please start the backend server first.');
    console.log('Run: cd backend && node server.js');
    return;
  }

  try {
    // Test 2: Test Razorpay order creation (without auth for now)
    console.log('\n2. Testing Razorpay order creation...');
    const orderResponse = await axios.post('http://localhost:5000/api/payments/create-order', {
      amount: 1000,
      currency: 'INR',
      receipt: 'test_receipt_123'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // You might need to adjust this
      }
    });
    
    console.log('✅ Order creation successful:', orderResponse.data);
  } catch (err) {
    console.log('❌ Order creation failed:', err.response?.data || err.message);
  }

  try {
    // Test 3: Test payment verification
    console.log('\n3. Testing payment verification...');
    const verifyResponse = await axios.post('http://localhost:5000/api/payments/verify-payment', {
      razorpay_order_id: 'test_order_123',
      razorpay_payment_id: 'test_payment_123',
      razorpay_signature: 'test_signature_123'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('✅ Payment verification endpoint accessible');
  } catch (err) {
    console.log('❌ Payment verification failed:', err.response?.data || err.message);
  }

  console.log('\n🎯 Frontend Testing Instructions:');
  console.log('1. Open http://localhost:3000/portal/payments?customer=customer&open=1&amount=2400');
  console.log('2. Select "Razorpay" as payment method');
  console.log('3. Click "Pay Now" to test the integration');
  console.log('4. Use test card: 4111 1111 1111 1111');
  console.log('5. Use any future expiry date and CVV');
}

testRazorpayIntegration();












