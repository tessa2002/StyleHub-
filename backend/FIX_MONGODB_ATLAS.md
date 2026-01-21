# 🔧 Fix MongoDB Atlas Connection

## ❌ Current Error:
```
ENOTFOUND _mongodb._tcp.cluster0.satblbp.mongodb.net
```

This means your MongoDB Atlas cluster cannot be found. The cluster might be:
- Paused
- Deleted
- Wrong cluster name in connection string

---

## ✅ SOLUTION: Get Fresh Connection String from MongoDB Atlas

### Step 1: Go to MongoDB Atlas
1. Open https://cloud.mongodb.com
2. Log in to your account

### Step 2: Check Your Cluster
1. Click **"Clusters"** in the left sidebar
2. Look at your cluster:
   - **Green status** = Running ✅
   - **Paused** = Click **"Resume"** button
   - **No cluster** = Create a new free cluster

### Step 3: Get Connection String
1. Click **"Connect"** button on your cluster
2. Choose **"Connect your application"**
3. Select **Node.js** and version **5.5 or later**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 4: Update Your .env File
1. Open `backend/.env`
2. Replace the `MONGODB_URI` line with your NEW connection string
3. **IMPORTANT:** Change the database name from `/?` to `/stylehub?`
   - Example: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/stylehub?retryWrites=true&w=majority`
4. Save the file

### Step 5: Verify Database User
1. In MongoDB Atlas, go to **Database Access** (left sidebar)
2. Find your database user
3. Make sure the username and password match what's in your connection string

### Step 6: Whitelist Your IP
1. In MongoDB Atlas, go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Add Current IP Address"** (or use `0.0.0.0/0` for testing)
4. Click **"Confirm"**

### Step 7: Test Connection
Run this command:
```powershell
cd C:\Users\HP\style_hub\backend
node test-mongodb-connection.js
```

You should see:
```
✅ MongoDB connected successfully!
```

### Step 8: Restart Backend
```powershell
npm start
```

You should see:
```
✅ MongoDB connected successfully
📊 Database: stylehub
✅ Server is running on port 5000
```

---

## 🎯 After Fixing: Test Login

1. Go to `http://localhost:3000/login`
2. Try logging in with existing credentials
3. Login should work! ✅


