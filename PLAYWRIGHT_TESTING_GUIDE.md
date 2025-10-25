# 🧪 Playwright Testing Guide

## 📦 Installation

### Step 1: Install Playwright

```bash
npm install --save-dev @playwright/test
```

### Step 2: Install Browsers

```bash
npx playwright install
```

This will install Chromium, Firefox, and WebKit browsers.

---

## 🚀 Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in UI Mode (Recommended for Development)

```bash
npm run test:ui
```

This opens an interactive UI where you can:
- See all tests
- Run tests one by one
- Watch tests in real-time
- Debug failures

### Run Tests in Headed Mode (See Browser)

```bash
npm run test:headed
```

### Run Specific Test File

```bash
# Test tailor workflow
npm run test:workflow

# Test authentication
npm run test:auth
```

### Debug Mode (Step Through Tests)

```bash
npm run test:debug
```

### View Test Report

```bash
npm run test:report
```

---

## 📁 Test Structure

```
tests/
├── auth.spec.js              # Authentication tests
├── tailor-workflow.spec.js   # Complete workflow tests
```

---

## 🧪 Test Coverage

### Authentication Tests (`auth.spec.js`)

✅ Login page loads correctly  
✅ Tailor can login with valid credentials  
✅ Login fails with invalid credentials  
✅ Admin can login with valid credentials  
✅ Cannot access protected routes without login  

### Tailor Workflow Tests (`tailor-workflow.spec.js`)

✅ Tailor can login successfully  
✅ Tailor can view assigned orders  
✅ Tailor can start work on pending order  
✅ Tailor can advance order to next stage  
✅ Tailor can mark order as ready  
✅ Tailor can view order details  
✅ Dashboard shows correct statistics  
✅ Tailor can refresh dashboard data  
✅ Tailor can logout  

### Complete End-to-End Test

✅ Full workflow: Pending → Cutting → Stitching → Ready  
✅ Notifications sent to admin  
✅ Orders move between sections correctly  

---

## 📊 Test Scenarios

### Scenario 1: Login and View Orders

```javascript
test('Tailor can login and view orders', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[type="email"]', 'tailor@gmail.com');
  await page.fill('input[type="password"]', 'tailor123');
  await page.click('button[type="submit"]');
  
  // View orders
  await page.click('text=View All Orders');
  
  // Verify orders are displayed
  await expect(page.locator('table')).toBeVisible();
});
```

### Scenario 2: Complete Workflow

```javascript
test('Complete workflow progression', async ({ page }) => {
  // Login as tailor
  await loginAsTailor(page);
  
  // Go to orders
  await page.click('text=View All Orders');
  
  // Start work on pending order
  await page.locator('tr:has-text("Pending")').first()
    .locator('button[title="Start Work"]').click();
  
  // Confirm action
  page.on('dialog', dialog => dialog.accept());
  
  // Wait and verify status changed
  await page.waitForTimeout(2000);
  await expect(page.locator('text=Cutting')).toBeVisible();
  
  // Advance to stitching
  await page.locator('tr:has-text("Cutting")').first()
    .locator('button[title="Next → Stitching"]').click();
  
  // Mark as ready
  await page.locator('tr:has-text("Stitching")').first()
    .locator('button[title="Mark as Ready"]').click();
  
  // Verify order is ready
  await expect(page.locator('text=Ready')).toBeVisible();
});
```

---

## 🎯 Before Running Tests

### 1. Make Sure Both Servers Are Running

The tests expect:
- **Backend:** `http://localhost:5000`
- **Frontend:** `http://localhost:3000`

**Option A: Manual Start**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start

# Terminal 3 - Tests
npm test
```

**Option B: Automatic Start (Configured)**
The `playwright.config.js` is configured to automatically start both servers when running tests!

Just run:
```bash
npm test
```

### 2. Ensure Test Data Exists

For tests to work, you need:
- ✅ Tailor user: `tailor@gmail.com` / `tailor123`
- ✅ Admin user: `admin@stylehub.local` / `Admin@123`
- ✅ At least one order assigned to tailor

You can create test data using:
```bash
cd backend
node scripts/verifyTailorUser.js
node scripts/debugTailorOrders.js
```

---

## 📸 Screenshots and Videos

Playwright automatically captures:
- **Screenshots** on test failure
- **Videos** when tests fail (retained)
- **Traces** for debugging

Find them in:
```
test-results/
├── screenshots/
├── videos/
└── traces/
```

### View Trace

```bash
npx playwright show-trace test-results/.../trace.zip
```

---

## 🐛 Debugging Tests

### 1. Run with Debug Flag

```bash
npm run test:debug
```

This opens Playwright Inspector where you can:
- Step through each action
- Inspect page state
- See what went wrong

### 2. Add Console Logs

```javascript
test('My test', async ({ page }) => {
  console.log('🧪 Starting test...');
  
  await page.goto('/login');
  console.log('✅ Login page loaded');
  
  // ... rest of test
});
```

### 3. Take Screenshots Manually

```javascript
test('My test', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Take screenshot
  await page.screenshot({ path: 'debug-screenshot.png' });
});
```

### 4. Wait for Network Activity

```javascript
// Wait for specific API call
await page.waitForResponse(response => 
  response.url().includes('/api/orders') && response.status() === 200
);
```

---

## 🔧 Troubleshooting

### Issue: Tests timeout

**Solution:** Increase timeout in `playwright.config.js`
```javascript
timeout: 60 * 1000, // 60 seconds
```

### Issue: "Server not running" error

**Solution:** Make sure both servers are running
```bash
# Check backend
curl http://localhost:5000

# Check frontend
curl http://localhost:3000
```

### Issue: "Element not found"

**Solution:** Add explicit waits
```javascript
await page.waitForSelector('button[type="submit"]');
await page.click('button[type="submit"]');
```

### Issue: Tests are flaky

**Solution:** Add proper waits
```javascript
// ❌ Bad - Race condition
await page.click('button');
await page.click('text=Submit'); // Might not be ready

// ✅ Good - Wait for element
await page.click('button');
await page.waitForSelector('text=Submit');
await page.click('text=Submit');
```

---

## 📋 Test Checklist

Before committing code, run:

- [ ] `npm test` - All tests pass
- [ ] `npm run test:auth` - Auth tests pass
- [ ] `npm run test:workflow` - Workflow tests pass
- [ ] Check test report for failures
- [ ] Review screenshots of failed tests
- [ ] Fix any flaky tests

---

## 🎨 Custom Test Helpers

### Create Reusable Functions

```javascript
// tests/helpers.js
async function loginAsTailor(page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'tailor@gmail.com');
  await page.fill('input[type="password"]', 'tailor123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard\/tailor/);
}

async function findPendingOrder(page) {
  return page.locator('tr:has-text("Pending")').first();
}

module.exports = { loginAsTailor, findPendingOrder };
```

### Use in Tests

```javascript
const { loginAsTailor, findPendingOrder } = require('./helpers');

test('Start work on order', async ({ page }) => {
  await loginAsTailor(page);
  const order = await findPendingOrder(page);
  // ... rest of test
});
```

---

## 📊 CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run tests
        run: npm test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🎯 Best Practices

### 1. Use Descriptive Test Names

```javascript
// ❌ Bad
test('test1', async ({ page }) => {});

// ✅ Good
test('Tailor can start work on pending order', async ({ page }) => {});
```

### 2. Keep Tests Independent

```javascript
// Each test should work on its own
test.beforeEach(async ({ page }) => {
  await loginAsTailor(page);
});
```

### 3. Use Page Object Model

```javascript
class OrdersPage {
  constructor(page) {
    this.page = page;
    this.startWorkButton = page.locator('button[title="Start Work"]');
  }
  
  async startWork() {
    await this.startWorkButton.click();
  }
}
```

### 4. Handle Dialogs Properly

```javascript
page.on('dialog', dialog => {
  console.log(`Dialog: ${dialog.message()}`);
  dialog.accept();
});
```

### 5. Clean Up After Tests

```javascript
test.afterEach(async ({ page }) => {
  await page.close();
});
```

---

## 🚀 Next Steps

1. **Install Playwright:**
   ```bash
   npm install --save-dev @playwright/test
   npx playwright install
   ```

2. **Run Tests:**
   ```bash
   npm test
   ```

3. **View Results:**
   ```bash
   npm run test:report
   ```

4. **Add More Tests:**
   - Create `tests/admin.spec.js` for admin tests
   - Create `tests/customer.spec.js` for customer tests
   - Add API tests for backend

---

## 📚 Resources

- **Playwright Docs:** https://playwright.dev/
- **Best Practices:** https://playwright.dev/docs/best-practices
- **API Reference:** https://playwright.dev/docs/api/class-playwright

---

**Happy Testing!** 🎉

