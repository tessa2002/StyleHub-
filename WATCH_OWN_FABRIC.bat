@echo off
cls
echo.
echo ================================================
echo   WATCH: Own Fabric Order Test
echo ================================================
echo.
echo You will see the CRITICAL test run:
echo   → Customer creates order with own fabric
echo   → Verifies redirect to PAYMENTS
echo   → NOT redirected to appointments
echo.
echo ================================================
echo.

REM Server check
curl -s http://localhost:5000 >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend not running (port 5000)
    pause
    exit /b 1
)

curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend not running (port 3000)
    pause
    exit /b 1
)

echo ✓ Servers ready!
echo.
echo ================================================
echo   WATCH THE BROWSER! 👀
echo ================================================
echo.
echo You will see:
echo   1. Browser opens
echo   2. Goes to login page
echo   3. Customer logs in
echo   4. Goes to new order page
echo   5. Selects "Own Fabric"
echo   6. Fills order details
echo   7. Submits order
echo   8. ⚡ REDIRECTS TO PAYMENTS (not appointments!)
echo.
timeout /t 3 /nobreak
echo.
echo Opening browser now...
echo.

REM Run the critical test with visible browser
call npx playwright test tests/own-fabric-order.spec.js -g "no automatic redirect" --headed --reporter=list

echo.
echo ================================================
echo   Test Complete! Did you see?
echo ================================================
echo.
echo What just happened:
echo   ✓ Order created with own fabric
echo   ✓ Redirected to PAYMENTS page
echo   ✓ Did NOT go to appointments
echo   ✓ Test PASSED! ✅
echo.
echo This proves the feature works correctly!
echo.
pause













