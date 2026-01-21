# 🚀 Deployment Guide - Style Hub with ML Integration

## Overview

This guide ensures all ML functionalities work **exactly the same** in localhost, staging, and production environments.

---

## 📋 Environment Configurations

### Development (Localhost)

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/stylehub
JWT_SECRET=your_dev_secret_key_min_32_characters
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000
NODE_ENV=development
REACT_APP_ENABLE_ML=true
```

---

### Production (Deployed)

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stylehub
JWT_SECRET=your_production_secret_key_min_32_characters_very_secure
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
```

**Frontend** (`frontend/.env.production`):
```env
REACT_APP_API_URL=https://api.your-domain.com
# OR leave empty if backend is on same domain:
REACT_APP_API_URL=
NODE_ENV=production
REACT_APP_ENABLE_ML=true
```

---

## ✅ Ensuring ML Works Everywhere

### 1. API URL Configuration

The ML service automatically adapts to the environment:

```javascript
// frontend/src/services/mlService.js
const API_BASE = process.env.REACT_APP_API_URL !== undefined 
  ? process.env.REACT_APP_API_URL 
  : (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
```

**Localhost**: Uses `http://localhost:5000`  
**Production**: Uses `process.env.REACT_APP_API_URL` or same domain

---

### 2. CORS Configuration

**Update `backend/server.js`** to handle CORS properly:

```javascript
// Existing CORS config
const cors = require('cors');

// Dynamic CORS based on environment
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
  credentials: true
};

app.use(cors(corsOptions));
```

---

### 3. MongoDB Connection

**Localhost**:
```env
MONGODB_URI=mongodb://localhost:27017/stylehub
```

**Production** (MongoDB Atlas):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stylehub
```

**Important**: ML models are stored in MongoDB. Same database = same models across environments.

---

### 4. ML Model Persistence

Models are stored in MongoDB via the `MLModel` schema:
- ✅ Train once in production
- ✅ Models persist across server restarts
- ✅ No need to retrain on every deployment

**To ensure models are available**:

```bash
# After first deployment, train models once:
POST https://your-domain.com/api/ml/train-all
Authorization: Bearer <admin_token>
```

---

## 🔧 Step-by-Step Deployment

### Option 1: Render.com (Recommended)

#### Backend Deployment

1. **Create `render.yaml`** (already exists):
```yaml
services:
  - type: web
    name: stylehub-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: FRONTEND_URL
        value: https://your-frontend-url.onrender.com
```

2. **Connect to Render**:
   - Push to GitHub
   - Connect repository on Render.com
   - Add environment variables
   - Deploy

3. **Add Environment Variables** on Render dashboard:
   ```
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=generate_secure_random_string
   FRONTEND_URL=https://your-frontend.onrender.com
   CORS_ORIGIN=https://your-frontend.onrender.com
   ```

#### Frontend Deployment

1. **Update `frontend/.env.production`**:
```env
REACT_APP_API_URL=https://your-backend.onrender.com
NODE_ENV=production
```

2. **Build and Deploy**:
```bash
cd frontend
npm run build
# Deploy build folder to Render/Netlify/Vercel
```

---

### Option 2: Heroku

#### Backend

```bash
# Install Heroku CLI
heroku login
heroku create stylehub-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set FRONTEND_URL=https://your-frontend.herokuapp.com

# Deploy
git push heroku main

# Train ML models (one-time)
curl -X POST https://stylehub-api.herokuapp.com/api/ml/train-all \
  -H "Authorization: Bearer <admin_token>"
```

#### Frontend

```bash
# Create frontend app
heroku create stylehub-frontend

# Set environment variable
heroku config:set REACT_APP_API_URL=https://stylehub-api.herokuapp.com

# Build and deploy
npm run build
git push heroku main
```

---

### Option 3: VPS (Ubuntu/Linux)

#### Backend Setup

```bash
# SSH into server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Clone repository
git clone https://github.com/your-repo/style_hub.git
cd style_hub/backend

# Install dependencies
npm install

# Create .env file
nano .env
# Add production environment variables

# Install PM2 for process management
sudo npm install -g pm2

# Start backend
pm2 start server.js --name stylehub-backend
pm2 save
pm2 startup

# Setup Nginx reverse proxy
sudo apt install nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/stylehub

# Add configuration:
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/stylehub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

#### Frontend Setup

```bash
# Build frontend
cd ../frontend
npm install
npm run build

# Copy to Nginx
sudo cp -r build/* /var/www/html/

# Or serve with Nginx
sudo nano /etc/nginx/sites-available/stylehub-frontend

# Add:
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/stylehub;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔒 Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string (min 32 characters)
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Enable HTTPS/SSL certificates
- [ ] Set strong `DEFAULT_ADMIN_PASSWORD`
- [ ] Configure CORS to only allow your frontend domain
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB authentication
- [ ] Rate limit API endpoints
- [ ] Sanitize user inputs
- [ ] Keep dependencies updated

---

## 🧪 Testing Across Environments

### 1. Test ML on Localhost

```bash
# Backend
cd backend
npm start

# Frontend (new terminal)
cd frontend
npm start

# Test ML endpoints
curl http://localhost:5000/api/ml/status
```

### 2. Test ML in Production

```bash
# Check ML status
curl https://your-domain.com/api/ml/status \
  -H "Authorization: Bearer <token>"

# Train models (if not trained)
curl -X POST https://your-domain.com/api/ml/train-all \
  -H "Authorization: Bearer <admin_token>"

# Test prediction
curl -X POST https://your-domain.com/api/ml/knn/predict \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"customerData": {"age": 35, "measurements": {"chest": 95, "waist": 85}}}'
```

### 3. Verify Consistency

Both should return:
- ✅ Same model accuracy
- ✅ Same prediction results
- ✅ Same API response format
- ✅ Same performance (< 1s predictions)

---

## 📊 Environment Comparison

| Feature | Localhost | Production |
|---------|-----------|------------|
| API URL | `http://localhost:5000` | `https://api.your-domain.com` |
| MongoDB | Local | MongoDB Atlas |
| ML Models | Trained locally | Trained once, persisted in DB |
| Predictions | Same algorithm | Same algorithm ✅ |
| Accuracy | Same metrics | Same metrics ✅ |
| Response Time | < 1 second | < 1 second ✅ |
| Data Format | Same JSON | Same JSON ✅ |

---

## 🔄 Model Synchronization

### Keep Models in Sync

**Option 1: Train in Production**
```bash
# After deployment, train once
POST /api/ml/train-all
```

**Option 2: Export/Import Models**

```javascript
// Export from localhost
GET /api/ml/models
// Save JSON responses

// Import to production
POST /api/ml/knn/train
// Use saved training data
```

**Option 3: Use Same MongoDB**
- Both environments point to same MongoDB Atlas cluster
- Models automatically synchronized

---

## 🐛 Troubleshooting

### Issue: Models not found in production

**Solution**:
```bash
# Train models in production
curl -X POST https://your-domain.com/api/ml/train-all \
  -H "Authorization: Bearer <admin_token>"
```

### Issue: CORS errors

**Solution**: Update `backend/.env`
```env
CORS_ORIGIN=https://your-frontend.com,https://www.your-frontend.com
```

### Issue: Different predictions localhost vs production

**Cause**: Different training data

**Solution**: 
1. Use same MongoDB database
2. Train models once in production
3. Or export/import training data

### Issue: Slow predictions in production

**Solution**:
1. Check server resources (CPU/RAM)
2. Use MongoDB Atlas in same region
3. Enable caching for frequent predictions

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Copy `.env.example` to `.env` and fill values
- [ ] Test all ML models locally
- [ ] Verify all API endpoints work
- [ ] Check database connection
- [ ] Test frontend integration

### During Deployment
- [ ] Set all environment variables
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Configure CORS
- [ ] Setup SSL/HTTPS
- [ ] Train ML models

### Post-Deployment
- [ ] Test ML status: `GET /api/ml/status`
- [ ] Test predictions on all 5 models
- [ ] Verify response times < 1 second
- [ ] Check MongoDB model storage
- [ ] Test from frontend UI
- [ ] Monitor for errors

---

## 📈 Monitoring

### Check ML System Health

```bash
# Status check
GET /api/ml/status

# Expected response:
{
  "status": "ML System Online",
  "models": {
    "knn": { "trained": true },
    "naiveBayes": { "trained": true },
    "decisionTree": { "trained": true },
    "svm": { "trained": true },
    "bpnn": { "trained": true }
  }
}
```

### Performance Monitoring

```javascript
// Add to backend/routes/ml.js
const startTime = Date.now();
const prediction = model.predict(data);
const endTime = Date.now();
console.log(`Prediction time: ${endTime - startTime}ms`);
```

---

## 🎯 Best Practices

1. **Train Once**: Train models once in production, they persist in MongoDB
2. **Use Same DB**: Point both localhost and production to same MongoDB for consistency
3. **Version Models**: Save model versions in MongoDB
4. **Monitor Performance**: Log prediction times
5. **Cache Results**: Cache frequent predictions to reduce load
6. **Regular Retraining**: Retrain monthly with new production data
7. **Backup Models**: Export models before retraining

---

## 🔗 Quick Commands

### Development
```bash
# Start backend
cd backend && npm start

# Start frontend  
cd frontend && npm start

# Test ML
node backend/ml/test-ml-models.js
```

### Production
```bash
# Deploy backend
git push heroku main

# Build frontend
npm run build

# Train models
curl -X POST https://your-api.com/api/ml/train-all
```

---

## 📞 Support

If ML behaves differently between environments:

1. Check environment variables match
2. Verify same MongoDB database
3. Confirm models are trained in production
4. Test with same input data
5. Compare model versions

---

**Result**: ML models work **identically** in localhost and production! ✅

All 5 models use the same algorithms, same data structures, and produce consistent results regardless of environment.








