import { test, expect } from '@playwright/test';

/**
 * Test Case 1: Verify Login with valid username and password
 * Test Case ID: Test_1
 * Module: Login Page
 * Priority: High
 */

const BASE_URL = 'http://localhost:3000';

test.describe('Test Case 1: Login with Valid Credentials', () => {

  test('Complete Login Flow - Admin User', async ({ page }) => {
    // Step 1: Open the browser (implicit)
    // Step 2: Navigate to login URL
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    
    // Verify login page loaded
    const loginForm = page.locator('form').first();
    await expect(loginForm).toBeVisible();
    
    // Step 3: Enter valid username
    const usernameInput = page.locator('input[type="email"], input[type="text"], input[name="email"], input[name="username"]').first();
    await usernameInput.fill('admin');
    await expect(usernameInput).toHaveValue('admin');
    
    // Step 4: Enter valid password
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill('admin123'); // Replace with actual password
    await expect(passwordInput).toHaveValue('admin123');
    
    // Step 5: Click Login
    const loginButton = page.locator('button').filter({ hasText: /LOGIN|Login|Sign In/ }).first();
    await expect(loginButton).toBeEnabled();
    await loginButton.click();
    
    // Verify redirect to dashboard
    await page.waitForURL('**/admin/dashboard**', { timeout: 10000 });
    const currentUrl = page.url();
    expect(currentUrl).toContain('/admin/dashboard');
    
    // Verify dashboard is visible
    const dashboard = page.locator(':text("Dashboard"), :text("Admin")').first();
    await expect(dashboard).toBeVisible({ timeout: 5000 });
    
    // Step 6: Browser will close automatically
  });

  test('Complete Login Flow - Customer User', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    const usernameInput = page.locator('input[type="email"], input[type="text"]').first();
    await usernameInput.fill('customer@example.com');
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('customer123');
    
    const loginButton = page.locator('button').filter({ hasText: /LOGIN|Login/ }).first();
    await loginButton.click();
    
    await page.waitForURL('**/portal/dashboard**', { timeout: 10000 });
    expect(page.url()).toContain('/portal/dashboard');
  });

  test('Complete Login Flow - Tailor User', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    const usernameInput = page.locator('input[type="email"], input[type="text"]').first();
    await usernameInput.fill('tailor@example.com');
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('tailor123');
    
    const loginButton = page.locator('button').filter({ hasText: /LOGIN|Login/ }).first();
    await loginButton.click();
    
    await page.waitForURL('**/dashboard/tailor**', { timeout: 10000 });
    expect(page.url()).toContain('/dashboard/tailor');
  });
});


