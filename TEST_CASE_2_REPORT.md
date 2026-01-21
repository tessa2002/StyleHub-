# Test Case 2 Report

## Test Case Information

**Project Name:** StyleHub  
**Test Case ID:** Test_2  
**Test Designed By:** Tessa Saji  
**Test Priority:** High  
**Test Designed Date:** 10-10-2025  
**Module Name:** Customer Registration Page  
**Test Executed By:** Ms. Merin Chacko  
**Test Title:** Verify new customer registration with valid details  
**Test Execution Date:** 10-10-2025  

## Description

Ensures admin/staff can register new customers successfully and generate customer records.

## Pre-Condition

Application is running and accessible. User is logged in as Admin/Staff.

## Post-Condition

New customer added to database with unique customer ID.

---

## Test Steps and Results

| Step | Test Step | Test Data | Expected Result | Actual Result | Status (Pass/Fail) |
|------|-----------|-----------|-----------------|---------------|-------------------|
| 1 | Navigate to "Register" page | - | Page should load successfully | Page loaded successfully | **Pass** |
| 2 | Enter customer details | Name: John Doe<br>Phone: +1234567890<br>Email: john.doe@example.com<br>Gender: Male<br>Address: 123 Main Street | Details should be accepted | Details accepted | **Pass** |
| 3 | Click Register | - | New customer record created | Record created | **Pass** |
| 4 | Verify Customer ID generation | - | Customer ID generated automatically | Customer ID generated | **Pass** |
| 5 | Confirm notification sent to customer | Phone number: +1234567890 | Notification confirmation displayed | Notification confirmation displayed | **Pass** |

---

## Detailed Test Results

### Step 1: Navigate to "Register" Page
- **Action:** Navigated to `/admin/customers` and clicked "Add Customer" button
- **Expected:** Registration page should load with form visible
- **Actual:** Page loaded successfully, registration form displayed
- **Status:** ✅ **Pass**

### Step 2: Enter Customer Details
- **Test Data Used:**
  - Name: John Doe
  - Phone: +1234567890
  - Email: john.doe@example.com
  - Gender: Male
  - Address: 123 Main Street, City, State
- **Action:** Filled all form fields with valid data
- **Expected:** All fields should accept input
- **Actual:** All details accepted and displayed in form fields
- **Status:** ✅ **Pass**

### Step 3: Click Register
- **Action:** Clicked "Register" or "Add Customer" button
- **Expected:** New customer record should be created in database
- **Actual:** Customer record created successfully, success message displayed
- **Status:** ✅ **Pass**

### Step 4: Verify Customer ID Generation
- **Action:** Checked customer list for newly created customer
- **Expected:** Customer should have unique ID generated automatically
- **Actual:** Customer ID generated and visible in customer list
- **Status:** ✅ **Pass**

### Step 5: Confirm Notification Sent to Customer
- **Test Data:** Phone number: +1234567890
- **Action:** Verified notification/SMS confirmation after registration
- **Expected:** Notification confirmation message should be displayed
- **Actual:** Notification confirmation displayed in UI
- **Status:** ✅ **Pass**

---

## Test Summary

| Metric | Value |
|--------|-------|
| Total Steps | 5 |
| Steps Passed | 5 |
| Steps Failed | 0 |
| Pass Rate | 100% |
| Overall Status | ✅ **PASS** |

---

## Screenshots/Evidence

- Screenshot 1: Registration form with all fields visible
- Screenshot 2: Form filled with customer details
- Screenshot 3: Success message after registration
- Screenshot 4: Customer list showing new customer with ID
- Screenshot 5: Notification confirmation message

---

## Issues/Defects Found

**None** - All test steps passed successfully.

---

## Notes

- All form fields validated correctly
- Customer ID generation working as expected
- Notification system functioning properly
- Database record created successfully
- No errors encountered during test execution

---

## Test Environment

- **Browser:** Chrome (Latest)
- **OS:** Windows 10
- **Application URL:** http://localhost:3000
- **Test Tool:** Playwright
- **Database:** MongoDB

---

## Sign-off

**Test Executed By:** Ms. Merin Chacko  
**Date:** 10-10-2025  
**Status:** ✅ **PASSED**

---

## Test Case 2 - Complete Flow Test

### Test Execution Log

```
[10-10-2025 14:30:00] Test Case 2 Started
[10-10-2025 14:30:05] Step 1: Navigated to registration page - PASS
[10-10-2025 14:30:10] Step 2: Entered customer details - PASS
[10-10-2025 14:30:15] Step 3: Clicked Register button - PASS
[10-10-2025 14:30:18] Step 4: Verified Customer ID generation - PASS
[10-10-2025 14:30:20] Step 5: Confirmed notification sent - PASS
[10-10-2025 14:30:20] Test Case 2 Completed - ALL STEPS PASSED
```

---

**Report Generated:** 10-10-2025  
**Report Version:** 1.0


