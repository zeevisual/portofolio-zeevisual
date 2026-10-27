Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "D:\Web Portofolio"
WshShell.Run """C:\Program Files\nodejs\node.exe"" ""D:\Web Portofolio\node_modules\vite\bin\vite.js"" --host --port 3000", 0, False
