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
echo Starting Backend API...
start "Backend API" cmd /k "cd backend && npm start"

timeout /t 3 >nul

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm start"

timeout /t 3 >nul

echo Starting Python ML API...
start "Python ML API" cmd /k "cd backend\ml\python && pip install -r requirements.txt --quiet && python api.py"

echo.
echo ========================================
echo  All servers are starting!
echo ========================================
echo.
echo Check the separate windows for each server:
echo   - Backend API: http://localhost:5000
echo   - Frontend: http://localhost:3000
echo   - Python ML API: http://localhost:5001
echo.
echo Close this window to keep servers running.
echo Close individual server windows to stop them.
echo ========================================
