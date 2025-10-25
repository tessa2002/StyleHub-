# 📋 Manual Testing Steps

Since automated testing requires all servers running, here's how to test manually:

## Step 1: Start Backend

Open **Terminal 1**:
```bash
cd C:\Users\HP\style_hub\backend
npm start
```

**Wait for:** `✅ Server is running on port 5000`

## Step 2: Start Frontend

Open **Terminal 2**:
```bash
cd C:\Users\HP\style_hub\frontend
npm start
```

**Wait for:** Browser opens at `http://localhost:3000`

## Step 3: Run Tests

Open **Terminal 3**:
```bash
cd C:\Users\HP\style_hub
npm test
```

---

## 🎯 Alternative: Run Tests One by One

### Test 1: Authentication
```bash
npm run test:auth
```

### Test 2: Tailor Workflow
```bash
npm run test:workflow
```

### Test 3: Interactive UI Mode (Best!)
```bash
npm run test:ui
```

---

## 🐛 If Tests Fail

Check these:

1. **Servers Running?**
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000

2. **Database Connected?**
   - Check backend terminal for MongoDB connection

3. **Test Users Exist?**
   ```bash
   cd backend
   node scripts/verifyTailorUser.js
   ```

4. **Orders Assigned?**
   ```bash
   cd backend
   node scripts/debugTailorOrders.js
   ```

---

## ✅ Expected Results

When all tests pass, you'll see:
```
Running 15 tests using 1 worker

✓ Login page loads correctly (2s)
✓ Tailor can login with valid credentials (3s)
✓ Tailor can view assigned orders (2s)
✓ Tailor can start work on pending order (4s)
... (15 tests total)

15 passed (45s)
```

---

## 📊 Test Breakdown

**Authentication Tests (5):**
- Login page loads ✓
- Valid login ✓
- Invalid login handling ✓
- Admin login ✓
- Protected routes ✓

**Workflow Tests (10):**
- View orders ✓
- Start work ✓
- Advance stages ✓
- Mark ready ✓
- Dashboard stats ✓
- Order details ✓
- Complete workflow ✓
- Logout ✓

---

## 🚀 Quick Fix Commands

If you need to reset:

```bash
# Verify tailor user
cd backend
node scripts/verifyTailorUser.js

# Check order assignments
node scripts/debugTailorOrders.js

# Test complete flow
node scripts/testCompleteFlow.js
```

