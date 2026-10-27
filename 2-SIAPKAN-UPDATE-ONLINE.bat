@echo off
title Update Website Online Zeevisual (https://zeevisual.github.io)
set "PATH=C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\MinGit\cmd;%PATH%"

if exist "D:\Web Portofolio\package.json" (
  cd /d "D:\Web Portofolio"
) else if exist "%~dp0package.json" (
  cd /d "%~dp0"
) else if exist "%~dp0..\package.json" (
  cd /d "%~dp0.."
)

echo ========================================================
echo   MEMPERBARUI WEBSITE ONLINE (https://zeevisual.github.io)
echo   Lokasi Proyek: %CD%
echo ========================================================
echo.
echo [1/3] Sedang membangun folder dist (Build Produksi)...
if exist "C:\Program Files\nodejs\node.exe" (
  "C:\Program Files\nodejs\node.exe" "node_modules\vite\bin\vite.js" build
) else (
  call .\node_modules\.bin\vite.cmd build
)

copy /y "dist\index.html" "dist\404.html" >nul
type nul > "dist\.nojekyll"

echo.
echo [2/3] Mengirim pembaruan ke Website Online (https://zeevisual.github.io)...
set "GIT_EXE=%LOCALAPPDATA%\Programs\MinGit\cmd\git.exe"
pushd "dist"
if not exist ".git" (
  "%GIT_EXE%" init
  "%GIT_EXE%" branch -M main
  "%GIT_EXE%" remote add origin https://github.com/zeevisual/zeevisual.github.io.git
) else (
  "%GIT_EXE%" remote set-url origin https://github.com/zeevisual/zeevisual.github.io.git
)
"%GIT_EXE%" add -A
"%GIT_EXE%" commit -m "Deploy produksi Zeevisual"
"%GIT_EXE%" push -f origin main
popd

echo.
echo [3/3] Menyimpan backup source code ke GitHub (portofolio-zeevisual)...
"%GIT_EXE%" remote set-url origin https://github.com/zeevisual/portofolio-zeevisual.git
"%GIT_EXE%" add .
"%GIT_EXE%" commit -m "Update karya dan konten portofolio Zeevisual"
"%GIT_EXE%" push origin main

echo.
echo ========================================================
echo   SELESAI!
echo   Website Online Anda sudah ter-update di:
echo   https://zeevisual.github.io
echo ========================================================
start "" "https://zeevisual.github.io"
pause
