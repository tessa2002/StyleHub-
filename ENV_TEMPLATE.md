# Environment Variables Template for Production

## 🔧 **Backend Environment Variables (Render)**

Add these in Render Dashboard → Backend Service → Environment:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/stylehub?retryWrites=true&w=majority
JWT_SECRET=your_very_long_secret_key_minimum_32_characters_here
DEFAULT_ADMIN_EMAIL=admin@stylehub.local
DEFAULT_ADMIN_PASSWORD=Admin@123
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

---

## 🎨 **Frontend Environment Variables (Render)**

Add these in Render Dashboard → Static Site → Environment:

```
REACT_APP_API_URL=https://your-backend-name.onrender.com
NODE_ENV=production
```

**⚠️ Important:** 
- Replace `your-backend-name` with your actual backend service name from Render
- Example: `https://stylehub-backend-xyz123.onrender.com`

---

## 📝 **How to Add Environment Variables in Render:**

1. Go to https://dashboard.render.com
2. Click on your service (Backend or Frontend)
3. Click "Environment" in the left sidebar
4. Click "Add Environment Variable"
5. Enter Key and Value
6. Click "Save Changes"
7. Service will automatically redeploy

---

## 🔒 **Security Notes:**

- ✅ Never commit `.env` files to GitHub
- ✅ Use strong, unique secrets for production
- ✅ Rotate keys regularly
- ✅ Use different credentials for dev/prod
- ✅ Keep MongoDB credentials secure

