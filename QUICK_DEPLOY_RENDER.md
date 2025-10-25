# ⚡ Quick Deploy to Render - StyleHub

## 🚀 **Frontend Fix - 3 Simple Steps**

### **Step 1: Update Your Render Settings**

1. Go to https://dashboard.render.com
2. Click on your **Frontend** service
3. Click "Settings" on the left

### **Step 2: Verify These Settings**

```
Name:               stylehub-frontend
Root Directory:     frontend          ← MUST BE "frontend" not empty!
Build Command:      npm install && npm run build
Publish Directory:  build             ← Just "build", NOT "frontend/build"
```

If any are wrong, update them and click "Save Changes"

### **Step 3: Add Environment Variable**

1. Still in Settings, scroll to "Environment Variables"
2. Click "Add Environment Variable"
3. Add this:
   ```
   Key:   REACT_APP_API_URL
   Value: https://your-backend-name.onrender.com
   ```
   **⚠️ Replace** `your-backend-name` with YOUR actual backend URL!

4. Click "Save Changes"
5. Click "Manual Deploy" → "Deploy latest commit"

---

## ✅ **What We Fixed**

1. ✅ Added `render.yaml` configuration
2. ✅ Updated AuthContext to use environment variables
3. ✅ Created deployment guides
4. ✅ Pushed everything to GitHub

---

## 🔧 **Backend Quick Setup**

If backend isn't deployed yet:

1. New Web Service
2. Connect GitHub repo
3. Settings:
   ```
   Root Directory: backend
   Build Command:  npm install
   Start Command:  npm start
   ```
4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_long_secret_key_32_characters
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

---

## 📊 **Check Build Logs**

If deployment fails:

1. Go to your service
2. Click "Events" tab
3. Click on the failed deployment
4. View logs to see the error
5. Common issues:
   - Root Directory not set to "frontend"
   - Missing environment variables
   - Build command incorrect

---

## 🎯 **Expected Build Output**

You should see:
```
==> Building...
✓ npm install completed
✓ npm run build completed
✓ Creating build directory... done
✓ Build successful!
==> Deploying...
✓ Deploy successful!
```

---

## 📝 **Full Guide**

For detailed instructions, see:
- `RENDER_DEPLOYMENT_GUIDE.md` - Complete step-by-step guide
- `ENV_TEMPLATE.md` - Environment variables template
- `render.yaml` - Automatic configuration

---

## 🆘 **Still Having Issues?**

1. **Check Root Directory:** MUST be "frontend" for frontend service
2. **Check Build Command:** Must include both install and build
3. **Check Publish Directory:** Just "build", nothing else
4. **Check Environment Variables:** REACT_APP_API_URL must be set
5. **View Logs:** Look for specific error messages

---

## ✨ **After Successful Deploy**

Your app will be live at:
- Frontend: `https://your-app-name.onrender.com`
- Backend: `https://your-backend-name.onrender.com`

Test by:
1. Visit frontend URL
2. Try to login
3. Check browser console for CORS errors
4. Verify API calls work

---

**Ready to deploy?** Follow the 3 steps above and your app will be live! 🚀

