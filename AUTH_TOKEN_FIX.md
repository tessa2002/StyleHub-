# 🔐 Fix: "No Token Provided" Error

## Problem
You're seeing the error: `{"message":"No token provided"}`

This happens when trying to access protected routes without a valid authentication token.

---

## Quick Solutions

### **Solution 1: Login Again** (Quickest Fix)
1. Go to `http://localhost:3000/login`
2. Login with your credentials
3. The token will be refreshed

### **Solution 2: Check Your Login Status**
Open browser console (F12) and run:
```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('token'));

// Check if user is logged in
console.log('User:', localStorage.getItem('user'));
```

If no token is found:
- **You need to login** - Go to `/login`

If token exists but still getting error:
- **Token might be expired** - Logout and login again
- **Token format issue** - Continue to Solution 3

### **Solution 3: Clear and Re-login**
```javascript
// In browser console (F12)
localStorage.clear();
location.href = '/login';
```

Then login again with your credentials.

---

## Common Causes

### 1. **Not Logged In**
- You haven't logged in yet
- **Fix**: Go to `/login` and sign in

### 2. **Token Expired**
- JWT tokens expire after a certain time
- **Fix**: Logout and login again

### 3. **Page Refresh Issue**
- Token not restored after page refresh
- **Fix**: Check if AuthContext is wrapping your app

### 4. **Accessing Wrong Environment**
- Frontend expects token but backend doesn't have it
- **Fix**: Ensure backend is running on `http://localhost:5000`

---

## Test Your Authentication

### Step 1: Check Backend is Running
```bash
cd backend
npm start
```

Should show: `✅ Server is running on port 5000`

### Step 2: Check Frontend is Running
```bash
cd frontend
npm start
```

Should show: `Compiled successfully!`

### Step 3: Login
1. Go to `http://localhost:3000/login`
2. Use these test credentials:

**Admin:**
```
Email: admin@stylehub.local
Password: Admin@123
```

**Or Create a Customer Account:**
```
Go to: /register
Fill in details and register
```

### Step 4: Verify Token
Open browser console (F12) and check:
```javascript
localStorage.getItem('token')
```

Should show a long JWT string like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## Debugging Steps

### 1. Check if Backend is Accessible
Open: `http://localhost:5000/`

Should show: `🚀 Style Hub API is running!`

### 2. Check Current Route
```javascript
// In browser console
console.log(window.location.pathname);
```

If you're on a protected route (like `/portal/...` or `/dashboard/...`), you need to be logged in.

### 3. Check Axios Headers
```javascript
// In browser console
import axios from 'axios';
console.log(axios.defaults.headers.common);
```

Should show: `Authorization: "Bearer eyJhbGci..."

### 4. Test Auth Endpoint Directly
```bash
# Get your token from localStorage first
# Then test:
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:5000/api/auth/verify
```

---

## Where This Error Comes From

The error is thrown in two places:

### 1. **`backend/middleware/auth.js`** (Line 10)
```javascript
if (!token) return res.status(401).json({ message: 'No token provided' });
```

### 2. **`backend/routes/auth.js`** (Line 77)
```javascript
if (!token) return res.status(401).json({ message: "No token provided" });
```

---

## Protected Routes That Need Authentication

These routes require you to be logged in:

### **Customer Routes:**
- `/portal/dashboard`
- `/portal/orders`
- `/portal/new-order`
- `/portal/profile`
- `/portal/measurements`
- `/portal/appointments`
- `/portal/payments`

### **Admin Routes:**
- `/dashboard/admin`
- `/customers`
- `/orders`
- `/staff`
- `/tailors`
- `/reports`

### **Staff Routes:**
- `/dashboard/staff`
- `/staff/orders`
- `/staff/customers`

### **Tailor Routes:**
- `/dashboard/tailor`
- `/tailor/orders`

---

## Auto-Fix Script

Create this file: `frontend/src/utils/authFix.js`

```javascript
// Auto-restore token on page load
export const restoreAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    // Re-attach token to axios
    import('axios').then(({ default: axios }) => {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ Token restored to axios headers');
    });
  } else {
    console.warn('⚠️ No token found - user needs to login');
  }
};

// Call this on app initialization
if (typeof window !== 'undefined') {
  restoreAuth();
}
```

Then import it in `frontend/src/index.js`:
```javascript
import './utils/authFix';
```

---

## Prevention Tips

### 1. **Always Check Login Status**
Before accessing protected pages, check:
```javascript
const token = localStorage.getItem('token');
if (!token) {
  navigate('/login');
}
```

### 2. **Handle Token Expiration**
Add a token refresh mechanism or redirect to login when token expires.

### 3. **Use Protected Route Component**
Wrap your routes with `ProtectedRoute` component (already exists in your app).

---

## Still Not Working?

### Check These:

1. **CORS Issue?**
   - Ensure backend allows requests from frontend
   - Check `backend/server.js` has `app.use(cors())`

2. **Wrong Port?**
   - Backend should be on `http://localhost:5000`
   - Frontend should be on `http://localhost:3000`

3. **Database Connection?**
   - MongoDB might not be connected
   - Check backend logs for MongoDB connection status

4. **Environment Variables?**
   - Check `backend/.env` has `JWT_SECRET`
   - Check `frontend/.env` has `REACT_APP_API_URL` (if needed)

---

## Quick Test Commands

```bash
# Test 1: Check if backend is running
curl http://localhost:5000/

# Test 2: Try to login (replace with your email/password)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stylehub.local","password":"Admin@123"}'

# Should return a token

# Test 3: Verify token (replace TOKEN with actual token)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/auth/verify
```

---

## Need More Help?

1. **Check browser console** (F12 → Console tab)
   - Look for errors
   - Check network requests (Network tab)

2. **Check backend logs**
   - Look at terminal where backend is running
   - Should see request logs

3. **Restart both servers**
   ```bash
   # Stop both (Ctrl+C)
   # Then restart:
   
   # Terminal 1 - Backend
   cd backend
   npm start
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

---

## Summary

**Most Common Fix:**
1. Go to `http://localhost:3000/login`
2. Login with your credentials
3. Token will be set and stored
4. You can now access protected routes

**If that doesn't work:**
1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Login again

The authentication system is working correctly - you just need to ensure you're logged in before accessing protected routes! 🔐

