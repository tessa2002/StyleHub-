# 🚀 Quick Start Guide - Style Hub with ML Integration

## 🎯 Goal
Connect and run your frontend and backend servers with integrated ML models.

---

## ⚡ Quick Start (3 Steps)

### Option 1: Automated (Recommended)

**Double-click this file:**
```
START_SERVERS.bat
```

This will:
1. Kill any existing processes on ports 3000 and 5000
2. Start backend server (port 5000)
3. Start frontend server (port 3000)
4. Open both in separate windows

**Then:**
- Wait 10-15 seconds for servers to start
- Open browser: http://localhost:3000
- Done! ✅

---

### Option 2: Manual

**Terminal 1 (Backend):**
```powershell
cd C:\Users\HP\style_hub\backend
npm start
```

**Terminal 2 (Frontend):**
```powershell
cd C:\Users\HP\style_hub\frontend
npm start
```

**Browser:**
```
http://localhost:3000
```

---

## 📊 Visual Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPLETE WORKFLOW                          │
└─────────────────────────────────────────────────────────────┘

Step 1: START SERVERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Backend (Terminal 1)          Frontend (Terminal 2)
  ├── cd backend                ├── cd frontend
  ├── npm start                 ├── npm start
  └── ✅ Port 5000              └── ✅ Port 3000


Step 2: USER INTERACTS WITH FRONTEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Browser (http://localhost:3000)
  │
  ├─ User logs in
  │   └── POST /api/auth/login
  │       └── Backend validates → Returns JWT token
  │
  ├─ User creates new order
  │   └── POST /api/orders
  │       ├── ML: Recommend fabric (Naïve Bayes)
  │       ├── ML: Allocate tailor (Decision Tree)
  │       ├── ML: Check delay risk (SVM)
  │       └── Save to MongoDB
  │
  ├─ Admin views dashboard
  │   └── GET /api/ml/all-models-status
  │       └── Shows ML model statistics
  │
  └─ System predicts satisfaction
      └── POST /api/ml/bpnn/predict
          └── Triggers follow-up if low


Step 3: ML MODELS IN ACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌──────────────────────────────────────────────────────┐
  │  1. Customer Preference (KNN)                        │
  │     Input: Order history, spending, preferences      │
  │     Output: Budget/Quality/Luxury seeker             │
  │     Use: Personalized recommendations                │
  └──────────────────────────────────────────────────────┘
              ↓
  ┌──────────────────────────────────────────────────────┐
  │  2. Fabric Recommendation (Naïve Bayes)              │
  │     Input: Season, occasion, price, skin tone        │
  │     Output: Cotton/Silk/Wool/Linen                   │
  │     Use: Auto-suggest in order form                  │
  └──────────────────────────────────────────────────────┘
              ↓
  ┌──────────────────────────────────────────────────────┐
  │  3. Tailor Allocation (Decision Tree)                │
  │     Input: Complexity, fabric, deadline              │
  │     Output: Best tailor (1-5)                        │
  │     Use: Optimize workload distribution              │
  └──────────────────────────────────────────────────────┘
              ↓
  ┌──────────────────────────────────────────────────────┐
  │  4. Delay Risk Detection (SVM)                       │
  │     Input: Complexity, availability, workload        │
  │     Output: High/Low risk                            │
  │     Use: Proactive alerts                            │
  └──────────────────────────────────────────────────────┘
              ↓
  ┌──────────────────────────────────────────────────────┐
  │  5. Satisfaction Prediction (Neural Network)         │
  │     Input: Quality, delivery, service metrics        │
  │     Output: Satisfaction score (0-100%)              │
  │     Use: Trigger follow-ups                          │
  └──────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
┌───────────┐         ┌───────────┐         ┌───────────┐
│  Browser  │────────►│  React    │────────►│  Proxy    │
│ (User UI) │         │  App      │         │  Setup    │
└───────────┘         └───────────┘         └─────┬─────┘
                           │                       │
                           │                       ▼
                           │                 ┌───────────┐
                           │                 │  Express  │
                           │                 │  Server   │
                           │                 └─────┬─────┘
                           │                       │
                           ▼                       ▼
                    ┌─────────────┐         ┌───────────┐
                    │  ML Service │         │   Auth    │
                    │  (Frontend) │         │ Middleware│
                    └─────────────┘         └─────┬─────┘
                           │                      │
                           │                      ▼
                           ▼                ┌───────────┐
                    ┌─────────────┐         │  Routes   │
                    │  API Calls  │────────►│  /api/ml  │
                    │  /api/ml/*  │         │  /api/... │
                    └─────────────┘         └─────┬─────┘
                                                   │
                    ┌──────────────────────────────┴──────┐
                    │                                     │
                    ▼                                     ▼
            ┌──────────────┐                     ┌──────────────┐
            │  ML Models   │                     │   MongoDB    │
            │              │                     │   Database   │
            │  • KNN       │                     │              │
            │  • Naïve B.  │◄───────────────────►│  • Users     │
            │  • Dec Tree  │     Load/Save       │  • Orders    │
            │  • SVM       │                     │  • MLModels  │
            │  • BPNN      │                     │  • ...       │
            └──────────────┘                     └──────────────┘
```

---

## 🧪 Test the Connection

### Test 1: Backend is Running
```powershell
# In browser or new terminal
curl http://localhost:5000/api/health

# Expected response:
# {"status": "ok", "message": "Server is running"}
```

### Test 2: Frontend Connects to Backend
```javascript
// In browser console (after opening http://localhost:3000)
fetch('/api/health')
  .then(r => r.json())
  .then(d => console.log('Connected:', d));

// Expected: Connected: {status: "ok", ...}
```

### Test 3: ML Models Status
```powershell
# In browser or terminal
curl http://localhost:5000/api/ml/all-models-status

# Expected: JSON with all 5 models' status
```

---

## 🎨 Where ML is Used in Frontend

### 1. **Order Form** (`frontend/src/pages/portal/NewOrder.js`)
```
User selects: Season, Occasion, Price Range
     ↓
ML recommends: Best fabric for their choices
     ↓
User sees: "🤖 AI Recommendation: Silk (87% confidence)"
```

### 2. **Admin Dashboard** (`frontend/src/pages/admin/AdminDashboard.js`)
```
Admin opens dashboard
     ↓
Shows: ML model statistics, accuracy, usage
     ↓
Admin can: Retrain models, view predictions
```

### 3. **Tailor Allocation** (`frontend/src/pages/admin/Orders.js`)
```
New order arrives
     ↓
ML suggests: Best tailor based on skills, workload
     ↓
Admin can: Accept or override suggestion
```

### 4. **Delay Alerts** (`frontend/src/pages/admin/Orders.js`)
```
System monitors in-progress orders
     ↓
ML detects: High delay risk
     ↓
Shows: ⚠️ Warning badge on order card
```

### 5. **Customer Profile** (`frontend/src/pages/CustomerProfile.js`)
```
Admin views customer
     ↓
ML analyzes: Purchase history, preferences
     ↓
Shows: "Budget-conscious customer" or "Luxury seeker"
```

---

## 📂 File Locations

### Backend ML Files
```
backend/
├── ml/
│   ├── models/                           # 5 ML model implementations
│   │   ├── knn-customer-preference.js
│   │   ├── naivebayes-fabric-recommendation.js
│   │   ├── decisiontree-tailor-allocation.js
│   │   ├── svm-order-delay.js
│   │   └── bpnn-satisfaction-prediction.js
│   │
│   ├── data/
│   │   └── training-data-generator.js    # Sample data generator
│   │
│   ├── test-ml-models.js                 # Test all models
│   └── README.md                         # ML documentation
│
├── routes/
│   └── ml.js                             # 17 ML API endpoints
│
└── models/
    └── MLModel.js                        # MongoDB schema for models
```

### Frontend ML Files
```
frontend/src/
├── services/
│   └── mlService.js                      # ML API client (USE THIS!)
│
└── pages/
    ├── admin/
    │   ├── AdminDashboard.js             # Add ML dashboard here
    │   └── Orders.js                     # Add delay alerts here
    │
    └── portal/
        └── NewOrder.js                   # Add fabric recommendation here
```

---

## 🔑 Key API Endpoints

### Authentication
```
POST   /api/auth/login          # Login to get JWT token
POST   /api/auth/register       # Create new account
```

### Orders
```
GET    /api/orders              # Get all orders
POST   /api/orders              # Create new order
PUT    /api/orders/:id          # Update order
```

### ML Models (All require authentication)
```
GET    /api/ml/all-models-status           # Check all models

POST   /api/ml/knn/predict                 # Predict preference
POST   /api/ml/naivebayes/predict          # Recommend fabric
POST   /api/ml/decisiontree/predict        # Allocate tailor
POST   /api/ml/svm/predict                 # Detect delay
POST   /api/ml/bpnn/predict                # Predict satisfaction

POST   /api/ml/knn/train                   # Train specific model
POST   /api/ml/train-all-models            # Train all at once
```

---

## 🎯 Next Steps After Starting

1. **✅ Verify servers are running**
   - Backend: http://localhost:5000/api/health
   - Frontend: http://localhost:3000

2. **🤖 Train ML models** (one-time)
   ```powershell
   cd C:\Users\HP\style_hub\backend
   node ml/test-ml-models.js
   ```

3. **👤 Create admin account**
   - Register at http://localhost:3000/register
   - Or use existing credentials

4. **🎨 Start integrating ML in UI**
   - See `ML_WORKFLOW.md` for component examples
   - See `FRONTEND_INTEGRATION_EXAMPLES.md` for code samples

5. **📊 Monitor ML usage**
   - Build ML dashboard in admin panel
   - Track predictions and accuracy

---

## 🐛 Common Issues

### ❌ Port 5000 in use
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### ❌ MongoDB not running
```powershell
net start MongoDB
# Or install from: https://www.mongodb.com/try/download/community
```

### ❌ Module not found
```powershell
cd backend
npm install

cd ..\frontend
npm install
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `QUICK_START_GUIDE.md` | ⭐ You are here - Quick start |
| `FRONTEND_BACKEND_CONNECTION_GUIDE.md` | Detailed connection setup |
| `ML_WORKFLOW.md` | Complete ML integration workflow |
| `backend/ml/README.md` | ML models technical details |
| `FRONTEND_INTEGRATION_EXAMPLES.md` | React component examples |

---

## ✅ Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000 in browser
- [ ] Can login/register
- [ ] ML models trained (run test script)
- [ ] No console errors in browser
- [ ] API calls working (check Network tab)

---

## 🎉 You're Ready!

Your Style Hub application with ML integration is now connected and running!

**Frontend**: http://localhost:3000
**Backend**: http://localhost:5000

For detailed ML integration examples, see:
- `ML_WORKFLOW.md` - Complete ML workflow
- `FRONTEND_BACKEND_CONNECTION_GUIDE.md` - Connection details

Happy coding! 🚀








