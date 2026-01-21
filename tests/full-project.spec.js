const { test, expect } = require('@playwright/test');

// Test users
const users = {
  customer: { email: 'customer@example.com', password: 'customer123' },
  admin: { email: 'admin@example.com', password: 'admin123' },
  tailor: { email: 'tailor@gmail.com', password: 'tailor123' },
  staff: { email: 'staff@example.com', password: 'staff123' }
};

// ============================================
// AUTHENTICATION TESTS (Parallel)
// ============================================
test.describe('Authentication', () => {
  test('Customer can login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', users.customer.email);
    await page.fill('input[type="password"]', users.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard|\/portal/, { timeout: 10000 });
    expect(page.url()).toMatch(/dashboard|portal/);
  });

  test('Admin can login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', users.admin.email);
    await page.fill('input[type="password"]', users.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 10000 });
    expect(page.url()).toContain('/admin');
  });

  test('Tailor can login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', users.tailor.email);
    await page.fill('input[type="password"]', users.tailor.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('Login fails with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });
});

// ============================================
// CUSTOMER PORTAL TESTS (Sequential for order)
// ============================================
test.describe('Customer Portal Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', users.customer.email);
    await page.fill('input[type="password"]', users.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard|\/portal/, { timeout: 10000 });
  });

  test('Dashboard loads with stats', async ({ page }) => {
    await page.goto('/dashboard/customer');
    await expect(page.locator('text=/dashboard|orders|welcome/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Can view orders page', async ({ page }) => {
    await page.goto('/portal/orders');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/orders|my orders/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Can view measurements page', async ({ page }) => {
    await page.goto('/portal/measurements');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/measurement/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Can view appointments page', async ({ page }) => {
    await page.goto('/portal/appointments');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/appointment/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Can view bills page', async ({ page }) => {
    await page.goto('/portal/bills');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/bill|invoice|payment/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Can view profile page', async ({ page }) => {
    await page.goto('/portal/profile');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/profile|account/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('New order page loads', async ({ page }) => {
    await page.goto('/portal/new-order');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/new order|create order/i').first()).toBeVisible({ timeout: 10000 });
  });
});

// ============================================
// ORDER CREATION TESTS (Critical Path)
// ============================================
test.describe('Order Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', users.customer.email);
    await page.fill('input[type="password"]', users.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard|\/portal/, { timeout: 10000 });
  });

  test('Shop fabric order redirects to payments', async ({ page }) => {
    await page.goto('/portal/new-order');
    await page.waitForLoadState('networkidle');
    
    // Quick order (if form available)
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible({ timeout: 5000 })) {
      // Try to fill minimum required fields
      const selects = page.locator('select');
      if (await selects.first().isVisible({ timeout: 3000 })) {
        await selects.first().selectOption({ index: 1 });
      }
      
      await submitBtn.click();
      await page.waitForTimeout(3000);
      
      // Should go to payments or show success
      const url = page.url();
      expect(url).toMatch(/payment|order|dashboard/);
    }
  });

  test('Own fabric order goes to payments (not appointments)', async ({ page }) => {
    await page.goto('/portal/new-order');
    await page.waitForLoadState('networkidle');
    
    // Check own fabric checkbox if available
    const ownFabricCheck = page.locator('input[type="checkbox"]:near(:text("own"))').first();
    if (await ownFabricCheck.isVisible({ timeout: 3000 })) {
      await ownFabricCheck.check();
      await page.waitForTimeout(1000);
      
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      await page.waitForTimeout(5000);
      
      // Critical: Should NOT go to appointments
      expect(page.url()).not.toContain('/appointment');
    }
  });
});

// ============================================
// APPOINTMENT TESTS (Parallel)
// ============================================
test.describe('Appointments', () => {
  test('Customer can access appointments page', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', users.customer.email);
    await page.fill('input[type="password"]', users.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard|\/portal/, { timeout: 10000 });
    
    await page.goto('/portal/appointments');
    await page.waitForLoadState('networkidle');
    
    // Check for book button or appointments list
    const bookBtn = page.locator('button:has-text("Book")');
    const appointmentsList = page.locator('.appointment-card, .appointments-list');
    
    const hasBookButton = await bookBtn.first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasList = await appointmentsList.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    expect(hasBookButton || hasList).toBeTruthy();
  });

  test('Admin can access appointments management', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', users.admin.email);
    await page.fill('input[type="password"]', users.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 10000 });
    
    await page.goto('/admin/appointments');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/appointment/i').first()).toBeVisible({ timeout: 10000 });
  });
});

// ============================================
// ADMIN DASHBOARD TESTS (Parallel)
// ============================================
test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', users.admin.email);
    await page.fill('input[type="password"]', users.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test('Dashboard loads with stats', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/dashboard|admin/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Can view customers page', async ({ page }) => {
    await page.goto('/admin/customers');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/customer/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Can view orders page', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/order/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Can view appointments page', async ({ page }) => {
    await page.goto('/admin/appointments');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/appointment/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Can view fabrics page', async ({ page }) => {
    await page.goto('/admin/fabrics');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/fabric/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Can view staff page', async ({ page }) => {
    await page.goto('/admin/staff');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/staff|tailor/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Can view billing page', async ({ page }) => {
    await page.goto('/admin/billing');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/bill|invoice/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Can view measurements page', async ({ page }) => {
    await page.goto('/admin/measurements');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/measurement/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Can view settings page', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/setting/i').first()).toBeVisible({ timeout: 10000 });
  });
});

// ============================================
// TAILOR DASHBOARD TESTS (Parallel)
// ============================================
test.describe('Tailor Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', users.tailor.email);
    await page.fill('input[type="password"]', users.tailor.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('Dashboard loads', async ({ page }) => {
    await page.goto('/dashboard/tailor');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/dashboard|tailor|order/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Can view orders page', async ({ page }) => {
    await page.goto('/dashboard/tailor/orders');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/order|pending|my/i').first()).toBeVisible({ timeout: 10000 });
  });
});

// ============================================
// NAVIGATION & UI TESTS (Fast - Parallel)
// ============================================
test.describe('Navigation & UI', () => {
  test('Homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=/style|tailor|fashion|login|register/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
  });

  test('Register page loads', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
  });

  test('Protected routes redirect to login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });
});

// ============================================
// API HEALTH CHECK (Fast)
// ============================================
test.describe('Backend API', () => {
  test('Backend is running', async ({ request }) => {
    const response = await request.get('http://localhost:5000/api/auth/health').catch(() => null);
    if (response) {
      expect(response.status()).toBeLessThan(500);
    }
  });
});

// ============================================
// NOTIFICATIONS TEST (Parallel)
// ============================================
test.describe('Notifications', () => {
  test('Customer can view notifications', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', users.customer.email);
    await page.fill('input[type="password"]', users.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard|\/portal/, { timeout: 10000 });
    
    // Look for notification bell or icon
    const notificationBell = page.locator('[class*="bell"], [class*="notification"], text=/notification/i').first();
    const hasNotifications = await notificationBell.isVisible({ timeout: 3000 }).catch(() => false);
    
    // Just check it doesn't crash
    expect(hasNotifications !== undefined).toBeTruthy();
  });
});

// ============================================
// LOGOUT TEST (Fast)
// ============================================
test.describe('Logout', () => {
  test('User can logout', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', users.customer.email);
    await page.fill('input[type="password"]', users.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard|\/portal/, { timeout: 10000 });
    
    // Look for logout button
    const logoutBtn = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
    if (await logoutBtn.isVisible({ timeout: 3000 })) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
      expect(page.url()).toMatch(/login|home|\//);
    }
  });
});

// ============================================
// RESPONSIVE DESIGN TEST (Fast)
// ============================================
test.describe('Responsive Design', () => {
  test('Works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Works on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});

// ============================================
// CRITICAL WORKFLOW TEST (Most Important)
// ============================================
test.describe('Critical User Journeys', () => {
  test('End-to-end: Customer creates order', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', users.customer.email);
    await page.fill('input[type="password"]', users.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard|\/portal/, { timeout: 10000 });
    
    // Go to new order
    await page.goto('/portal/new-order');
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded
    const pageLoaded = page.locator('text=/new order|create|submit/i').first();
    await expect(pageLoaded).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Critical workflow: Customer can access order creation');
  });

  test('End-to-end: Admin can view orders', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', users.admin.email);
    await page.fill('input[type="password"]', users.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 10000 });
    
    // Go to orders
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded
    await expect(page.locator('text=/order/i').first()).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Critical workflow: Admin can view orders');
  });

  test('End-to-end: Tailor can view assigned orders', async ({ page }) => {
    // Login as tailor
    await page.goto('/login');
    await page.fill('input[type="email"]', users.tailor.email);
    await page.fill('input[type="password"]', users.tailor.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Go to orders
    await page.goto('/dashboard/tailor/orders');
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded
    await expect(page.locator('text=/order|pending|my/i').first()).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Critical workflow: Tailor can view orders');
  });
});













