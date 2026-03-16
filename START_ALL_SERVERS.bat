@echo off
echo ========================================
echo  Starting ALL Style Hub Servers
echo ========================================
echo.
echo This will start:
echo   1. Backend API (Node.js) - Port 5000
echo   2. Frontend React - Port 3000
echo   3. Python ML API - Port 5001
echo.
echo Press any key to continue...
pause >nul

echo.
echo Starting Backend and ML API...
start "Backend & ML" cmd /k "cd backend && npm start"

timeout /t 3 >nul

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo  All servers are starting!
echo ========================================
echo.
echo Check the separate windows for each server:
echo   - Backend & ML: http://localhost:5000 / http://localhost:5001
echo   - Frontend: http://localhost:3000
echo.
echo Close this window to keep servers running.
echo Close individual server windows to stop them.
echo ========================================
