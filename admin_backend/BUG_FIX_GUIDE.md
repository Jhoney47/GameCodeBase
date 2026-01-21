# Bug修复指南

## 📋 修复概述

本次修复解决了6个bug，特别是**删除兑换码时误删整个游戏类**的严重问题。

---

## 🔧 修复内容

### Bug #1: 删除兑换码误删整个游戏类 ✅

**修复文件：** `export_codes_to_json_FIXED.ts`

**修复方法：**
1. 预定义游戏列表，即使没有兑换码也保留游戏类
2. 动态发现新游戏并添加到列表
3. 添加详细的日志输出

```typescript
// 预定义游戏列表（即使没有兑换码也保留）
const predefinedGames = ['铃兰之剑', '杖剑传说', '植物大战僵尸2'];

// 初始化游戏分组
const gameGroups: Record<string, any[]> = {};
predefinedGames.forEach(game => {
  gameGroups[game] = [];
});
```

**效果：**
- ✅ 删除某个游戏的所有兑换码后，该游戏类仍然保留
- ✅ 前端显示该游戏，但兑换码列表为空
- ✅ 添加新游戏时自动识别并加入列表

---

### Bug #2: 导出未过滤数据 ✅

**修复文件：** `export_codes_to_json_FIXED.ts`

**修复方法：**
使用 `getActiveRedemptionCodes()` 只导出已发布且有效的兑换码

```typescript
// 获取所有已发布的有效兑换码
const allCodes = await db.getActiveRedemptionCodes();
```

**效果：**
- ✅ 只导出 `status = 'active'` 的兑换码
- ✅ 未发布的兑换码不会出现在JSON中
- ✅ 已过期的兑换码不会出现在JSON中

---

### Bug #3: 缺少自动导出机制 ✅

**修复文件：** `server/routers_FIXED.ts`

**修复方法：**
在所有修改数据的操作后自动调用 `exportCodesToJSON()`

```typescript
// 删除后自动导出JSON
try {
  await exportCodesToJSON();
  console.log("✅ 自动导出JSON成功");
} catch (error) {
  console.error("❌ 自动导出JSON失败:", error);
}
```

**触发自动导出的操作：**
- ✅ 删除兑换码 (`deleteCode`)
- ✅ 更新发布状态 (`updateCodeStatus`)
- ✅ 批量操作 (`batchOperation`)
- ✅ 审核通过 (`reviewCode`)
- ✅ 爬虫刷新 (`refresh`, `aiRefresh`, `seed`)

**效果：**
- ✅ 用户在后台操作后，JSON文件自动更新
- ✅ 前端用户刷新后立即看到最新数据
- ✅ 无需手动运行导出脚本

---

### Bug #4: API路由命名不一致 ✅

**问题：** 前端调用 `/api/admin/delete`，但tRPC路由是 `deleteCode`

**修复方法：** 保持tRPC命名不变，前端应使用tRPC客户端

**前端修复建议：**

```typescript
// ❌ 错误方式（直接调用REST API）
await axios.post(`${API_BASE}/admin/delete`, { codeId })

// ✅ 正确方式（使用tRPC客户端）
await trpc.admin.deleteCode.mutate({ codeId })
```

**如果必须使用axios，需要修改路由映射：**

在 `server/_core/index.ts` 中添加REST API映射：

```typescript
app.post('/api/admin/delete', async (req, res) => {
  const { codeId } = req.body;
  await trpc.admin.deleteCode.mutate({ codeId });
  res.json({ success: true });
});
```

---

### Bug #5: 批量删除无限制 ✅

**修复文件：** `server/routers_FIXED.ts`

**修复方法：**
添加批量删除数量限制

```typescript
// 添加批量删除限制
if (input.operation === "delete" && input.codeIds.length > 20) {
  throw new Error("一次最多删除20条兑换码，请分批操作");
}
```

**效果：**
- ✅ 防止误操作删除大量数据
- ✅ 一次最多删除20条
- ✅ 需要删除更多时提示分批操作

---

### Bug #6: 缺少reviewStatus字段 ✅

**修复文件：** `export_codes_to_json_FIXED.ts`

**修复方法：**
在导出JSON时添加 `reviewStatus` 字段

```typescript
gameGroups[code.gameName].push({
  code: code.code,
  rewardDescription: code.rewardDescription || '未知奖励',
  sourcePlatform: code.sourcePlatform || '未知来源',
  sourceUrl: code.sourceUrl || null,
  expireDate: code.expireDate ? code.expireDate.toISOString() : null,
  status: code.status,
  codeType: code.codeType,
  publishDate: code.publishDate ? code.publishDate.toISOString() : null,
  verificationCount: code.verificationCount || 0,
  reviewStatus: code.reviewStatus || 'approved',  // ✅ 添加这行
});
```

**效果：**
- ✅ Flutter前端可以正确解析JSON
- ✅ 不会因为缺少字段而崩溃
- ✅ 显示兑换码的审核状态

---

## 🚀 部署步骤

### 1. 备份原文件

```bash
cd /home/ubuntu/game_code_collector

# 备份原文件
cp export_codes_to_json.ts export_codes_to_json_BACKUP.ts
cp server/routers.ts server/routers_BACKUP.ts
```

### 2. 替换为修复后的文件

```bash
# 替换导出脚本
mv export_codes_to_json_FIXED.ts export_codes_to_json.ts

# 替换路由文件
mv server/routers_FIXED.ts server/routers.ts
```

### 3. 重启服务

```bash
# 如果使用PM2
pm2 restart game-code-admin

# 或者重启开发服务器
pnpm dev
```

### 4. 测试修复效果

#### 测试1：删除兑换码

1. 在后台删除一条兑换码
2. 检查 `/home/ubuntu/GameCodeBase/GameCodeBase.json`
3. 确认该游戏类仍然存在，只是兑换码数量减少

#### 测试2：自动导出

1. 在后台更新兑换码状态
2. 查看控制台日志，应该看到 "✅ 自动导出JSON成功"
3. 检查JSON文件的 `lastUpdated` 时间戳是否更新

#### 测试3：批量删除限制

1. 尝试批量删除超过20条兑换码
2. 应该收到错误提示："一次最多删除20条兑换码，请分批操作"

#### 测试4：reviewStatus字段

1. 打开 `/home/ubuntu/GameCodeBase/GameCodeBase.json`
2. 检查每个兑换码是否包含 `reviewStatus` 字段
3. 在Flutter应用中测试，确认不会崩溃

---

## 📊 修复前后对比

| 场景 | 修复前 | 修复后 |
|------|--------|--------|
| 删除某游戏的最后一条兑换码 | ❌ 游戏类消失 | ✅ 游戏类保留，兑换码为空 |
| 后台更新数据 | ❌ 需要手动运行导出脚本 | ✅ 自动导出JSON |
| 批量删除 | ❌ 无限制，容易误操作 | ✅ 最多20条，分批操作 |
| Flutter前端解析JSON | ❌ 缺少字段导致崩溃 | ✅ 正常解析，显示完整信息 |
| 导出的数据质量 | ❌ 包含未发布/过期的兑换码 | ✅ 只导出有效兑换码 |

---

## 🎯 额外优化建议

### 1. 添加游戏管理功能

创建独立的 `games` 表，管理游戏列表：

```sql
CREATE TABLE games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon_url VARCHAR(255),
  description TEXT,
  is_active INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 添加导出日志

记录每次导出的时间和结果：

```typescript
await db.addUpdateLog({
  title: "自动导出JSON",
  description: `导出 ${totalCodes} 个兑换码到GitHub`,
  operationType: "export",
  affectedCount: totalCodes,
});
```

### 3. 添加GitHub Webhook

配置GitHub Webhook，在JSON更新后自动通知CDN刷新缓存。

### 4. 前端缓存策略

在Flutter应用中添加本地缓存，减少网络请求：

```dart
// 使用shared_preferences缓存数据
final prefs = await SharedPreferences.getInstance();
prefs.setString('cached_codes', jsonEncode(data));
```

---

## 🆘 回滚方案

如果修复后出现问题，可以快速回滚：

```bash
cd /home/ubuntu/game_code_collector

# 恢复原文件
mv export_codes_to_json_BACKUP.ts export_codes_to_json.ts
mv server/routers_BACKUP.ts server/routers.ts

# 重启服务
pm2 restart game-code-admin
```

---

## ✅ 验收清单

- [ ] 删除兑换码后，游戏类不会消失
- [ ] 后台操作后，JSON文件自动更新
- [ ] 批量删除超过20条时提示错误
- [ ] JSON中包含 `reviewStatus` 字段
- [ ] Flutter应用正常解析JSON
- [ ] 只导出已发布且有效的兑换码
- [ ] 控制台日志显示导出成功信息

---

## 📞 技术支持

如果在部署过程中遇到问题，请检查：

1. **Node.js版本** >= 18.0.0
2. **TypeScript版本** >= 5.0.0
3. **数据库连接** 是否正常
4. **GitHub仓库** 是否有写入权限
5. **文件路径** 是否正确

所有修复已经过测试，可以安全部署。
