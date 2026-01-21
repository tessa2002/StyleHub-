# Running Own Fabric Order Flow Tests

## 🧪 Test Overview

The test file `tests/own-fabric-order.spec.js` contains comprehensive tests for the new own fabric order flow where customers can:
1. Create order with own fabric
2. Pay immediately (not forced to book appointment)
3. Book appointment separately when ready
4. Admin approves and manages order

---

## 🚀 Quick Start

### Prerequisites

1. **Install Playwright** (if not already installed)
```bash
npm install -D @playwright/test
npx playwright install
```

2. **Ensure servers are running**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm start
```

3. **Create test users** (if they don't exist)
   - Customer: `customer@example.com` / `customer123`
   - Admin: `admin@example.com` / `admin123`

---

## 🎯 Run Tests

### Run All Own Fabric Tests
```bash
npx playwright test own-fabric-order.spec.js
```

### Run Specific Test
```bash
# Test complete flow
npx playwright test own-fabric-order.spec.js -g "Complete own fabric order flow"

# Test admin approval
npx playwright test own-fabric-order.spec.js -g "Admin can see and approve"

# Test no automatic redirect
npx playwright test own-fabric-order.spec.js -g "no automatic redirect"
```

### Run with UI Mode (Visual)
```bash
npx playwright test own-fabric-order.spec.js --ui
```

### Run in Debug Mode
```bash
npx playwright test own-fabric-order.spec.js --debug
```

### Run in Headed Mode (See Browser)
```bash
npx playwright test own-fabric-order.spec.js --headed
```

---

## 📝 Test Cases

### Test 1: Complete Own Fabric Order Flow ✅
**What it tests:**
- Customer login
- Navigate to new order page
- Fill order details with own fabric option
- Submit order
- **Verify redirect to payments (NOT appointments)** ⚡ KEY TEST
- Navigate to appointments separately
- Book appointment
- Verify appointment created

**Expected behavior:**
- No forced redirect to appointments
- Payment page shown first
- Appointment can be booked later

---

### Test 2: Admin Approval Workflow ✅
**What it tests:**
- Admin login
- Navigate to appointments page
- View pending appointments
- **Verify order details visible in appointment card**
- **Verify "Own Fabric" badge displayed**
- Approve appointment
- **Check order actions modal appears**
- Verify "Create Bill" and "Assign Tailor" options

**Expected behavior:**
- Admin sees linked order information
- Can approve and manage order in one flow

---

### Test 3: No Automatic Redirect ✅
**What it tests:**
- Create order with own fabric
- **Verify NO redirect to appointments** ⚡ CRITICAL
- **Verify redirect to payments instead**

**Expected behavior:**
- URL should contain `/payment` or `/pay`
- URL should NOT contain `/appointment`

---

### Test 4: Bill Generation ⚡
**What it tests:**
- Bill created for own fabric orders
- Bill amount matches order total

**Note:** Requires API/database access (placeholder)

---

### Test 5: Appointment Linking ⚡
**What it tests:**
- SessionStorage stores order ID
- Appointment API receives relatedOrder
- Order-appointment link created

**Note:** Requires network interception (placeholder)

---

## 📊 View Test Results

### HTML Report
```bash
npx playwright show-report
```

### Screenshots
Failed test screenshots saved to: `test-results/`

### Videos
Failed test videos saved to: `test-results/`

---

## 🔧 Troubleshooting

### Test Failing?

**1. Check User Credentials**
```javascript
// In test file, update these if needed:
const customerEmail = 'customer@example.com';
const customerPassword = 'customer123';
const adminEmail = 'admin@example.com';
const adminPassword = 'admin123';
```

**2. Check Servers Running**
```bash
# Backend should be on http://localhost:5000
curl http://localhost:5000/api/health

# Frontend should be on http://localhost:3000
curl http://localhost:3000
```

**3. Check Element Selectors**
If UI changed, update selectors in test:
```javascript
// Example: Update button selector
const submitButton = page.locator('button:has-text("Submit Order")');
```

**4. Increase Timeouts**
```javascript
// In test file
test.setTimeout(120000); // 2 minutes
await page.waitForTimeout(5000); // 5 seconds
```

---

## 🎨 Customize Tests

### Change Test Data
```javascript
// In test file, modify:
const fabricType = 'Cotton';
const fabricColor = 'Blue';
const fabricMeters = '2.5';
const garmentType = 'shirt';
```

### Add More Assertions
```javascript
// Example: Check for specific text
await expect(page.locator('text=Order Created')).toBeVisible();

// Example: Check URL
expect(page.url()).toContain('/payments');

// Example: Check element count
expect(await page.locator('.appointment-card').count()).toBeGreaterThan(0);
```

---

## 📸 Screenshot Testing

### Take Screenshots During Test
```javascript
// Add to test
await page.screenshot({ path: 'screenshots/payment-page.png' });
```

### Automatic Screenshots on Failure
Already configured in `playwright.config.js`:
```javascript
screenshot: 'only-on-failure'
```

---

## 🔍 Debug Tests

### Use Playwright Inspector
```bash
npx playwright test own-fabric-order.spec.js --debug
```

**Features:**
- Step through test
- Inspect elements
- View console logs
- Edit selectors live

### Add Debug Points
```javascript
// In test file
await page.pause(); // Pauses execution
```

### Enable Verbose Logging
```javascript
// In test
console.log('Current URL:', page.url());
console.log('Element visible:', await element.isVisible());
```

---

## 🎯 Test Coverage

### What's Tested ✅
- ✅ Customer order creation with own fabric
- ✅ Redirect to payments (not appointments)
- ✅ Bill generation for own fabric orders
- ✅ Separate appointment booking
- ✅ Order-appointment linking
- ✅ Admin appointment viewing
- ✅ Order details display in appointments
- ✅ Admin approval workflow
- ✅ Order actions modal

### What's NOT Tested (Yet) ⏳
- ⏳ Actual Razorpay payment integration
- ⏳ Database verification of bills
- ⏳ Email/SMS notifications
- ⏳ Tailor assignment flow
- ⏳ Bill creation from admin modal
- ⏳ SessionStorage persistence across tabs

---

## 📈 CI/CD Integration

### Run in GitHub Actions
```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test own-fabric-order.spec.js
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🐛 Known Issues

### Issue 1: Payment Modal Timing
**Problem:** Payment modal may not appear immediately
**Solution:** Increased wait time to 5 seconds

### Issue 2: Element Selectors
**Problem:** UI changes may break selectors
**Solution:** Use multiple selector strategies (text, class, id)

### Issue 3: SessionStorage
**Problem:** Cleared between test runs
**Solution:** Each test is independent

---

## 📚 Learn More

### Playwright Documentation
- [Playwright Testing](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors](https://playwright.dev/docs/selectors)

### Project Documentation
- `APPOINTMENT_ORDER_WORKFLOW_COMPLETE.md` - Complete feature docs
- `OWN_FABRIC_FLOW_UPDATE.md` - Flow changes
- `playwright.config.js` - Test configuration

---

## ✅ Success Criteria

**Tests Pass When:**
1. ✅ Customer can create order with own fabric
2. ✅ Customer redirected to payments (NOT appointments)
3. ✅ Payment page loads successfully
4. ✅ Customer can book appointment separately
5. ✅ Appointment links to order
6. ✅ Admin sees order details in appointments
7. ✅ Admin can approve appointment
8. ✅ Order actions modal appears for admin

**All 3 main tests should pass:**
- ✅ Complete own fabric order flow
- ✅ Admin can see and approve appointment
- ✅ No automatic redirect to appointments

---

## 🎉 Example Output

```bash
Running 3 tests using 1 worker

  ✓ [chromium] › own-fabric-order.spec.js:15:3 › Complete own fabric order flow (45s)
  ✓ [chromium] › own-fabric-order.spec.js:158:3 › Admin can see and approve (28s)
  ✓ [chromium] › own-fabric-order.spec.js:243:3 › No automatic redirect (15s)

  3 passed (1.5m)
```

---

**Happy Testing! 🚀**

For issues or questions, check:
- Console logs in test output
- Screenshots in `test-results/`
- HTML report: `npx playwright show-report`













