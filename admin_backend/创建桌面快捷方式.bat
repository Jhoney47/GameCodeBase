@echo off
chcp 65001 >nul
title 创建桌面快捷方式

echo ========================================
echo   游戏码宝 - 创建桌面快捷方式
echo ========================================
echo.

REM 获取当前目录
set CURRENT_DIR=%~dp0

REM 获取桌面路径
for /f "tokens=3*" %%a in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" /v Desktop') do set DESKTOP=%%b
call set DESKTOP=%DESKTOP%

REM 创建VBScript来生成快捷方式
set VBS_FILE=%TEMP%\create_shortcut.vbs
echo Set oWS = WScript.CreateObject("WScript.Shell") > %VBS_FILE%
echo sLinkFile = "%DESKTOP%\游戏码宝后台管理.lnk" >> %VBS_FILE%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %VBS_FILE%
echo oLink.TargetPath = "%CURRENT_DIR%启动后台管理.bat" >> %VBS_FILE%
echo oLink.WorkingDirectory = "%CURRENT_DIR%" >> %VBS_FILE%
echo oLink.Description = "游戏码宝后台管理系统" >> %VBS_FILE%
echo oLink.IconLocation = "%%SystemRoot%%\System32\SHELL32.dll,13" >> %VBS_FILE%
echo oLink.Save >> %VBS_FILE%

REM 执行VBScript
cscript //nologo %VBS_FILE%

REM 删除临时文件
del %VBS_FILE%

echo.
echo [成功] 桌面快捷方式已创建！
echo.
echo 快捷方式位置: %DESKTOP%\游戏码宝后台管理.lnk
echo.
echo 您现在可以双击桌面上的快捷方式来启动后台管理系统。
echo.

pause
