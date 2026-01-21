@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo   游戏码宝 - Flutter APK 一键打包
echo ========================================
echo.

:: 检查Flutter是否安装
echo [1/6] 检查Flutter环境...
flutter --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到Flutter！
    echo.
    echo 请先安装Flutter SDK:
    echo https://flutter.dev/docs/get-started/install/windows
    echo.
    echo 安装后添加到PATH环境变量，然后重新运行此脚本。
    pause
    exit /b 1
)
echo [成功] Flutter已安装
echo.

:: 检查Android SDK
echo [2/6] 检查Android SDK...
flutter doctor --android-licenses >nul 2>&1
if errorlevel 1 (
    echo [警告] Android SDK可能未正确配置
    echo 尝试自动接受licenses...
    flutter doctor --android-licenses
)
echo [成功] Android SDK已配置
echo.

:: 清理旧的构建
echo [3/6] 清理旧的构建文件...
if exist build (
    rmdir /s /q build
    echo [成功] 已清理build目录
) else (
    echo [跳过] 无需清理
)
echo.

:: 获取依赖
echo [4/6] 安装项目依赖...
flutter pub get
if errorlevel 1 (
    echo [错误] 依赖安装失败！
    pause
    exit /b 1
)
echo [成功] 依赖安装完成
echo.

:: 打包APK
echo [5/6] 开始打包APK...
echo 这可能需要5-10分钟，请耐心等待...
echo.
flutter build apk --release --split-per-abi
if errorlevel 1 (
    echo [错误] APK打包失败！
    echo.
    echo 请检查错误信息，或手动运行:
    echo flutter build apk --release
    pause
    exit /b 1
)
echo.
echo [成功] APK打包完成！
echo.

:: 显示APK位置
echo [6/6] 打包结果:
echo ========================================
echo.
echo APK文件已生成:
echo.

set "APK_DIR=build\app\outputs\flutter-apk"

if exist "%APK_DIR%\app-arm64-v8a-release.apk" (
    for %%F in ("%APK_DIR%\app-arm64-v8a-release.apk") do set "SIZE=%%~zF"
    set /a "SIZE_MB=!SIZE! / 1048576"
    echo ✓ app-arm64-v8a-release.apk (!SIZE_MB! MB) [推荐]
    echo   适用于: 99%%的现代Android手机
    echo.
)

if exist "%APK_DIR%\app-armeabi-v7a-release.apk" (
    for %%F in ("%APK_DIR%\app-armeabi-v7a-release.apk") do set "SIZE=%%~zF"
    set /a "SIZE_MB=!SIZE! / 1048576"
    echo ✓ app-armeabi-v7a-release.apk (!SIZE_MB! MB)
    echo   适用于: 旧款32位Android手机
    echo.
)

if exist "%APK_DIR%\app-x86_64-release.apk" (
    for %%F in ("%APK_DIR%\app-x86_64-release.apk") do set "SIZE=%%~zF"
    set /a "SIZE_MB=!SIZE! / 1048576"
    echo ✓ app-x86_64-release.apk (!SIZE_MB! MB)
    echo   适用于: x86架构设备(极少)
    echo.
)

echo ========================================
echo.
echo 📱 推荐分发: app-arm64-v8a-release.apk
echo.
echo 📂 APK位置:
echo %CD%\%APK_DIR%
echo.
echo ========================================
echo.

:: 询问是否打开文件夹
set /p "OPEN=是否打开APK所在文件夹? (Y/N): "
if /i "%OPEN%"=="Y" (
    explorer "%APK_DIR%"
)

echo.
echo 🎉 打包完成！
echo.
echo 接下来您可以:
echo 1. 将APK传输到手机测试
echo 2. 上传到GitHub Release
echo 3. 上传到蒲公英/fir.im分发平台
echo 4. 分享下载链接给用户
echo.
pause
