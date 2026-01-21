# 推送代码到GitHub并启用自动打包

## 📋 前提条件

1. 已有GitHub账号
2. 已安装Git（本地已完成）
3. 已创建GitHub仓库（或准备创建新仓库）

---

## 🚀 方法1：推送到现有仓库（Jhoney47/GameCodeBase）

### 步骤：

```bash
# 1. 进入项目目录
cd /home/ubuntu/game_code_flutter

# 2. 添加远程仓库（如果还没添加）
git remote add origin https://github.com/Jhoney47/GameCodeBase.git

# 3. 设置默认分支名为main
git branch -M main

# 4. 推送代码到GitHub
git push -u origin main

# 5. 创建第一个版本tag
git tag v1.0.0

# 6. 推送tag（触发自动打包）
git push origin v1.0.0
```

---

## 🆕 方法2：创建新的GitHub仓库

### 步骤：

1. **在GitHub上创建新仓库**
   - 访问：https://github.com/new
   - 仓库名：`game_code_flutter`（或其他名称）
   - 描述：游戏码宝 - 游戏兑换码收集移动应用
   - 选择：Public（公开）或 Private（私有）
   - 不要勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

2. **推送本地代码到新仓库**
   ```bash
   cd /home/ubuntu/game_code_flutter
   
   # 添加远程仓库（替换为您的仓库地址）
   git remote add origin https://github.com/YOUR_USERNAME/game_code_flutter.git
   
   # 设置默认分支
   git branch -M main
   
   # 推送代码
   git push -u origin main
   
   # 创建版本tag
   git tag v1.0.0
   git push origin v1.0.0
   ```

---

## 🔐 认证方式

### 方式1：使用Personal Access Token（推荐）

1. **生成Token**
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 勾选 `repo` 权限
   - 点击 "Generate token"
   - **复制Token（只显示一次！）**

2. **使用Token推送**
   ```bash
   # 推送时输入用户名和Token
   git push -u origin main
   # Username: YOUR_USERNAME
   # Password: YOUR_TOKEN（粘贴刚才复制的Token）
   ```

3. **保存凭据（避免重复输入）**
   ```bash
   git config --global credential.helper store
   ```

---

### 方式2：使用SSH Key

1. **生成SSH Key**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # 一路回车
   ```

2. **添加到GitHub**
   ```bash
   # 查看公钥
   cat ~/.ssh/id_ed25519.pub
   
   # 复制输出的内容
   # 访问：https://github.com/settings/keys
   # 点击 "New SSH key"
   # 粘贴公钥并保存
   ```

3. **使用SSH地址推送**
   ```bash
   # 使用SSH地址
   git remote set-url origin git@github.com:YOUR_USERNAME/game_code_flutter.git
   git push -u origin main
   ```

---

## ✅ 验证自动打包

推送tag后，验证自动打包是否启动：

1. **访问Actions页面**
   ```
   https://github.com/YOUR_USERNAME/YOUR_REPO/actions
   ```

2. **查看工作流状态**
   - 应该看到 "自动打包Flutter APK" 工作流正在运行
   - 状态：⏳ 进行中 或 ✅ 完成

3. **查看Release**
   ```
   https://github.com/YOUR_USERNAME/YOUR_REPO/releases
   ```
   - 打包完成后会自动创建Release
   - 可以下载生成的APK文件

---

## 📝 完整命令示例

```bash
# 进入项目目录
cd /home/ubuntu/game_code_flutter

# 添加远程仓库（替换为您的仓库地址）
git remote add origin https://github.com/Jhoney47/GameCodeBase.git

# 设置分支名
git branch -M main

# 推送代码
git push -u origin main

# 创建并推送tag（触发自动打包）
git tag v1.0.0
git push origin v1.0.0

# 等待5-10分钟，访问Releases页面查看APK
```

---

## ❓ 常见问题

### Q1: 推送时提示 "Permission denied"

**A:** 检查认证方式：
- 使用HTTPS：需要Personal Access Token
- 使用SSH：需要添加SSH Key到GitHub

### Q2: 推送时提示 "Updates were rejected"

**A:** 远程仓库有更新，先拉取：
```bash
git pull origin main --rebase
git push -u origin main
```

### Q3: GitHub Actions没有运行

**A:** 检查：
1. `.github/workflows/` 目录是否已推送
2. 是否推送了tag（`git push origin v1.0.0`）
3. Actions是否被禁用（仓库Settings → Actions）

### Q4: 打包失败

**A:** 查看Actions日志：
1. 访问 Actions 页面
2. 点击失败的工作流
3. 查看错误信息

---

## 🎉 完成！

推送成功后：

1. ✅ 代码已保存到GitHub
2. ✅ 自动打包已启动
3. ✅ 5-10分钟后可下载APK
4. ✅ 以后每次推送tag都会自动打包

**下载链接示例：**
```
https://github.com/YOUR_USERNAME/YOUR_REPO/releases/download/v1.0.0/game_code_app-v1.0.0-arm64.apk
```

---

## 📞 需要帮助？

- GitHub文档：https://docs.github.com
- Git教程：https://git-scm.com/book/zh/v2
