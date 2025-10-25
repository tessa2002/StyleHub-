# 🚀 Playwright Testing - Quick Start

## ⚡ 3-Step Setup

### 1️⃣ Install Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### 2️⃣ Start Servers (2 terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 3️⃣ Run Tests (3rd terminal)

```bash
npm test
```

---

## 🎯 Quick Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:ui` | Interactive test UI (RECOMMENDED) |
| `npm run test:headed` | See browser while testing |
| `npm run test:debug` | Debug mode with breakpoints |
| `npm run test:workflow` | Test tailor workflow only |
| `npm run test:auth` | Test authentication only |
| `npm run test:report` | View last test results |

---

## 📊 What Gets Tested

### ✅ Authentication (5 tests)
- Login page loads
- Tailor login
- Admin login  
- Invalid credentials handling
- Protected route access

### ✅ Tailor Workflow (9 tests)
- View assigned orders
- Start work on order (Pending → Cutting)
- Advance to next stage (Cutting → Stitching)
- Mark as ready (Stitching → Ready)
- View order details
- Dashboard statistics
- Logout

### ✅ Complete End-to-End (1 test)
- Full workflow: Pending → Cutting → Stitching → Ready
- Notification delivery
- Status progression

**Total: 15 automated tests** 🎉

---

## 🎬 Watch Tests Run

### Option 1: UI Mode (Best for Development)

```bash
npm run test:ui
```

Opens an interactive UI where you can:
- ✅ See all tests
- ✅ Run tests individually
- ✅ Watch tests execute
- ✅ Time travel through test steps
- ✅ Debug failures visually

### Option 2: Headed Mode (See Browser)

```bash
npm run test:headed
```

Runs tests in a visible browser window.

---

## 📸 Test Results

After running tests, Playwright creates:

```
playwright-report/          # HTML report
test-results/
  ├── screenshots/          # Failure screenshots
  ├── videos/              # Test execution videos
  └── traces/              # Debug traces
```

### View HTML Report

```bash
npm run test:report
```

---

## 🐛 Debugging Failed Tests

### 1. Check the Report

```bash
npm run test:report
```

### 2. View Screenshots

Check `test-results/` folder for failure screenshots.

### 3. Run in Debug Mode

```bash
npm run test:debug
```

This opens Playwright Inspector to step through the test.

### 4. Check Trace

```bash
npx playwright show-trace test-results/.../trace.zip
```

---

## 🎯 Common Issues

### Issue: "Server not running"

**Fix:** Make sure both servers are running
```bash
# Terminal 1
cd backend && npm start

# Terminal 2  
cd frontend && npm start
```

### Issue: "Element not found"

**Fix:** Server might be slow. Increase timeout in `playwright.config.js`:
```javascript
timeout: 60 * 1000
```

### Issue: Tests are flaky

**Fix:** Run in headed mode to see what's happening:
```bash
npm run test:headed
```

---

## 📝 Test Credentials

Tests use these credentials:

**Tailor:**
```
Email: tailor@gmail.com
Password: tailor123
```

**Admin:**
```
Email: admin@stylehub.local
Password: Admin@123
```

Make sure these users exist in your database!

---

## 🔧 Configuration

Edit `playwright.config.js` to:
- Change browser (Chromium, Firefox, WebKit)
- Adjust timeouts
- Modify base URL
- Configure screenshots/videos
- Set up CI/CD

---

## 📚 Full Guide

For detailed documentation, see: **`PLAYWRIGHT_TESTING_GUIDE.md`**

---

## ✨ That's It!

You're ready to test your StyleHub application with Playwright! 🎉

**Recommended Workflow:**
1. Start servers
2. Run `npm run test:ui`
3. Watch tests pass
4. Fix any failures
5. Commit with confidence! ✅

---

**Questions?** Check `PLAYWRIGHT_TESTING_GUIDE.md` for troubleshooting and advanced usage.

