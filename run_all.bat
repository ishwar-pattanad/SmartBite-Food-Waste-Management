@echo off
echo ========================================================
echo   Launching SmartBite Full-Stack Web Application
echo ========================================================

start "SmartBite Backend (FastAPI)" cmd /c run_backend.bat
start "SmartBite Frontend (React Vite)" cmd /c run_frontend.bat

echo.
echo [SmartBite] Backend running at:  http://127.0.0.1:8000
echo [SmartBite] Swagger API Docs at: http://127.0.0.1:8000/docs
echo [SmartBite] Frontend running at: http://localhost:5173
echo.
echo Press any key to close this launcher...
pause >nul
