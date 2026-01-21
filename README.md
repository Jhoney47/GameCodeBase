# 游戏码宝 - 游戏兑换码收集应用

[![Flutter](https://img.shields.io/badge/Flutter-3.0+-blue.svg)](https://flutter.dev/)
[![Dart](https://img.shields.io/badge/Dart-3.0+-blue.svg)](https://dart.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

一个专注于收集和分享游戏兑换码的跨平台移动应用，支持iOS、Android和Web平台。

## ✨ 核心特性

- 🌐 **国内无障碍访问** - 使用jsDelivr CDN加速，国内用户无需VPN
- 🎮 **动态游戏管理** - 游戏列表完全动态生成，后台更新自动同步
- 📱 **跨平台支持** - Flutter开发，一套代码支持iOS、Android、Web
- 🔍 **强大搜索筛选** - 支持搜索、筛选、排序等多种操作
- 🎨 **精美UI设计** - 靛蓝色主题，支持浅色/深色模式
- 🔄 **实时数据同步** - 下拉刷新获取最新兑换码

## 📱 应用截图

> 待添加截图

## 🚀 快速开始

### 前端应用

#### 安装依赖

```bash
cd flutter_app
flutter pub get
```

#### 运行应用

```bash
# Android/iOS
flutter run

# Web
flutter run -d chrome
```

#### 打包APK

```bash
flutter build apk --release
```

生成的APK位于：`flutter_app/build/app/outputs/flutter-apk/app-release.apk`

### 后台管理

后台管理系统代码和修复说明请查看 `admin_backend/` 目录。

## 📂 项目结构

```
GameCodeBase/
├── flutter_app/              # Flutter前端应用
│   ├── lib/
│   │   ├── main.dart         # 应用入口
│   │   ├── models/           # 数据模型
│   │   ├── repositories/     # 数据访问层
│   │   ├── screens/          # 页面
│   │   ├── widgets/          # 组件
│   │   └── theme/            # 主题配置
│   ├── pubspec.yaml          # 依赖配置
│   ├── README.md             # Flutter文档
│   └── QUICKSTART.md         # 快速开始指南
│
├── admin_backend/            # 后台管理系统
│   ├── export_codes_to_json_FIXED.ts  # 修复后的导出脚本
│   ├── routers_FIXED.ts               # 修复后的API路由
│   ├── BUG_ANALYSIS.md                # Bug分析报告
│   └── BUG_FIX_GUIDE.md               # Bug修复指南
│
├── GameCodeBase.json         # 兑换码数据文件
├── PROJECT_REPORT.md         # 完整项目报告
└── README.md                 # 本文件
```

## 🌐 数据源

应用使用jsDelivr CDN加速GitHub数据访问：

```
https://cdn.jsdelivr.net/gh/Jhoney47/GameCodeBase@main/GameCodeBase.json
```

**优势：**
- ✅ 国内直接访问，无需VPN
- ✅ 全球CDN加速
- ✅ 自动同步GitHub更新
- ✅ 免费使用

## 📊 数据格式

```json
{
  "version": "2.0.1",
  "lastUpdated": "2026-01-21T10:30:00.000Z",
  "totalCodes": 15,
  "games": [
    {
      "gameName": "铃兰之剑",
      "codeCount": 5,
      "codes": [
        {
          "code": "KSTGIFT",
          "rewardDescription": "金币*1000",
          "sourcePlatform": "TapTap论坛",
          "sourceUrl": "https://...",
          "expireDate": "2026-01-30T00:00:00.000Z",
          "status": "active",
          "codeType": "permanent",
          "publishDate": "2026-01-18T00:00:00.000Z",
          "verificationCount": 10,
          "reviewStatus": "approved"
        }
      ]
    }
  ]
}
```

## 🔄 更新流程

### 用户端

1. 打开应用
2. 下拉刷新
3. 获取最新兑换码

### 管理端

1. 在后台添加/修改兑换码
2. 系统自动导出JSON到GitHub
3. jsDelivr CDN自动同步
4. 用户刷新即可看到更新

**完全无需修改前端代码！**

## 🐛 Bug修复记录

本次更新修复了6个重要bug：

1. ✅ **删除兑换码误删整个游戏类** - 预定义游戏列表，防止游戏类消失
2. ✅ **导出未过滤数据** - 只导出已发布且有效的兑换码
3. ✅ **缺少自动导出机制** - 后台操作后自动导出JSON
4. ✅ **API路由命名不一致** - 统一使用tRPC客户端
5. ✅ **批量删除无限制** - 添加限制，一次最多删除20条
6. ✅ **缺少reviewStatus字段** - 在导出时添加该字段

详细信息请查看 `admin_backend/BUG_ANALYSIS.md`

## 📖 文档

- [完整项目报告](PROJECT_REPORT.md) - 详细的技术文档和架构说明
- [Flutter快速开始](flutter_app/QUICKSTART.md) - 5分钟快速部署指南
- [Bug修复指南](admin_backend/BUG_FIX_GUIDE.md) - 后台Bug修复说明

## 🛠️ 技术栈

### 前端

- **Flutter** 3.0+ - 跨平台移动应用框架
- **Dart** 3.0+ - 编程语言
- **http** - HTTP请求
- **provider** - 状态管理
- **pull_to_refresh** - 下拉刷新

### 后端

- **Node.js** 18+ - 服务器运行环境
- **TypeScript** 5.0+ - 编程语言
- **tRPC** - API框架
- **Drizzle ORM** - 数据库ORM
- **MySQL** - 数据库

## 🤝 贡献

欢迎贡献代码、报告Bug或提出建议！

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

- **GitHub:** https://github.com/Jhoney47
- **问题反馈:** https://github.com/Jhoney47/GameCodeBase/issues

## 🙏 致谢

感谢以下开源项目和服务：

- [Flutter](https://flutter.dev/)
- [jsDelivr](https://www.jsdelivr.com/)
- [GitHub](https://github.com/)
- [tRPC](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)

---

**最后更新：** 2026-01-21  
**版本：** 2.0.1
