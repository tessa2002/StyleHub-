@echo off
echo ========================================
echo  Starting Python ML API Server
echo ========================================
echo.

echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found!
    echo Please install Python 3.7+ from python.org
    pause
    exit /b 1
)

echo.
echo Navigating to Python ML directory...
cd backend\ml\python

echo.
echo Installing Python dependencies (if needed)...
pip install -r requirements.txt --quiet

echo.
echo ========================================
echo  Starting ML API on http://localhost:5001
echo ========================================
echo.
echo Available endpoints:
echo   - GET  /health
echo   - GET  /models/status
echo   - POST /predict/body-measurement
echo.
echo Press CTRL+C to stop the server
echo ========================================
echo.

python api.py
