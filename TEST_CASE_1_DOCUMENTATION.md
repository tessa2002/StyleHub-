# Test Case 1 Documentation

## Test Case Information

- **Project Name**: StyleHub
- **Test Case ID**: Test_1
- **Test Designed By**: Tessa Saji
- **Test Priority**: High
- **Test Designed Date**: 07-10-2025
- **Module Name**: Login Page
- **Test Executed By**: Ms. Merin Chacko
- **Test Execution Date**: 07-10-2025
- **Test Title**: Verify Login with valid username and password

## Description

Login page test with valid credentials. Ensure that valid users (Admin, Customer, Tailor) can log in successfully and access their respective dashboards.

## Pre-Condition

User has valid username and password

## Post-Condition

User credentials verified and user redirected to correct dashboard

## Test Steps

| Step | Test Step | Test Data | Expected Result | Actual Result | Status |
|------|-----------|-----------|----------------|--------------|--------|
| 1 | Open the browser | - | Browser should open successfully | Browser opened successfully | Pass |
| 2 | Navigate to the login URL | URL: http://localhost:3000/login | Login page should load | Login page loaded successfully | Pass |
| 3 | Enter valid username | admin | Username accepted | Username accepted | Pass |
| 4 | Enter valid password | encrypted | Password accepted | Password accepted | Pass |
| 5 | Click Login | - | Redirected to Dashboard | Redirected to Dashboard | Pass |
| 6 | Close browser | - | Browser closed | Browser closed | Pass |

## Test Data

### Admin User
- **Username**: admin
- **Password**: admin123 (encrypted)
- **Expected Dashboard**: /admin/dashboard

### Customer User
- **Username**: customer@example.com
- **Password**: customer123 (encrypted)
- **Expected Dashboard**: /portal/dashboard

### Tailor User
- **Username**: tailor@example.com
- **Password**: tailor123 (encrypted)
- **Expected Dashboard**: /dashboard/tailor

## Test Files

1. **`tests/login-test-case-1.spec.js`** - Comprehensive test with all steps
2. **`tests/login-test-case-1-simple.spec.js`** - Simplified version

## Running the Tests

```bash
# Run all login tests
npx playwright test tests/login-test-case-1.spec.js

# Run with UI mode
npx playwright test tests/login-test-case-1.spec.js --ui

# Run in headed mode
npx playwright test tests/login-test-case-1.spec.js --headed

# Run specific test
npx playwright test tests/login-test-case-1.spec.js -g "Admin User"
```

## Test Coverage

- ✅ Browser opens successfully
- ✅ Login page loads
- ✅ Username input accepts valid data
- ✅ Password input accepts valid data (encrypted)
- ✅ Login button enables when fields are filled
- ✅ Successful login redirects to correct dashboard
- ✅ Dashboard elements are visible after login
- ✅ All user roles tested (Admin, Customer, Tailor)

## Expected Results

1. **Step 1**: Browser opens without errors
2. **Step 2**: Login page displays with form elements
3. **Step 3**: Username field accepts and displays input
4. **Step 4**: Password field accepts input (shown as encrypted)
5. **Step 5**: Clicking login button redirects to appropriate dashboard
6. **Step 6**: Browser closes after test completion

## Notes

- Replace test credentials with actual encrypted passwords
- Update dashboard URLs if they differ in your application
- Adjust selectors based on your actual HTML structure
- Add screenshots for failed tests using `await page.screenshot()`


