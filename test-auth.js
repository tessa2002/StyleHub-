// Test Authentication Endpoints
const http = require('http');

console.log('🧪 TESTING AUTHENTICATION ENDPOINTS\n');

function testLogin() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      email: "Customer@gmail.com",
      password: "password123"
    });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.token && result.user) {
            console.log('✅ Login working:', result.user.name, '(' + result.user.role + ')');
            resolve({ success: true, token: result.token });
          } else {
            console.log('❌ Login failed:', result.message);
            resolve({ success: false });
          }
        } catch (e) {
          console.log('❌ Invalid login response');
          resolve({ success: false });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Login request failed:', err.message);
      resolve({ success: false });
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Login timeout');
      resolve({ success: false });
    });
    
    req.write(postData);
    req.end();
  });
}

function testVerify(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/verify',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.user) {
            console.log('✅ Token verification working:', result.user.name);
            resolve(true);
          } else {
            console.log('❌ Token verification failed:', result.message);
            resolve(false);
          }
        } catch (e) {
          console.log('❌ Invalid verify response');
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Verify request failed:', err.message);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Verify timeout');
      resolve(false);
    });
    
    req.end();
  });
}

async function runAuthTest() {
  console.log('1. Testing Login...');
  const loginResult = await testLogin();
  
  if (loginResult.success) {
    console.log('\n2. Testing Token Verification...');
    const verifyResult = await testVerify(loginResult.token);
    
    console.log('\n📋 AUTHENTICATION RESULTS:');
    console.log('========================');
    console.log(`Login: ${loginResult.success ? '✅ Working' : '❌ Failed'}`);
    console.log(`Verify: ${verifyResult ? '✅ Working' : '❌ Failed'}`);
    
    if (loginResult.success && verifyResult) {
      console.log('\n🎯 AUTHENTICATION IS WORKING!');
      console.log('==============================');
      console.log('✅ Login endpoint working');
      console.log('✅ Token verification working');
      console.log('✅ No database required for testing');
      console.log('✅ Frontend authentication should work now');
      
      console.log('\n🚀 READY TO TEST PAYMENT FLOW:');
      console.log('==============================');
      console.log('1. Refresh your frontend page');
      console.log('2. Login should work without errors');
      console.log('3. Navigate to payment page');
      console.log('4. Test Razorpay integration');
      
    } else {
      console.log('\n⚠️  AUTHENTICATION ISSUES:');
      console.log('==========================');
      if (!loginResult.success) {
        console.log('❌ Login not working');
      }
      if (!verifyResult) {
        console.log('❌ Token verification not working');
      }
    }
  } else {
    console.log('\n❌ Login failed, cannot test verification');
  }
}

runAuthTest();























