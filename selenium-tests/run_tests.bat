@echo off
REM StyleHub Selenium Test Runner for Windows

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           StyleHub Selenium Test Suite                     ║
echo ║                                                            ║
echo ║  Testing: Admin, Customer, and Tailor Login ^& Dashboards  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.7+ from https://www.python.org/
    pause
    exit /b 1
)

echo ✓ Python is installed
echo.

REM Check if selenium is installed
python -c "import selenium" >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing Selenium...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✓ Selenium installed successfully
) else (
    echo ✓ Selenium is already installed
)

echo.
echo ⚙️  Pre-flight Checks:
echo.
echo 1. Make sure Chrome browser is installed
echo 2. Make sure StyleHub backend is running
echo 3. Make sure StyleHub frontend is running on http://localhost:3000
echo.
echo Press any key to start tests or Ctrl+C to cancel...
pause >nul

echo.
echo 🚀 Starting tests...
echo.

REM Create screenshots directory if it doesn't exist
if not exist "screenshots" mkdir screenshots

REM Run tests
python test_stylehub.py

echo.
echo 📸 Screenshots saved in: screenshots\
echo.
pause
