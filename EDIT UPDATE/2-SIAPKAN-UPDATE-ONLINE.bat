@echo off
title Update Website Online Zeevisual (Build & Push GitHub)
set "PATH=C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\MinGit\cmd;%PATH%"

if exist "D:\Web Portofolio\package.json" (
  cd /d "D:\Web Portofolio"
) else if exist "%~dp0package.json" (
  cd /d "%~dp0"
) else if exist "%~dp0..\package.json" (
  cd /d "%~dp0.."
)

echo ========================================================
echo   MEMPERBARUI FILE ONLINE (DIST ^& GITHUB) ZEEVISUAL
echo   Lokasi Proyek: %CD%
echo ========================================================
echo.
echo [1/2] Sedang memperbarui folder dist (Build Produksi)...
if exist "C:\Program Files\nodejs\node.exe" (
  "C:\Program Files\nodejs\node.exe" "node_modules\vite\bin\vite.js" build
) else (
  call .\node_modules\.bin\vite.cmd build
)
echo.
echo [2/2] Mengirim pembaruan ke GitHub (ziyadf28/portofolio-zeevisual)...
set "GIT_EXE=%LOCALAPPDATA%\Programs\MinGit\cmd\git.exe"
if exist "%GIT_EXE%" (
  "%GIT_EXE%" add .
  "%GIT_EXE%" commit -m "Update karya dan konten portofolio Zeevisual"
  "%GIT_EXE%" push origin main
) else (
  git add .
  git commit -m "Update karya dan konten portofolio Zeevisual"
  git push origin main
)
echo.
echo ========================================================
echo   SELESAI!
echo   - Folder "D:\Web Portofolio\dist" sudah diperbarui.
echo   - File di GitHub juga sudah diperbarui.
echo ========================================================
pause
