@echo off
cls
:menu
echo.
echo ================================================
echo   WATCH TESTS - BROWSER VISIBLE
echo ================================================
echo.
echo Choose what to watch:
echo.
echo   1. Single test (Customer Login) - FAST
echo   2. Own Fabric Order test - CRITICAL
echo   3. All Authentication tests
echo   4. All Customer Portal tests
echo   5. All tests (MANY browsers!)
echo   6. UI Mode (Interactive - BEST!)
echo.
echo   0. Exit
echo.
echo ================================================
set /p choice="Enter your choice (0-6): "

if "%choice%"=="1" goto test1
if "%choice%"=="2" goto test2
if "%choice%"=="3" goto test3
if "%choice%"=="4" goto test4
if "%choice%"=="5" goto test5
if "%choice%"=="6" goto test6
if "%choice%"=="0" goto end
goto menu

:test1
cls
echo.
echo ================================================
echo   WATCHING: Customer Login Test
echo ================================================
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak
call npx playwright test tests/full-project.spec.js -g "Customer can login" --headed --reporter=list
echo.
echo Test complete! Press any key to return to menu...
pause >nul
goto menu

:test2
cls
echo.
echo ================================================
echo   WATCHING: Own Fabric Order Test
echo ================================================
echo.
echo This is the CRITICAL test!
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak
call npx playwright test tests/own-fabric-order.spec.js -g "no automatic redirect" --headed --reporter=list
echo.
echo Test complete! Press any key to return to menu...
pause >nul
goto menu

:test3
cls
echo.
echo ================================================
echo   WATCHING: All Authentication Tests
echo ================================================
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak
call npx playwright test tests/full-project.spec.js -g "Authentication" --headed --reporter=list
echo.
echo Tests complete! Press any key to return to menu...
pause >nul
goto menu

:test4
cls
echo.
echo ================================================
echo   WATCHING: All Customer Portal Tests
echo ================================================
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak
call npx playwright test tests/full-project.spec.js -g "Customer Portal" --headed --reporter=list
echo.
echo Tests complete! Press any key to return to menu...
pause >nul
goto menu

:test5
cls
echo.
echo ================================================
echo   WATCHING: ALL TESTS
echo ================================================
echo.
echo ⚠️  WARNING: This will open MANY browser windows!
echo.
set /p confirm="Continue? (Y/N): "
if /i not "%confirm%"=="Y" goto menu
echo.
echo Opening browsers in 3 seconds...
timeout /t 3 /nobreak
call npx playwright test tests/full-project.spec.js --headed --workers=3 --reporter=list
echo.
echo All tests complete! Press any key to return to menu...
pause >nul
goto menu

:test6
cls
echo.
echo ================================================
echo   OPENING UI MODE
echo ================================================
echo.
echo This opens an interactive test viewer!
echo.
echo In UI Mode you can:
echo   → Click to run any test
echo   → Watch in browser
echo   → Pause and inspect
echo   → Step through actions
echo.
echo Opening UI Mode...
timeout /t 2 /nobreak
call npx playwright test tests/full-project.spec.js --ui
goto menu

:end
echo.
echo Goodbye!
exit /b 0













