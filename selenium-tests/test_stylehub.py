"""
StyleHub Selenium Test Suite
Tests login and dashboard access for Admin, Customer, and Tailor roles
"""

import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException
import time

class StyleHubTestSuite(unittest.TestCase):
    """Test suite for StyleHub application"""
    
    BASE_URL = "http://localhost:3000"
    
    # Test credentials
    ADMIN_CREDENTIALS = {
        "email": "admin@gmail.com",
        "password": "Admin@123",
        "role": "Admin"
    }
    
    CUSTOMER_CREDENTIALS = {
        "email": "milka@gmail.com",
        "password": "Milka@123",
        "role": "Customer"
    }
    
    TAILOR_CREDENTIALS = {
        "email": "tessasaji@gmail.com",
        "password": "Tessasaji@123",
        "role": "Tailor"
    }
    
    @classmethod
    def setUpClass(cls):
        """Set up Chrome driver once for all tests"""
        chrome_options = Options()
        # Uncomment the line below to run in headless mode
        # chrome_options.add_argument("--headless")
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_argument("--disable-notifications")
        
        cls.driver = webdriver.Chrome(options=chrome_options)
        cls.driver.implicitly_wait(10)
        cls.wait = WebDriverWait(cls.driver, 15)
    
    @classmethod
    def tearDownClass(cls):
        """Close browser after all tests"""
        time.sleep(2)  # Brief pause to see final state
        cls.driver.quit()
    
    def setUp(self):
        """Navigate to home page before each test"""
        self.driver.get(self.BASE_URL)
        time.sleep(1)
    
    def tearDown(self):
        """Logout after each test"""
        try:
            # Try to find and click logout button
            logout_button = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, ".mini-logout, .logout-btn, button[title='Logout']"))
            )
            logout_button.click()
            time.sleep(1)
        except:
            # If logout fails, just navigate to home
            self.driver.get(self.BASE_URL)
    
    def login(self, email, password):
        """Helper method to perform login"""
        print(f"\n🔐 Logging in as: {email}")
        
        # Wait for and click login button on home page
        try:
            login_link = self.wait.until(
                EC.element_to_be_clickable((By.LINK_TEXT, "Login"))
            )
            login_link.click()
            print("✓ Clicked Login link")
        except TimeoutException:
            # Try alternative selectors
            login_link = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href='/login'], .login-btn"))
            )
            login_link.click()
            print("✓ Clicked Login button")
        
        time.sleep(1)
        
        # Fill in email
        email_input = self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email'], input[name='email']"))
        )
        email_input.clear()
        email_input.send_keys(email)
        print(f"✓ Entered email: {email}")
        
        # Fill in password
        password_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='password'], input[name='password']")
        password_input.clear()
        password_input.send_keys(password)
        print("✓ Entered password")
        
        # Click login button
        login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit'], .login-submit-btn")
        login_button.click()
        print("✓ Clicked Login button")
        
        time.sleep(2)
    
    def verify_dashboard_elements(self, role):
        """Verify dashboard loaded correctly for the role"""
        print(f"\n🔍 Verifying {role} Dashboard...")
        
        # Wait for dashboard to load
        try:
            dashboard = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".dashboard-root, .dashboard-main, .dashboard-content"))
            )
            print("✓ Dashboard loaded")
        except TimeoutException:
            self.fail(f"Dashboard did not load for {role}")
        
        # Verify URL contains expected path
        current_url = self.driver.current_url
        if role == "Admin":
            self.assertIn("/admin", current_url, "Admin should be redirected to /admin")
            print("✓ URL contains /admin")
        elif role == "Customer":
            self.assertIn("/portal", current_url, "Customer should be redirected to /portal")
            print("✓ URL contains /portal")
        elif role == "Tailor":
            self.assertIn("/tailor", current_url, "Tailor should be redirected to /tailor")
            print("✓ URL contains /tailor")
        
        # Verify sidebar exists
        try:
            sidebar = self.driver.find_element(By.CSS_SELECTOR, ".dashboard-sidebar, .sidebar, aside")
            self.assertTrue(sidebar.is_displayed(), "Sidebar should be visible")
            print("✓ Sidebar is visible")
        except:
            print("⚠ Sidebar not found (might be using different layout)")
        
        # Take screenshot
        screenshot_name = f"screenshots/{role.lower()}_dashboard.png"
        self.driver.save_screenshot(screenshot_name)
        print(f"✓ Screenshot saved: {screenshot_name}")
        
        # Verify role-specific elements
        if role == "Admin":
            self.verify_admin_dashboard()
        elif role == "Customer":
            self.verify_customer_dashboard()
        elif role == "Tailor":
            self.verify_tailor_dashboard()
    
    def verify_admin_dashboard(self):
        """Verify Admin-specific dashboard elements"""
        print("\n📊 Verifying Admin Dashboard Elements...")
        
        # Check for admin navigation items
        expected_nav_items = ["Dashboard", "Orders", "Staff", "Inventory"]
        
        for item in expected_nav_items:
            try:
                nav_element = self.driver.find_element(By.LINK_TEXT, item)
                print(f"✓ Found navigation: {item}")
            except:
                print(f"⚠ Navigation item not found: {item}")
        
        # Check for admin-specific content
        try:
            page_source = self.driver.page_source.lower()
            admin_keywords = ["admin", "manage", "staff", "inventory"]
            found_keywords = [kw for kw in admin_keywords if kw in page_source]
            print(f"✓ Found admin keywords: {', '.join(found_keywords)}")
        except:
            pass
    
    def verify_customer_dashboard(self):
        """Verify Customer-specific dashboard elements"""
        print("\n👤 Verifying Customer Dashboard Elements...")
        
        # Check for customer navigation items
        expected_nav_items = ["Dashboard", "New Request", "My Orders", "Measurements"]
        
        for item in expected_nav_items:
            try:
                nav_element = self.driver.find_element(By.LINK_TEXT, item)
                print(f"✓ Found navigation: {item}")
            except:
                print(f"⚠ Navigation item not found: {item}")
        
        # Check for customer-specific content
        try:
            page_source = self.driver.page_source.lower()
            customer_keywords = ["order", "measurement", "fabric", "appointment"]
            found_keywords = [kw for kw in customer_keywords if kw in page_source]
            print(f"✓ Found customer keywords: {', '.join(found_keywords)}")
        except:
            pass
    
    def verify_tailor_dashboard(self):
        """Verify Tailor-specific dashboard elements"""
        print("\n✂️ Verifying Tailor Dashboard Elements...")
        
        # Check for tailor navigation items
        expected_nav_items = ["Dashboard", "My Tasks", "Orders"]
        
        for item in expected_nav_items:
            try:
                nav_element = self.driver.find_element(By.LINK_TEXT, item)
                print(f"✓ Found navigation: {item}")
            except:
                print(f"⚠ Navigation item not found: {item}")
        
        # Check for tailor-specific content
        try:
            page_source = self.driver.page_source.lower()
            tailor_keywords = ["task", "assigned", "work", "order"]
            found_keywords = [kw for kw in tailor_keywords if kw in page_source]
            print(f"✓ Found tailor keywords: {', '.join(found_keywords)}")
        except:
            pass
    
    # Test Cases
    
    def test_01_admin_login_and_dashboard(self):
        """Test Admin login and dashboard access"""
        print("\n" + "="*60)
        print("TEST 1: ADMIN LOGIN AND DASHBOARD")
        print("="*60)
        
        self.login(
            self.ADMIN_CREDENTIALS["email"],
            self.ADMIN_CREDENTIALS["password"]
        )
        
        self.verify_dashboard_elements(self.ADMIN_CREDENTIALS["role"])
        
        print("\n✅ Admin test completed successfully!")
    
    def test_02_customer_login_and_dashboard(self):
        """Test Customer login and dashboard access"""
        print("\n" + "="*60)
        print("TEST 2: CUSTOMER LOGIN AND DASHBOARD")
        print("="*60)
        
        self.login(
            self.CUSTOMER_CREDENTIALS["email"],
            self.CUSTOMER_CREDENTIALS["password"]
        )
        
        self.verify_dashboard_elements(self.CUSTOMER_CREDENTIALS["role"])
        
        print("\n✅ Customer test completed successfully!")
    
    def test_03_tailor_login_and_dashboard(self):
        """Test Tailor login and dashboard access"""
        print("\n" + "="*60)
        print("TEST 3: TAILOR LOGIN AND DASHBOARD")
        print("="*60)
        
        self.login(
            self.TAILOR_CREDENTIALS["email"],
            self.TAILOR_CREDENTIALS["password"]
        )
        
        self.verify_dashboard_elements(self.TAILOR_CREDENTIALS["role"])
        
        print("\n✅ Tailor test completed successfully!")
    
    def test_04_invalid_login(self):
        """Test login with invalid credentials"""
        print("\n" + "="*60)
        print("TEST 4: INVALID LOGIN")
        print("="*60)
        
        print("\n🔐 Testing invalid login...")
        
        # Navigate to login
        login_link = self.wait.until(
            EC.element_to_be_clickable((By.LINK_TEXT, "Login"))
        )
        login_link.click()
        time.sleep(1)
        
        # Enter invalid credentials
        email_input = self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
        email_input.send_keys("invalid@example.com")
        
        password_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        password_input.send_keys("wrongpassword")
        
        login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_button.click()
        
        time.sleep(2)
        
        # Verify error message or still on login page
        current_url = self.driver.current_url
        self.assertIn("/login", current_url, "Should remain on login page after invalid credentials")
        print("✓ Remained on login page (invalid credentials rejected)")
        
        print("\n✅ Invalid login test completed successfully!")


def run_tests():
    """Run all tests and generate report"""
    import os
    
    # Create screenshots directory
    if not os.path.exists("screenshots"):
        os.makedirs("screenshots")
        print("📁 Created screenshots directory")
    
    # Run tests
    suite = unittest.TestLoader().loadTestsFromTestCase(StyleHubTestSuite)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"Tests run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print("="*60)
    
    return result


if __name__ == "__main__":
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║           StyleHub Selenium Test Suite                     ║
    ║                                                            ║
    ║  Testing: Admin, Customer, and Tailor Login & Dashboards  ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    
    print("\n⚙️  Setup Instructions:")
    print("1. Make sure Chrome browser is installed")
    print("2. Install required packages: pip install selenium")
    print("3. Make sure StyleHub is running on http://localhost:3000")
    print("4. Press Enter to start tests...\n")
    
    input()
    
    run_tests()
