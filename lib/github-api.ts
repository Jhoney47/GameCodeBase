/**
 * GitHub API 数据获取和解析模块
 * 从 GitHub Raw API 获取游戏兑换码 JSON 数据
 */

export interface GameCode {
  code: string;
  gameName: string;
  rewardDescription: string;
  sourcePlatform: string;
  sourceUrl: string;
  expireDate: string | null;
  status: "active" | "expired";
  codeType: "permanent" | "limited";
  publishDate: string;
  verificationCount: number;
  reviewStatus: string;
  credibilityScore?: number;
}

export interface GitHubDataResponse {
  version: string;
  lastUpdated: string;
  totalCodes: number;
  games: Array<{
    gameName: string;
    codeCount: number;
    codes: Array<{
      code: string;
      rewardDescription: string;
      sourcePlatform: string;
      sourceUrl: string;
      expireDate: string | null;
      status: string;
      codeType: string;
      publishDate: string;
      verificationCount: number;
      reviewStatus: string;
    }>;
  }>;
}

const GITHUB_RAW_URL = "https://raw.githubusercontent.com/Jhoney47/GameCodeBase/main/GameCodeBase.json";

/**
 * 从 GitHub 获取游戏兑换码数据
 */
export async function fetchGitHubData(): Promise<GitHubDataResponse> {
  try {
    const response = await fetch(GITHUB_RAW_URL, {
      cache: "no-cache",
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
    throw error;
  }
}

/**
 * 转换 GitHub 数据为扁平的兑换码列表
 */
export function transformGitHubData(data: GitHubDataResponse): GameCode[] {
  const codes: GameCode[] = [];

  for (const game of data.games) {
    for (const code of game.codes) {
      codes.push({
        code: code.code,
        gameName: game.gameName,
        rewardDescription: code.rewardDescription,
        sourcePlatform: code.sourcePlatform,
        sourceUrl: code.sourceUrl,
        expireDate: code.expireDate,
        status: code.status === "active" ? "active" : "expired",
        codeType: code.codeType === "permanent" ? "permanent" : "limited",
        publishDate: code.publishDate,
        verificationCount: code.verificationCount,
        reviewStatus: code.reviewStatus,
        credibilityScore: calculateCredibilityScore(code),
      });
    }
  }

  return codes;
}

/**
 * 计算兑换码可信度评分
 */
function calculateCredibilityScore(code: {
  verificationCount: number;
  sourcePlatform: string;
  reviewStatus: string;
}): number {
  let score = 50; // 基础分

  // 验证次数加分
  score += Math.min(code.verificationCount * 5, 30);

  // 来源平台加分
  const trustedPlatforms = ["TapTap论坛", "Bilibili", "官方"];
  if (trustedPlatforms.some(p => code.sourcePlatform.includes(p))) {
    score += 10;
  }

  // 审核状态加分
  if (code.reviewStatus === "approved") {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * 搜索兑换码
 */
export function searchCodes(codes: GameCode[], query: string): GameCode[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return codes;

  return codes.filter(code =>
    code.gameName.toLowerCase().includes(lowerQuery) ||
    code.code.toLowerCase().includes(lowerQuery) ||
    code.rewardDescription.toLowerCase().includes(lowerQuery)
  );
}

/**
 * 按游戏筛选
 */
export function filterByGame(codes: GameCode[], gameName?: string): GameCode[] {
  if (!gameName) return codes;
  return codes.filter(code => code.gameName === gameName);
}

/**
 * 获取游戏列表
 */
export function getGameList(codes: GameCode[]): string[] {
  const games = new Set<string>();
  codes.forEach(code => games.add(code.gameName));
  return Array.from(games).sort();
}

/**
 * 按类型筛选
 */
export function filterByType(codes: GameCode[], type: "all" | "permanent" | "limited"): GameCode[] {
  if (type === "all") return codes;
  return codes.filter(code => code.codeType === type);
}

/**
 * 按排序选项排序
 */
export function sortCodes(
  codes: GameCode[],
  sortBy: "latest" | "credibility" | "expiring"
): GameCode[] {
  const sorted = [...codes];

  switch (sortBy) {
    case "latest":
      sorted.sort((a, b) => {
        const dateA = a.publishDate ? new Date(a.publishDate).getTime() : 0;
        const dateB = b.publishDate ? new Date(b.publishDate).getTime() : 0;
        return dateB - dateA;
      });
      break;

    case "credibility":
      sorted.sort((a, b) => {
        return (b.credibilityScore || 0) - (a.credibilityScore || 0);
      });
      break;

    case "expiring":
      sorted.sort((a, b) => {
        if (!a.expireDate) return 1;
        if (!b.expireDate) return -1;
        const dateA = new Date(a.expireDate).getTime();
        const dateB = new Date(b.expireDate).getTime();
        return dateA - dateB;
      });
      break;
  }

  return sorted;
}
