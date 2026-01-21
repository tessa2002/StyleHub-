# Get Google Client ID - Step by Step

## 🚀 Quick Setup (5 minutes)

### Step 1: Go to Google Cloud Console
👉 **Click here**: https://console.cloud.google.com/

### Step 2: Create/Select Project
- Click "Select a project" dropdown at the top
- Click "New Project"
- Project name: `StyleHub OAuth`
- Click "Create"
- Wait for project creation (30 seconds)

### Step 3: Enable Required APIs
- In the left sidebar, click "APIs & Services" → "Library"
- Search for "Google Identity" and click on it
- Click "Enable"

### Step 4: Configure OAuth Consent Screen
- Go to "APIs & Services" → "OAuth consent screen"
- Choose "External" user type
- Click "Create"
- Fill in required fields:
  - **App name**: `StyleHub`
  - **User support email**: Your email address
  - **Developer contact information**: Your email address
- Click "Save and Continue"
- Skip "Scopes" page (click "Save and Continue")
- Skip "Test users" page (click "Save and Continue")
- Click "Back to Dashboard"

### Step 5: Create OAuth Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client IDs"
- Application type: **Web application**
- Name: `StyleHub Web Client`
- **Authorized JavaScript origins**: 
  - Add: `http://localhost:3000`
- **Authorized redirect URIs**:
  - Add: `http://localhost:3000`
- Click "Create"

### Step 6: Copy Your Client ID
- A popup will show your credentials
- **Copy the Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
- Click "OK"

### Step 7: Update Environment Files

**Frontend (.env)**:
```bash
# Replace this line in frontend/.env:
REACT_APP_GOOGLE_CLIENT_ID=your_actual_client_id_here
```

**Backend (.env)**:
```bash
# Replace this line in backend/.env:
GOOGLE_CLIENT_ID=your_actual_client_id_here
```

### Step 8: Restart Servers
```bash
# Stop both servers (Ctrl+C)
# Then restart:

# Backend
cd backend
npm start

# Frontend (in new terminal)
cd frontend  
npm start
```

### Step 9: Test Google Sign-In
- Go to: http://localhost:3000/login
- Click the "Google" button
- Should show Google account picker
- Select your account
- Should automatically log in and redirect to dashboard

## ✅ Success Indicators
- Google button shows account picker (not error message)
- After selecting account, you're logged in automatically
- Redirected to customer dashboard
- No manual email/password entry needed

## 🔧 Troubleshooting

**"Can't continue with google.com"**
- Check Client ID is exactly copied (no extra spaces)
- Ensure `http://localhost:3000` is in authorized origins
- Try clearing browser cache

**Still seeing demo mode message**
- Check Client ID is updated in BOTH .env files
- Restart BOTH servers after updating .env files
- Check for typos in environment variable names

**Backend errors**
- Check backend console for detailed error messages
- Ensure MongoDB is running
- Verify GOOGLE_CLIENT_ID is set in backend/.env

## 💡 Tips
- The Client ID is safe to share (it's not a secret)
- You can always regenerate credentials if needed
- For production, add your production domain to authorized origins

## 🎯 What Happens After Setup
1. ✅ Google Sign-In button works seamlessly
2. ✅ New users automatically registered as Customers  
3. ✅ Existing users can link Google accounts
4. ✅ One-click login for returning Google users
5. ✅ Automatic redirect to appropriate dashboard