import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";

const GITHUB_RAW_URL = "https://raw.githubusercontent.com/Jhoney47/GameCodeBase/main/GameCodeBase.json";

export const githubRouter = router({
  /**
   * 从 GitHub 获取游戏兑换码数据
   */
  fetchData: publicProcedure.query(async () => {
    try {
      const response = await fetch(GITHUB_RAW_URL, {
        cache: "no-cache" as RequestCache,
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("获取 GitHub 数据失败:", error);
      throw new Error("无法获取数据，请稍后重试");
    }
  }),
});
