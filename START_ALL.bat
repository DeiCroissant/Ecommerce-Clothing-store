@echo off
title Vyron Fashion - Full Stack Server
color 0A
echo ========================================
echo    VYRON FASHION - FULL STACK SERVER
echo ========================================
echo.
echo Starting Backend and Frontend...
echo.

:: Start Backend in new window
start "Backend API (Port 8000)" cmd /k "cd /d C:\Users\ADMIN\Desktop\web\Ecommerce-Clothing-store\backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak >nul

:: Start Frontend in new window
start "Frontend (Port 3000)" cmd /k "cd /d C:\Users\ADMIN\Desktop\web\Ecommerce-Clothing-store\vyronfashion && npm run dev"

echo.
echo ========================================
echo  Backend: http://localhost:8000
echo  Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
