@echo off
cd /d "%~dp0"
echo Starting Vyron Fashion Backend API...
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
