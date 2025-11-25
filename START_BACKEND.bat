@echo off
title Backend API - Vyron Fashion
color 0B
cd /d "%~dp0backend"
echo ========================================
echo   VYRON FASHION - BACKEND API
echo   Starting on http://0.0.0.0:8000
echo ========================================
echo.
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
