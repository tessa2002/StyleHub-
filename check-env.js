// Check Environment Variables
const fs = require('fs');
const path = require('path');

console.log('🔍 ENVIRONMENT VARIABLES CHECK\n');

// Check frontend .env
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
console.log('📁 Frontend .env file:');
console.log(`   Path: ${frontendEnvPath}`);
console.log(`   Exists: ${fs.existsSync(frontendEnvPath) ? '✅ Yes' : '❌ No'}`);

if (fs.existsSync(frontendEnvPath)) {
  const content = fs.readFileSync(frontendEnvPath, 'utf8');
  const lines = content.split('\n');
  
  console.log('   Contents:');
  lines.forEach((line, index) => {
    if (line.trim() && !line.startsWith('#')) {
      console.log(`     ${index + 1}: ${line}`);
    }
  });
  
  // Check for Google Client ID
  const googleClientIdLine = lines.find(line => line.includes('REACT_APP_GOOGLE_CLIENT_ID'));
  if (googleClientIdLine) {
    const value = googleClientIdLine.split('=')[1];
    console.log(`\n🔑 Google Client ID Status:`);
    console.log(`   Found: ✅ Yes`);
    console.log(`   Value: ${value}`);
    
    if (value === 'demo_client_id_replace_with_real_one') {
      console.log(`   Status: ⚠️  Demo mode (needs real Client ID)`);
    } else if (value && value.includes('.apps.googleusercontent.com')) {
      console.log(`   Status: ✅ Real Google Client ID detected`);
    } else {
      console.log(`   Status: ❌ Invalid format`);
    }
  } else {
    console.log(`\n🔑 Google Client ID: ❌ Not found`);
  }
}

console.log('\n🎯 NEXT STEPS:');
console.log('1. Make sure frontend/.env exists with REACT_APP_GOOGLE_CLIENT_ID');
console.log('2. Restart frontend server: cd frontend && npm start');
console.log('3. Check browser console for Google initialization logs');
console.log('4. If still in demo mode, get real Client ID from Google Cloud Console');

console.log('\n💡 QUICK TEST:');
console.log('After restarting frontend, check browser console for:');
console.log('   "🔍 Google Client ID check: { clientId: \'Found\', ... }"');