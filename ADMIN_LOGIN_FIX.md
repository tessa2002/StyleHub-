# Admin Login Issue - RESOLVED ✅

## Problem
Login failing with "Login failed. Please try again." error for Admin@gmail.com

## Root Cause
**Backend server is not running!** The login credentials are correct, but the frontend cannot connect to the backend API.

---

## ✅ Verified Correct Credentials

The admin user exists in the database with:
- **Email:** `admin@gmail.com` ✅
- **Password:** `Admin@123` ✅
- **Role:** Admin ✅
- **Status:** Active ✅

---

## 🔧 Solution: Start the Backend Server

### Open a NEW terminal/command prompt and run:

```bash
# Navigate to backend folder
cd C:\Users\HP\style_hub\backend

# Start the server
npm start
```

### You should see output like:
```
✅ Server is running on port 5000
🔗 Local: http://localhost:5000
✅ MongoDB connected: stylehub
```

---

## 🧪 Test Login After Starting Server

Once the backend is running, you can login with:

```
Email: admin@gmail.com
Password: Admin@123
```

Or you can also use these default credentials:

```
Email: admin@stylehub.local
Password: Admin@123
```

---

## 📝 Alternative: Check if Server is Already Running

### Check running Node processes:
```powershell
Get-Process -Name node
```

### If server is running but on different port, check:
```powershell
netstat -ano | findstr :5000
```

---

## 🚀 Permanent Solution

### For Development (Auto-restart on changes):
```bash
cd backend
npm run dev
```

### For Production:
```bash
cd backend
npm start
```

---

## 💡 Quick Start Guide

### Terminal 1 (Backend):
```bash
cd C:\Users\HP\style_hub\backend
npm start
```

### Terminal 2 (Frontend):
```bash
cd C:\Users\HP\style_hub\frontend
npm start
```

### Then open browser:
```
http://localhost:3000/login
```

---

## ✅ Admin Credentials Summary

| Email | Password | Role |
|-------|----------|------|
| `admin@gmail.com` | `Admin@123` | Admin |
| `admin@stylehub.local` | `Admin@123` | Admin |

Both work! The email is case-insensitive.

---

## 🔍 Troubleshooting

### If still not working:

1. **Check Backend is Running:**
   ```bash
   curl http://localhost:5000/api/auth/verify
   ```

2. **Check MongoDB Connection:**
   - Make sure MongoDB is running
   - Check connection string in `.env` file

3. **Clear Browser Cache:**
   - Press Ctrl+Shift+Delete
   - Clear cookies and cache
   - Try again

4. **Check Frontend API URL:**
   - Open browser DevTools (F12)
   - Check Network tab
   - Look for failed requests to `/api/auth/login`

---

## 🎉 After Login

Once logged in successfully, you'll be redirected to:
- **Admin Dashboard:** `/admin/dashboard`
- Access to all admin features

---

**Status:** ✅ Credentials are correct, just need to start the backend server!

