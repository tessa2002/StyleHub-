"""
StyleHub Selenium Test - Admin Only
Tests only Admin login and dashboard
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
import time
import os

BASE_URL = "http://localhost:3000"

# Admin credentials
ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "Admin@123"

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-notifications")
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.implicitly_wait(10)
    return driver

def find_element_by_multiple_selectors(driver, selectors):
    """Try multiple selectors to find an element"""
    for selector_type, selector_value in selectors:
        try:
            element = driver.find_element(selector_type, selector_value)
            if element.is_displayed():
                return element
        except:
            continue
    return None

def test_admin_login():
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║           StyleHub Admin Login Test                        ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    
    print("\n🚀 Starting Admin test...")
    print("⚙️  Make sure StyleHub is running on http://localhost:3000\n")
    
    driver = setup_driver()
    print("✓ Chrome driver ready\n")
    
    try:
        print("="*60)
        print("TEST: ADMIN LOGIN AND DASHBOARD")
        print("="*60)
        
        print(f"\n🔐 Logging in as: {ADMIN_EMAIL}")
        
        # Navigate to home
        driver.get(BASE_URL)
        time.sleep(2)
        
        # Try to find and click login link
        login_selectors = [
            (By.LINK_TEXT, "Login"),
            (By.PARTIAL_LINK_TEXT, "Login"),
            (By.CSS_SELECTOR, "a[href='/login']"),
            (By.CSS_SELECTOR, "a[href*='login']"),
            (By.XPATH, "//a[contains(text(), 'Login')]"),
        ]
        
        login_link = find_element_by_multiple_selectors(driver, login_selectors)
        if login_link:
            login_link.click()
            print("✓ Clicked Login link")
            time.sleep(2)
        else:
            print("⚠ Login link not found, assuming already on login page")
        
        # Try to find email input
        email_selectors = [
            (By.CSS_SELECTOR, "input[type='email']"),
            (By.CSS_SELECTOR, "input[name='email']"),
            (By.CSS_SELECTOR, "input[placeholder*='email' i]"),
            (By.ID, "email"),
            (By.NAME, "email"),
        ]
        
        email_input = find_element_by_multiple_selectors(driver, email_selectors)
        if email_input:
            email_input.clear()
            email_input.send_keys(ADMIN_EMAIL)
            print(f"✓ Entered email: {ADMIN_EMAIL}")
        else:
            print("✗ Email input not found")
            if not os.path.exists("screenshots"):
                os.makedirs("screenshots")
            driver.save_screenshot("screenshots/debug_login_page.png")
            print("📸 Screenshot saved: screenshots/debug_login_page.png")
            return False
        
        # Try to find password input
        password_selectors = [
            (By.CSS_SELECTOR, "input[type='password']"),
            (By.CSS_SELECTOR, "input[name='password']"),
            (By.ID, "password"),
            (By.NAME, "password"),
        ]
        
        password_input = find_element_by_multiple_selectors(driver, password_selectors)
        if password_input:
            password_input.clear()
            password_input.send_keys(ADMIN_PASSWORD)
            print("✓ Entered password")
        else:
            print("✗ Password input not found")
            return False
        
        # Try to find and click login button
        button_selectors = [
            (By.CSS_SELECTOR, "button[type='submit']"),
            (By.CSS_SELECTOR, "input[type='submit']"),
            (By.XPATH, "//button[contains(text(), 'Login')]"),
            (By.XPATH, "//button[contains(text(), 'Sign in')]"),
        ]
        
        login_button = find_element_by_multiple_selectors(driver, button_selectors)
        if login_button:
            login_button.click()
            print("✓ Clicked Login button")
        else:
            # Try pressing Enter as fallback
            password_input.send_keys(Keys.RETURN)
            print("✓ Pressed Enter to submit")
        
        time.sleep(4)
        
        # Verify dashboard
        print("\n🔍 Verifying Admin Dashboard...")
        
        current_url = driver.current_url
        if "/admin" in current_url:
            print(f"✓ URL contains /admin")
            print(f"  Current URL: {current_url}")
        else:
            print(f"✗ Expected URL to contain /admin, got {current_url}")
            driver.save_screenshot("screenshots/admin_error.png")
            return False
        
        # Check dashboard loaded
        dashboard_selectors = [
            (By.CSS_SELECTOR, ".dashboard-root"),
            (By.CSS_SELECTOR, ".dashboard-main"),
            (By.CSS_SELECTOR, ".dashboard-content"),
            (By.CSS_SELECTOR, "[class*='dashboard']"),
        ]
        
        dashboard = find_element_by_multiple_selectors(driver, dashboard_selectors)
        if dashboard:
            print("✓ Dashboard loaded")
        else:
            print("⚠ Dashboard element not found, but URL is correct")
        
        # Check for admin-specific elements
        admin_elements = ["Orders", "Staff", "Inventory", "Dashboard"]
        found_elements = []
        for element_text in admin_elements:
            try:
                driver.find_element(By.LINK_TEXT, element_text)
                found_elements.append(element_text)
            except:
                pass
        
        if found_elements:
            print(f"✓ Found admin navigation: {', '.join(found_elements)}")
        
        # Take screenshot
        if not os.path.exists("screenshots"):
            os.makedirs("screenshots")
        screenshot_path = "screenshots/admin_dashboard.png"
        driver.save_screenshot(screenshot_path)
        print(f"✓ Screenshot saved: {screenshot_path}")
        
        print("\n" + "="*60)
        print("✅ ADMIN TEST PASSED!")
        print("="*60)
        print(f"\n📸 Screenshot: {screenshot_path}")
        print(f"🌐 Dashboard URL: {current_url}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error during test: {e}")
        import traceback
        traceback.print_exc()
        
        # Take error screenshot
        try:
            if not os.path.exists("screenshots"):
                os.makedirs("screenshots")
            driver.save_screenshot("screenshots/admin_error.png")
            print("📸 Error screenshot saved: screenshots/admin_error.png")
        except:
            pass
        
        return False
        
    finally:
        print("\n🔒 Closing browser...")
        time.sleep(3)  # Keep browser open for 3 seconds to see result
        driver.quit()
        print("✓ Browser closed")
        print("\n✅ Test completed!")

if __name__ == "__main__":
    success = test_admin_login()
    exit(0 if success else 1)
