# 游戏码宝 - Flutter APK打包完整指南

本指南将帮助您将Flutter项目打包为APK安装包，供Android用户下载使用。

---

## 📋 前置要求

### 1. 安装Flutter SDK

**下载地址：** https://flutter.dev/docs/get-started/install/windows

**安装步骤：**
1. 下载Flutter SDK压缩包
2. 解压到 `C:\src\flutter`（或其他位置）
3. 添加到系统PATH环境变量：`C:\src\flutter\bin`

**验证安装：**
```cmd
flutter --version
```

---

### 2. 安装Android Studio

**下载地址：** https://developer.android.com/studio

**安装步骤：**
1. 下载并安装Android Studio
2. 打开Android Studio
3. 进入 Settings → Appearance & Behavior → System Settings → Android SDK
4. 安装以下组件：
   - Android SDK Platform (API 33或更高)
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
   - Android SDK Platform-Tools

---

### 3. 配置Flutter

运行Flutter doctor检查环境：

```cmd
flutter doctor
```

如果有红色❌，按照提示解决。

**常见问题：**
- Android licenses未接受：运行 `flutter doctor --android-licenses`
- cmdline-tools未安装：在Android Studio SDK Manager中安装

---

## 🚀 快速打包（3步）

### 第1步：进入项目目录

```cmd
cd /d "您的Flutter项目路径"
```

例如：
```cmd
cd /d "D:\game_code_flutter"
```

---

### 第2步：安装依赖

```cmd
flutter pub get
```

---

### 第3步：打包APK

```cmd
flutter build apk --release
```

**打包时间：** 首次打包需要5-10分钟，之后会更快。

---

## 📦 获取APK文件

打包完成后，APK文件位于：

```
build/app/outputs/flutter-apk/app-release.apk
```

**文件大小：** 约15-25MB

---

## 📱 测试APK

### 方法1：在Android手机上测试

1. 将APK文件传输到手机
2. 在手机上打开文件管理器
3. 点击APK文件
4. 允许"未知来源"安装
5. 安装并测试

---

### 方法2：使用Android模拟器测试

```cmd
# 启动模拟器
flutter emulators --launch <emulator_id>

# 安装APK
flutter install
```

---

## 🎯 高级打包选项

### 打包分架构APK（减小体积）

```cmd
flutter build apk --split-per-abi --release
```

这会生成3个APK：
- `app-armeabi-v7a-release.apk` (32位ARM，约8MB)
- `app-arm64-v8a-release.apk` (64位ARM，约10MB)
- `app-x86_64-release.apk` (x86，约10MB)

**推荐：** 只分发 `app-arm64-v8a-release.apk`，适用于99%的现代Android手机。

---

### 打包App Bundle（用于Google Play）

```cmd
flutter build appbundle --release
```

生成的文件：`build/app/outputs/bundle/release/app-release.aab`

---

## 🔧 常见问题

### 问题1：Gradle下载慢

**解决：** 配置国内镜像

编辑 `android/build.gradle`：

```gradle
allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/jcenter' }
        maven { url 'https://maven.aliyun.com/repository/public' }
        google()
        mavenCentral()
    }
}
```

---

### 问题2：内存不足

**解决：** 增加Gradle内存

编辑 `android/gradle.properties`：

```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
```

---

### 问题3：签名错误

**解决：** Flutter会自动使用debug签名，release版本需要配置签名。

对于测试分发，debug签名已足够。

---

## 📤 分发APK

### 方法1：GitHub Release

1. 在GitHub仓库创建Release
2. 上传APK文件
3. 获得下载链接

**示例链接：**
```
https://github.com/Jhoney47/GameCodeBase/releases/download/v1.0/game_code_app.apk
```

---

### 方法2：蒲公英/fir.im

1. 注册账号
2. 上传APK
3. 获得短链接和二维码

---

### 方法3：自己的服务器

1. 上传APK到服务器
2. 分享下载链接

---

## ✅ 打包清单

- [ ] 安装Flutter SDK
- [ ] 安装Android Studio
- [ ] 配置Android SDK
- [ ] 运行 `flutter doctor` 确认环境
- [ ] 进入项目目录
- [ ] 运行 `flutter pub get`
- [ ] 运行 `flutter build apk --release`
- [ ] 获取APK文件
- [ ] 在手机上测试APK
- [ ] 上传到分发平台
- [ ] 分享下载链接

---

## 🎉 完成！

打包完成后，您就可以将APK分享给用户了！

**用户使用流程：**
1. 点击下载链接
2. 下载APK文件
3. 安装APK
4. 打开应用
5. 开始使用

---

## 📞 需要帮助？

如果遇到问题，请查看：
- Flutter官方文档：https://flutter.dev/docs
- Android打包指南：https://flutter.dev/docs/deployment/android

或者查看项目中的 `一键打包.bat` 脚本，自动化打包流程。
