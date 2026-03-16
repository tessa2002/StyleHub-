"""
StyleHub Selenium Test - Robust Version
Tries multiple selectors to find elements
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

CREDENTIALS = {
    "Admin": {"email": "admin@gmail.com", "password": "Admin@123", "expected_url": "/admin"},
    "Customer": {"email": "milka@gmail.com", "password": "Milka@123", "expected_url": "/portal"},
    "Tailor": {"email": "tessasaji@gmail.com", "password": "Tessasaji@123", "expected_url": "/tailor"}
}

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

def login(driver, email, password):
    wait = WebDriverWait(driver, 15)
    
    print(f"\n🔐 Logging in as: {email}")
    
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
        (By.CLASS_NAME, "login-btn"),
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
        (By.CSS_SELECTOR, "input[placeholder*='Email' i]"),
        (By.ID, "email"),
        (By.NAME, "email"),
        (By.XPATH, "//input[@type='email']"),
        (By.XPATH, "//input[contains(@placeholder, 'email')]"),
    ]
    
    email_input = find_element_by_multiple_selectors(driver, email_selectors)
    if email_input:
        email_input.clear()
        email_input.send_keys(email)
        print(f"✓ Entered email: {email}")
    else:
        print("✗ Email input not found")
        print("📸 Taking screenshot for debugging...")
        driver.save_screenshot("screenshots/debug_login_page.png")
        return False
    
    # Try to find password input
    password_selectors = [
        (By.CSS_SELECTOR, "input[type='password']"),
        (By.CSS_SELECTOR, "input[name='password']"),
        (By.CSS_SELECTOR, "input[placeholder*='password' i]"),
        (By.ID, "password"),
        (By.NAME, "password"),
        (By.XPATH, "//input[@type='password']"),
    ]
    
    password_input = find_element_by_multiple_selectors(driver, password_selectors)
    if password_input:
        password_input.clear()
        password_input.send_keys(password)
        print("✓ Entered password")
    else:
        print("✗ Password input not found")
        return False
    
    # Try to find and click login button
    button_selectors = [
        (By.CSS_SELECTOR, "button[type='submit']"),
        (By.CSS_SELECTOR, "button[type='Submit']"),
        (By.CSS_SELECTOR, "input[type='submit']"),
        (By.XPATH, "//button[contains(text(), 'Login')]"),
        (By.XPATH, "//button[contains(text(), 'Sign in')]"),
        (By.XPATH, "//button[contains(text(), 'Submit')]"),
        (By.CLASS_NAME, "login-submit-btn"),
        (By.CLASS_NAME, "submit-btn"),
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
    return True

def verify_dashboard(driver, role, expected_url):
    print(f"\n🔍 Verifying {role} Dashboard...")
    
    current_url = driver.current_url
    if expected_url in current_url:
        print(f"✓ URL contains {expected_url}")
    else:
        print(f"✗ Expected URL to contain {expected_url}, got {current_url}")
        return False
    
    # Check dashboard loaded
    dashboard_selectors = [
        (By.CSS_SELECTOR, ".dashboard-root"),
        (By.CSS_SELECTOR, ".dashboard-main"),
        (By.CSS_SELECTOR, ".dashboard-content"),
        (By.CSS_SELECTOR, "[class*='dashboard']"),
        (By.TAG_NAME, "main"),
    ]
    
    dashboard = find_element_by_multiple_selectors(driver, dashboard_selectors)
    if dashboard:
        print("✓ Dashboard loaded")
    else:
        print("⚠ Dashboard element not found, but URL is correct")
    
    # Take screenshot
    try:
        if not os.path.exists("screenshots"):
            os.makedirs("screenshots")
        screenshot_path = f"screenshots/{role.lower()}_dashboard.png"
        driver.save_screenshot(screenshot_path)
        print(f"✓ Screenshot saved: {screenshot_path}")
    except Exception as e:
        print(f"✗ Failed to save screenshot: {e}")
    
    return True

def logout(driver):
    logout_selectors = [
        (By.CSS_SELECTOR, ".mini-logout"),
        (By.CSS_SELECTOR, ".logout-btn"),
        (By.CSS_SELECTOR, "button[title='Logout']"),
        (By.XPATH, "//button[contains(text(), 'Logout')]"),
        (By.XPATH, "//a[contains(text(), 'Logout')]"),
    ]
    
    logout_button = find_element_by_multiple_selectors(driver, logout_selectors)
    if logout_button:
        logout_button.click()
        time.sleep(1)
        print("✓ Logged out successfully")
    else:
        driver.get(BASE_URL)
        print("⚠ Logout button not found, navigated to home")

def test_role(driver, role, credentials):
    print("\n" + "="*60)
    print(f"TEST: {role.upper()} LOGIN AND DASHBOARD")
    print("="*60)
    
    success = True
    
    if not login(driver, credentials["email"], credentials["password"]):
        print(f"❌ {role} login failed")
        return False
    
    if not verify_dashboard(driver, role, credentials["expected_url"]):
        print(f"❌ {role} dashboard verification failed")
        success = False
    
    logout(driver)
    
    if success:
        print(f"\n✅ {role} test completed successfully!")
    else:
        print(f"\n❌ {role} test failed!")
    
    return success

def main():
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║           StyleHub Selenium Test Suite                     ║
    ║                                                            ║
    ║  Testing: Admin, Customer, and Tailor Login & Dashboards  ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    
    print("\n🚀 Starting tests...")
    print("⚙️  Make sure StyleHub is running on http://localhost:3000\n")
    
    driver = setup_driver()
    print("✓ Chrome driver ready\n")
    
    results = {}
    
    try:
        for role, credentials in CREDENTIALS.items():
            results[role] = test_role(driver, role, credentials)
            time.sleep(2)
        
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        
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
        
        if failed == 0:
            print("\n🎉 All tests passed successfully!")
        else:
            print(f"\n⚠️  {failed} test(s) failed.")
        
    except KeyboardInterrupt:
        print("\n\n⚠ Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("\n🔒 Closing browser...")
        driver.quit()
        print("✓ Done!")

if __name__ == "__main__":
    main()
