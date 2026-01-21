// Test All Endpoints
const http = require('http');

console.log('🧪 TESTING ALL ENDPOINTS\n');

async function testEndpoint(path, method = 'GET', headers = {}) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        ...headers
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ ${path}: ${res.statusCode} - Working`);
            resolve({ success: true, status: res.statusCode, data: result });
          } else {
            console.log(`❌ ${path}: ${res.statusCode} - ${result.message || 'Error'}`);
            resolve({ success: false, status: res.statusCode, error: result.message });
          }
        } catch (e) {
          console.log(`❌ ${path}: ${res.statusCode} - Invalid JSON response`);
          resolve({ success: false, status: res.statusCode, error: 'Invalid JSON' });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${path}: Connection failed - ${err.message}`);
      resolve({ success: false, error: err.message });
    });
    
    req.setTimeout(5000, () => {
      console.log(`❌ ${path}: Timeout`);
      resolve({ success: false, error: 'Timeout' });
    });
    
    req.end();
  });
}

async function runAllTests() {
  console.log('Testing Portal Endpoints...');
  console.log('============================');
  
  const endpoints = [
    '/api/portal/dashboard',
    '/api/portal/profile', 
    '/api/portal/orders',
    '/api/portal/appointments',
    '/api/portal/measurements',
    '/api/portal/bills',
    '/api/notifications',
    '/api/offers?limit=3',
    '/api/fabrics?limit=6'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push({ endpoint, ...result });
  }
  
  console.log('\n📋 FINAL RESULTS:');
  console.log('=================');
  
  const working = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Working: ${working.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (failed.length > 0) {
    console.log('\n❌ Failed Endpoints:');
    failed.forEach(f => {
      console.log(`  - ${f.endpoint}: ${f.error || f.status}`);
    });
  }
  
  if (working.length === results.length) {
    console.log('\n🎯 ALL ENDPOINTS WORKING!');
    console.log('=========================');
    console.log('✅ Portal dashboard working');
    console.log('✅ Profile endpoint working');
    console.log('✅ Orders endpoint working');
    console.log('✅ Appointments endpoint working');
    console.log('✅ Measurements endpoint working');
    console.log('✅ Bills endpoint working');
    console.log('✅ Notifications endpoint working');
    console.log('✅ Offers endpoint working');
    console.log('✅ Fabrics endpoint working');
    
    console.log('\n🚀 READY TO TEST PAYMENT FLOW:');
    console.log('==============================');
    console.log('1. Refresh your frontend page');
    console.log('2. Login should work without errors');
    console.log('3. Dashboard should load without 401 errors');
    console.log('4. Navigate to payments page');
    console.log('5. Test Razorpay integration');
    
  } else {
    console.log('\n⚠️  SOME ENDPOINTS STILL FAILING:');
    console.log('==================================');
    console.log('Please check the failed endpoints above');
  }
}

runAllTests();























