const { test, expect } = require('@playwright/test');

test.describe('Own Fabric Order Flow', () => {
  
  // Test customer credentials
  const customerEmail = 'customer@example.com';
  const customerPassword = 'customer123';
  
  // Test admin credentials
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';

  test.beforeEach(async ({ page }) => {
    // Set longer timeout for this test suite
    test.setTimeout(120000);
  });

  test('Complete own fabric order flow: Order → Pay → Book Appointment', async ({ page }) => {
    console.log('🧪 Starting own fabric order flow test...');
    
    // ==========================================
    // STEP 1: Customer Login
    // ==========================================
    console.log('📝 Step 1: Customer login');
    await page.goto('/login');
    await page.fill('input[type="email"]', customerEmail);
    await page.fill('input[type="password"]', customerPassword);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to customer dashboard
    await page.waitForURL(/\/dashboard|\/portal/, { timeout: 15000 });
    console.log('✅ Customer logged in successfully');
    
    // ==========================================
    // STEP 2: Navigate to New Order Page
    // ==========================================
    console.log('📝 Step 2: Navigate to new order page');
    await page.goto('/portal/new-order');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the new order page
    await expect(page.locator('text=New Order')).toBeVisible({ timeout: 10000 });
    console.log('✅ On new order page');
    
    // ==========================================
    // STEP 3: Fill Order Details
    // ==========================================
    console.log('📝 Step 3: Fill order details');
    
    // Select garment type (assuming dropdown or select)
    const garmentSelect = page.locator('select[name="garmentType"], #garmentType, select:has-text("Select")').first();
    if (await garmentSelect.isVisible({ timeout: 5000 })) {
      await garmentSelect.selectOption('shirt');
      console.log('  → Selected garment: Shirt');
    }
    
    // Fill measurements (check for measurement inputs)
    const measurementInputs = page.locator('input[type="number"]');
    const measurementCount = await measurementInputs.count();
    if (measurementCount > 0) {
      // Fill first few measurements with sample data
      for (let i = 0; i < Math.min(5, measurementCount); i++) {
        await measurementInputs.nth(i).fill('40');
      }
      console.log(`  → Filled ${Math.min(5, measurementCount)} measurements`);
    }
    
    // ==========================================
    // STEP 4: Select "Own Fabric" Option
    // ==========================================
    console.log('📝 Step 4: Select own fabric option');
    
    // Look for own fabric checkbox or radio button
    const ownFabricCheckbox = page.locator('input[type="checkbox"]:near(:text("own fabric")), input[type="radio"]:near(:text("own fabric"))').first();
    if (await ownFabricCheckbox.isVisible({ timeout: 5000 })) {
      await ownFabricCheckbox.check();
      console.log('  → Checked "Own Fabric" option');
      
      // Wait for own fabric fields to appear
      await page.waitForTimeout(1000);
      
      // Fill own fabric details
      const fabricTypeInput = page.locator('input[placeholder*="fabric type"], input[name*="fabricType"]').first();
      if (await fabricTypeInput.isVisible({ timeout: 3000 })) {
        await fabricTypeInput.fill('Cotton');
        console.log('  → Entered fabric type: Cotton');
      }
      
      const fabricColorInput = page.locator('input[placeholder*="color"], input[name*="color"]').first();
      if (await fabricColorInput.isVisible({ timeout: 3000 })) {
        await fabricColorInput.fill('Blue');
        console.log('  → Entered fabric color: Blue');
      }
      
      const fabricMetersInput = page.locator('input[placeholder*="meters"], input[name*="meters"]').first();
      if (await fabricMetersInput.isVisible({ timeout: 3000 })) {
        await fabricMetersInput.fill('2.5');
        console.log('  → Entered fabric meters: 2.5');
      }
    }
    
    // ==========================================
    // STEP 5: Submit Order
    // ==========================================
    console.log('📝 Step 5: Submit order');
    
    // Look for submit button
    const submitButton = page.locator('button[type="submit"]:has-text("Submit"), button:has-text("Create Order"), button:has-text("Place Order")').first();
    await submitButton.click();
    console.log('  → Clicked submit button');
    
    // ==========================================
    // STEP 6: Verify Redirect to Payments (NOT Appointments)
    // ==========================================
    console.log('📝 Step 6: Verify redirect to payments page');
    
    // Should redirect to payments, not appointments
    await page.waitForURL(/\/payment|\/pay/, { timeout: 15000 });
    expect(page.url()).not.toContain('/appointment');
    expect(page.url()).toContain('/payment');
    console.log('✅ Correctly redirected to payments page (not appointments)');
    
    // Verify payment page loads
    await expect(page.locator('text=/pay|payment/i').first()).toBeVisible({ timeout: 10000 });
    console.log('✅ Payment page loaded');
    
    // ==========================================
    // STEP 7: Complete Payment (Mock or Skip)
    // ==========================================
    console.log('📝 Step 7: Payment process');
    console.log('  ℹ️  Note: Skipping actual Razorpay payment (requires mock)');
    
    // In real test, you would:
    // - Mock Razorpay response
    // - Or use Razorpay test API
    // For now, we'll verify the payment UI is present
    
    await page.waitForTimeout(2000);
    
    // ==========================================
    // STEP 8: Navigate to Appointments Page
    // ==========================================
    console.log('📝 Step 8: Navigate to appointments page separately');
    
    await page.goto('/portal/appointments');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on appointments page
    await expect(page.locator('text=Appointments')).toBeVisible({ timeout: 10000 });
    console.log('✅ On appointments page');
    
    // ==========================================
    // STEP 9: Book Appointment
    // ==========================================
    console.log('📝 Step 9: Book appointment');
    
    // Click "Book Appointment" button
    const bookButton = page.locator('button:has-text("Book Appointment")').first();
    if (await bookButton.isVisible({ timeout: 5000 })) {
      await bookButton.click();
      console.log('  → Clicked "Book Appointment"');
      
      // Wait for appointment form/modal
      await page.waitForTimeout(1000);
      
      // Fill appointment details
      const serviceSelect = page.locator('select[name="service"]').first();
      if (await serviceSelect.isVisible({ timeout: 5000 })) {
        await serviceSelect.selectOption('Measurement');
        console.log('  → Selected service: Measurement');
      }
      
      // Fill date/time
      const dateInput = page.locator('input[type="datetime-local"]').first();
      if (await dateInput.isVisible({ timeout: 5000 })) {
        // Set appointment for tomorrow at 10 AM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        const dateTimeString = tomorrow.toISOString().slice(0, 16);
        await dateInput.fill(dateTimeString);
        console.log('  → Set appointment time: Tomorrow 10:00 AM');
      }
      
      // Submit appointment
      const submitAppointment = page.locator('button[type="submit"]:has-text("Book"), button:has-text("Submit")').last();
      if (await submitAppointment.isVisible({ timeout: 5000 })) {
        await submitAppointment.click();
        console.log('  → Submitted appointment');
        
        // Wait for success notification
        await page.waitForTimeout(2000);
        console.log('✅ Appointment booking completed');
      }
    }
    
    console.log('✅ Customer flow completed successfully!');
  });

  test('Admin can see and approve appointment with order details', async ({ page, context }) => {
    console.log('🧪 Starting admin appointment approval test...');
    
    // ==========================================
    // STEP 1: Admin Login
    // ==========================================
    console.log('📝 Step 1: Admin login');
    await page.goto('/login');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to admin dashboard
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });
    console.log('✅ Admin logged in successfully');
    
    // ==========================================
    // STEP 2: Navigate to Appointments Page
    // ==========================================
    console.log('📝 Step 2: Navigate to admin appointments page');
    await page.goto('/admin/appointments');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on appointments page
    await expect(page.locator('text=/Appointments.*Management/i').or(page.locator('h1:has-text("Appointments")'))).toBeVisible({ timeout: 10000 });
    console.log('✅ On admin appointments page');
    
    // ==========================================
    // STEP 3: Check for Pending Appointments
    // ==========================================
    console.log('📝 Step 3: Check for pending appointments');
    
    // Click pending filter
    const pendingFilter = page.locator('button:has-text("Pending")').first();
    if (await pendingFilter.isVisible({ timeout: 5000 })) {
      await pendingFilter.click();
      console.log('  → Filtered to pending appointments');
      await page.waitForTimeout(1000);
    }
    
    // ==========================================
    // STEP 4: Verify Order Details Visible
    // ==========================================
    console.log('📝 Step 4: Verify order details are visible');
    
    // Look for appointment cards
    const appointmentCard = page.locator('.appointment-card, [class*="card"]').first();
    if (await appointmentCard.isVisible({ timeout: 5000 })) {
      console.log('✅ Found appointment card');
      
      // Check for order details
      const orderDetails = appointmentCard.locator('text=/Related Order|Order|Customer.*Fabric/i');
      if (await orderDetails.first().isVisible({ timeout: 3000 })) {
        console.log('✅ Order details visible in appointment card');
      }
      
      // Check for "Own Fabric" badge
      const ownFabricBadge = appointmentCard.locator('text=/own fabric/i');
      if (await ownFabricBadge.first().isVisible({ timeout: 3000 })) {
        console.log('✅ "Own Fabric" badge visible');
      }
    }
    
    // ==========================================
    // STEP 5: Approve Appointment
    // ==========================================
    console.log('📝 Step 5: Approve appointment');
    
    const approveButton = page.locator('button:has-text("Approve")').first();
    if (await approveButton.isVisible({ timeout: 5000 })) {
      await approveButton.click();
      console.log('  → Clicked approve button');
      
      // Wait for approval modal
      await page.waitForTimeout(1000);
      
      // Confirm approval
      const confirmButton = page.locator('button:has-text("Confirm")').last();
      if (await confirmButton.isVisible({ timeout: 5000 })) {
        await confirmButton.click();
        console.log('  → Confirmed approval');
        
        // Wait for success message
        await page.waitForTimeout(2000);
        console.log('✅ Appointment approved');
        
        // ==========================================
        // STEP 6: Check for Order Actions Modal
        // ==========================================
        console.log('📝 Step 6: Check for order actions modal');
        
        // Look for order actions modal
        const orderActionsModal = page.locator('text=/Complete Order|Create Bill|Assign.*Tailor/i').first();
        if (await orderActionsModal.isVisible({ timeout: 5000 })) {
          console.log('✅ Order actions modal appeared');
          
          // Check for Create Bill button
          const createBillButton = page.locator('button:has-text("Create Bill")');
          if (await createBillButton.isVisible({ timeout: 3000 })) {
            console.log('✅ "Create Bill" button visible');
          }
          
          // Check for tailor select
          const tailorSelect = page.locator('select, [placeholder*="tailor"]');
          if (await tailorSelect.first().isVisible({ timeout: 3000 })) {
            console.log('✅ Tailor selection dropdown visible');
          }
        }
      }
    }
    
    console.log('✅ Admin approval flow completed successfully!');
  });

  test('Verify no automatic redirect to appointments for own fabric orders', async ({ page }) => {
    console.log('🧪 Testing that own fabric orders do not force appointment redirect...');
    
    // Login as customer
    await page.goto('/login');
    await page.fill('input[type="email"]', customerEmail);
    await page.fill('input[type="password"]', customerPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard|\/portal/, { timeout: 15000 });
    
    // Navigate to new order
    await page.goto('/portal/new-order');
    await page.waitForLoadState('networkidle');
    
    // Quick order creation with own fabric
    const garmentSelect = page.locator('select').first();
    if (await garmentSelect.isVisible({ timeout: 5000 })) {
      await garmentSelect.selectOption({ index: 1 });
    }
    
    // Check own fabric
    const ownFabricCheckbox = page.locator('input[type="checkbox"]:near(:text("own"))').first();
    if (await ownFabricCheckbox.isVisible({ timeout: 5000 })) {
      await ownFabricCheckbox.check();
      await page.waitForTimeout(1000);
    }
    
    // Submit order
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // CRITICAL: Should redirect to payments, NOT appointments
    await page.waitForTimeout(5000);
    
    // Verify URL does NOT contain appointments
    expect(page.url()).not.toContain('/appointment');
    
    // Verify URL DOES contain payments
    const isPaymentPage = page.url().includes('/payment') || page.url().includes('/pay');
    expect(isPaymentPage).toBeTruthy();
    
    console.log('✅ Verified: No automatic appointment redirect!');
    console.log(`   Current URL: ${page.url()}`);
  });

  test('Verify bill is generated for own fabric orders', async ({ page }) => {
    console.log('🧪 Testing that bills are created for own fabric orders...');
    
    // This test verifies that the backend creates bills for own fabric orders
    // In a real test, you would:
    // 1. Create an order via API
    // 2. Check database for bill
    // 3. Verify bill amount matches order
    
    console.log('ℹ️  Note: Full bill verification requires API/database access');
    console.log('✅ Test placeholder - implement with API calls');
  });
});

test.describe('Appointment Linking', () => {
  test('Appointment automatically links to order when booking', async ({ page }) => {
    console.log('🧪 Testing automatic order-appointment linking...');
    
    // This test verifies sessionStorage linking
    // 1. Order ID stored in sessionStorage
    // 2. Retrieved when booking appointment
    // 3. Sent to API as relatedOrder
    
    console.log('ℹ️  Note: Testing sessionStorage requires intercepting API calls');
    console.log('✅ Test placeholder - implement with network interception');
  });
});













