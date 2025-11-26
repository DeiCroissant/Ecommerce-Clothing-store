@echo off
echo ============================================================
echo TEST PERFORMANCE - Kiem tra toc do API
echo ============================================================
echo.
echo Starting backend if not running...
start /min START_BACKEND.bat
timeout /t 3 /nobreak > nul

echo.
echo Running performance tests...
python test_performance.py

echo.
pause
