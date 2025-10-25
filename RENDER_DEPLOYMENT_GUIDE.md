# 🚀 Render Deployment Guide - StyleHub

Complete guide to deploy your StyleHub application on Render.

---

## 📋 **Prerequisites**

- ✅ GitHub repository with your code
- ✅ Render account (free tier available)
- ✅ MongoDB Atlas account (or other MongoDB hosting)
- ✅ Razorpay API keys

---

## 🔙 **Backend Deployment (Node.js/Express)**

### **Option 1: Using Render Dashboard (Recommended for First Time)**

1. **Login to Render:** https://render.com

2. **Create New Web Service:**
   - Click "+ New" → "Web Service"
   - Connect your GitHub repository
   - Select `tessa2002/StyleHub-`

3. **Configure Backend:**
   ```
   Name:               stylehub-backend
   Region:             Singapore (or closest to you)
   Branch:             master
   Root Directory:     backend
   Runtime:            Node
   Build Command:      npm install
   Start Command:      npm start
   Instance Type:      Free
   ```

4. **Add Environment Variables:**
   
   Click "Advanced" → "Add Environment Variable":
   
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key_minimum_32_characters
   DEFAULT_ADMIN_EMAIL=admin@stylehub.local
   DEFAULT_ADMIN_PASSWORD=Admin@123
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

   **Important:** 
   - Replace `your_mongodb_connection_string` with your actual MongoDB Atlas URI
   - Replace `your_jwt_secret_key_minimum_32_characters` with a strong random string
   - Replace Razorpay keys with your actual keys

5. **Click "Create Web Service"**

6. **Wait for Deployment** (3-5 minutes)

7. **Copy Your Backend URL:** 
   - Example: `https://stylehub-backend.onrender.com`
   - You'll need this for the frontend!

---

## 🎨 **Frontend Deployment (React Static Site)**

### **Option 1: Using Render Dashboard**

1. **Create New Static Site:**
   - Click "+ New" → "Static Site"
   - Select your GitHub repository

2. **Configure Frontend:**
   ```
   Name:                  stylehub-frontend
   Region:                Singapore (same as backend)
   Branch:                master
   Root Directory:        frontend
   Build Command:         npm install && npm run build
   Publish Directory:     build
   Auto-Deploy:           Yes
   ```

3. **Add Environment Variable:**
   
   Click "Advanced" → "Add Environment Variable":
   
   ```
   REACT_APP_API_URL=https://stylehub-backend.onrender.com
   ```
   
   **⚠️ IMPORTANT:** Replace with YOUR actual backend URL from step 7 above!

4. **Add Rewrite Rule for React Router:**
   
   Click "Redirects/Rewrites" → "Add Rule":
   ```
   Source:        /*
   Destination:   /index.html
   Action:        Rewrite
   ```

5. **Click "Create Static Site"**

6. **Wait for Build** (3-5 minutes)

---

## 🔧 **Fix: "Publish directory build does not exist"**

If you get this error, here's the fix:

### **Method 1: Update package.json (if needed)**

Check your `frontend/package.json` has this:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### **Method 2: Correct Render Settings**

1. Go to your Static Site dashboard
2. Click "Settings"
3. Verify these settings:
   - **Root Directory:** `frontend` (NOT empty!)
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build` (NOT `frontend/build`!)

4. Click "Save Changes"
5. Click "Manual Deploy" → "Deploy latest commit"

### **Method 3: Check Build Logs**

1. Click on your deployment
2. View the build logs
3. Look for errors in the npm install or build process
4. Common issues:
   - Missing dependencies
   - TypeScript errors
   - ESLint errors set to fail build
   - Out of memory (upgrade plan)

---

## 🌐 **Update Frontend to Use Backend URL**

### **Option A: Using Environment Variable (Recommended)**

1. **Create `.env.production` in frontend folder:**

```env
REACT_APP_API_URL=https://stylehub-backend.onrender.com
```

2. **Update your axios config:**

In `frontend/src/setupProxy.js` or wherever you configure axios:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

axios.defaults.baseURL = API_URL;
```

### **Option B: Direct Configuration**

Update all API calls from:
```javascript
axios.get('/api/orders')
```

To:
```javascript
axios.get('https://stylehub-backend.onrender.com/api/orders')
```

---

## 🔐 **CORS Configuration**

Update your **backend** `server.js` to allow frontend domain:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',  // Local development
    'https://stylehub-frontend.onrender.com'  // Production - Replace with YOUR frontend URL
  ],
  credentials: true
}));
```

---

## 🗄️ **MongoDB Atlas Setup** (If Not Already Done)

1. **Create Account:** https://www.mongodb.com/cloud/atlas

2. **Create Cluster:**
   - Choose FREE tier (M0)
   - Select region close to Render (Singapore)
   - Name: `stylehub-cluster`

3. **Create Database User:**
   - Username: `stylehub_admin`
   - Password: (generate strong password)
   - Save these credentials!

4. **Whitelist IP:**
   - Click "Network Access"
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, use Render's IP addresses

5. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `stylehub`

Example:
```
mongodb+srv://stylehub_admin:YourPassword@stylehub-cluster.xxxxx.mongodb.net/stylehub?retryWrites=true&w=majority
```

6. **Add to Render Environment Variables:**
   - Go to backend service on Render
   - Add `MONGODB_URI` with the connection string

---

## 🧪 **Testing Your Deployment**

### **1. Test Backend:**

```bash
# Health check
curl https://stylehub-backend.onrender.com/

# Test API endpoint
curl https://stylehub-backend.onrender.com/api/auth/test
```

### **2. Test Frontend:**

Visit: `https://stylehub-frontend.onrender.com`

Try:
- ✅ Login page loads
- ✅ Can login with credentials
- ✅ Dashboard appears
- ✅ No CORS errors in console

---

## ⚡ **Common Issues & Solutions**

### **Issue 1: Build Fails with "Module not found"**

**Solution:**
```bash
# Delete node_modules and package-lock.json, then reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Issue 2: CORS Error**

**Solution:**
- Update backend CORS settings to include frontend URL
- Ensure credentials: true if using cookies/sessions

### **Issue 3: Environment Variables Not Working**

**Solution:**
- Must start with `REACT_APP_` for React
- Rebuild after adding env vars
- Check logs to verify they're loaded

### **Issue 4: Routes Don't Work (404 on Refresh)**

**Solution:**
- Add rewrite rule in Render: `/*` → `/index.html`
- This makes React Router work properly

### **Issue 5: "Out of Memory" During Build**

**Solution:**
- Upgrade to paid plan ($7/month)
- Or reduce build size:
  - Remove unused dependencies
  - Use code splitting
  - Optimize images

### **Issue 6: Slow First Load**

**Solution:**
- Free tier services sleep after 15 minutes of inactivity
- First request wakes it up (30-60 seconds)
- Upgrade to paid plan for always-on

---

## 📊 **Monitoring Your Deployment**

### **Check Deployment Status:**
1. Go to Render Dashboard
2. Click on your service
3. View "Events" tab for deployment history
4. View "Logs" tab for runtime logs

### **View Logs:**
```bash
# In Render dashboard
1. Click your service
2. Click "Logs" tab
3. View real-time logs
```

---

## 🔄 **Auto-Deploy on Git Push**

Render automatically deploys when you push to GitHub!

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin master

# Render will automatically:
# 1. Detect the push
# 2. Run build command
# 3. Deploy new version
# 4. Show in Events tab
```

---

## 💰 **Cost Breakdown**

### **Free Tier:**
- ✅ Backend Web Service: FREE
- ✅ Frontend Static Site: FREE  
- ✅ Total: $0/month

**Limitations:**
- Services sleep after 15 min inactivity
- Limited compute resources
- 750 hours/month free

### **Paid Tier ($7/month per service):**
- ✅ Always-on (no sleep)
- ✅ More resources
- ✅ Custom domains
- ✅ Better performance

---

## 📝 **Deployment Checklist**

Before deploying, ensure:

- [ ] `.env` files NOT in git (they're in `.gitignore`)
- [ ] MongoDB connection string ready
- [ ] JWT secret generated (32+ characters)
- [ ] Razorpay keys available
- [ ] Backend CORS configured for frontend URL
- [ ] Frontend API URL points to backend
- [ ] React Router rewrite rule added
- [ ] Build works locally (`npm run build`)
- [ ] All tests passing
- [ ] Environment variables added to Render

---

## 🎯 **Quick Deploy Commands**

```bash
# Test locally before deploying
cd backend
npm install
npm start

# In new terminal
cd frontend
npm install
npm run build
serve -s build

# Push to GitHub (triggers auto-deploy)
git add .
git commit -m "Deploy to Render"
git push origin master
```

---

## 🆘 **Need Help?**

1. **Check Render Logs:**
   - Dashboard → Your Service → Logs

2. **Render Documentation:**
   - https://render.com/docs

3. **Common Issues:**
   - https://render.com/docs/troubleshooting-deploys

4. **Render Community:**
   - https://community.render.com

---

## 🎉 **Success!**

Your StyleHub should now be live at:
- **Frontend:** `https://stylehub-frontend.onrender.com`
- **Backend:** `https://stylehub-backend.onrender.com`

Share your deployed app with the world! 🌍

---

**Last Updated:** October 25, 2025

