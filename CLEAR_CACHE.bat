@echo off
title Clear Next.js Cache
color 0C
echo ========================================
echo   CLEARING NEXT.JS CACHE
echo ========================================
cd /d "%~dp0vyronfashion"
echo.
echo Deleting .next folder...
if exist .next (
    rmdir /s /q .next
    echo ✅ Cache cleared successfully!
) else (
    echo ⚠️  No .next folder found
)
echo.
echo Press any key to exit...
pause >nul
