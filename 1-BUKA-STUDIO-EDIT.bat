@echo off
title Studio Admin Zeevisual - Server Lokal
cd /d "%~dp0"
echo ========================================================
echo   MEMBUKA STUDIO ADMIN PORTOFOLIO ZEEVISUAL
echo ========================================================
echo.
echo Silakan buka browser Anda ke:
echo   - Halaman Utama : http://localhost:3000
echo   - Halaman Admin : http://localhost:3000/admin
echo.
echo Jangan tutup jendela hitam ini selama Anda sedang mengedit.
echo.
start http://localhost:3000/admin
call .\node_modules\.bin\vite.cmd --host --port 3000
pause
