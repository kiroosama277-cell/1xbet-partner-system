@echo off
REM ============================================================
REM  1XBET Affiliate System - Start Server Script for Windows
REM ============================================================
echo.
echo ========================================
echo   Starting 1XBET Affiliate Server...
echo ========================================
echo.
echo Site:  http://localhost:3000
echo Admin: http://localhost:3000/admin
echo.
echo Press Ctrl+C to stop the server
echo ----------------------------------------
echo.

call npm run dev

pause
