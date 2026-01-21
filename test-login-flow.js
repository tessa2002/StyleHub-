// Test Login Flow - Run this to verify your setup
const fs = require('fs');
const path = require('path');

console.log('🧪 TESTING LOGIN FLOW SETUP\n');

// Check environment files
function checkEnvFile(filePath, requiredVars) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${filePath} - File not found`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let allFound = true;
  
  requiredVars.forEach(varName => {
    if (content.includes(varName)) {
      const line = content.split('\n').find(l => l.includes(varName));
      const value = line ? line.split('=')[1] : '';
      
      if (value && !value.includes('demo_client_id') && !value.includes('your_')) {
        console.log(`✅ ${varName} - Configured`);
      } else {
        console.log(`⚠️  ${varName} - Using placeholder (needs real Client ID)`);
        allFound = false;
      }
    } else {
      console.log(`❌ ${varName} - Missing`);
      allFound = false;
    }
  });
  
  return allFound;
}

console.log('📁 FRONTEND ENVIRONMENT:');
const frontendReady = checkEnvFile('frontend/.env', ['REACT_APP_GOOGLE_CLIENT_ID']);

console.log('\n📁 BACKEND ENVIRONMENT:');
const backendReady = checkEnvFile('backend/.env', ['GOOGLE_CLIENT_ID', 'MONGODB_URI', 'JWT_SECRET']);

console.log('\n🔍 OVERALL STATUS:');
if (frontendReady && backendReady) {
  console.log('✅ All environment variables configured with real values');
  console.log('✅ Ready to test Google Sign-In');
} else {
  console.log('⚠️  Some environment variables need real values');
  console.log('📋 Next steps:');
  
  if (!frontendReady) {
    console.log('   1. Get Google Client ID from https://console.cloud.google.com/');
    console.log('   2. Update REACT_APP_GOOGLE_CLIENT_ID in frontend/.env');
  }
  
  if (!backendReady) {
    console.log('   3. Update GOOGLE_CLIENT_ID in backend/.env');
  }
  
  console.log('   4. Restart both servers');
}

console.log('\n🎯 TESTING CHECKLIST:');
console.log('□ Google Cloud Console project created');
console.log('□ OAuth 2.0 credentials created');
console.log('□ Client ID copied to both .env files');
console.log('□ Both servers restarted');
console.log('□ Test at http://localhost:3000/login');

console.log('\n💡 EXPECTED BEHAVIOR:');
console.log('✅ Click Google button → Account picker appears');
console.log('✅ Select account → Automatic login');
console.log('✅ Redirect to customer dashboard');
console.log('✅ No manual email/password entry needed');

console.log('\n📖 DETAILED SETUP GUIDE:');
console.log('👉 See GET_GOOGLE_CLIENT_ID.md for step-by-step instructions');