@echo off
REM ============================================================
REM  1XBET Affiliate System - Diagnose Login Issues
REM  Run this if you cannot log in to /admin
REM ============================================================
echo.
echo ========================================
echo   Diagnosing Admin Login Issues...
echo ========================================
echo.

echo [1/6] Checking if server is running...
echo ----------------------------------------
curl -s -o nul -w "Server status: %%{http_code}\n" http://localhost:3000/api/admin/auth/check-ip
echo.

echo [2/6] Checking database file...
echo ----------------------------------------
if exist "db\custom.db" (
    echo Database file exists: db\custom.db
) else (
    echo ERROR: Database file NOT FOUND!
    echo Run SETUP.bat first.
    goto end
)
echo.

echo [3/6] Checking admin user in database...
echo ----------------------------------------
call npx prisma studio --port 5556 --browser none
echo.
echo (Prisma Studio opened on http://localhost:5556)
echo Check the Admin table - you should see user 100001
echo.

echo [4/6] Testing login API directly...
echo ----------------------------------------
echo Testing with userId=100001 accessCode=17F6413A
curl -s -X POST http://localhost:3000/api/admin/auth -H "Content-Type: application/json" -d "{\"userId\":\"100001\",\"accessCode\":\"17F6413A\"}"
echo.
echo.

echo [5/6] Common Login Issues:
echo ----------------------------------------
echo 1. If error: "بيانات الدخول غير صحيحة"
echo    - Wrong access code. Correct code: 17F6413A (uppercase)
echo    - Or run: npm run db:setup
echo.
echo 2. If error: "تم تجاوز عدد المحاولات المسموحة"
echo    - Wait 15 minutes OR
echo    - Run: npm run db:reset to clear attempts
echo.
echo 3. If error: "عنوان IP غير مصرح به"
echo    - First login must come from a whitelisted IP
echo    - Default admin allows ALL IPs (*)
echo    - If you added IP whitelist, delete entries in Prisma Studio
echo.
echo 4. If you see "يجب إدخال كود الوصول"
echo    - You are running an OLD version of the project
echo    - Re-download the latest ZIP and run SETUP.bat
echo.

echo [6/6] Reset Login State (if locked out):
echo ----------------------------------------
echo To reset everything:
echo   1. Stop server (Ctrl+C)
echo   2. Run: npm run db:setup
echo   3. Run: START.bat
echo.

:end
pause
