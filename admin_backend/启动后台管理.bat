@echo off
chcp 65001 >nul
title 游戏码宝 - 后台管理系统

echo ========================================
echo   游戏码宝 - 后台管理系统
echo ========================================
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] 检查Node.js版本...
node --version
echo.

REM 检查pnpm是否安装
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [警告] 未检测到pnpm，正在安装...
    npm install -g pnpm
    echo.
)

echo [2/3] 检查依赖...
if not exist "node_modules" (
    echo 首次运行，正在安装依赖...
    pnpm install
    echo.
)

echo [3/3] 启动后台服务...
echo.
echo ========================================
echo   后台管理系统已启动！
echo ========================================
echo.
echo   管理后台: http://localhost:8081
echo   API服务:  http://localhost:3000
echo.
echo   按 Ctrl+C 停止服务
echo ========================================
echo.

REM 启动服务
pnpm dev

pause
