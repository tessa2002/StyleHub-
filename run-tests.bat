@echo off
echo 🧪 StyleHub Playwright Test Runner
echo ==================================
echo.

REM Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm not found. Please install Node.js first.
    exit /b 1
)

REM Install Playwright if needed
if not exist "node_modules\@playwright" (
    echo 📦 Installing Playwright...
    call npm install --save-dev @playwright/test
    echo 🌐 Installing browsers...
    call npx playwright install
)

echo 🔍 Checking if servers are running...
echo.

REM Check backend
curl -s http://localhost:5000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend server is running on http://localhost:5000
) else (
    echo ⚠️  Backend server not detected
    echo    Please start backend: cd backend ^&^& npm start
    echo.
)

REM Check frontend
curl -s http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Frontend server is running on http://localhost:3000
) else (
    echo ⚠️  Frontend server not detected
    echo    Please start frontend: cd frontend ^&^& npm start
    echo.
)

echo.
echo 🚀 Running Playwright tests...
echo.

REM Run tests
call npm test

echo.
echo 📊 Test run complete!
echo.
echo 📝 To view the HTML report:
echo    npm run test:report
echo.

pause

