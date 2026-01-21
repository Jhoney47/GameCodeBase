#!/bin/bash

# 游戏码宝 - 创建macOS应用程序
# 运行此脚本后，会在桌面生成一个可双击的应用程序

APP_NAME="游戏码宝后台"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DESKTOP_DIR="$HOME/Desktop"
APP_DIR="$DESKTOP_DIR/$APP_NAME.app"

echo "正在创建macOS应用程序..."

# 创建应用程序目录结构
mkdir -p "$APP_DIR/Contents/MacOS"
mkdir -p "$APP_DIR/Contents/Resources"

# 创建Info.plist
cat > "$APP_DIR/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>launcher</string>
    <key>CFBundleIconFile</key>
    <string>icon</string>
    <key>CFBundleIdentifier</key>
    <string>com.gamecode.admin</string>
    <key>CFBundleName</key>
    <string>$APP_NAME</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
</dict>
</plist>
EOF

# 创建启动脚本
cat > "$APP_DIR/Contents/MacOS/launcher" << EOF
#!/bin/bash
cd "$SCRIPT_DIR"
open -a Terminal.app "$SCRIPT_DIR/启动后台管理.sh"
EOF

chmod +x "$APP_DIR/Contents/MacOS/launcher"

echo "✅ 应用程序已创建: $APP_DIR"
echo "📱 您可以在桌面找到「$APP_NAME」应用"
echo "🚀 双击即可启动后台管理系统"
