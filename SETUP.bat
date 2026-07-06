@echo off
REM ============================================================
REM  1XBET Affiliate System - Full Setup Script for Windows
REM  Run this ONCE on a fresh install
REM ============================================================
echo.
echo ========================================
echo   1XBET Affiliate - Setup Script
echo ========================================
echo.

echo [1/5] Installing npm packages...
call npm install
if errorlevel 1 goto error

echo.
echo [2/5] Generating Prisma Client...
call npx prisma generate
if errorlevel 1 goto error

echo.
echo [3/5] Resetting database (this will erase all data)...
call npx prisma db push --force-reset
if errorlevel 1 goto error

echo.
echo [4/5] Seeding default admin user...
call npm run db:seed
if errorlevel 1 goto error

echo.
echo [5/5] Building project (optional verification)...
call npm run build
if errorlevel 1 goto error

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo Default admin credentials:
echo   User ID:     100001
echo   Username:    superadmin
echo   Access Code: 17F6413A
echo.
echo To start the server, run: START.bat
echo.
goto end

:error
echo.
echo ========================================
echo   SETUP FAILED - Check error above
echo ========================================
echo Common fixes:
echo   1. Make sure Node.js 18+ is installed
echo   2. Close any running dev servers and try again
echo   3. Delete node_modules folder and re-run SETUP.bat
echo.

:end
pause
