// Debug script to test adding material directly
const http = require('http');

// First, let's test if we can reach the fabrics endpoint
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function debugAddMaterial() {
  console.log('🔍 Debugging Add Material Functionality...\n');

  try {
    // Test 1: Check if fabrics endpoint is accessible
    console.log('1️⃣ Testing GET /api/fabrics...');
    const getResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/fabrics',
      method: 'GET'
    });
    console.log(`Status: ${getResponse.status}`);
    console.log(`Fabrics found: ${getResponse.data.fabrics?.length || 0}`);

    // Test 2: Try POST without authentication (should fail with 401/403)
    console.log('\n2️⃣ Testing POST /api/fabrics without auth...');
    const postData = JSON.stringify({
      name: 'Test Fabric',
      price: 100,
      stock: 50,
      category: 'PREMIUM FABRIC',
      unit: 'm'
    });

    const postResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/fabrics',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, postData);

    console.log(`Status: ${postResponse.status}`);
    console.log(`Response:`, postResponse.data);

    // Test 3: Check server logs for any errors
    console.log('\n3️⃣ Common Issues to Check:');
    console.log('- ❓ Is user logged in as Admin/Staff?');
    console.log('- ❓ Is authentication token valid?');
    console.log('- ❓ Are all required fields filled?');
    console.log('- ❓ Check browser console for JavaScript errors');
    console.log('- ❓ Check network tab for failed requests');

    console.log('\n🔧 Debugging Steps:');
    console.log('1. Open browser developer tools (F12)');
    console.log('2. Go to Console tab');
    console.log('3. Try adding material again');
    console.log('4. Look for any red error messages');
    console.log('5. Go to Network tab and check for failed requests');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugAddMaterial();