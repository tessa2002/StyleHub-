@echo off
echo ========================================
echo   Rebuilding Frontend and Deploying
echo ========================================
echo.

echo [1/4] Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Frontend build complete!
echo.

echo [2/4] Staging changes...
cd ..
git add frontend/build frontend/src/context/AuthContext.js frontend/src/pages/Login.js
echo.

echo [3/4] Committing changes...
git commit -m "Fix: Add validation for login response and improve error handling"
if %errorlevel% neq 0 (
    echo ⚠️  No changes to commit or commit failed
)
echo.

echo [4/4] Pushing to remote...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Push failed! Please check your git configuration.
    pause
    exit /b 1
)
echo.

echo ========================================
echo ✅ Deploy complete!
echo.
echo Your changes are being deployed to Render.
echo Check your Render dashboard for deployment status.
echo ========================================
pause

