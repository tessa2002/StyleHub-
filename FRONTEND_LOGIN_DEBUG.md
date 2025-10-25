# 🔧 Frontend Login Debug Guide

## ✅ Backend Status: WORKING

I've confirmed the backend login works perfectly:
- ✅ Email: `tailor@gmail.com`
- ✅ Password: `tailor123`
- ✅ Backend returns valid token
- ✅ 8 orders are assigned

---

## ❌ Problem: Frontend Shows "Invalid credentials"

This means the **frontend can't connect to the backend** properly.

---

## 🚀 COMPLETE FIX (Follow ALL steps)

### Step 1: Verify Backend is Running

Open a NEW terminal and check:

```bash
cd C:\Users\HP\style_hub\backend
npm start
```

You should see:
```
✅ MongoDB connected successfully
✅ Server is running on port 5000
🔗 Local: http://localhost:5000
👤 Admin accounts found: 1
```

**Keep this terminal open!** Don't close it.

---

### Step 2: Verify Frontend is Running

Open ANOTHER NEW terminal and check:

```bash
cd C:\Users\HP\style_hub\frontend
npm start
```

Browser should open at: `http://localhost:3000`

**Keep this terminal open too!**

---

### Step 3: Test Backend Directly

Open your browser and go to:
```
http://localhost:5000
```

You should see: `🚀 Style Hub API is running!`

If you see this, backend is good! ✅

If you get "can't reach this page" ❌:
- Backend is not running
- Go back to Step 1

---

### Step 4: Clear All Browser Data

**CRITICAL:** Old data causes login issues!

1. Press `F12` (opens Developer Tools)
2. Click **Application** tab (Chrome) or **Storage** tab (Firefox)
3. In left sidebar, expand **Local Storage**
4. Click on `http://localhost:3000`
5. Right-click in the right panel → **Clear**
6. Also click **Session Storage** → Clear
7. Close Developer Tools
8. **Close ALL browser windows**
9. **Reopen browser**

---

### Step 5: Fresh Login Attempt

1. Go to: `http://localhost:3000/login`
2. **Type carefully** (copy-paste these):
   ```
   Email: tailor@gmail.com
   Password: tailor123
   ```
3. Click Login

---

## 🔍 Debug: Check What's Happening

If still getting "Invalid credentials":

### Open Browser Console:

1. Press `F12`
2. Go to **Console** tab
3. Look for red errors
4. Look for these messages:

**Good signs:**
```
🔍 Attempting login for: tailor@gmail.com
✅ Login successful, setting token and user
```

**Bad signs:**
```
❌ Login failed: Network Error
❌ Login failed: Request failed with status code 500
```

### Check Network Tab:

1. Press `F12`
2. Go to **Network** tab
3. Click Login again
4. Look for `/api/auth/login` request
5. Click on it

**Check:**
- **Request URL:** Should be `http://localhost:5000/api/auth/login`
- **Status:** Should be `200 OK` (not 500, 401, or failed)
- **Response:** Should have `{token: "...", user: {...}}`

---

## 🐛 Common Issues & Fixes

### Issue 1: Network Error
**Symptom:** Console shows "Network Error"
**Cause:** Backend not running
**Fix:** 
```bash
cd backend
npm start
```

### Issue 2: Status 500 (Server Error)
**Symptom:** Login request returns 500
**Cause:** Database not connected
**Fix:** Check backend terminal for MongoDB connection errors

### Issue 3: CORS Error
**Symptom:** Console shows "CORS policy blocked"
**Cause:** Frontend/Backend on wrong ports
**Fix:** 
- Backend should be on `http://localhost:5000`
- Frontend should be on `http://localhost:3000`

### Issue 4: Status 401 (Unauthorized)
**Symptom:** Login returns 401
**Cause:** Wrong credentials
**Fix:** 
- Double-check email: `tailor@gmail.com` (no typos!)
- Double-check password: `tailor123` (all lowercase!)
- No extra spaces at the end

### Issue 5: Request goes to wrong URL
**Symptom:** Network tab shows request to `/api/auth/login` (no localhost)
**Cause:** Frontend not configured properly
**Fix:**

Check `frontend/src/context/AuthContext.js`:
```javascript
axios.defaults.baseURL = 'http://localhost:5000';
```

---

## 🎯 Copy-Paste Test

Run this in browser console (F12 → Console):

```javascript
// Test backend connection
fetch('http://localhost:5000')
  .then(r => r.text())
  .then(text => console.log('✅ Backend response:', text))
  .catch(err => console.error('❌ Backend not reachable:', err));

// Test login
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'tailor@gmail.com',
    password: 'tailor123'
  })
})
  .then(r => r.json())
  .then(data => {
    if (data.token) {
      console.log('✅ Login SUCCESS!', data);
    } else {
      console.log('❌ Login FAILED:', data);
    }
  })
  .catch(err => console.error('❌ Login error:', err));
```

**Expected output:**
```
✅ Backend response: 🚀 Style Hub API is running!
✅ Login SUCCESS! {token: "eyJhbG...", user: {...}}
```

---

## 🔑 Exact Credentials (Copy These)

```
tailor@gmail.com
```

```
tailor123
```

---

## ⚡ Nuclear Option (Complete Reset)

If nothing works, do a complete reset:

### 1. Stop Everything
- Close all terminals
- Close browser
- Wait 10 seconds

### 2. Clean Start Backend
```bash
cd C:\Users\HP\style_hub\backend
npm start
```
Wait for: "Server is running on port 5000"

### 3. Clean Start Frontend
```bash
# NEW TERMINAL
cd C:\Users\HP\style_hub\frontend
npm start
```
Browser opens automatically

### 4. Test Backend
Browser → `http://localhost:5000`
Should see: "🚀 Style Hub API is running!"

### 5. Clear Browser
- Press `Ctrl+Shift+Delete`
- Select "Cached images and files"
- Select "Cookies and other site data"
- Click "Clear data"
- Close browser
- Reopen browser

### 6. Fresh Login
- Go to: `http://localhost:3000/login`
- Email: `tailor@gmail.com`
- Password: `tailor123`
- Click Login

---

## 📊 What Should Happen

### Successful Login:
1. Click Login button
2. Brief loading spinner
3. Redirected to: `http://localhost:3000/dashboard/tailor`
4. See dashboard with 8 orders

### Browser Console:
```
🔑 Token found: Yes
🔍 Verifying token with backend...
✅ Token verified, user: {name: "tailor", role: "Tailor"}
📊 Fetching dashboard data for tailor: 68ca325eaa09cbfa7239892a
✅ Loaded 8 orders
```

### Dashboard Display:
```
┌─────────────────────────────────────────┐
│  Total Orders: 8                        │
│  Pending: 2                             │
│  In Progress: 4                         │
│  Completed: 2                           │
└─────────────────────────────────────────┘
```

---

## 📞 Still Not Working?

Provide these details:

1. **Backend terminal output** (screenshot or copy)
2. **Frontend terminal output** (screenshot or copy)
3. **Browser console errors** (F12 → Console, screenshot)
4. **Network tab** (F12 → Network → login request, screenshot)
5. **What you see when you go to:** `http://localhost:5000`

---

## ✅ Checklist

- [ ] Backend terminal shows "Server is running on port 5000"
- [ ] Frontend terminal shows "webpack compiled successfully"
- [ ] `http://localhost:5000` shows "API is running"
- [ ] `http://localhost:3000` shows login page
- [ ] Browser cache cleared
- [ ] Local Storage cleared
- [ ] Using exact credentials: tailor@gmail.com / tailor123
- [ ] No spaces before/after email or password
- [ ] F12 console shows no red errors
- [ ] Network tab shows login request to correct URL

**If ALL checked and still fails:** There's a network/configuration issue. Check firewall settings.

---

**Password is 100% correct:** `tailor123`  
**Email is 100% correct:** `tailor@gmail.com`  
**Backend verified:** Working ✅  
**Your action:** Clear cache + Fresh login

