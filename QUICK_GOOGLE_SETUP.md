# Quick Google OAuth Setup for Testing

## Step 1: Get Google Client ID (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen (if first time):
   - User Type: External
   - App name: StyleHub
   - User support email: your email
   - Developer contact: your email
6. Create OAuth Client:
   - Application type: Web application
   - Name: StyleHub Web
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000`
7. Copy the Client ID

## Step 2: Configure Environment Variables

Create `frontend/.env` file:
```bash
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
REACT_APP_API_URL=http://localhost:5000
```

Create `backend/.env` file:
```bash
GOOGLE_CLIENT_ID=your_client_id_here
MONGODB_URI=mongodb://localhost:27017/stylehub
JWT_SECRET=your_secret_key_here
PORT=5000
```

## Step 3: Test

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Go to `http://localhost:3000/login`
4. Click Google button
5. Should show Google account picker
6. After selecting account, should automatically log in and redirect

## Troubleshooting

**"Can't continue with google.com"**
- Check that Client ID is correctly set in both .env files
- Ensure `http://localhost:3000` is in authorized origins
- Try clearing browser cache

**"Google Sign-In not configured"**
- Check that `REACT_APP_GOOGLE_CLIENT_ID` is set in frontend/.env
- Restart the frontend server after adding .env

**Backend errors**
- Check that `GOOGLE_CLIENT_ID` is set in backend/.env
- Ensure MongoDB is running
- Check backend console for detailed error messages