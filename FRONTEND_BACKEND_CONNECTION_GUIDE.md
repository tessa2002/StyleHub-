# 🔗 Frontend-Backend Connection Guide

## Overview
Your Style Hub application has been successfully configured with:
- **Backend**: Node.js/Express API running on port 5000
- **Frontend**: React application running on port 3000
- **ML Integration**: 5 machine learning models integrated in the backend
- **Proxy Setup**: Automatic API request routing from frontend to backend

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     STYLE HUB APPLICATION                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐                  ┌──────────────────────┐
│   FRONTEND (React)   │                  │  BACKEND (Node.js)   │
│   Port: 3000         │◄────────────────►│   Port: 5000         │
│                      │   Proxy Setup    │                      │
│  • React UI          │   /api → 5000    │  • Express Server    │
│  • Components        │   /uploads →     │  • REST API          │
│  • ML Service        │      5000        │  • ML Models         │
│  • Auth Context      │                  │  • Auth Middleware   │
└──────────────────────┘                  └──────────────────────┘
         │                                           │
         │                                           │
         │                                  ┌────────▼────────┐
         │                                  │    MongoDB      │
         │                                  │  Port: 27017    │
         │                                  └─────────────────┘
         │
         └──────────────────────────────────────────────────────►
                    Browser (http://localhost:3000)
```

---

## 📋 Prerequisites

### 1. **MongoDB** (Required)
```powershell
# Check if MongoDB is running
mongosh --eval "db.version()"
```
If MongoDB is not installed:
- Download from: https://www.mongodb.com/try/download/community
- Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### 2. **Node.js & npm** (Already installed ✓)
```powershell
# Verify installation
node --version  # Should be v14 or higher
npm --version
```

---

## 🚀 Quick Start - Running the Application

### Step 1: Kill Any Existing Server Process
```powershell
# Find and kill process on port 5000 (backend)
netstat -ano | findstr :5000
# Note the PID and kill it:
taskkill /PID <PID_NUMBER> /F

# Find and kill process on port 3000 (frontend)
netstat -ano | findstr :3000
# Note the PID and kill it:
taskkill /PID <PID_NUMBER> /F
```

### Step 2: Start Backend Server

**Option A: Open Terminal 1 (PowerShell/CMD)**
```powershell
cd C:\Users\HP\style_hub\backend
npm start
```

**Option B: Development mode with auto-reload**
```powershell
cd C:\Users\HP\style_hub\backend
npm run dev
```

**Expected Output:**
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
Environment: development
```

### Step 3: Start Frontend Server

**Open Terminal 2 (PowerShell/CMD)**
```powershell
cd C:\Users\HP\style_hub\frontend
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

### Step 4: Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🔌 Connection Configuration

### Backend Configuration (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stylehub
JWT_SECRET=your_jwt_secret_key_change_this_in_production
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
NODE_ENV=development
```

### Frontend Configuration (`frontend/.env`)
```env
REACT_APP_API_URL=
PORT=3000
BROWSER=none
```

### Proxy Setup (`frontend/src/setupProxy.js`)
```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    ['/api', '/uploads'],
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};
```

**How it works:**
- When frontend makes a request to `/api/auth/login`, the proxy automatically forwards it to `http://localhost:5000/api/auth/login`
- No need to specify the full backend URL in frontend code
- Avoids CORS issues during development

---

## 🔄 Complete Workflow

### 1. **User Authentication Flow**

```javascript
// Frontend: Login Component
import axios from 'axios';

const handleLogin = async (email, password) => {
  try {
    // Request goes to /api/auth/login
    // Proxy forwards to http://localhost:5000/api/auth/login
    const response = await axios.post('/api/auth/login', {
      email,
      password
    });
    
    // Store token
    localStorage.setItem('token', response.data.token);
    
    // Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### 2. **ML Model Integration Flow**

```javascript
// Frontend: Using ML Service
import mlService from '../services/mlService';

const predictCustomerPreference = async (customerData) => {
  try {
    const result = await mlService.predictCustomerPreference({
      previousOrders: 5,
      avgOrderValue: 3500,
      fabricPreference: 1, // 0: Cotton, 1: Silk, 2: Wool
      designComplexity: 2
    });
    
    console.log('Predicted preference:', result.prediction);
    // Use the prediction in your UI
  } catch (error) {
    console.error('Prediction failed:', error);
  }
};
```

### 3. **Data Flow Example: Creating an Order**

```
1. User fills order form in React → frontend/src/pages/Orders.js
                ↓
2. Submit button triggers API call → axios.post('/api/orders', orderData)
                ↓
3. Proxy forwards request → http://localhost:5000/api/orders
                ↓
4. Backend receives request → backend/routes/orders.js
                ↓
5. Auth middleware validates token → backend/middleware/auth.js
                ↓
6. Order controller processes → backend/controllers/orderController.js
                ↓
7. ML models may be called → backend/ml/models/
                ↓
8. Data saved to MongoDB → Order.save()
                ↓
9. Response sent back → { success: true, order: {...} }
                ↓
10. Frontend receives response → Update UI with new order
```

---

## 🧪 Testing the Connection

### Test 1: Backend Health Check
```powershell
# In a new terminal
curl http://localhost:5000/api/health

# Or in browser
http://localhost:5000/api/health
```

### Test 2: Frontend API Call
```javascript
// Add this to any React component temporarily
useEffect(() => {
  fetch('/api/health')
    .then(res => res.json())
    .then(data => console.log('Backend connected:', data))
    .catch(err => console.error('Connection failed:', err));
}, []);
```

### Test 3: ML Models
```powershell
cd C:\Users\HP\style_hub\backend
node ml/test-ml-models.js
```

---

## 🎯 ML Features Available

### 1. **Customer Preference Classification (KNN)**
```javascript
// API Endpoint
POST /api/ml/knn/predict

// Frontend Usage
const preference = await mlService.predictCustomerPreference({
  previousOrders: 10,
  avgOrderValue: 5000,
  fabricPreference: 1,
  designComplexity: 3
});
```

### 2. **Fabric Type Recommendation (Naïve Bayes)**
```javascript
// API Endpoint
POST /api/ml/naivebayes/predict

// Frontend Usage
const fabric = await mlService.recommendFabricType({
  season: 2,        // 0: Spring, 1: Summer, 2: Fall, 3: Winter
  occasion: 1,      // 0: Casual, 1: Formal, 2: Party
  priceRange: 2,    // 0: Budget, 1: Mid, 2: Premium
  skinTone: 1       // 0: Fair, 1: Medium, 2: Dark
});
```

### 3. **Tailor Allocation (Decision Tree)**
```javascript
// API Endpoint
POST /api/ml/decisiontree/predict

// Frontend Usage
const tailor = await mlService.allocateTailor({
  orderComplexity: 3,
  fabricType: 1,
  deadline: 7,
  specialRequirements: 1
});
```

### 4. **Order Delay Risk Detection (SVM)**
```javascript
// API Endpoint
POST /api/ml/svm/predict

// Frontend Usage
const delayRisk = await mlService.detectOrderDelay({
  orderComplexity: 2,
  fabricAvailability: 1,
  tailorWorkload: 4,
  seasonalDemand: 3,
  customizationLevel: 2
});
```

### 5. **Customer Satisfaction Prediction (BPNN)**
```javascript
// API Endpoint
POST /api/ml/bpnn/predict

// Frontend Usage
const satisfaction = await mlService.predictCustomerSatisfaction({
  orderAccuracy: 0.95,
  deliveryTime: 5,
  fabricQuality: 4,
  designComplexity: 3,
  priceValue: 4,
  customerService: 5,
  previousExperience: 4
});
```

---

## 📁 Project Structure

```
style_hub/
│
├── backend/                    # Node.js Backend
│   ├── server.js              # Main server file
│   ├── .env                   # Environment variables ✨ NEW
│   ├── package.json           # Backend dependencies
│   │
│   ├── routes/                # API Routes
│   │   ├── auth.js           # Authentication routes
│   │   ├── orders.js         # Order management
│   │   ├── ml.js             # ML model endpoints ✨ NEW
│   │   └── ...
│   │
│   ├── models/                # Mongoose Models
│   │   ├── User.js
│   │   ├── Order.js
│   │   ├── MLModel.js        # ML model storage ✨ NEW
│   │   └── ...
│   │
│   ├── ml/                    # ML Integration ✨ NEW
│   │   ├── models/           # ML model implementations
│   │   │   ├── knn-customer-preference.js
│   │   │   ├── naivebayes-fabric-recommendation.js
│   │   │   ├── decisiontree-tailor-allocation.js
│   │   │   ├── svm-order-delay.js
│   │   │   └── bpnn-satisfaction-prediction.js
│   │   │
│   │   ├── data/             # Training data generators
│   │   │   └── training-data-generator.js
│   │   │
│   │   ├── test-ml-models.js # Test script
│   │   └── README.md         # ML documentation
│   │
│   └── middleware/           # Express middleware
│       └── auth.js          # JWT authentication
│
├── frontend/                  # React Frontend
│   ├── package.json          # Frontend dependencies
│   ├── .env                  # Frontend environment ✨ NEW
│   │
│   ├── public/               # Static files
│   │   └── index.html
│   │
│   └── src/
│       ├── App.js           # Main App component
│       ├── setupProxy.js    # Proxy configuration ✓
│       │
│       ├── components/      # React components
│       │   ├── AdminDashboard.js
│       │   ├── CustomerDashboard.js
│       │   └── ...
│       │
│       ├── pages/           # Page components
│       │   ├── Login.js
│       │   ├── Orders.js
│       │   └── ...
│       │
│       ├── services/        # API Services
│       │   └── mlService.js # ML API client ✨ NEW
│       │
│       └── context/         # React Context
│           └── AuthContext.js
│
└── Documentation/             # Project documentation
    ├── FRONTEND_BACKEND_CONNECTION_GUIDE.md ✨ YOU ARE HERE
    ├── ML_INTEGRATION_COMPLETE.md
    ├── START_HERE.md
    └── ...
```

---

## 🛠️ Troubleshooting

### Issue 1: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```powershell
# Find the process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace <PID> with actual process ID)
taskkill /PID <PID> /F

# Restart the backend
cd C:\Users\HP\style_hub\backend
npm start
```

### Issue 2: MongoDB Connection Failed
**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
```powershell
# Start MongoDB service
net start MongoDB

# Or check if MongoDB is installed
mongosh --version

# Alternative: Use MongoDB Atlas (cloud)
# Update backend/.env with your Atlas connection string
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stylehub
```

### Issue 3: Cannot Connect to Backend from Frontend
**Error:** `Network Error` or `CORS Error`

**Solution:**
1. Ensure backend is running on port 5000
2. Check `backend/.env` has `CORS_ORIGIN=http://localhost:3000`
3. Verify `frontend/src/setupProxy.js` exists
4. Restart both servers

### Issue 4: ML Model Not Found
**Error:** `Model not trained yet`

**Solution:**
```powershell
# Train the models first
cd C:\Users\HP\style_hub\backend

# Option 1: Run test script (trains all models)
node ml/test-ml-models.js

# Option 2: Train via API
# Use Postman or curl to POST to /api/ml/knn/train, etc.
```

### Issue 5: Module Not Found Errors
**Error:** `Cannot find module 'xyz'`

**Solution:**
```powershell
# Reinstall backend dependencies
cd C:\Users\HP\style_hub\backend
npm install

# Reinstall frontend dependencies
cd C:\Users\HP\style_hub\frontend
npm install
```

---

## 🔐 Security Notes

### Development vs Production

**Development (Current Setup):**
- CORS allows localhost:3000
- JWT secret in .env file
- No HTTPS required
- MongoDB on localhost

**Production (Future):**
- Update `CORS_ORIGIN` to your production domain
- Use strong JWT secret (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Enable HTTPS
- Use MongoDB Atlas or secured MongoDB instance
- Set `NODE_ENV=production`

---

## 📞 API Endpoints Reference

### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/me            - Get current user
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Orders
```
GET    /api/orders             - Get all orders
POST   /api/orders             - Create new order
GET    /api/orders/:id         - Get order by ID
PUT    /api/orders/:id         - Update order
DELETE /api/orders/:id         - Delete order
```

### ML Models
```
POST   /api/ml/knn/train                    - Train KNN model
POST   /api/ml/knn/predict                  - Predict customer preference
GET    /api/ml/knn/status                   - Get model status

POST   /api/ml/naivebayes/train             - Train Naïve Bayes
POST   /api/ml/naivebayes/predict           - Recommend fabric
GET    /api/ml/naivebayes/status

POST   /api/ml/decisiontree/train           - Train Decision Tree
POST   /api/ml/decisiontree/predict         - Allocate tailor
GET    /api/ml/decisiontree/status

POST   /api/ml/svm/train                    - Train SVM
POST   /api/ml/svm/predict                  - Detect delay risk
GET    /api/ml/svm/status

POST   /api/ml/bpnn/train                   - Train Neural Network
POST   /api/ml/bpnn/predict                 - Predict satisfaction
GET    /api/ml/bpnn/status

GET    /api/ml/all-models-status            - Get all models status
POST   /api/ml/train-all-models             - Train all models at once
```

---

## 🎓 Next Steps

1. **✅ Start both servers** (backend + frontend)
2. **🧪 Test the connection** (visit http://localhost:3000)
3. **🤖 Train ML models** (run `node ml/test-ml-models.js`)
4. **🎨 Integrate ML in UI** (see `FRONTEND_INTEGRATION_EXAMPLES.md`)
5. **📊 Build dashboards** (use ML predictions in admin panel)
6. **🚀 Deploy to production** (see `DEPLOYMENT_GUIDE.md`)

---

## 📚 Additional Resources

- **ML Integration Details:** `backend/ml/README.md`
- **Frontend Examples:** `FRONTEND_INTEGRATION_EXAMPLES.md`
- **Deployment Guide:** `DEPLOYMENT_GUIDE.md`
- **Test ML Models:** `backend/ml/test-ml-models.js`

---

## ✅ Checklist

Before starting development, ensure:

- [ ] MongoDB is running
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] `.env` files created in both backend and frontend
- [ ] No processes running on ports 5000 and 3000
- [ ] Backend starts successfully on port 5000
- [ ] Frontend starts successfully on port 3000
- [ ] Can access http://localhost:3000 in browser
- [ ] ML models trained (run test script)

---

**🎉 You're all set! Your frontend and backend are now connected and ready to use.**

For ML-specific workflows, see the next section or `ML_WORKFLOW.md`.








