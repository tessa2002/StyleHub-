// Quick test to check if Google Sign-In is working
// Run this with: node test-google-signin-now.js

const axios = require('axios');

async function testGoogleSignIn() {
  console.log('🔍 Testing Google Sign-In Setup...\n');

  // Test 1: Check if backend is running
  console.log('Test 1: Checking if backend is running...');
  try {
    const response = await axios.get('http://localhost:5000/api/auth/verify');
    console.log('❌ Unexpected success (should be 401)');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Backend is running (401 Unauthorized is expected)\n');
    } else {
      console.log('❌ Backend might not be running');
      console.log('   Error:', error.message);
      console.log('   Make sure to run: cd backend && npm start\n');
      return;
    }
  }

  // Test 2: Check if Google OAuth endpoint exists
  console.log('Test 2: Checking Google OAuth endpoint...');
  try {
    const response = await axios.post('http://localhost:5000/api/auth/google', {
      credential: 'test_token'
    });
    console.log('❌ Unexpected success');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Google OAuth endpoint exists (400 Bad Request is expected for invalid token)\n');
    } else if (error.response && error.response.status === 500) {
      console.log('✅ Google OAuth endpoint exists (500 is expected for invalid token)\n');
    } else {
      console.log('❌ Google OAuth endpoint might have issues');
      console.log('   Error:', error.message);
      console.log('');
    }
  }

  // Test 3: Check environment variables
  console.log('Test 3: Checking environment variables...');
  const fs = require('fs');
  const path = require('path');
  
  const backendEnv = fs.readFileSync(path.join(__dirname, 'backend', '.env'), 'utf8');
  const frontendEnv = fs.readFileSync(path.join(__dirname, 'frontend', '.env'), 'utf8');
  
  const backendHasGoogle = backendEnv.includes('GOOGLE_CLIENT_ID=');
  const frontendHasGoogle = frontendEnv.includes('REACT_APP_GOOGLE_CLIENT_ID=');
  
  if (backendHasGoogle) {
    console.log('✅ Backend has GOOGLE_CLIENT_ID');
  } else {
    console.log('❌ Backend missing GOOGLE_CLIENT_ID');
  }
  
  if (frontendHasGoogle) {
    console.log('✅ Frontend has REACT_APP_GOOGLE_CLIENT_ID');
  } else {
    console.log('❌ Frontend missing REACT_APP_GOOGLE_CLIENT_ID');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 TROUBLESHOOTING STEPS:\n');
  console.log('1. Make sure backend is running:');
  console.log('   cd backend && npm start\n');
  console.log('2. Make sure frontend is running:');
  console.log('   cd frontend && npm start\n');
  console.log('3. Open browser console (F12) and check for errors\n');
  console.log('4. Try these URLs:');
  console.log('   - http://localhost:3000/login');
  console.log('   - http://localhost:3000/register\n');
  console.log('5. Click Google button and watch console for errors\n');
  console.log('='.repeat(60));
}

testGoogleSignIn().catch(err => {
  console.error('Test failed:', err.message);
});
