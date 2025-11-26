@echo off
echo ================================================
echo    Cleanup Duplicate Images Script
echo ================================================
echo.

cd /d "%~dp0"
python cleanup_duplicates.py

echo.
pause
