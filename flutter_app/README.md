# 游戏码宝 - Flutter版本

一个使用Flutter开发的游戏兑换码收集应用，支持从GitHub动态获取数据，**国内用户无需VPN即可使用**。

## ✨ 核心特性

### 🌐 国内无障碍访问
- 使用 **jsDelivr CDN** 加速GitHub数据访问
- 国内用户无需梯子即可秒开APP
- 添加时间戳参数破除CDN缓存，确保数据实时更新

### 🎮 动态内容管理
- 游戏Tabs **完全动态生成**，无需修改代码
- 后台更新GitHub JSON后，前端自动同步
- 支持任意数量的游戏和兑换码

### 📱 功能完整
- ✅ 动态游戏标签页
- ✅ 下拉刷新数据
- ✅ 搜索兑换码
- ✅ 多维度筛选（游戏、类型、状态）
- ✅ 多种排序（最新、可信度、即将过期）
- ✅ 一键复制兑换码
- ✅ 详情页展示完整信息
- ✅ 浅色/深色主题自动切换

## 🚀 快速开始

### 环境要求
- Flutter SDK >= 3.0.0
- Dart SDK >= 3.0.0

### 安装依赖
```bash
cd game_code_flutter
flutter pub get
```

### 运行应用
```bash
# 运行在Android模拟器/设备
flutter run

# 运行在iOS模拟器/设备
flutter run

# 运行在Web浏览器
flutter run -d chrome
```

### 打包APK（Android）
```bash
flutter build apk --release
```
生成的APK位于：`build/app/outputs/flutter-apk/app-release.apk`

### 打包IPA（iOS）
```bash
flutter build ios --release
```

## 📁 项目结构

```
lib/
├── main.dart                   # 应用入口
├── models/
│   ├── game_code.dart         # 数据模型
│   └── game_code.g.dart       # JSON序列化（自动生成）
├── repositories/
│   └── code_repository.dart   # 数据仓库层（CDN访问）
├── screens/
│   ├── home_screen.dart       # 首页（动态Tabs）
│   └── code_detail_screen.dart # 详情页
├── widgets/
│   └── code_card.dart         # 兑换码卡片组件
└── theme/
    └── app_theme.dart         # 主题配置
```

## 🔧 核心实现

### 1. 国内CDN访问（code_repository.dart）

```dart
// 使用jsDelivr CDN，国内直接访问
static const String _baseUrl =
    'https://cdn.jsdelivr.net/gh/Jhoney47/GameCodeBase@main/GameCodeBase.json';

Future<GameCodeResponse> fetchGameCodes() async {
  // 添加时间戳破除CDN缓存
  final timestamp = DateTime.now().millisecondsSinceEpoch;
  final url = Uri.parse('$_baseUrl?v=$timestamp');
  
  final response = await http.get(url, headers: {
    'Cache-Control': 'no-cache',
  });
  
  return GameCodeResponse.fromJson(json.decode(response.body));
}
```

### 2. 动态Tabs生成（home_screen.dart）

```dart
// 根据games列表自动生成TabBar
_tabController = TabController(
  length: data.games.length + 1, // +1 for "全部" tab
  vsync: this,
);

TabBar(
  controller: _tabController,
  isScrollable: true,
  tabs: [
    const Tab(text: '全部'),
    ...data.games.map((game) => Tab(text: game.gameName)),
  ],
)
```

### 3. 状态逻辑（game_code.dart）

```dart
// isActive == true -> 绿色高亮
// isActive == false -> 灰色置灰
bool get isActive {
  if (status != 'active') return false;
  if (expireDate == null) return true;
  
  final expiry = DateTime.parse(expireDate!);
  return expiry.isAfter(DateTime.now());
}

// reliability 准确率计算
double get reliability {
  double score = 50.0;
  // 根据验证次数、来源平台、审核状态计算
  return score.clamp(0.0, 100.0);
}
```

## 🎯 数据源配置

当前使用jsDelivr CDN加速GitHub数据：
```
https://cdn.jsdelivr.net/gh/Jhoney47/GameCodeBase@main/GameCodeBase.json
```

### 其他可用CDN（备选）
```
# Statically CDN
https://cdn.statically.io/gh/Jhoney47/GameCodeBase/main/GameCodeBase.json

# ghproxy.com
https://ghproxy.com/https://raw.githubusercontent.com/Jhoney47/GameCodeBase/main/GameCodeBase.json
```

如需更换CDN，只需修改 `lib/repositories/code_repository.dart` 中的 `_baseUrl` 常量。

## 📦 依赖说明

| 依赖 | 版本 | 用途 |
|------|------|------|
| http | ^1.1.0 | HTTP请求 |
| provider | ^6.1.1 | 状态管理 |
| json_annotation | ^4.8.1 | JSON序列化注解 |
| flutter_clipboard | ^1.0.1 | 剪贴板操作 |
| pull_to_refresh | ^2.0.0 | 下拉刷新 |

## 🔄 更新流程

### 后台操作
1. 在admin后台添加/修改游戏和兑换码
2. 更新GitHub仓库的 `GameCodeBase.json`
3. 提交更改

### 前端自动更新
1. 用户下拉刷新或重新打开APP
2. 应用从jsDelivr CDN获取最新数据（带时间戳破除缓存）
3. 游戏Tabs自动更新
4. 兑换码列表自动刷新

**完全无需修改前端代码！**

## 📱 用户使用方式

### 方式一：直接安装APK（推荐）
1. 打包APK：`flutter build apk --release`
2. 将APK发送给用户
3. 用户在Android手机上直接安装

### 方式二：发布到应用商店
- **Google Play**：需要Google Play开发者账号（$25一次性）
- **华为应用市场**：国内用户推荐
- **小米应用商店**：国内用户推荐

### 方式三：Web版本
```bash
flutter build web --release
```
部署到服务器后，用户通过浏览器访问。

## 🐛 常见问题

### Q: 数据不更新怎么办？
A: 下拉刷新页面，时间戳参数会破除CDN缓存。

### Q: 国内访问慢怎么办？
A: 已使用jsDelivr CDN加速，国内访问速度很快。如仍有问题，可更换其他CDN。

### Q: 如何添加新游戏？
A: 只需在GitHub JSON中添加，前端会自动生成新的Tab和内容。

## 📄 许可证

MIT License

## 👨‍💻 开发者

Flutter高级工程师 - 专注于跨平台移动应用开发
