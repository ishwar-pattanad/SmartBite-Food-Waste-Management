@echo off
echo ========================================================
echo   Starting SmartBite FastAPI Backend Server
echo ========================================================
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
pause
