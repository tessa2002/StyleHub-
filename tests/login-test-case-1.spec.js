import { test, expect } from '@playwright/test';

/**
 * Test Case 1: Verify Login with valid username and password
 * 
 * Project Name: StyleHub
 * Test Case ID: Test_1
 * Test Designed By: Tessa Saji
 * Test Priority: High
 * Test Designed Date: 07-10-2025
 * Module Name: Login Page
 * Test Executed By: Ms. Merin Chacko
 * Test Execution Date: 07-10-2025
 * 
 * Description: Login page test with valid credentials. 
 * Ensure that valid users (Admin, Customer, Tailor) can log in successfully 
 * and access their respective dashboards.
 * 
 * Pre-Condition: User has valid username and password
 * Post-Condition: User credentials verified and user redirected to correct dashboard
 */

const BASE_URL = 'http://localhost:3000';

// Test data for different user roles
const testUsers = {
  admin: {
    username: 'admin',
    password: 'admin123', // Replace with actual encrypted password
    expectedDashboard: '/admin/dashboard',
    role: 'Admin'
  },
  customer: {
    username: 'customer@example.com',
    password: 'customer123', // Replace with actual encrypted password
    expectedDashboard: '/portal/dashboard',
    role: 'Customer'
  },
  tailor: {
    username: 'tailor@example.com',
    password: 'tailor123', // Replace with actual encrypted password
    expectedDashboard: '/dashboard/tailor',
    role: 'Tailor'
  }
};

test.describe('Test Case 1: Login with Valid Credentials', () => {

  test.beforeEach(async ({ page }) => {
    // Step 1: Open the browser (implicit in Playwright)
    // Step 2: Navigate to the login URL
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
  });

  test('Step 1-2: Browser opens and Login page loads successfully', async ({ page }) => {
    // Verify browser opened (implicit)
    // Verify login page loaded
    const loginPageTitle = page.locator(':text("Staff Login"), :text("Login"), :text("Sign In")').first();
    await expect(loginPageTitle).toBeVisible({ timeout: 10000 });
    
    // Verify login form is visible
    const loginForm = page.locator('form').first();
    await expect(loginForm).toBeVisible();
    
    console.log('✓ Step 1: Browser opened successfully');
    console.log('✓ Step 2: Login page loaded successfully');
  });

  test('Step 3-6: Admin Login with valid credentials', async ({ page }) => {
    const user = testUsers.admin;
    
    // Step 3: Enter valid username
    const usernameInput = page.locator('input[type="email"], input[type="text"], input[name="email"], input[name="username"]').first();
    await usernameInput.fill(user.username);
    await expect(usernameInput).toHaveValue(user.username);
    console.log('✓ Step 3: Username entered -', user.username);
    
    // Step 4: Enter valid password
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(user.password);
    await expect(passwordInput).toHaveValue(user.password);
    console.log('✓ Step 4: Password entered (encrypted)');
    
    // Step 5: Click Login button
    const loginButton = page.locator('button').filter({ hasText: /LOGIN|Login|Sign In/ }).first();
    await expect(loginButton).toBeEnabled();
    await loginButton.click();
    
    // Wait for navigation
    await page.waitForURL(`**${user.expectedDashboard}**`, { timeout: 10000 });
    
    // Verify redirect to Admin Dashboard
    const currentUrl = page.url();
    expect(currentUrl).toContain(user.expectedDashboard);
    console.log('✓ Step 5: Login clicked - Redirected to Dashboard');
    
    // Verify dashboard elements are visible
    const dashboardTitle = page.locator(':text("Dashboard"), :text("Admin"), :text("Welcome")').first();
    await expect(dashboardTitle).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Step 6: Browser session active');
    console.log('✓ Post-Condition: Admin user redirected to correct dashboard');
  });

  test('Step 3-6: Customer Login with valid credentials', async ({ page }) => {
    const user = testUsers.customer;
    
    // Step 3: Enter valid username
    const usernameInput = page.locator('input[type="email"], input[type="text"], input[name="email"], input[name="username"]').first();
    await usernameInput.fill(user.username);
    await expect(usernameInput).toHaveValue(user.username);
    console.log('✓ Step 3: Username entered -', user.username);
    
    // Step 4: Enter valid password
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(user.password);
    await expect(passwordInput).toHaveValue(user.password);
    console.log('✓ Step 4: Password entered (encrypted)');
    
    // Step 5: Click Login button
    const loginButton = page.locator('button').filter({ hasText: /LOGIN|Login|Sign In/ }).first();
    await expect(loginButton).toBeEnabled();
    await loginButton.click();
    
    // Wait for navigation
    await page.waitForURL(`**${user.expectedDashboard}**`, { timeout: 10000 });
    
    // Verify redirect to Customer Dashboard
    const currentUrl = page.url();
    expect(currentUrl).toContain(user.expectedDashboard);
    console.log('✓ Step 5: Login clicked - Redirected to Dashboard');
    
    // Verify dashboard elements are visible
    const dashboardTitle = page.locator(':text("Dashboard"), :text("Portal"), :text("Welcome")').first();
    await expect(dashboardTitle).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Step 6: Browser session active');
    console.log('✓ Post-Condition: Customer user redirected to correct dashboard');
  });

  test('Step 3-6: Tailor Login with valid credentials', async ({ page }) => {
    const user = testUsers.tailor;
    
    // Step 3: Enter valid username
    const usernameInput = page.locator('input[type="email"], input[type="text"], input[name="email"], input[name="username"]').first();
    await usernameInput.fill(user.username);
    await expect(usernameInput).toHaveValue(user.username);
    console.log('✓ Step 3: Username entered -', user.username);
    
    // Step 4: Enter valid password
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(user.password);
    await expect(passwordInput).toHaveValue(user.password);
    console.log('✓ Step 4: Password entered (encrypted)');
    
    // Step 5: Click Login button
    const loginButton = page.locator('button').filter({ hasText: /LOGIN|Login|Sign In/ }).first();
    await expect(loginButton).toBeEnabled();
    await loginButton.click();
    
    // Wait for navigation
    await page.waitForURL(`**${user.expectedDashboard}**`, { timeout: 10000 });
    
    // Verify redirect to Tailor Dashboard
    const currentUrl = page.url();
    expect(currentUrl).toContain(user.expectedDashboard);
    console.log('✓ Step 5: Login clicked - Redirected to Dashboard');
    
    // Verify dashboard elements are visible
    const dashboardTitle = page.locator(':text("Dashboard"), :text("Tailor"), :text("Welcome")').first();
    await expect(dashboardTitle).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Step 6: Browser session active');
    console.log('✓ Post-Condition: Tailor user redirected to correct dashboard');
  });

  test('Complete Test Flow: All Steps for Admin User', async ({ page }) => {
    const user = testUsers.admin;
    
    // Step 1: Browser opened (implicit)
    console.log('Step 1: Browser opened successfully');
    
    // Step 2: Navigate to login URL
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    const loginPageVisible = await page.locator('form').first().isVisible();
    expect(loginPageVisible).toBe(true);
    console.log('Step 2: Login page loaded successfully');
    
    // Step 3: Enter valid username
    const usernameInput = page.locator('input[type="email"], input[type="text"], input[name="email"], input[name="username"]').first();
    await usernameInput.fill(user.username);
    await expect(usernameInput).toHaveValue(user.username);
    console.log('Step 3: Username entered -', user.username, '- Username accepted');
    
    // Step 4: Enter valid password
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(user.password);
    await expect(passwordInput).toHaveValue(user.password);
    console.log('Step 4: Password entered (encrypted) - Password accepted');
    
    // Step 5: Click Login
    const loginButton = page.locator('button').filter({ hasText: /LOGIN|Login|Sign In/ }).first();
    await expect(loginButton).toBeEnabled();
    await loginButton.click();
    
    // Wait for redirect
    await page.waitForURL(`**${user.expectedDashboard}**`, { timeout: 10000 });
    const currentUrl = page.url();
    expect(currentUrl).toContain(user.expectedDashboard);
    console.log('Step 5: Login clicked - Redirected to Dashboard');
    
    // Step 6: Close browser (will be done automatically after test)
    console.log('Step 6: Browser will be closed after test completion');
    
    // Post-Condition verification
    const dashboardVisible = await page.locator(':text("Dashboard"), :text("Admin")').first().isVisible();
    expect(dashboardVisible).toBe(true);
    console.log('Post-Condition: User credentials verified and redirected to correct dashboard');
  });

  test.afterEach(async ({ page }) => {
    // Step 6: Close browser (handled by Playwright)
    // This is implicit - Playwright closes browser after each test
    console.log('Browser closed');
  });
});


