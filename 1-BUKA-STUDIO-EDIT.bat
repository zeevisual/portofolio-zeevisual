@echo off
title Membuka Studio Admin Zeevisual (localhost:3000)
set "PATH=C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\MinGit\cmd;%PATH%"

if exist "D:\Web Portofolio\package.json" (
  cd /d "D:\Web Portofolio"
) else if exist "%~dp0package.json" (
  cd /d "%~dp0"
) else if exist "%~dp0..\package.json" (
  cd /d "%~dp0.."
)

echo ========================================================
echo   MEMBUKA STUDIO ADMIN ZEEVISUAL (LOCALHOST:3000)
echo ========================================================
echo.

netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
  echo Server lokal sudah aktif di latar belakang!
  echo Membuka http://localhost:3000/admin ...
  start "" "http://localhost:3000/admin"
  exit /b 0
)

echo Menyalakan server lokal di latar belakang (tetap hidup walau jendela ditutup)...
if exist "D:\Web Portofolio\start-background-server.vbs" (
  wscript.exe "D:\Web Portofolio\start-background-server.vbs"
  timeout /t 2 /nobreak >nul
  start "" "http://localhost:3000/admin"
  exit /b 0
) else (
  "C:\Program Files\nodejs\node.exe" "node_modules\vite\bin\vite.js" --host --port 3000 --open /admin
)
