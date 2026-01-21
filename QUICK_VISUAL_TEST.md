# 🎬 Watch Tests in Browser - Quick Guide

## 🚀 Super Easy - Just Double-Click!

### **Option 1: Watch Single Test (Fastest)**
```
Double-click: WATCH_TEST.bat
```
- Opens 1 browser window
- Runs login test
- Duration: 10 seconds
- **Perfect for first-time viewing!**

---

### **Option 2: Watch Critical Own Fabric Test**
```
Double-click: WATCH_OWN_FABRIC.bat
```
- Opens 1 browser window
- Tests own fabric order flow
- Shows redirect to payments (not appointments)
- Duration: 30 seconds
- **Best proof of main feature!**

---

### **Option 3: Interactive Menu**
```
Double-click: WATCH_TESTS_MENU.bat
```
- Choose what to watch
- Multiple test options
- **Most flexible!**

---

### **Option 4: UI Mode (Best Experience!)**
```
Double-click and choose option 6
OR
npx playwright test --ui
```
- Interactive test viewer
- Click to run any test
- Pause and inspect
- Time travel through test
- **Most powerful!**

---

## 🎯 What You'll See

### **When You Run WATCH_TEST.bat:**

```
1. Console shows: "Opening browser in 3 seconds..."
   ↓
2. Chrome browser opens (visible!)
   ↓
3. Goes to: http://localhost:3000/login
   ↓
4. You see form fields appear
   ↓
5. Email field fills: customer@example.com
   ↓
6. Password field fills: ******** (masked)
   ↓
7. "Login" button clicks (you see it!)
   ↓
8. Page redirects to dashboard
   ↓
9. Test verifies URL
   ↓
10. Browser closes
    ↓
Console shows: ✓ Test PASSED!
```

**Duration:** 10 seconds
**What you see:** Everything happens in real browser!

---

### **When You Run WATCH_OWN_FABRIC.bat:**

```
1. Browser opens
   ↓
2. Login page loads
   ↓
3. Customer logs in (you see it!)
   ↓
4. Redirects to dashboard
   ↓
5. Goes to new order page
   ↓
6. "Own Fabric" checkbox clicks
   ↓
7. Fabric fields fill in
   ↓
8. Submit button clicks
   ↓
9. ⚡ Page redirects to PAYMENTS (you see URL!)
   ↓
10. Test verifies: URL contains "/payment"
    Test verifies: URL does NOT contain "/appointment"
    ↓
Test PASSES! ✅
```

**Duration:** 30 seconds
**Proof:** You watch it redirect to payments!

---

## 🎬 UI Mode (Best Experience)

### **Start UI Mode:**
```bash
# Option 1: Via menu
WATCH_TESTS_MENU.bat → Press 6

# Option 2: Direct command
npx playwright test --ui
```

### **What You Get:**

```
┌─────────────────────────────────────────┐
│  Playwright Test Runner - UI Mode      │
├─────────────────────────────────────────┤
│                                         │
│  📁 Tests                 🎬 Actions    │
│  ├─ ✓ Authentication      ▶ Run        │
│  │  ├─ Customer login     ⏸ Pause      │
│  │  ├─ Admin login        ⏭ Step       │
│  │  └─ Tailor login       🔄 Reload    │
│  ├─ ✓ Customer Portal                  │
│  ├─ ✓ Order Creation                   │
│  └─ ✓ Admin Dashboard                  │
│                                         │
│  Browser Preview          📊 Timeline   │
│  [Shows actual browser]   [Shows steps] │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**
- ✅ Click any test to run
- ✅ Watch in browser
- ✅ Pause at any step
- ✅ Inspect elements
- ✅ Time travel (rewind!)
- ✅ See what test sees

---

## 📋 Available Scripts

| Script | What It Does | Duration | Browsers |
|--------|-------------|----------|----------|
| `WATCH_TEST.bat` | Single login test | 10s | 1 |
| `WATCH_OWN_FABRIC.bat` | Own fabric test | 30s | 1 |
| `WATCH_ALL_TESTS.bat` | All 50+ tests | 2min | Many! |
| `WATCH_TESTS_MENU.bat` | Interactive menu | Varies | Varies |

---

## 🎯 Command Line Options

### **Watch Any Specific Test:**
```bash
# Watch customer login
npx playwright test -g "Customer can login" --headed

# Watch own fabric flow
npx playwright test -g "Own fabric" --headed

# Watch all authentication
npx playwright test -g "Authentication" --headed

# Watch all customer portal tests
npx playwright test -g "Customer Portal" --headed
```

### **Control Speed:**
```bash
# Slower (see each action)
npx playwright test -g "Customer can login" --headed --slowMo=1000

# Normal speed
npx playwright test -g "Customer can login" --headed

# Debug mode (step through)
npx playwright test -g "Customer can login" --debug
```

---

## 🔍 UI Mode Features Explained

### **1. Run Any Test**
- Click test in sidebar
- Click "Run" button
- Watch in browser panel

### **2. Pause Execution**
- Click "Pause" during test
- Inspect current state
- Step through manually

### **3. Time Travel**
- Slide timeline back
- See previous states
- Replay actions

### **4. Inspect Elements**
- Hover over elements
- See selectors
- Verify what test sees

### **5. Edit and Rerun**
- Modify test code
- Save changes
- Rerun immediately

---

## 💡 Pro Tips

### **Tip 1: Slow Down Tests**
```bash
# Add delay between actions (milliseconds)
npx playwright test --headed --slowMo=500
```

### **Tip 2: Keep Browser Open**
```bash
# Browser stays open after test
npx playwright test --headed --debug
```

### **Tip 3: Record Video**
```bash
# Already configured in playwright.config.js
# Videos saved on failure automatically
```

### **Tip 4: Take Screenshots**
```bash
# Add to test code:
await page.screenshot({ path: 'screenshot.png' });
```

---

## 🎬 Recommended First Run

**For first-time viewing:**

```bash
1. Double-click: WATCH_TEST.bat
   → See how tests work
   → Quick 10 seconds

2. Double-click: WATCH_OWN_FABRIC.bat
   → See main feature
   → Verify redirect to payments

3. Double-click: WATCH_TESTS_MENU.bat → Press 6
   → Open UI Mode
   → Explore interactively
```

---

## 📊 What Happens in Background

### **When You Run --headed:**

```
Playwright launches:
├─ Real Chrome browser (visible!)
├─ Navigates to your app
├─ Interacts with page (fills forms, clicks buttons)
├─ Takes screenshots (on failure)
├─ Records video (on failure)
└─ Shows you everything!
```

### **Normal vs Headed Mode:**

```
Headless (default):
- No visible browser
- Faster execution
- Background only
- Good for CI/CD

Headed (--headed):
- Visible browser! 👀
- See what's happening
- Watch real interactions
- Good for debugging
```

---

## ✅ Quick Checklist

Before running visible tests:

- [ ] Backend running (port 5000)
- [ ] Frontend running (port 3000)
- [ ] Playwright installed (`npx playwright --version`)
- [ ] Test users exist

---

## 🚀 Start Now!

**Fastest way to see it:**

```
1. Make sure servers running
2. Double-click: WATCH_TEST.bat
3. Watch the browser! 👀
```

That's it! You'll see the test run in a real browser window.

---

## 🎥 What You'll Actually See

### **Real Browser Window Opens:**
```
┌──────────────────────────────────────────┐
│  ← → ⟳ http://localhost:3000/login      │
├──────────────────────────────────────────┤
│                                          │
│          LOGIN                           │
│                                          │
│  Email:    customer@example.com  ←typing!│
│  Password: ********              ←typing!│
│                                          │
│         [Login Button]           ←click! │
│                                          │
│  Test is controlling this! 🤖           │
│                                          │
└──────────────────────────────────────────┘

Then redirects to dashboard...
Then browser closes.
Console shows: ✓ Test PASSED!
```

---

**Ready? Just double-click `WATCH_TEST.bat` and watch the magic! ✨**













