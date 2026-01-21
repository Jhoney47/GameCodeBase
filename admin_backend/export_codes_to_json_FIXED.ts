import * as db from "./server/db";
import { writeFileSync } from "fs";
import { execSync } from "child_process";

/**
 * 导出兑换码到JSON文件
 * 
 * 修复内容：
 * 1. 只导出已发布且有效的兑换码
 * 2. 添加 reviewStatus 字段
 * 3. 保留预定义的游戏列表，即使没有兑换码
 * 4. 自动提交到GitHub
 */
async function exportCodesToJSON() {
  console.log("🚀 开始导出兑换码到JSON...\n");

  try {
    // 获取所有已发布的有效兑换码
    const allCodes = await db.getActiveRedemptionCodes();
    
    console.log(`📊 找到 ${allCodes.length} 个有效兑换码`);
    
    // 预定义游戏列表（即使没有兑换码也保留）
    const predefinedGames = ['铃兰之剑', '杖剑传说', '植物大战僵尸2'];
    
    // 初始化游戏分组
    const gameGroups: Record<string, any[]> = {};
    predefinedGames.forEach(game => {
      gameGroups[game] = [];
    });
    
    // 按游戏分组
    allCodes.forEach(code => {
      // 如果是新游戏，添加到分组中
      if (!gameGroups[code.gameName]) {
        gameGroups[code.gameName] = [];
        console.log(`✨ 发现新游戏: ${code.gameName}`);
      }
      
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
        reviewStatus: code.reviewStatus || 'approved',  // ✅ 添加 reviewStatus 字段
      });
    });

    // 构建输出数据
    const output = {
      version: "2.0.1",  // 版本号升级
      lastUpdated: new Date().toISOString(),
      totalCodes: allCodes.length,
      games: Object.keys(gameGroups).map(gameName => ({
        gameName,
        codeCount: gameGroups[gameName].length,
        codes: gameGroups[gameName]
      }))
    };

    // 写入本地文件
    const localPath = "/home/ubuntu/GameCodeBase/GameCodeBase.json";
    writeFileSync(localPath, JSON.stringify(output, null, 2));
    console.log(`\n✅ 已导出到: ${localPath}`);
    
    // 打印摘要
    console.log("\n=== 导出摘要 ===");
    output.games.forEach(game => {
      const icon = game.codeCount > 0 ? '✓' : '○';
      console.log(`${icon} ${game.gameName}: ${game.codeCount} 个兑换码`);
    });
    
    // 自动提交到GitHub
    try {
      console.log("\n📤 正在提交到GitHub...");
      
      execSync('cd /home/ubuntu/GameCodeBase && git add GameCodeBase.json', { stdio: 'inherit' });
      execSync(`cd /home/ubuntu/GameCodeBase && git commit -m "自动更新兑换码数据 - ${new Date().toISOString()}"`, { stdio: 'inherit' });
      execSync('cd /home/ubuntu/GameCodeBase && git push', { stdio: 'inherit' });
      
      console.log("✅ 已成功推送到GitHub");
    } catch (gitError) {
      console.warn("⚠️ Git操作失败（可能没有变更）:", gitError);
    }
    
  } catch (error) {
    console.error("❌ 导出失败:", error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  exportCodesToJSON()
    .then(() => {
      console.log("\n🎉 导出完成！");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 导出失败:", error);
      process.exit(1);
    });
}

// 导出函数供其他模块调用
export { exportCodesToJSON };
