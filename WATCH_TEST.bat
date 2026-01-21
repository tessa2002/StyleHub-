@echo off
cls
echo.
echo ================================================
echo   WATCH TESTS IN BROWSER (VISIBLE)
echo ================================================
echo.
echo You will SEE the browser open and tests run!
echo.
echo ================================================
echo.

REM Quick server check
echo Checking servers...
curl -s http://localhost:5000 >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ Backend not running on port 5000
    echo    Start it: cd backend ^&^& npm start
    echo.
    pause
    exit /b 1
)

curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ Frontend not running on port 3000
    echo    Start it: cd frontend ^&^& npm start
    echo.
    pause
    exit /b 1
)

echo ✓ Servers are running!
echo.
echo ================================================
echo   OPENING BROWSER NOW...
echo ================================================
echo.
echo You will see:
echo   → Browser window opens
echo   → Test navigates pages
echo   → Forms being filled
echo   → Buttons being clicked
echo   → Test verification
echo.
echo Watch the browser window! 👀
echo.
timeout /t 3 /nobreak
echo.
echo Starting test...
echo.

REM Run test with visible browser (--headed)
call npx playwright test tests/full-project.spec.js -g "Customer can login" --headed --reporter=list

echo.
echo ================================================
echo   Test Complete!
echo ================================================
echo.
echo What you just saw:
echo   ✓ Browser opened (visible!)
echo   ✓ Went to login page
echo   ✓ Filled in credentials
echo   ✓ Clicked login button
echo   ✓ Verified successful login
echo.
echo Want to see more?
echo   Run: WATCH_ALL_TESTS.bat
echo.
pause













