# GitHub Actions 自动打包APK 使用指南

## 🎯 功能说明

已为您配置好GitHub Actions自动打包系统，实现：

- ✅ **自动打包**：推送代码后自动生成APK
- ✅ **自动发布**：创建Release并上传APK
- ✅ **用户下载**：提供直接下载链接
- ✅ **版本管理**：自动管理版本号

---

## 🚀 使用方法

### 方法1：推送Tag触发（推荐）

**适用场景：** 发布新版本

#### 步骤：

1. **提交代码到GitHub**
   ```bash
   cd game_code_flutter
   git add .
   git commit -m "更新：添加新功能"
   git push
   ```

2. **创建并推送Tag**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **等待自动打包**
   - GitHub Actions自动开始打包（约5-10分钟）
   - 打包完成后自动创建Release
   - APK自动上传到Release

4. **获取下载链接**
   - 访问：https://github.com/Jhoney47/GameCodeBase/releases
   - 找到最新的Release
   - 复制APK下载链接

**下载链接示例：**
```
https://github.com/Jhoney47/GameCodeBase/releases/download/v1.0.0/game_code_app-v1.0.0-arm64.apk
```

---

### 方法2：手动触发打包

**适用场景：** 测试打包或临时生成APK

#### 步骤：

1. **访问GitHub Actions页面**
   ```
   https://github.com/Jhoney47/GameCodeBase/actions
   ```

2. **选择"手动打包APK"工作流**
   - 点击左侧的 "手动打包APK"
   - 点击右侧的 "Run workflow" 按钮

3. **输入版本号**
   - 输入版本名称（如：v1.0.1）
   - 点击 "Run workflow"

4. **等待完成并下载**
   - 等待5-10分钟
   - 打包完成后点击工作流
   - 在 "Artifacts" 区域下载APK

---

## 📱 分享APK给用户

### 方式1：分享GitHub Release链接（推荐）

**优点：**
- ✅ 永久有效
- ✅ 免费无限流量
- ✅ 自动版本管理

**步骤：**

1. 访问Releases页面：
   ```
   https://github.com/Jhoney47/GameCodeBase/releases
   ```

2. 找到最新版本，右键复制APK下载链接

3. 分享给用户：
   ```
   游戏码宝最新版下载：
   https://github.com/Jhoney47/GameCodeBase/releases/download/v1.0.0/game_code_app-v1.0.0-arm64.apk
   ```

---

### 方式2：使用短链接服务

如果GitHub链接太长，可以使用短链接：

**国内短链接服务：**
- 新浪短链接：https://sina.lt
- 百度短网址：https://dwz.cn

**示例：**
```
原链接：https://github.com/Jhoney47/GameCodeBase/releases/download/v1.0.0/game_code_app-v1.0.0-arm64.apk
短链接：https://dwz.cn/abc123
```

---

### 方式3：生成二维码

使用二维码生成器：
- 草料二维码：https://cli.im
- 联图二维码：https://www.liantu.com

用户扫码即可下载APK。

---

## 📋 版本号规范

推荐使用语义化版本号：

```
v主版本号.次版本号.修订号

示例：
v1.0.0  - 首次发布
v1.0.1  - 修复bug
v1.1.0  - 添加新功能
v2.0.0  - 重大更新
```

---

## 🔄 更新流程

### 发布新版本的完整流程：

```bash
# 1. 修改代码
# 2. 测试功能

# 3. 提交代码
git add .
git commit -m "v1.0.1: 修复兑换码复制问题"
git push

# 4. 创建tag
git tag v1.0.1
git push origin v1.0.1

# 5. 等待自动打包（5-10分钟）

# 6. 访问Releases页面获取下载链接
# https://github.com/Jhoney47/GameCodeBase/releases

# 7. 分享给用户
```

---

## 📊 查看打包状态

### 方法1：GitHub Actions页面

访问：https://github.com/Jhoney47/GameCodeBase/actions

可以看到：
- ✅ 打包成功
- ⏳ 打包中
- ❌ 打包失败

### 方法2：Releases页面

访问：https://github.com/Jhoney47/GameCodeBase/releases

可以看到所有已发布的版本和APK。

---

## ❓ 常见问题

### Q1: 打包失败怎么办？

**A:** 查看Actions日志：
1. 访问 https://github.com/Jhoney47/GameCodeBase/actions
2. 点击失败的工作流
3. 查看错误信息
4. 常见原因：代码错误、依赖问题

### Q2: APK在哪里下载？

**A:** 两个位置：
1. **Releases页面**（推荐）：https://github.com/Jhoney47/GameCodeBase/releases
2. **Actions Artifacts**：打包完成后的Artifacts区域

### Q3: 如何删除旧版本？

**A:** 
1. 访问Releases页面
2. 点击要删除的Release
3. 点击 "Delete" 按钮

### Q4: 用户下载APK无法安装？

**A:** 提醒用户：
1. 在手机设置中允许"未知来源"安装
2. 确保下载的是arm64版本（推荐）
3. Android版本需要5.0+

### Q5: 如何修改APK名称？

**A:** 编辑 `.github/workflows/build-apk.yml` 文件，修改第51-53行的文件名。

---

## 🎉 完成！

现在您的工作流程是：

```
修改代码 → 提交GitHub → 推送Tag → 自动打包 → 自动发布 → 用户下载
```

**完全自动化，无需手动操作！**

---

## 📞 技术支持

如有问题，请查看：
1. GitHub Actions文档：https://docs.github.com/actions
2. Flutter打包文档：https://flutter.dev/docs/deployment/android

---

**祝您使用愉快！** 🚀
