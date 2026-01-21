@echo off
cls
echo.
echo ================================================
echo   FAST FULL PROJECT TEST
echo ================================================
echo.
echo This will run ALL tests in parallel for speed!
echo.
echo Test Coverage:
echo   ✓ Authentication (Customer/Admin/Tailor/Staff)
echo   ✓ Customer Portal (Orders, Appointments, Bills)
echo   ✓ Admin Dashboard (All pages)
echo   ✓ Tailor Dashboard
echo   ✓ Order Creation Flow
echo   ✓ Appointment Workflow
echo   ✓ Navigation & UI
echo   ✓ Responsive Design
echo   ✓ Critical User Journeys
echo.
echo ================================================
echo.

REM Check servers are running
echo Checking if servers are running...
echo.

curl -s http://localhost:5000 >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend not running on port 5000!
    echo    Please start: cd backend ^&^& npm start
    echo.
    pause
    exit /b 1
)
echo ✓ Backend is running

curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend not running on port 3000!
    echo    Please start: cd frontend ^&^& npm start
    echo.
    pause
    exit /b 1
)
echo ✓ Frontend is running
echo.

echo ================================================
echo   Starting Tests...
echo ================================================
echo.

REM Run tests with fast config
call npx playwright test tests/full-project.spec.js --config=playwright-fast.config.js --reporter=list

echo.
echo ================================================
echo   Tests Complete!
echo ================================================
echo.
echo View detailed report:
echo   npx playwright show-report
echo.
pause













