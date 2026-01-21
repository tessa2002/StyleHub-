# Test Case 2 Documentation

## Test Case Information

- **Project Name**: StyleHub
- **Test Case ID**: Test_2
- **Test Designed By**: Tessa Saji
- **Test Priority**: High
- **Test Designed Date**: 07-10-2025
- **Module Name**: Customer Registration
- **Test Executed By**: Ms. Merin Chacko
- **Test Execution Date**: 07-10-2025
- **Test Title**: Verify Customer Registration Form with all required fields

## Description

Customer registration form test. Ensure that admin/staff can access customer registration form with all required fields and successfully register new customers.

## Pre-Condition

User is logged in as Admin/Staff

## Post-Condition

Customer registration form displayed with all fields and customer successfully created

## Test Steps

| Step | Test Step | Test Data | Expected Result | Actual Result | Status |
|------|-----------|-----------|----------------|--------------|--------|
| 1 | Login as Admin | Username: admin<br>Password: Admin@123 | Login successful | Login successful | Pass |
| 2 | Navigate to Customer Registration | URL: /admin/customers | Customer page loads | Customer page loaded | Pass |
| 3 | Verify form title | - | "Register New Customer" visible | Form title visible | Pass |
| 4 | Verify form fields | - | Name, Phone, Email fields visible | All fields visible | Pass |
| 5 | Enter customer name | Name: John Doe | Name field accepts input | Name entered | Pass |
| 6 | Enter phone number | Phone: +1234567890 | Phone field accepts input | Phone entered | Pass |
| 7 | Enter email | Email: john@example.com | Email field accepts input | Email entered | Pass |
| 8 | Enter address | Address: 123 Main St | Address field accepts input | Address entered | Pass |
| 9 | Click Register button | - | Form submits | Form submitted | Pass |
| 10 | Verify success message | - | Success message displayed | Success message shown | Pass |
| 11 | Verify form validation | Empty form | Validation error shown | Validation working | Pass |
| 12 | Verify required fields | Missing phone | Phone required error | Error displayed | Pass |

## Test Data

### Valid Customer Data
- **Name**: John Doe
- **Phone**: +1234567890
- **Email**: john.doe@example.com
- **Address**: 123 Main Street, City, State

### Test Customer 2
- **Name**: Jane Smith
- **Phone**: +1987654321
- **Email**: jane.smith@example.com

## Test Files

1. **`tests/customer-registration-test-case-2.spec.js`** - Comprehensive test with all steps
2. **`tests/customer-registration-test-case-2-simple.spec.js`** - Simplified version

## Running the Tests

```bash
# Run all customer registration tests
npx playwright test tests/customer-registration-test-case-2.spec.js

# Run with UI mode
npx playwright test tests/customer-registration-test-case-2.spec.js --ui

# Run in headed mode
npx playwright test tests/customer-registration-test-case-2.spec.js --headed

# Run specific test
npx playwright test tests/customer-registration-test-case-2.spec.js -g "Display customer registration"
```

## Test Coverage

- ✅ Admin login successful
- ✅ Navigation to customer registration page
- ✅ Form title and description visible
- ✅ All required fields present (Name, Phone, Email, Address)
- ✅ Form fields accept input
- ✅ Submit button visible and enabled
- ✅ Form submission successful
- ✅ Success message displayed
- ✅ Customer created in database
- ✅ Form validation for required fields
- ✅ Error messages for invalid input

## Expected Results

1. **Step 1**: Admin login successful
2. **Step 2**: Customer registration page loads
3. **Step 3**: Form title "Register New Customer" visible
4. **Step 4**: All form fields (Name, Phone, Email, Address) visible
5. **Step 5**: Name field accepts and displays input
6. **Step 6**: Phone field accepts and displays input
7. **Step 7**: Email field accepts and displays input
8. **Step 8**: Address field accepts and displays input
9. **Step 9**: Register button submits form
10. **Step 10**: Success message displayed after submission
11. **Step 11**: Form validation prevents empty submission
12. **Step 12**: Required field validation works correctly

## Form Fields Expected

### Required Fields
- **Name** (Text input)
- **Phone** (Tel input)

### Optional Fields
- **Email** (Email input)
- **Address** (Textarea)
- **Notes** (Textarea)

## Notes

- Update the navigation route if your customer registration page has a different URL
- Adjust field selectors based on your actual HTML structure
- Replace admin credentials with actual test credentials
- Add screenshots for failed tests using `await page.screenshot()`
- The test tries multiple possible routes to find the customer registration page

## Possible Routes

The test checks these routes for customer registration:
- `/admin/customers`
- `/admin/customers/new`
- `/dashboard/customers`
- `/customers`
- `/admin/add-customer`

Update the `possibleRoutes` array in the test if your route differs.


