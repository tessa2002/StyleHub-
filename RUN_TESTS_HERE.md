# ⚠️ IMPORTANT: Run Tests from ROOT Directory

## 🎯 Correct Directory Structure

```
C:\Users\HP\style_hub\          ← RUN TESTS FROM HERE! ✅
├── package.json                 ← Playwright test scripts
├── playwright.config.js         ← Test configuration
├── tests/                       ← Test files
│   ├── auth.spec.js
│   └── tailor-workflow.spec.js
├── backend/                     ← Backend code
│   └── package.json            ← Backend dependencies
└── frontend/                    ← Frontend code
    └── package.json            ← Frontend dependencies
```

---

## ✅ How to Run Tests

### Step 1: Make Sure You're in the RIGHT Directory

```bash
# Check your current directory
pwd

# Should show: C:\Users\HP\style_hub
# If not, navigate to it:
cd C:\Users\HP\style_hub
```

### Step 2: Verify Installation

```bash
# You should be in: C:\Users\HP\style_hub
ls package.json           # Should exist
ls playwright.config.js   # Should exist
ls tests/                 # Should exist
```

### Step 3: Run Tests

```bash
# From C:\Users\HP\style_hub
npm test
```

---

## 🚨 Common Mistakes

### ❌ WRONG - Running from frontend directory
```bash
C:\Users\HP\style_hub\frontend> npm run test:ui
# Error: Missing script: "test:ui"
```

### ❌ WRONG - Running from backend directory
```bash
C:\Users\HP\style_hub\backend> npm test
# Error: Missing script
```

### ✅ CORRECT - Running from root directory
```bash
C:\Users\HP\style_hub> npm test
# Tests run successfully!
```

---

## 📋 Quick Reference

**Always run test commands from:** `C:\Users\HP\style_hub\`

| Command | What it does |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:ui` | Open interactive UI |
| `npm run test:headed` | See browser |
| `npm run test:debug` | Debug mode |
| `npm run test:report` | View results |

---

## 🔧 Before Running Tests

Make sure **both servers are running** in **separate terminals**:

**Terminal 1 (Backend):**
```bash
cd C:\Users\HP\style_hub\backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd C:\Users\HP\style_hub\frontend
npm start
```

**Terminal 3 (Tests) - FROM ROOT:**
```bash
cd C:\Users\HP\style_hub
npm test
```

---

## 🎯 Your Checklist

- [ ] I'm in `C:\Users\HP\style_hub\` (root directory)
- [ ] Backend is running on http://localhost:5000
- [ ] Frontend is running on http://localhost:3000
- [ ] I've run `npm install --save-dev @playwright/test`
- [ ] I've run `npx playwright install chromium`
- [ ] Now I can run `npm test`

---

## 💡 Pro Tip

Add this to your terminal prompt to always know where you are:

```bash
# PowerShell
pwd

# Should show:
# Path
# ----
# C:\Users\HP\style_hub
```

If you see `\frontend` or `\backend` at the end, navigate up:

```bash
cd ..
```

---

**Remember:** 

🟢 **ROOT DIRECTORY** = `C:\Users\HP\style_hub\` ← Run tests here!

🔴 **NOT** from frontend or backend directories!

