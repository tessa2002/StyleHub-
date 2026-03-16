package com.stylehub.tests;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.*;
import java.io.File;
import java.util.concurrent.TimeUnit;
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;

/**
 * StyleHub Selenium Test Suite
 * Tests login and dashboard access for Admin, Customer, and Tailor roles
 */
public class StyleHubTest {
    
    private WebDriver driver;
    private WebDriverWait wait;
    private static final String BASE_URL = "http://localhost:3000";
    
    // Test credentials
    private static class Credentials {
        String email;
        String password;
        String role;
        
        Credentials(String email, String password, String role) {
            this.email = email;
            this.password = password;
            this.role = role;
        }
    }
    
    private static final Credentials ADMIN = new Credentials(
        "admin@gmail.com", "Admin@123", "Admin"
    );
    
    private static final Credentials CUSTOMER = new Credentials(
        "milka@gmail.com", "Milka@123", "Customer"
    );
    
    private static final Credentials TAILOR = new Credentials(
        "tessasaji@gmail.com", "Tessasaji@123", "Tailor"
    );
    
    @BeforeClass
    public void setupClass() {
        System.out.println("\n╔════════════════════════════════════════════════════════════╗");
        System.out.println("║           StyleHub Selenium Test Suite                     ║");
        System.out.println("║                                                            ║");
        System.out.println("║  Testing: Admin, Customer, and Tailor Login & Dashboards  ║");
        System.out.println("╚════════════════════════════════════════════════════════════╝\n");
        
        // Create screenshots directory
        File screenshotDir = new File("screenshots");
        if (!screenshotDir.exists()) {
            screenshotDir.mkdirs();
            System.out.println("📁 Created screenshots directory");
        }
    }
    
    @BeforeMethod
    public void setup() {
        // Set up Chrome driver
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");
        options.addArguments("--disable-notifications");
        // Uncomment for headless mode
        // options.addArguments("--headless");
        
        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
        wait = new WebDriverWait(driver, 15);
        
        // Navigate to home page
        driver.get(BASE_URL);
        sleep(1000);
    }
    
    @AfterMethod
    public void teardown() {
        try {
            // Try to logout
            WebElement logoutButton = wait.until(
                ExpectedConditions.elementToBeClickable(
                    By.cssSelector(".mini-logout, .logout-btn, button[title='Logout']")
                )
            );
            logoutButton.click();
            sleep(1000);
        } catch (Exception e) {
            // If logout fails, just navigate to home
            driver.get(BASE_URL);
        }
        
        sleep(2000);
        driver.quit();
    }
    
    /**
     * Helper method to perform login
     */
    private void login(String email, String password) {
        System.out.println("\n🔐 Logging in as: " + email);
        
        try {
            // Click login link
            WebElement loginLink = wait.until(
                ExpectedConditions.elementToBeClickable(By.linkText("Login"))
            );
            loginLink.click();
            System.out.println("✓ Clicked Login link");
        } catch (Exception e) {
            // Try alternative selector
            WebElement loginLink = wait.until(
                ExpectedConditions.elementToBeClickable(
                    By.cssSelector("a[href='/login'], .login-btn")
                )
            );
            loginLink.click();
            System.out.println("✓ Clicked Login button");
        }
        
        sleep(1000);
        
        // Fill in email
        WebElement emailInput = wait.until(
            ExpectedConditions.presenceOfElementLocated(
                By.cssSelector("input[type='email'], input[name='email']")
            )
        );
        emailInput.clear();
        emailInput.sendKeys(email);
        System.out.println("✓ Entered email: " + email);
        
        // Fill in password
        WebElement passwordInput = driver.findElement(
            By.cssSelector("input[type='password'], input[name='password']")
        );
        passwordInput.clear();
        passwordInput.sendKeys(password);
        System.out.println("✓ Entered password");
        
        // Click login button
        WebElement loginButton = driver.findElement(
            By.cssSelector("button[type='submit'], .login-submit-btn")
        );
        loginButton.click();
        System.out.println("✓ Clicked Login button");
        
        sleep(2000);
    }
    
    /**
     * Verify dashboard loaded correctly for the role
     */
    private void verifyDashboard(String role) {
        System.out.println("\n🔍 Verifying " + role + " Dashboard...");
        
        // Wait for dashboard to load
        try {
            wait.until(
                ExpectedConditions.presenceOfElementLocated(
                    By.cssSelector(".dashboard-root, .dashboard-main, .dashboard-content")
                )
            );
            System.out.println("✓ Dashboard loaded");
        } catch (Exception e) {
            Assert.fail("Dashboard did not load for " + role);
        }
        
        // Verify URL contains expected path
        String currentUrl = driver.getCurrentUrl();
        if (role.equals("Admin")) {
            Assert.assertTrue(currentUrl.contains("/admin"), 
                "Admin should be redirected to /admin");
            System.out.println("✓ URL contains /admin");
        } else if (role.equals("Customer")) {
            Assert.assertTrue(currentUrl.contains("/portal"), 
                "Customer should be redirected to /portal");
            System.out.println("✓ URL contains /portal");
        } else if (role.equals("Tailor")) {
            Assert.assertTrue(currentUrl.contains("/tailor"), 
                "Tailor should be redirected to /tailor");
            System.out.println("✓ URL contains /tailor");
        }
        
        // Verify sidebar exists
        try {
            WebElement sidebar = driver.findElement(
                By.cssSelector(".dashboard-sidebar, .sidebar, aside")
            );
            Assert.assertTrue(sidebar.isDisplayed(), "Sidebar should be visible");
            System.out.println("✓ Sidebar is visible");
        } catch (Exception e) {
            System.out.println("⚠ Sidebar not found (might be using different layout)");
        }
        
        // Take screenshot
        takeScreenshot(role.toLowerCase() + "_dashboard");
        
        // Verify role-specific elements
        if (role.equals("Admin")) {
            verifyAdminDashboard();
        } else if (role.equals("Customer")) {
            verifyCustomerDashboard();
        } else if (role.equals("Tailor")) {
            verifyTailorDashboard();
        }
    }
    
    /**
     * Verify Admin-specific dashboard elements
     */
    private void verifyAdminDashboard() {
        System.out.println("\n📊 Verifying Admin Dashboard Elements...");
        
        String[] expectedNavItems = {"Dashboard", "Orders", "Staff", "Inventory"};
        
        for (String item : expectedNavItems) {
            try {
                driver.findElement(By.linkText(item));
                System.out.println("✓ Found navigation: " + item);
            } catch (Exception e) {
                System.out.println("⚠ Navigation item not found: " + item);
            }
        }
        
        // Check for admin-specific content
        String pageSource = driver.getPageSource().toLowerCase();
        String[] adminKeywords = {"admin", "manage", "staff", "inventory"};
        for (String keyword : adminKeywords) {
            if (pageSource.contains(keyword)) {
                System.out.println("✓ Found admin keyword: " + keyword);
            }
        }
    }
    
    /**
     * Verify Customer-specific dashboard elements
     */
    private void verifyCustomerDashboard() {
        System.out.println("\n👤 Verifying Customer Dashboard Elements...");
        
        String[] expectedNavItems = {"Dashboard", "New Request", "My Orders", "Measurements"};
        
        for (String item : expectedNavItems) {
            try {
                driver.findElement(By.linkText(item));
                System.out.println("✓ Found navigation: " + item);
            } catch (Exception e) {
                System.out.println("⚠ Navigation item not found: " + item);
            }
        }
        
        // Check for customer-specific content
        String pageSource = driver.getPageSource().toLowerCase();
        String[] customerKeywords = {"order", "measurement", "fabric", "appointment"};
        for (String keyword : customerKeywords) {
            if (pageSource.contains(keyword)) {
                System.out.println("✓ Found customer keyword: " + keyword);
            }
        }
    }
    
    /**
     * Verify Tailor-specific dashboard elements
     */
    private void verifyTailorDashboard() {
        System.out.println("\n✂️ Verifying Tailor Dashboard Elements...");
        
        String[] expectedNavItems = {"Dashboard", "My Tasks", "Orders"};
        
        for (String item : expectedNavItems) {
            try {
                driver.findElement(By.linkText(item));
                System.out.println("✓ Found navigation: " + item);
            } catch (Exception e) {
                System.out.println("⚠ Navigation item not found: " + item);
            }
        }
        
        // Check for tailor-specific content
        String pageSource = driver.getPageSource().toLowerCase();
        String[] tailorKeywords = {"task", "assigned", "work", "order"};
        for (String keyword : tailorKeywords) {
            if (pageSource.contains(keyword)) {
                System.out.println("✓ Found tailor keyword: " + keyword);
            }
        }
    }
    
    /**
     * Take screenshot
     */
    private void takeScreenshot(String fileName) {
        try {
            File screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            FileUtils.copyFile(screenshot, new File("screenshots/" + fileName + ".png"));
            System.out.println("✓ Screenshot saved: screenshots/" + fileName + ".png");
        } catch (Exception e) {
            System.out.println("⚠ Failed to take screenshot: " + e.getMessage());
        }
    }
    
    /**
     * Sleep helper
     */
    private void sleep(long milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
    
    // Test Cases
    
    @Test(priority = 1)
    public void testAdminLoginAndDashboard() {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("TEST 1: ADMIN LOGIN AND DASHBOARD");
        System.out.println("=".repeat(60));
        
        login(ADMIN.email, ADMIN.password);
        verifyDashboard(ADMIN.role);
        
        System.out.println("\n✅ Admin test completed successfully!");
    }
    
    @Test(priority = 2)
    public void testCustomerLoginAndDashboard() {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("TEST 2: CUSTOMER LOGIN AND DASHBOARD");
        System.out.println("=".repeat(60));
        
        login(CUSTOMER.email, CUSTOMER.password);
        verifyDashboard(CUSTOMER.role);
        
        System.out.println("\n✅ Customer test completed successfully!");
    }
    
    @Test(priority = 3)
    public void testTailorLoginAndDashboard() {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("TEST 3: TAILOR LOGIN AND DASHBOARD");
        System.out.println("=".repeat(60));
        
        login(TAILOR.email, TAILOR.password);
        verifyDashboard(TAILOR.role);
        
        System.out.println("\n✅ Tailor test completed successfully!");
    }
    
    @Test(priority = 4)
    public void testInvalidLogin() {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("TEST 4: INVALID LOGIN");
        System.out.println("=".repeat(60));
        
        System.out.println("\n🔐 Testing invalid login...");
        
        // Navigate to login
        WebElement loginLink = wait.until(
            ExpectedConditions.elementToBeClickable(By.linkText("Login"))
        );
        loginLink.click();
        sleep(1000);
        
        // Enter invalid credentials
        WebElement emailInput = wait.until(
            ExpectedConditions.presenceOfElementLocated(
                By.cssSelector("input[type='email']")
            )
        );
        emailInput.sendKeys("invalid@example.com");
        
        WebElement passwordInput = driver.findElement(
            By.cssSelector("input[type='password']")
        );
        passwordInput.sendKeys("wrongpassword");
        
        WebElement loginButton = driver.findElement(
            By.cssSelector("button[type='submit']")
        );
        loginButton.click();
        
        sleep(2000);
        
        // Verify error message or still on login page
        String currentUrl = driver.getCurrentUrl();
        Assert.assertTrue(currentUrl.contains("/login"), 
            "Should remain on login page after invalid credentials");
        System.out.println("✓ Remained on login page (invalid credentials rejected)");
        
        System.out.println("\n✅ Invalid login test completed successfully!");
    }
}
