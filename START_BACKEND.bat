@echo off
echo ========================================
echo   Starting StyleHub Backend Server
echo ========================================
echo.

REM Kill any existing process on port 5000
echo Checking for existing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Stopping process %%a...
    taskkill /PID %%a /F >nul 2>&1
)
echo.

REM Navigate to backend directory
cd /d "%~dp0backend"

echo Starting backend server...
echo Server will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the server
npm run server












