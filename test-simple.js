// Simple test to check if servers are running
const http = require('http');

function testServer(port, name) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      console.log(`✅ ${name} server is running on port ${port}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${name} server is not running on port ${port}`);
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log(`❌ ${name} server timeout on port ${port}`);
      resolve(false);
    });
  });
}

async function testServers() {
  console.log('🧪 Testing Server Status...\n');
  
  const backendRunning = await testServer(5000, 'Backend');
  const frontendRunning = await testServer(3000, 'Frontend');
  
  console.log('\n📋 Test Results:');
  console.log(`Backend (Port 5000): ${backendRunning ? '✅ Running' : '❌ Not Running'}`);
  console.log(`Frontend (Port 3000): ${frontendRunning ? '✅ Running' : '❌ Not Running'}`);
  
  if (backendRunning && frontendRunning) {
    console.log('\n🎯 Ready to test Razorpay integration!');
    console.log('1. Open: http://localhost:3000/portal/payments?customer=customer&open=1&amount=2400');
    console.log('2. Select "Razorpay" as payment method');
    console.log('3. Click "Pay Now"');
    console.log('4. Use test card: 4111 1111 1111 1111');
  } else {
    console.log('\n⚠️  Please start the servers:');
    if (!backendRunning) {
      console.log('Backend: cd backend && node server.js');
    }
    if (!frontendRunning) {
      console.log('Frontend: cd frontend && npm start');
    }
  }
}

testServers();























