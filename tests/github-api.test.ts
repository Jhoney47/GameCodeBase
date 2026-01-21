import { describe, it, expect } from "vitest";
import {
  transformGitHubData,
  searchCodes,
  filterByGame,
  getGameList,
  filterByType,
  sortCodes,
  type GameCode,
  type GitHubDataResponse,
} from "../lib/github-api";

// 模拟GitHub数据
const mockGitHubData: GitHubDataResponse = {
  version: "2.0.0",
  lastUpdated: "2026-01-20T23:13:27.304305Z",
  totalCodes: 3,
  games: [
    {
      gameName: "铃兰之剑",
      codeCount: 2,
      codes: [
        {
          code: "TEST001",
          rewardDescription: "测试奖励1",
          sourcePlatform: "TapTap论坛",
          sourceUrl: "https://example.com",
          expireDate: null,
          status: "active",
          codeType: "permanent",
          publishDate: "2026-01-20T00:00:00.000Z",
          verificationCount: 5,
          reviewStatus: "approved",
        },
        {
          code: "TEST002",
          rewardDescription: "测试奖励2",
          sourcePlatform: "Bilibili",
          sourceUrl: "https://example.com",
          expireDate: "2026-02-01T00:00:00.000Z",
          status: "active",
          codeType: "limited",
          publishDate: "2026-01-19T00:00:00.000Z",
          verificationCount: 10,
          reviewStatus: "approved",
        },
      ],
    },
    {
      gameName: "权剑传说",
      codeCount: 1,
      codes: [
        {
          code: "TEST003",
          rewardDescription: "测试奖励3",
          sourcePlatform: "官方",
          sourceUrl: "https://example.com",
          expireDate: null,
          status: "active",
          codeType: "permanent",
          publishDate: "2026-01-18T00:00:00.000Z",
          verificationCount: 3,
          reviewStatus: "approved",
        },
      ],
    },
  ],
};

describe("GitHub API Functions", () => {
  describe("transformGitHubData", () => {
    it("应该正确转换GitHub数据为扁平的兑换码列表", () => {
      const result = transformGitHubData(mockGitHubData);
      
      expect(result).toHaveLength(3);
      expect(result[0].gameName).toBe("铃兰之剑");
      expect(result[0].code).toBe("TEST001");
      expect(result[1].code).toBe("TEST002");
      expect(result[2].gameName).toBe("权剑传说");
    });

    it("应该计算可信度评分", () => {
      const result = transformGitHubData(mockGitHubData);
      
      expect(result[0].credibilityScore).toBeGreaterThan(0);
      expect(result[0].credibilityScore).toBeLessThanOrEqual(100);
    });
  });

  describe("searchCodes", () => {
    const codes = transformGitHubData(mockGitHubData);

    it("应该能够按游戏名称搜索", () => {
      const result = searchCodes(codes, "铃兰");
      expect(result).toHaveLength(2);
      expect(result.every(c => c.gameName.includes("铃兰"))).toBe(true);
    });

    it("应该能够按兑换码搜索", () => {
      const result = searchCodes(codes, "TEST001");
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe("TEST001");
    });

    it("空查询应该返回所有兑换码", () => {
      const result = searchCodes(codes, "");
      expect(result).toHaveLength(3);
    });

    it("不区分大小写搜索", () => {
      const result = searchCodes(codes, "test001");
      expect(result).toHaveLength(1);
    });
  });

  describe("filterByGame", () => {
    const codes = transformGitHubData(mockGitHubData);

    it("应该能够按游戏筛选", () => {
      const result = filterByGame(codes, "铃兰之剑");
      expect(result).toHaveLength(2);
      expect(result.every(c => c.gameName === "铃兰之剑")).toBe(true);
    });

    it("未指定游戏应该返回所有兑换码", () => {
      const result = filterByGame(codes, undefined);
      expect(result).toHaveLength(3);
    });
  });

  describe("getGameList", () => {
    const codes = transformGitHubData(mockGitHubData);

    it("应该返回所有游戏名称列表", () => {
      const result = getGameList(codes);
      expect(result).toContain("铃兰之剑");
      expect(result).toContain("权剑传说");
      expect(result).toHaveLength(2);
    });

    it("返回的列表应该是排序的", () => {
      const result = getGameList(codes);
      const sorted = [...result].sort();
      expect(result).toEqual(sorted);
    });
  });

  describe("filterByType", () => {
    const codes = transformGitHubData(mockGitHubData);

    it("应该能够筛选永久兑换码", () => {
      const result = filterByType(codes, "permanent");
      expect(result).toHaveLength(2);
      expect(result.every(c => c.codeType === "permanent")).toBe(true);
    });

    it("应该能够筛选限时兑换码", () => {
      const result = filterByType(codes, "limited");
      expect(result).toHaveLength(1);
      expect(result[0].codeType).toBe("limited");
    });

    it("all类型应该返回所有兑换码", () => {
      const result = filterByType(codes, "all");
      expect(result).toHaveLength(3);
    });
  });

  describe("sortCodes", () => {
    const codes = transformGitHubData(mockGitHubData);

    it("应该能够按最新发布排序", () => {
      const result = sortCodes(codes, "latest");
      expect(result[0].code).toBe("TEST001"); // 2026-01-20
      expect(result[1].code).toBe("TEST002"); // 2026-01-19
      expect(result[2].code).toBe("TEST003"); // 2026-01-18
    });

    it("应该能够按可信度排序", () => {
      const result = sortCodes(codes, "credibility");
      // 验证第一个的可信度分数最高
      expect(result[0].credibilityScore).toBeGreaterThanOrEqual(result[1].credibilityScore || 0);
      expect(result[1].credibilityScore).toBeGreaterThanOrEqual(result[2].credibilityScore || 0);
    });

    it("应该能够按即将过期排序", () => {
      const result = sortCodes(codes, "expiring");
      // 有过期时间的应该排在前面
      const hasExpireDate = result.filter(c => c.expireDate !== null);
      expect(hasExpireDate.length).toBeGreaterThan(0);
      if (hasExpireDate.length > 0) {
        expect(result[0].expireDate).not.toBeNull();
      }
    });
  });
});
