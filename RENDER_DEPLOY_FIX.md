# Render Deployment Fix - Build & Directory Issues

## Common Errors

### Error 1: `Publish directory build does not exist!`
**Cause**: Service is configured as a Static Site instead of Web Service

### Error 2: `react-scripts: not found`
**Cause**: Build command is not navigating to frontend directory or installing dependencies

## Root Cause
The service needs proper configuration for a monorepo structure where the backend serves the frontend.

## Solution

### Quick Fix: Update Service Type

1. **Go to Render Dashboard** → Your Service
2. **Check Service Type**: It should say "Web Service" not "Static Site"
3. **If it's a Static Site**: You need to delete it and create a Web Service instead

### Create New Web Service (If Needed)

1. **Go to** [Render Dashboard](https://dashboard.render.com/)
2. **Click** "New +" → "Web Service"
3. **Connect** your GitHub repository
4. **Configure** with these exact settings:

```
Name: stylehub
Runtime: Node
Region: Singapore (or your preference)
Branch: main (or your default branch)

Build Command: 
cd frontend && npm install && npm run build && cd ../backend && npm install

Start Command:
cd backend && node server.js

Publish Directory: 
[LEAVE BLANK - DO NOT SET THIS]
```

5. **Add Environment Variables**:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `MONGODB_URI` = your MongoDB connection string
   - `JWT_SECRET` = generate a secure random string
   - `RAZORPAY_KEY_ID` = your Razorpay key
   - `RAZORPAY_KEY_SECRET` = your Razorpay secret

### Important Notes

- ✅ **DO NOT** set a "Publish Directory" - this is for static sites only
- ✅ Your backend will serve the frontend from `backend/../frontend/build`
- ✅ All API routes will be at `/api/*`
- ✅ All frontend routes will be handled by the React Router

## Why This Happens

Your `render.yaml` is correct, but if you created the service manually through the dashboard, you might have selected "Static Site" by mistake. The error "Publish directory build does not exist" only appears for static sites.

## Verify Deployment

After deployment, visit:
- `https://your-app.onrender.com/` - Should show your React app
- `https://your-app.onrender.com/api/` - Should show "Style Hub API is running!"

## Alternative: Using render.yaml

If you want to use the `render.yaml` file for automatic deployment:

1. Go to Render Dashboard → "New +" → "Blueprint"
2. Connect your repository
3. Render will automatically read the `render.yaml` file
4. Add your environment variables manually

Your existing `render.yaml` is already configured correctly!

## Still Having Issues?

Check these:
1. Verify service type is "Web Service" not "Static Site"
2. Ensure "Publish Directory" field is empty/blank
3. Confirm build command includes `npm run build` for frontend
4. Verify start command points to backend: `cd backend && node server.js`
5. Check build logs for any npm install or build errors

---

**Quick Checklist:**
- [ ] Service type is Web Service ✓
- [ ] Publish Directory is BLANK ✓
- [ ] Build command includes frontend build ✓
- [ ] Start command runs backend server ✓
- [ ] Environment variables are set ✓

