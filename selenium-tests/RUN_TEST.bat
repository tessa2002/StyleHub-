@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           StyleHub Selenium Test Suite                     ║
echo ║                                                            ║
echo ║  Testing: Admin, Customer, and Tailor Login ^& Dashboards  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo.
echo ⚙️  IMPORTANT: Before running tests, make sure:
echo.
echo    1. ✓ Chrome browser is installed
echo    2. ✓ StyleHub backend is running
echo    3. ✓ StyleHub frontend is running on http://localhost:3000
echo.
echo.
pause

python run_test_now.py

echo.
echo.
pause
