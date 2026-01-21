#!/usr/bin/env node

console.log(`
🚀 GOOGLE OAUTH SETUP FOR STYLEHUB
==================================

You're seeing "Google Sign-In not configured" because you need a real Google Client ID.

📋 QUICK SETUP (5 minutes):

1️⃣  Go to Google Cloud Console:
    👉 https://console.cloud.google.com/

2️⃣  Create a new project (or select existing):
    - Click "Select a project" → "New Project"
    - Name: "StyleHub OAuth"
    - Click "Create"

3️⃣  Enable APIs:
    - Go to "APIs & Services" → "Library"
    - Search and enable "Google+ API"

4️⃣  Create OAuth Credentials:
    - Go to "APIs & Services" → "Credentials"
    - Click "Create Credentials" → "OAuth 2.0 Client IDs"
    
    📝 OAuth Consent Screen (if first time):
    - User Type: External
    - App name: StyleHub
    - User support email: your email
    - Developer contact: your email
    - Save and continue through all steps
    
    🔑 Create OAuth Client:
    - Application type: Web application
    - Name: StyleHub Web Client
    - Authorized JavaScript origins: http://localhost:3000
    - Authorized redirect URIs: http://localhost:3000
    - Click "Create"

5️⃣  Copy the Client ID and update your .env files:

    📁 frontend/.env:
    REACT_APP_GOOGLE_CLIENT_ID=your_actual_client_id_here
    
    📁 backend/.env:
    GOOGLE_CLIENT_ID=your_actual_client_id_here

6️⃣  Restart both servers:
    Backend: cd backend && npm start
    Frontend: cd frontend && npm start

7️⃣  Test at http://localhost:3000/login

✅ CURRENT STATUS:
   - ✅ Environment files created
   - ❌ Google Client ID needed (placeholder set)
   - ❌ Servers need restart after setting real Client ID

🔧 TROUBLESHOOTING:
   - If you see "Can't continue with google.com": Check Client ID is correct
   - If button doesn't work: Ensure localhost:3000 is in authorized origins
   - If backend errors: Check GOOGLE_CLIENT_ID is set in backend/.env

💡 TIP: The Client ID looks like: 123456789-abcdefg.apps.googleusercontent.com
`);

// Check current environment setup
const fs = require('fs');
const path = require('path');

console.log('\n🔍 CHECKING CURRENT SETUP:\n');

// Check frontend .env
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
if (fs.existsSync(frontendEnvPath)) {
  const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
  const hasGoogleClientId = frontendEnv.includes('REACT_APP_GOOGLE_CLIENT_ID');
  const isDemo = frontendEnv.includes('demo_client_id');
  
  console.log(`📁 frontend/.env: ${hasGoogleClientId ? '✅ Found' : '❌ Missing'}`);
  if (hasGoogleClientId && isDemo) {
    console.log('   ⚠️  Using demo Client ID - replace with real one');
  }
} else {
  console.log('📁 frontend/.env: ❌ Missing');
}

// Check backend .env
const backendEnvPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(backendEnvPath)) {
  const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
  const hasGoogleClientId = backendEnv.includes('GOOGLE_CLIENT_ID');
  const isDemo = backendEnv.includes('demo_client_id');
  
  console.log(`📁 backend/.env: ${hasGoogleClientId ? '✅ Found' : '❌ Missing'}`);
  if (hasGoogleClientId && isDemo) {
    console.log('   ⚠️  Using demo Client ID - replace with real one');
  }
} else {
  console.log('📁 backend/.env: ❌ Missing');
}

console.log(`
🎯 NEXT STEPS:
1. Get your Google Client ID from the link above
2. Replace "demo_client_id_replace_with_real_one" in both .env files
3. Restart both servers
4. Test Google Sign-In at http://localhost:3000/login

Need help? Check QUICK_GOOGLE_SETUP.md for detailed instructions.
`);