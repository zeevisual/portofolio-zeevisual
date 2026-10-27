@echo off
title Server Lokal & Studio Admin Zeevisual (localhost:3000)
cd /d "%~dp0"
echo ========================================================
echo   MENYALAKAN SERVER LOKAL & STUDIO ADMIN ZEEVISUAL
echo ========================================================
echo.
echo Membuka browser otomatis ke http://localhost:3000/admin ...
echo (Jangan tutup jendela hitam ini selama Anda sedang mengedit)
echo.
start "" "http://localhost:3000/admin"
call .\node_modules\.bin\vite.cmd --host --port 3000
pause
