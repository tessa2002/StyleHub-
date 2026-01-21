# Google OAuth Setup Guide

This guide will help you set up Google Sign-In for the StyleHub application.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "StyleHub OAuth"
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" and enable it
3. Also enable "Google Identity" API

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in required fields:
     - App name: "StyleHub"
     - User support email: your email
     - Developer contact information: your email
   - Add scopes: email, profile, openid
   - Add test users if needed

4. Create OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: "StyleHub Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/login` (for development)
     - `https://yourdomain.com/login` (for production)

5. Click "Create" and copy the Client ID

## Step 4: Configure Environment Variables

### Frontend (.env)
```bash
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Backend (.env)
```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Step 5: Test the Integration

1. Start your backend server: `npm start` (in backend directory)
2. Start your frontend server: `npm start` (in frontend directory)
3. Go to `http://localhost:3000/login`
4. Click the "Google" button
5. Complete the Google sign-in flow

## Features Implemented

✅ **Google Sign-In Button**: Professional Google-styled button with loading state
✅ **Automatic Account Creation**: New users are automatically registered as Customers
✅ **Existing Account Linking**: Existing users can link their Google account
✅ **Secure Token Verification**: Backend verifies Google tokens using Google Auth Library
✅ **JWT Integration**: Google users receive the same JWT tokens as regular users
✅ **Role-Based Routing**: Google users are redirected to appropriate dashboards
✅ **Profile Picture Support**: Google profile pictures are stored and can be displayed

## Security Features

- Google tokens are verified server-side using Google's official library
- User data is validated before account creation
- Existing email addresses are handled gracefully
- JWT tokens follow the same security standards as regular login
- Google ID is stored securely for future authentication

## Troubleshooting

### "Google Sign-In not available"
- Check that `REACT_APP_GOOGLE_CLIENT_ID` is set in your frontend .env file
- Ensure the Google Identity Services script is loading properly

### "Invalid Google token"
- Verify that `GOOGLE_CLIENT_ID` matches in both frontend and backend .env files
- Check that your domain is authorized in Google Cloud Console

### "Failed to create customer profile"
- Check MongoDB connection
- Ensure Customer model is properly defined
- Check for duplicate phone number constraints

## Production Deployment

1. Update authorized origins and redirect URIs in Google Cloud Console
2. Set production environment variables
3. Ensure HTTPS is enabled for production domains
4. Test the complete flow in production environment

## Support

For issues with Google OAuth setup, refer to:
- [Google Identity Documentation](https://developers.google.com/identity)
- [Google Cloud Console Help](https://cloud.google.com/docs)