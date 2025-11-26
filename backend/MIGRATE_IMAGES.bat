@echo off
cd /d "%~dp0"
echo ============================================================
echo MIGRATE IMAGES - Keo anh san pham ve local
echo ============================================================
echo.

python auto_migrate_images.py

echo.
echo Nhan phim bat ky de thoat...
pause > nul
