"""
StyleHub Simple Selenium Test
Standalone test script - no unittest framework needed
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time

# Configuration
BASE_URL = "http://localhost:3000"

# Test credentials
CREDENTIALS = {
    "Admin": {"email": "admin@gmail.com", "password": "Admin@123", "expected_url": "/admin"},
    "Customer": {"email": "milka@gmail.com", "password": "Milka@123", "expected_url": "/portal"},
    "Tailor": {"email": "tessasaji@gmail.com", "password": "Tessasaji@123", "expected_url": "/tailor"}
}

def print_header(text):
    """Print formatted header"""
    print("\n" + "="*60)
    print(text)
    print("="*60)

def print_success(text):
    """Print success message"""
    print(f"✓ {text}")

def print_error(text):
    """Print error message"""
    print(f"✗ {text}")

def setup_driver():
    """Setup Chrome driver"""
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-notifications")
    # Uncomment for headless mode
    # chrome_options.add_argument("--headless")
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.implicitly_wait(10)
    return driver

def login(driver, email, password):
    """Perform login"""
    wait = WebDriverWait(driver, 15)
    
    print(f"\n🔐 Logging in as: {email}")
    
    # Navigate to home page
    driver.get(BASE_URL)
    time.sleep(1)
    
    # Click login link
    try:
        login_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Login")))
        login_link.click()
        print_success("Clicked Login link")
    except:
        try:
            login_link = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href='/login']")))
            login_link.click()
            print_success("Clicked Login button")
        except Exception as e:
            print_error(f"Failed to find login link: {e}")
            return False
    
    time.sleep(1)
    
    # Fill in email
    try:
        email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
        email_input.clear()
        email_input.send_keys(email)
        print_success(f"Entered email: {email}")
    except Exception as e:
        print_error(f"Failed to enter email: {e}")
        return False
    
    # Fill in password
    try:
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        password_input.clear()
        password_input.send_keys(password)
        print_success("Entered password")
    except Exception as e:
        print_error(f"Failed to enter password: {e}")
        return False
    
    # Click login button
    try:
        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_button.click()
        print_success("Clicked Login button")
    except Exception as e:
        print_error(f"Failed to click login button: {e}")
        return False
    
    time.sleep(3)
    return True

def verify_dashboard(driver, role, expected_url):
    """Verify dashboard loaded correctly"""
    wait = WebDriverWait(driver, 15)
    
    print(f"\n🔍 Verifying {role} Dashboard...")
    
    # Check URL
    current_url = driver.current_url
    if expected_url in current_url:
        print_success(f"URL contains {expected_url}")
    else:
        print_error(f"Expected URL to contain {expected_url}, got {current_url}")
        return False
    
    # Check dashboard loaded
    try:
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".dashboard-root, .dashboard-main, .dashboard-content")))
        print_success("Dashboard loaded")
    except:
        print_error("Dashboard did not load")
        return False
    
    # Check sidebar
    try:
        sidebar = driver.find_element(By.CSS_SELECTOR, ".dashboard-sidebar, .sidebar, aside")
        if sidebar.is_displayed():
            print_success("Sidebar is visible")
    except:
        print("⚠ Sidebar not found (might be using different layout)")
    
    # Take screenshot
    try:
        import os
        if not os.path.exists("screenshots"):
            os.makedirs("screenshots")
        screenshot_path = f"screenshots/{role.lower()}_dashboard.png"
        driver.save_screenshot(screenshot_path)
        print_success(f"Screenshot saved: {screenshot_path}")
    except Exception as e:
        print_error(f"Failed to save screenshot: {e}")
    
    return True

def logout(driver):
    """Logout from application"""
    try:
        wait = WebDriverWait(driver, 5)
        logout_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, ".mini-logout, .logout-btn, button[title='Logout']")))
        logout_button.click()
        time.sleep(1)
        print_success("Logged out successfully")
    except:
        # If logout fails, just navigate to home
        driver.get(BASE_URL)
        print("⚠ Logout button not found, navigated to home")

def test_role(driver, role, credentials):
    """Test login and dashboard for a specific role"""
    print_header(f"TEST: {role.upper()} LOGIN AND DASHBOARD")
    
    success = True
    
    # Login
    if not login(driver, credentials["email"], credentials["password"]):
        print_error(f"{role} login failed")
        return False
    
    # Verify dashboard
    if not verify_dashboard(driver, role, credentials["expected_url"]):
        print_error(f"{role} dashboard verification failed")
        success = False
    
    # Logout
    logout(driver)
    
    if success:
        print(f"\n✅ {role} test completed successfully!")
    else:
        print(f"\n❌ {role} test failed!")
    
    return success

def main():
    """Main test execution"""
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║           StyleHub Selenium Test Suite                     ║
    ║                                                            ║
    ║  Testing: Admin, Customer, and Tailor Login & Dashboards  ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    
    print("\n⚙️  Pre-flight Checks:")
    print("1. Make sure Chrome browser is installed")
    print("2. Make sure StyleHub backend is running")
    print("3. Make sure StyleHub frontend is running on http://localhost:3000")
    print("\nPress Enter to start tests or Ctrl+C to cancel...")
    input()
    
    # Setup driver
    print("\n🚀 Setting up Chrome driver...")
    driver = setup_driver()
    
    results = {}
    
    try:
        # Test each role
        for role, credentials in CREDENTIALS.items():
            results[role] = test_role(driver, role, credentials)
            time.sleep(2)
        
        # Print summary
        print_header("TEST SUMMARY")
        total = len(results)
        passed = sum(1 for v in results.values() if v)
        failed = total - passed
        
        print(f"Tests run: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print("="*60)
        
        for role, success in results.items():
            status = "✅ PASSED" if success else "❌ FAILED"
            print(f"{role}: {status}")
        
        print("\n📸 Screenshots saved in: screenshots/")
        
    except KeyboardInterrupt:
        print("\n\n⚠ Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error during tests: {e}")
    finally:
        print("\n🔒 Closing browser...")
        driver.quit()
        print("✓ Browser closed")

if __name__ == "__main__":
    main()
