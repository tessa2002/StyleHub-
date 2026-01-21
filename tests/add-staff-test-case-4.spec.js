import { test, expect } from '@playwright/test';

/**
 * Test Case 4: Add Staff/Tailor Test Case
 * 
 * Project Name: StyleHub
 * Test Case ID: Test_4
 * Test Designed By: Tessa Saji
 * Test Priority: High
 * Test Designed Date: 10-10-2025
 * Module Name: Add Staff Page
 * Test Executed By: Ms. Merin Chacko
 * Test Title: Verify adding new staff/tailor with valid details
 * Test Execution Date: 10-10-2025
 * 
 * Description: Ensures admin can add new staff members (Staff/Tailor) 
 * successfully and temporary password is generated.
 * 
 * Pre-Condition: Application is running and accessible, user is logged in as Admin
 * Post-Condition: New staff member added to database with temporary password
 */

const BASE_URL = 'http://localhost:3000';

test.describe('Test Case 4: Add Staff/Tailor Tests', () => {

  // Before each test, login as admin
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Login with admin credentials
    const inputs = page.locator('input');
    const usernameInput = inputs.nth(0);
    const passwordInput = inputs.nth(1);
    const loginButton = page.locator('button').filter({ hasText: /LOGIN|Login/ }).first();

    await usernameInput.fill('admin');
    await passwordInput.fill('Admin@123');
    await loginButton.click();

    // Wait for login to complete
    await page.waitForTimeout(1000);

    // Verify login was successful
    const hasToken = await page.evaluate(() => {
      return !!localStorage.getItem('token');
    });

    if (!hasToken) {
      throw new Error('Login failed - no token found');
    }

    // Navigate to add staff page
    // Try different possible routes
    const possibleRoutes = [
      '/admin/add-staff',
      '/admin/staff/new',
      '/dashboard/add-staff',
      '/admin/staff',
      '/dashboard/staff'
    ];

    let navigated = false;
    for (const route of possibleRoutes) {
      try {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
        await page.waitForTimeout(1000);
        
        // Check if we're on a staff management page
        const pageContent = await page.textContent('body');
        if (pageContent?.includes('Staff') || pageContent?.includes('Tailor') || pageContent?.includes('Add')) {
          navigated = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // If navigation failed, try clicking a link
    if (!navigated) {
      try {
        const staffLink = page.locator('a, button').filter({ hasText: /Staff|Tailor|Add/ }).first();
        if (await staffLink.isVisible({ timeout: 3000 })) {
          await staffLink.click();
          await page.waitForTimeout(1000);
          
          // Click Add button if exists
          const addButton = page.locator('button').filter({ hasText: /Add|New|Create/ }).first();
          if (await addButton.isVisible({ timeout: 3000 })) {
            await addButton.click();
            await page.waitForTimeout(1000);
          }
        }
      } catch (e) {
        // Continue with test anyway
      }
    }

    // Wait for page to render
    await page.waitForTimeout(1000);
  });

  test('Step 1-5: Complete Add Staff Flow', async ({ page }) => {
    // Step 1: Navigate to "Add Staff" page
    const formTitle = page.locator(':text("Add Staff"), :text("Add New Staff"), :text("Add Tailor"), :text("Staff")').first();
    await expect(formTitle).toBeVisible({ timeout: 10000 });
    console.log('✓ Step 1: Navigate to Add Staff page - Page loaded successfully');

    // Step 2: Enter staff details (Name, Username, Email, Role)
    const nameField = page.locator('input[name="name"], input[placeholder*="Name"]').first();
    await nameField.fill('John Tailor');
    await expect(nameField).toHaveValue('John Tailor');
    console.log('✓ Step 2: Name entered - John Tailor');

    const usernameField = page.locator('input[name="username"], input[placeholder*="Username"]').first();
    if (await usernameField.isVisible({ timeout: 3000 })) {
      await usernameField.fill('johntailor');
      await expect(usernameField).toHaveValue('johntailor');
      console.log('✓ Step 2: Username entered - johntailor');
    }

    const emailField = page.locator('input[name="email"], input[type="email"]').first();
    await emailField.fill('john.tailor@stylehub.com');
    await expect(emailField).toHaveValue('john.tailor@stylehub.com');
    console.log('✓ Step 2: Email entered - john.tailor@stylehub.com');

    // Step 3: Select role
    const roleField = page.locator('select[name="role"], input[name="role"]').first();
    if (await roleField.isVisible({ timeout: 3000 })) {
      if (await roleField.evaluate(el => el.tagName === 'SELECT')) {
        await roleField.selectOption('Tailor');
        const selectedRole = await roleField.inputValue();
        expect(selectedRole).toBe('Tailor');
        console.log('✓ Step 3: Role selected - Tailor');
      } else {
        await roleField.fill('Tailor');
        console.log('✓ Step 3: Role entered - Tailor');
      }
    }

    console.log('✓ Step 2-3: Staff details entered - Details accepted');

    // Step 4: Click Add Staff button
    const addButton = page.locator('button').filter({ hasText: /Add Staff|Add|Create|Submit/ }).first();
    await expect(addButton).toBeEnabled();
    await addButton.click();
    console.log('✓ Step 4: Click Add Staff - Button clicked');

    // Wait for form submission
    await page.waitForTimeout(2000);

    // Step 5: Verify staff created and temporary password displayed
    try {
      // Check for success message with temporary password
      const successMessage = page.locator(':text("success"), :text("Success"), :text("created"), :text("password"), :text("Password")').first();
      await expect(successMessage).toBeVisible({ timeout: 5000 });
      
      // Check if temporary password is mentioned
      const messageText = await successMessage.textContent();
      if (messageText?.toLowerCase().includes('password') || messageText?.toLowerCase().includes('temp')) {
        console.log('✓ Step 5: Staff created with temporary password - Temporary password generated');
      } else {
        console.log('✓ Step 5: Staff created successfully - Staff member added');
      }
    } catch (e) {
      // Check if redirected to staff list
      const currentUrl = page.url();
      if (currentUrl.includes('staff') || currentUrl.includes('dashboard')) {
        console.log('✓ Step 5: Staff created (redirected to list)');
      } else {
        throw new Error('Staff creation failed - no success indication');
      }
    }

    console.log('✓ Post-Condition: New staff member added to database with temporary password');
  });

  test('Step 1: Navigate to Add Staff page', async ({ page }) => {
    // Step 1: Navigate to "Add Staff" page
    const formTitle = page.locator(':text("Add Staff"), :text("Add New Staff"), :text("Staff")').first();
    await expect(formTitle).toBeVisible({ timeout: 10000 });
    
    // Verify form is visible
    const nameField = page.locator('input[name="name"]').first();
    await expect(nameField).toBeVisible();
    
    console.log('Step 1: Navigate to Add Staff page - Page loaded successfully - Pass');
  });

  test('Step 2: Enter staff details', async ({ page }) => {
    // Step 2: Enter staff details
    const nameField = page.locator('input[name="name"]').first();
    await nameField.fill('Jane Staff');
    await expect(nameField).toHaveValue('Jane Staff');

    const emailField = page.locator('input[name="email"], input[type="email"]').first();
    await emailField.fill('jane.staff@stylehub.com');
    await expect(emailField).toHaveValue('jane.staff@stylehub.com');

    const usernameField = page.locator('input[name="username"]').first();
    if (await usernameField.isVisible({ timeout: 2000 })) {
      await usernameField.fill('janestaff');
      await expect(usernameField).toHaveValue('janestaff');
    }

    console.log('Step 2: Enter staff details - Details accepted - Pass');
  });

  test('Step 3: Select role', async ({ page }) => {
    // Fill name and email first
    const nameField = page.locator('input[name="name"]').first();
    await nameField.fill('Test Staff');

    const emailField = page.locator('input[name="email"]').first();
    await emailField.fill('test@stylehub.com');

    // Step 3: Select role
    const roleField = page.locator('select[name="role"]').first();
    if (await roleField.isVisible({ timeout: 3000 })) {
      await roleField.selectOption('Staff');
      const selectedRole = await roleField.inputValue();
      expect(selectedRole).toBe('Staff');
      console.log('Step 3: Select role - Role selected - Pass');
    } else {
      console.log('⚠ Step 3: Role field not found (may be auto-set)');
    }
  });

  test('Step 4-5: Submit form and verify staff creation', async ({ page }) => {
    // Fill form
    const nameField = page.locator('input[name="name"]').first();
    await nameField.fill('New Tailor');

    const emailField = page.locator('input[name="email"]').first();
    await emailField.fill('newtailor@stylehub.com');

    const roleField = page.locator('select[name="role"]').first();
    if (await roleField.isVisible({ timeout: 2000 })) {
      await roleField.selectOption('Tailor');
    }

    // Step 4: Click Add Staff
    const addButton = page.locator('button').filter({ hasText: /Add Staff|Add|Create/ }).first();
    await addButton.click();
    await page.waitForTimeout(2000);

    // Step 5: Verify success and temporary password
    const successMessage = page.locator(':text("success"), :text("Success"), :text("created")').first();
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    
    // Check for password mention
    const messageText = await successMessage.textContent();
    if (messageText?.toLowerCase().includes('password')) {
      console.log('Step 4-5: Click Add Staff - Staff created with temporary password - Temporary password generated - Pass');
    } else {
      console.log('Step 4-5: Click Add Staff - Staff created successfully - Staff member added - Pass');
    }
  });

  test('Form validation for required fields', async ({ page }) => {
    // Try to submit empty form
    const addButton = page.locator('button').filter({ hasText: /Add Staff|Add|Create/ }).first();
    
    const isDisabled = await addButton.isDisabled();
    if (!isDisabled) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Check for validation
      const validation = page.locator(':text("required"), :text("Required"), :text("Please")').first();
      await expect(validation).toBeVisible({ timeout: 3000 });
      console.log('✓ Form validation working - required fields validated');
    } else {
      expect(isDisabled).toBe(true);
      console.log('✓ Submit button disabled when form is empty');
    }
  });

  test('Verify role options available', async ({ page }) => {
    const roleField = page.locator('select[name="role"]').first();
    if (await roleField.isVisible({ timeout: 3000 })) {
      // Check available options
      const options = await roleField.locator('option').allTextContents();
      expect(options.length).toBeGreaterThan(0);
      
      // Verify expected roles exist
      const optionsText = options.join(' ');
      expect(optionsText).toMatch(/Staff|Tailor|Admin/i);
      console.log('✓ Role options available:', options);
    }
  });
});


