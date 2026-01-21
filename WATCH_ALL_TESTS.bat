@echo off
cls
echo.
echo ================================================
echo   WATCH ALL TESTS IN BROWSER
echo ================================================
echo.
echo Multiple browser windows will open!
echo You'll see ALL tests running!
echo.
echo ================================================
echo.

echo What you'll see:
echo   → Multiple browser windows
echo   → Tests running in parallel
echo   → Pages loading
echo   → Forms being filled
echo   → Buttons being clicked
echo.
echo ⚠️  This will open MANY browser windows!
echo.
set /p continue="Continue? (Y/N): "
if /i not "%continue%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo ================================================
echo   OPENING BROWSERS NOW...
echo ================================================
echo.
timeout /t 2 /nobreak

REM Run all tests with visible browsers
call npx playwright test tests/full-project.spec.js --headed --workers=3 --reporter=list

echo.
echo ================================================
echo   All Tests Complete!
echo ================================================
echo.
pause













