@echo off
echo ====================================
echo Starting Style Hub Application
echo ====================================
echo.

echo Checking for running processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing process %%a on port 5000...
    taskkill /F /PID %%a >nul 2>&1
)

echo Checking for running processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process %%a on port 3000...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ====================================
echo Starting Backend Server (Port 5000)
echo ====================================
cd backend
start "Style Hub Backend" cmd /k "npm start"

timeout /t 3 /nobreak >nul

echo.
echo ====================================
echo Starting Frontend Server (Port 3000)
echo ====================================
cd ..\frontend
start "Style Hub Frontend" cmd /k "npm start"

echo.
echo ====================================
echo Servers are starting...
echo ====================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Both servers will open in new windows.
echo Close this window after servers have started.
echo ====================================
pause








