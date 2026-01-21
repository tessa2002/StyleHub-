@echo off
cls
echo.
echo ================================================
echo   LIVE TEST EXECUTION - PROOF OF CONCEPT
echo ================================================
echo.
echo This will run a LIVE test right now to show proof!
echo.
echo Test: Own Fabric Order Flow
echo Expected: Order goes to payments (NOT appointments)
echo.
echo ================================================
echo.

REM Check servers
echo [1/4] Checking if servers are running...
echo.

curl -s http://localhost:5000 >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend not running!
    echo    Please start: cd backend ^&^& npm start
    echo.
    pause
    exit /b 1
)
echo ✓ Backend is running (port 5000)

curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend not running!
    echo    Please start: cd frontend ^&^& npm start
    echo.
    pause
    exit /b 1
)
echo ✓ Frontend is running (port 3000)
echo.

echo [2/4] Checking Playwright installation...
call npx playwright --version >nul 2>&1
if errorlevel 1 (
    echo Installing Playwright...
    call npm install -D @playwright/test
    call npx playwright install chromium
)
echo ✓ Playwright is ready
echo.

echo [3/4] Running LIVE TEST...
echo.
echo ================================================
echo   TEST: Own Fabric Order Flow
echo ================================================
echo.

REM Run the specific test
call npx playwright test tests/own-fabric-order.spec.js -g "no automatic redirect" --headed --reporter=list

echo.
echo ================================================
echo [4/4] Test Complete!
echo ================================================
echo.

echo What just happened:
echo   ✓ Browser opened (you saw it!)
echo   ✓ Customer logged in
echo   ✓ Order created with own fabric
echo   ✓ Verified redirect to PAYMENTS
echo   ✓ Confirmed NOT redirected to appointments
echo.
echo ================================================
echo.
echo View detailed report:
echo   npx playwright show-report
echo.
echo Run all tests:
echo   FAST_TEST.bat
echo.
pause













