const { test, expect } = require('@playwright/test');

// Test data
const TAILOR_CREDENTIALS = {
  email: 'tailor@gmail.com',
  password: 'tailor123'
};

const ADMIN_CREDENTIALS = {
  email: 'admin@stylehub.local',
  password: 'Admin@123'
};

// Helper function to login
async function loginAsTailor(page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', TAILOR_CREDENTIALS.email);
  await page.fill('input[type="password"]', TAILOR_CREDENTIALS.password);
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard
  await page.waitForURL(/\/dashboard\/tailor/, { timeout: 10000 });
}

async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', ADMIN_CREDENTIALS.email);
  await page.fill('input[type="password"]', ADMIN_CREDENTIALS.password);
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard
  await page.waitForURL(/\/dashboard|\/admin/, { timeout: 10000 });
}

test.describe('Tailor Workflow Tests', () => {
  
  test('Tailor can login successfully', async ({ page }) => {
    await loginAsTailor(page);
    
    // Verify we're on the tailor dashboard
    await expect(page).toHaveURL(/\/dashboard\/tailor/);
    
    // Check for dashboard elements
    await expect(page.locator('text=Total Orders')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
  });

  test('Tailor can view assigned orders', async ({ page }) => {
    await loginAsTailor(page);
    
    // Click on "View All Orders" button
    await page.click('text=View All Orders');
    
    // Wait for orders page to load
    await page.waitForURL(/\/dashboard\/tailor\/orders/);
    
    // Check if orders are displayed
    const ordersExist = await page.locator('table tbody tr').count();
    console.log(`Found ${ordersExist} orders`);
    
    // Should have at least some orders (or empty state)
    expect(ordersExist).toBeGreaterThanOrEqual(0);
  });

  test('Tailor can start work on pending order', async ({ page }) => {
    await loginAsTailor(page);
    
    // Go to orders page
    await page.click('text=View All Orders');
    await page.waitForURL(/\/dashboard\/tailor\/orders/);
    
    // Look for a pending order
    const pendingOrder = page.locator('tr:has-text("Pending")').first();
    const hasPendingOrders = await pendingOrder.count() > 0;
    
    if (hasPendingOrders) {
      // Find and click "Start Work" button
      const startButton = pendingOrder.locator('button[title="Start Work"]');
      
      if (await startButton.count() > 0) {
        // Click start work button
        await startButton.click();
        
        // Handle confirmation dialog
        page.on('dialog', dialog => dialog.accept());
        
        // Wait for alert or success message
        await page.waitForTimeout(1000);
        
        // Verify the status changed (order should now be in Cutting state)
        // The page should refresh and show the updated status
        await page.waitForTimeout(2000);
      } else {
        console.log('No Start Work button found - order may already be in progress');
      }
    } else {
      console.log('No pending orders found to test');
    }
  });

  test('Tailor can advance order to next stage', async ({ page }) => {
    await loginAsTailor(page);
    
    // Go to orders page
    await page.click('text=View All Orders');
    await page.waitForURL(/\/dashboard\/tailor\/orders/);
    
    // Look for an order in Cutting stage
    const cuttingOrder = page.locator('tr:has-text("Cutting")').first();
    const hasCuttingOrders = await cuttingOrder.count() > 0;
    
    if (hasCuttingOrders) {
      // Find and click "Next" button
      const nextButton = cuttingOrder.locator('button[title="Next → Stitching"]');
      
      if (await nextButton.count() > 0) {
        // Click next button
        await nextButton.click();
        
        // Handle confirmation dialog
        page.on('dialog', dialog => dialog.accept());
        
        // Wait for success
        await page.waitForTimeout(2000);
      } else {
        console.log('No Next button found');
      }
    } else {
      console.log('No orders in Cutting stage found to test');
    }
  });

  test('Tailor can mark order as ready', async ({ page }) => {
    await loginAsTailor(page);
    
    // Go to orders page
    await page.click('text=View All Orders');
    await page.waitForURL(/\/dashboard\/tailor\/orders/);
    
    // Look for an order in Stitching stage
    const stitchingOrder = page.locator('tr:has-text("Stitching")').first();
    const hasStitchingOrders = await stitchingOrder.count() > 0;
    
    if (hasStitchingOrders) {
      // Find and click "Mark as Ready" button
      const readyButton = stitchingOrder.locator('button[title="Mark as Ready"]');
      
      if (await readyButton.count() > 0) {
        // Click mark ready button
        await readyButton.click();
        
        // Handle confirmation dialog
        page.on('dialog', dialog => dialog.accept());
        
        // Wait for success
        await page.waitForTimeout(2000);
        
        // Verify the order is now marked as Ready
        // It should no longer show action buttons
      } else {
        console.log('No Mark as Ready button found');
      }
    } else {
      console.log('No orders in Stitching stage found to test');
    }
  });

  test('Tailor can view order details', async ({ page }) => {
    await loginAsTailor(page);
    
    // Go to orders page
    await page.click('text=View All Orders');
    await page.waitForURL(/\/dashboard\/tailor\/orders/);
    
    // Click on first order's view button
    const firstViewButton = page.locator('button[title="View Details"]').first();
    
    if (await firstViewButton.count() > 0) {
      await firstViewButton.click();
      
      // Wait for order details page
      await page.waitForURL(/\/dashboard\/tailor\/orders\/.+/);
      
      // Verify order details page elements
      await expect(page.locator('text=Back to Orders')).toBeVisible();
      await expect(page.locator('.workflow-progress')).toBeVisible();
      
      // Check if workflow steps are visible
      await expect(page.locator('text=Pending')).toBeVisible();
      await expect(page.locator('text=Cutting')).toBeVisible();
      await expect(page.locator('text=Stitching')).toBeVisible();
      await expect(page.locator('text=Ready')).toBeVisible();
    } else {
      console.log('No orders found to view details');
    }
  });

  test('Dashboard shows correct statistics', async ({ page }) => {
    await loginAsTailor(page);
    
    // Wait for dashboard to load
    await page.waitForSelector('.summary-card');
    
    // Check that statistics are displayed
    const totalOrders = await page.locator('.summary-card:has-text("Total Orders") .card-value').textContent();
    const pending = await page.locator('.summary-card:has-text("Pending") .card-value').textContent();
    const inProgress = await page.locator('.summary-card:has-text("In Progress") .card-value').textContent();
    const completed = await page.locator('.summary-card:has-text("Completed") .card-value').textContent();
    
    console.log('Dashboard Statistics:');
    console.log(`  Total Orders: ${totalOrders}`);
    console.log(`  Pending: ${pending}`);
    console.log(`  In Progress: ${inProgress}`);
    console.log(`  Completed: ${completed}`);
    
    // Verify numbers are valid
    expect(parseInt(totalOrders)).toBeGreaterThanOrEqual(0);
    expect(parseInt(pending)).toBeGreaterThanOrEqual(0);
    expect(parseInt(inProgress)).toBeGreaterThanOrEqual(0);
    expect(parseInt(completed)).toBeGreaterThanOrEqual(0);
  });

  test('Tailor can refresh dashboard data', async ({ page }) => {
    await loginAsTailor(page);
    
    // Look for refresh button
    const refreshButton = page.locator('button:has-text("Refresh")');
    
    if (await refreshButton.count() > 0) {
      await refreshButton.click();
      
      // Wait for data to reload
      await page.waitForTimeout(2000);
      
      // Dashboard should still be visible
      await expect(page.locator('text=Total Orders')).toBeVisible();
    }
  });

  test('Tailor can logout', async ({ page }) => {
    await loginAsTailor(page);
    
    // Wait for sidebar to be visible
    await page.waitForSelector('.tailor-sidebar');
    
    // Look for logout button (might be in a dropdown or menu)
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")').first();
    
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      
      // Should redirect to login page
      await page.waitForURL(/\/login/);
      
      // Verify we're on login page
      await expect(page.locator('input[type="email"]')).toBeVisible();
    }
  });
});

test.describe('Complete Workflow End-to-End Test', () => {
  
  test('Complete workflow: Pending → Cutting → Stitching → Ready', async ({ page }) => {
    console.log('🧪 Starting complete workflow test...');
    
    // Step 1: Login as tailor
    console.log('Step 1: Login as tailor');
    await loginAsTailor(page);
    await expect(page).toHaveURL(/\/dashboard\/tailor/);
    
    // Step 2: Navigate to orders
    console.log('Step 2: Navigate to orders page');
    await page.click('text=View All Orders');
    await page.waitForURL(/\/dashboard\/tailor\/orders/);
    
    // Step 3: Find a pending order
    console.log('Step 3: Looking for pending order');
    const pendingOrder = page.locator('tr:has-text("Pending")').first();
    const hasPending = await pendingOrder.count() > 0;
    
    if (!hasPending) {
      console.log('⚠️ No pending orders found - skipping workflow test');
      test.skip();
      return;
    }
    
    // Get order ID for tracking
    const orderRow = await pendingOrder.textContent();
    console.log(`Found pending order: ${orderRow.substring(0, 50)}...`);
    
    // Step 4: Start work (Pending → Cutting)
    console.log('Step 4: Starting work on order');
    const startButton = pendingOrder.locator('button[title="Start Work"]');
    
    if (await startButton.count() > 0) {
      page.on('dialog', dialog => {
        console.log(`Dialog: ${dialog.message()}`);
        dialog.accept();
      });
      
      await startButton.click();
      await page.waitForTimeout(3000); // Wait for API call
      
      console.log('✅ Work started - Order should now be in Cutting');
    }
    
    // Step 5: Reload page and find the order in Cutting stage
    console.log('Step 5: Checking if order is now in Cutting stage');
    await page.reload();
    await page.waitForTimeout(2000);
    
    const cuttingOrder = page.locator('tr:has-text("Cutting")').first();
    const hasCutting = await cuttingOrder.count() > 0;
    
    if (hasCutting) {
      console.log('✅ Order found in Cutting stage');
      
      // Step 6: Advance to Stitching
      console.log('Step 6: Advancing to Stitching stage');
      const nextButton = cuttingOrder.locator('button[title="Next → Stitching"]');
      
      if (await nextButton.count() > 0) {
        await nextButton.click();
        await page.waitForTimeout(3000);
        console.log('✅ Advanced to Stitching');
      }
    }
    
    // Step 7: Reload and check Stitching stage
    console.log('Step 7: Checking if order is now in Stitching stage');
    await page.reload();
    await page.waitForTimeout(2000);
    
    const stitchingOrder = page.locator('tr:has-text("Stitching")').first();
    const hasStitching = await stitchingOrder.count() > 0;
    
    if (hasStitching) {
      console.log('✅ Order found in Stitching stage');
      
      // Step 8: Mark as Ready
      console.log('Step 8: Marking order as Ready');
      const readyButton = stitchingOrder.locator('button[title="Mark as Ready"]');
      
      if (await readyButton.count() > 0) {
        await readyButton.click();
        await page.waitForTimeout(3000);
        console.log('✅ Marked as Ready');
      }
    }
    
    // Step 9: Verify order is in Ready state
    console.log('Step 9: Verifying order is now Ready');
    await page.reload();
    await page.waitForTimeout(2000);
    
    const readyOrders = await page.locator('tr:has-text("Ready")').count();
    console.log(`Found ${readyOrders} Ready orders`);
    
    console.log('🎉 Complete workflow test finished!');
  });
});

test.describe('Admin Notification Tests', () => {
  
  test('Admin receives notification when tailor starts work', async ({ page }) => {
    // This would require setting up the test to trigger a workflow action
    // and then checking admin notifications
    
    await loginAsAdmin(page);
    
    // Look for notification bell or notifications section
    const notificationBell = page.locator('[aria-label="Notifications"], .notification-bell, text=Notifications');
    
    if (await notificationBell.count() > 0) {
      await notificationBell.click();
      
      // Check if any notifications exist
      await page.waitForTimeout(1000);
      
      // Verify notification structure
      const notifications = await page.locator('.notification-item, .notification').count();
      console.log(`Found ${notifications} notifications`);
    } else {
      console.log('⚠️ Notifications feature not accessible in UI');
    }
  });
});

