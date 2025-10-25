@echo off
echo ============================================
echo    StyleHub Playwright Testing Suite
echo ============================================
echo.

echo Step 1: Checking prerequisites...
echo.

REM Check if Playwright is installed
if not exist "node_modules\@playwright" (
    echo Installing Playwright...
    call npm install --save-dev @playwright/test
    call npx playwright install chromium
)

echo.
echo Step 2: Starting Backend Server...
echo.
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak

echo.
echo Step 3: Starting Frontend Server...
echo.
start "Frontend Server" cmd /k "cd frontend && npm start"
timeout /t 10 /nobreak

echo.
echo Step 4: Running Playwright Tests...
echo.
echo This will open the Playwright Test UI
echo.
pause

call npm run test:ui

echo.
echo ============================================
echo    Testing Complete!
echo ============================================
echo.
pause

