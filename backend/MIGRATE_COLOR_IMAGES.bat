@echo off
echo ========================================
echo MIGRATION ANH MAU SAN PHAM
echo ========================================
echo.

cd /d "%~dp0"

echo Dang chay migration...
python migrate_color_images.py

echo.
echo ========================================
echo Xong! Refresh trang admin de thay anh.
echo ========================================
pause
