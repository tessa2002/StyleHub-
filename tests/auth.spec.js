const { test, expect } = require('@playwright/test');

test.describe('Authentication Tests', () => {
  
  test('Login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check for login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Tailor can login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in credentials
    await page.fill('input[type="email"]', 'tailor@gmail.com');
    await page.fill('input[type="password"]', 'tailor123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Verify successful login
    expect(page.url()).toContain('/dashboard');
  });

  test('Login fails with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in wrong credentials
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show error message
    await page.waitForTimeout(2000);
    
    // Should still be on login page
    expect(page.url()).toContain('/login');
  });

  test('Admin can login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in admin credentials
    await page.fill('input[type="email"]', 'admin@stylehub.local');
    await page.fill('input[type="password"]', 'Admin@123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL(/\/dashboard|\/admin/, { timeout: 10000 });
    
    // Verify successful login
    const url = page.url();
    expect(url.includes('/dashboard') || url.includes('/admin')).toBeTruthy();
  });

  test('Cannot access protected routes without login', async ({ page }) => {
    // Try to access tailor dashboard without login
    await page.goto('/dashboard/tailor/orders');
    
    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 });
    
    expect(page.url()).toContain('/login');
  });
});

