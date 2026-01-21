// Debug Google Sign-In - Add this to browser console to test

console.log('🔍 DEBUGGING GOOGLE SIGN-IN');

// Check environment variables
console.log('📋 Environment Check:');
console.log('- Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
console.log('- API URL:', process.env.REACT_APP_API_URL);

// Check if Google library is loaded
console.log('📋 Google Library Check:');
console.log('- window.google exists:', !!window.google);
if (window.google) {
  console.log('- google.accounts exists:', !!window.google.accounts);
  if (window.google.accounts) {
    console.log('- google.accounts.id exists:', !!window.google.accounts.id);
  }
}

// Check if Google script is loaded
const googleScript = document.querySelector('script[src*="accounts.google.com"]');
console.log('- Google script loaded:', !!googleScript);
if (googleScript) {
  console.log('- Script src:', googleScript.src);
}

// Test manual Google initialization
if (window.google && window.google.accounts && window.google.accounts.id) {
  console.log('🧪 Testing manual Google initialization...');
  
  try {
    window.google.accounts.id.initialize({
      client_id: '20409656859-sncmroekumql52vt4rnpdtq6l64u5c43.apps.googleusercontent.com',
      callback: (response) => {
        console.log('✅ Google callback received:', response);
      }
    });
    
    console.log('✅ Google initialized successfully');
    
    // Test prompt
    console.log('🧪 Testing Google prompt...');
    window.google.accounts.id.prompt((notification) => {
      console.log('📋 Prompt notification:', notification);
    });
    
  } catch (error) {
    console.error('❌ Manual initialization failed:', error);
  }
} else {
  console.error('❌ Google library not properly loaded');
}

console.log('🎯 NEXT STEPS:');
console.log('1. Check if all console logs show expected values');
console.log('2. If Google library not loaded, refresh page');
console.log('3. If Client ID wrong, check .env.local file');
console.log('4. Try clicking Google button and check for new console messages');