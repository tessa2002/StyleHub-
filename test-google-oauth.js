// Test Google OAuth Integration
// Run this after setting up Google OAuth credentials

const axios = require('axios');

// Test data - replace with actual Google JWT token for testing
const testGoogleCredential = 'your_google_jwt_token_here';

async function testGoogleOAuth() {
  try {
    console.log('🧪 Testing Google OAuth integration...');
    
    // Test the Google OAuth endpoint
    const response = await axios.post('http://localhost:5000/api/auth/google', {
      credential: testGoogleCredential
    });
    
    console.log('✅ Google OAuth test successful!');
    console.log('📦 Response:', response.data);
    
    if (response.data.success) {
      console.log('👤 User created/logged in:', response.data.user.name);
      console.log('🔑 JWT token received:', response.data.token ? 'Yes' : 'No');
    }
    
  } catch (error) {
    console.error('❌ Google OAuth test failed:');
    console.error('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('💡 This is expected if using placeholder token');
      console.log('💡 Replace testGoogleCredential with real Google JWT token');
    }
  }
}

// Test with placeholder (will fail but show structure)
testGoogleOAuth();

console.log(`
📋 To properly test Google OAuth:

1. Set up Google Cloud Console credentials (see GOOGLE_OAUTH_SETUP.md)
2. Add your Google Client ID to backend/.env:
   GOOGLE_CLIENT_ID=your_actual_client_id

3. Add your Google Client ID to frontend/.env:
   REACT_APP_GOOGLE_CLIENT_ID=your_actual_client_id

4. Start both servers:
   Backend: cd backend && npm start
   Frontend: cd frontend && npm start

5. Test in browser at http://localhost:3000/login
   - Click Google button
   - Complete Google sign-in
   - Should redirect to customer dashboard

🔧 Features implemented:
✅ Google Sign-In button with loading state
✅ Automatic user registration for new Google accounts
✅ Existing account linking for returning users
✅ Secure server-side token verification
✅ JWT token generation and authentication
✅ Role-based dashboard redirection
✅ Profile picture support from Google
`);