# GameCodeBase 管理后台使用指南

## 🎯 功能概述

这个管理后台完全适配您的GitHub仓库，实现了：

1. **GitHub双向同步**：
   - 启动时拉取最新数据
   - 修改后自动推送到GitHub
   - 实时状态监控

2. **完整数据管理**：
   - 游戏管理（添加/删除）
   - 兑换码管理（添加/编辑/删除）
   - 兑换码审核（待审核/已通过/已拒绝）

3. **数据结构完全匹配**：
   - 适配您的JSON格式
   - 保留所有原始字段
   - 自动更新元数据

## 🚀 快速开始

### 1. 下载文件

从附件中下载 `GameCodeBase_Admin_Package.tar.gz`

### 2. 解压到您的本地仓库

```bash
# 克隆您的GitHub仓库
git clone https://github.com/Jhoney47/GameCodeBase.git
cd GameCodeBase

# 解压管理后台文件
tar -xzf GameCodeBase_Admin_Package.tar.gz

# 您会得到以下文件：
# - admin.py（管理后台主程序）
# - requirements.txt（Python依赖）
# - GameCodeBase.json（数据文件，已重命名去掉空格）
```

### 3. 安装依赖

```bash
pip install -r requirements.txt
```

### 4. 配置Git

```bash
# 配置用户信息（如果未配置）
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 5. 启动管理后台

```bash
streamlit run admin.py
```

浏览器会自动打开 `http://localhost:8501`

## 📋 使用流程

### 场景1：首次启动并同步数据

```
1. 运行 streamlit run admin.py
2. 侧边栏 → 🔄 GitHub同步 → ⬇️ 拉取
3. 系统加载GitHub最新数据
4. 开始管理兑换码
```

### 场景2：添加新游戏

```
1. 侧边栏 → ➕ 添加游戏
2. 填写游戏名称（如：崩坏星穹铁道）
3. 点击 ✅ 添加
4. 系统自动推送到GitHub
5. 查看GitHub仓库，新游戏已添加
```

### 场景3：编辑兑换码

```
1. 侧边栏 → 选择游戏（如：原神 (3)）
2. 在表格中编辑：
   - 修改兑换码
   - 修改奖励描述
   - 修改状态（active/inactive/expired）
   - 修改类型（permanent/limited）
   - 修改过期时间
   - 修改审核状态（approved/pending/rejected）
3. 点击表格底部 ➕ 添加新行
4. 点击行号 🗑️ 删除行
5. 点击 💾 保存
6. 系统自动推送到GitHub
```

### 场景4：审核用户提交的兑换码

```
假设：用户在GitHub上直接编辑JSON，添加了新兑换码并设置 reviewStatus: "pending"

1. 打开管理后台
2. 点击 ⬇️ 拉取（获取GitHub最新数据）
3. 切换到"⏳ 待审核"标签
4. 查看待审核兑换码列表
5. 点击 ✅ 通过 或 ❌ 拒绝
6. 系统自动推送到GitHub
```

### 场景5：删除游戏

```
1. 选择要删除的游戏
2. 点击右上角 🗑️ 删除
3. 确认删除
4. 系统自动推送到GitHub
```

## 📊 数据结构说明

### JSON格式

您的JSON文件结构：

```json
{
  "version": "2.0.0",
  "lastUpdated": "2026-01-20T11:07:27.421Z",
  "totalCodes": 111,
  "games": [
    {
      "gameName": "原神",
      "codeCount": 3,
      "codes": [
        {
          "code": "GENSHINGIFT",
          "rewardDescription": "原石×100、大英雄的经验×10",
          "sourcePlatform": "官网",
          "sourceUrl": "https://www.hoyoverse.com/",
          "expireDate": null,
          "status": "active",
          "codeType": "permanent",
          "publishDate": "2026-01-20T10:59:17.000Z",
          "verificationCount": 0,
          "reviewStatus": "approved"
        }
      ]
    }
  ]
}
```

### 字段说明

**顶层字段**：
- `version`: 数据格式版本
- `lastUpdated`: 最后更新时间（自动更新）
- `totalCodes`: 兑换码总数（自动计算）
- `games`: 游戏列表

**游戏字段**：
- `gameName`: 游戏名称
- `codeCount`: 兑换码数量（自动计算）
- `codes`: 兑换码列表

**兑换码字段**：
- `code`: 兑换码（必填）
- `rewardDescription`: 奖励描述
- `sourcePlatform`: 来源平台
- `sourceUrl`: 来源URL
- `expireDate`: 过期时间（null表示永久）
- `status`: 状态（active/inactive/expired）
- `codeType`: 类型（permanent/limited）
- `publishDate`: 发布时间
- `verificationCount`: 验证次数
- `reviewStatus`: 审核状态（approved/pending/rejected）

## 🔄 GitHub同步机制

### 自动推送时机

以下操作会**自动推送**到GitHub：

| 操作 | 触发按钮 | GitHub提交信息 |
|------|---------|---------------|
| 添加游戏 | ✅ 添加 | `Update - YYYY-MM-DD HH:MM` |
| 删除游戏 | 🗑️ 删除 | `Update - YYYY-MM-DD HH:MM` |
| 保存兑换码 | 💾 保存 | `Update - YYYY-MM-DD HH:MM` |
| 审核通过 | ✅ | `Update - YYYY-MM-DD HH:MM` |
| 审核拒绝 | ❌ | `Update - YYYY-MM-DD HH:MM` |

### 手动操作

| 按钮 | 功能 | Git命令 |
|------|------|---------|
| ⬇️ 拉取 | 从GitHub拉取最新数据 | `git pull origin main` |
| ⬆️ 推送 | 手动推送本地更改 | `git push origin main` |

### 同步状态

侧边栏会显示当前同步状态：
- ✅ 已同步：本地与GitHub一致
- ⚠️ 有未提交的更改：本地有修改未推送
- 上次同步时间：显示最后一次手动拉取的时间

## 🎨 界面说明

### 侧边栏（240px宽）

```
┌─────────────────────────┐
│ 📊 数据库               │
│ 游戏: 4  兑换码: 111    │
│ 版本: 2.0.0             │
├─────────────────────────┤
│ 🔄 GitHub同步           │
│ [⬇️ 拉取] [⬆️ 推送]     │
├─────────────────────────┤
│ 🎯 选择游戏             │
│ [原神 (3)           ▼]  │
├─────────────────────────┤
│ ➕ 添加游戏             │
│ 游戏名称: [         ]   │
│ [✅ 添加]               │
└─────────────────────────┘
```

### 主工作区

**标签页1：📝 兑换码管理**
- 显示选中游戏的所有兑换码
- 可编辑表格（7列）
- 添加/删除行
- 保存按钮
- 统计信息

**标签页2：⏳ 待审核**
- 显示所有 `reviewStatus: "pending"` 的兑换码
- 显示游戏名称、兑换码、奖励、来源
- ✅ 通过 / ❌ 拒绝 按钮

## 🛠️ 故障排除

### 问题1：推送失败 - 权限不足

**错误信息**：
```
❌ 推送失败: Permission denied
```

**解决方案**：

**方法1：使用Personal Access Token（推荐）**

```bash
# 1. 在GitHub上生成Personal Access Token
# Settings → Developer settings → Personal access tokens → Generate new token
# 勾选 repo 权限

# 2. 配置凭据存储
git config credential.helper store

# 3. 下次推送时输入：
# Username: your_github_username
# Password: your_personal_access_token（不是GitHub密码）
```

**方法2：使用SSH密钥**

```bash
# 1. 生成SSH密钥
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"

# 2. 将公钥添加到GitHub
# Settings → SSH and GPG keys → New SSH key
# 复制 ~/.ssh/id_rsa.pub 的内容

# 3. 修改远程URL
git remote set-url origin git@github.com:Jhoney47/GameCodeBase.git
```

### 问题2：拉取失败 - 冲突

**错误信息**：
```
❌ 拉取失败: Your local changes would be overwritten
```

**解决方案**：

```bash
# 方案1：丢弃本地更改（谨慎使用）
git reset --hard origin/main

# 方案2：保存本地更改
git stash
git pull origin main
git stash pop
# 手动解决冲突后
git add .
git commit -m "Resolve conflicts"
git push origin main
```

### 问题3：文件名有空格

**症状**：JSON文件名是 `GameCodeBase .json`（有空格）

**解决方案**：

```bash
# 重命名文件
mv "GameCodeBase .json" "GameCodeBase.json"

# 提交更改
git add .
git commit -m "Rename file: remove space"
git push origin main
```

### 问题4：数据未同步

**症状**：明明修改了数据，但GitHub上没有更新

**原因**：自动推送失败（网络问题或权限问题）

**解决方案**：

1. 检查侧边栏是否显示"⚠️ 有未提交的更改"
2. 点击 ⬆️ 推送 按钮手动推送
3. 如果失败，查看错误信息并解决权限问题

### 问题5：管理后台无法启动

**错误信息**：
```
ModuleNotFoundError: No module named 'streamlit'
```

**解决方案**：

```bash
# 安装依赖
pip install -r requirements.txt

# 或手动安装
pip install streamlit pandas
```

## 🔐 安全建议

### 1. 使用私有仓库

如果您的兑换码数据敏感，建议将仓库设置为私有：

```
GitHub → 仓库 → Settings → Danger Zone → Change visibility → Make private
```

### 2. 不要提交敏感信息

创建 `.gitignore` 文件：

```bash
cat > .gitignore << EOF
__pycache__/
*.pyc
.DS_Store
.env
*.log
.streamlit/secrets.toml
EOF
```

### 3. 定期备份

```bash
# 手动备份
cp GameCodeBase.json GameCodeBase_backup_$(date +%Y%m%d).json

# 或使用Git标签
git tag -a v1.0 -m "Backup 2026-01-20"
git push origin v1.0
```

## 📈 高级功能

### 1. 批量导入兑换码

如果您有大量兑换码需要导入，可以直接编辑JSON文件：

```bash
# 1. 编辑JSON文件
nano GameCodeBase.json

# 2. 添加新兑换码到对应游戏的codes数组

# 3. 提交更改
git add GameCodeBase.json
git commit -m "Bulk import codes"
git push origin main

# 4. 在管理后台点击 ⬇️ 拉取
```

### 2. 自定义提交信息

修改 `admin.py` 中的 `git_push` 函数：

```python
def git_push(message: str = None) -> tuple[bool, str]:
    if message is None:
        message = f"[Admin] Update - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    # ...
```

### 3. 查看提交历史

```bash
# 查看最近10次提交
git log --oneline -10

# 查看某个文件的修改历史
git log --follow GameCodeBase.json

# 查看某次提交的详细内容
git show <commit-hash>
```

### 4. 恢复到历史版本

```bash
# 查看提交历史
git log --oneline

# 恢复到某个版本
git checkout <commit-hash> GameCodeBase.json

# 提交恢复
git commit -m "Restore to previous version"
git push origin main
```

## 🎯 最佳实践

### 1. 工作流程

```
开始工作
  ↓
⬇️ 拉取最新数据
  ↓
编辑数据
  ↓
💾 保存（自动推送）
  ↓
继续工作或结束
```

### 2. 多人协作

如果多人使用管理后台：

```
人员A：
  1. ⬇️ 拉取
  2. 编辑游戏A
  3. 💾 保存（自动推送）

人员B：
  1. ⬇️ 拉取（获取A的更改）
  2. 编辑游戏B
  3. 💾 保存（自动推送）
```

### 3. 审核流程

```
用户提交兑换码（GitHub网页编辑）
  ↓
设置 reviewStatus: "pending"
  ↓
管理员打开后台
  ↓
⬇️ 拉取最新数据
  ↓
切换到"⏳ 待审核"标签
  ↓
审核兑换码（✅ 通过 / ❌ 拒绝）
  ↓
自动推送到GitHub
```

## 📞 支持

如有问题，请：
- 查看本指南的"故障排除"部分
- 检查GitHub Issues
- 联系开发者

---

**祝您使用愉快！** 🎮
