@echo off
echo ========================================
echo   Own Fabric Order Flow Tests
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if Playwright is installed
echo Checking Playwright installation...
call npx playwright --version >nul 2>&1
if errorlevel 1 (
    echo Installing Playwright...
    call npm install -D @playwright/test
    call npx playwright install
    echo.
)

echo ========================================
echo   Choose Test Option:
echo ========================================
echo   1. Run all own fabric tests
echo   2. Run complete flow test only
echo   3. Run admin approval test only
echo   4. Run with UI mode (visual)
echo   5. Run in debug mode
echo   6. Run with headed browser (visible)
echo   7. Show last test report
echo ========================================
echo.

set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" (
    echo.
    echo Running all own fabric tests...
    call npx playwright test tests/own-fabric-order.spec.js
) else if "%choice%"=="2" (
    echo.
    echo Running complete flow test...
    call npx playwright test tests/own-fabric-order.spec.js -g "Complete own fabric order flow"
) else if "%choice%"=="3" (
    echo.
    echo Running admin approval test...
    call npx playwright test tests/own-fabric-order.spec.js -g "Admin can see and approve"
) else if "%choice%"=="4" (
    echo.
    echo Starting UI mode...
    call npx playwright test tests/own-fabric-order.spec.js --ui
) else if "%choice%"=="5" (
    echo.
    echo Starting debug mode...
    call npx playwright test tests/own-fabric-order.spec.js --debug
) else if "%choice%"=="6" (
    echo.
    echo Running with headed browser...
    call npx playwright test tests/own-fabric-order.spec.js --headed
) else if "%choice%"=="7" (
    echo.
    echo Opening test report...
    call npx playwright show-report
) else (
    echo Invalid choice!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Test Execution Complete!
echo ========================================
echo.
echo View detailed report: npx playwright show-report
echo.
pause
