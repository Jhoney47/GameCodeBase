import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import * as db from "./db";
import { runAllCrawlers, seedInitialCodes } from "./crawler";
import { runAllAICrawlers } from "./ai-crawler";
import { calculateCredibilityScore, getCredibilityDetails } from "./credibility";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { exportCodesToJSON } from "../export_codes_to_json_FIXED";  // ✅ 导入导出函数

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // GitHub data proxy
  github: router({
    fetchData: publicProcedure.query(async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/Jhoney47/GameCodeBase/main/GameCodeBase.json?v=" + Date.now(),
          {
            headers: {
              "Accept": "application/json",
              "Cache-Control": "no-cache",
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Failed to fetch GitHub data:", error);
        throw error;
      }
    }),
  }),

  // Redemption codes routes
  codes: router({
    list: publicProcedure
      .input(
        z
          .object({
            gameName: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const gameName = input?.gameName;
        return db.getRedemptionCodes(gameName);
      }),

    search: publicProcedure
      .input(
        z.object({
          query: z.string().min(1),
        })
      )
      .query(async ({ input }) => {
        return db.searchRedemptionCodes(input.query);
      }),

    getById: publicProcedure
      .input(
        z.object({
          id: z.number(),
        })
      )
      .query(async ({ input }) => {
        const code = await db.getRedemptionCodeById(input.id);
        if (!code) return null;
        
        return {
          ...code,
          credibilityScore: calculateCredibilityScore(code),
          credibilityDetails: getCredibilityDetails(code),
        };
      }),

    active: publicProcedure
      .input(
        z
          .object({
            gameName: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const gameName = input?.gameName;
        return db.getActiveRedemptionCodes(gameName);
      }),

    refresh: publicProcedure.mutation(async () => {
      const result = await runAllCrawlers();
      
      // ✅ 爬取完成后自动导出JSON
      try {
        await exportCodesToJSON();
        console.log("✅ 自动导出JSON成功");
      } catch (error) {
        console.error("❌ 自动导出JSON失败:", error);
      }
      
      return {
        success: true,
        ...result,
      };
    }),

    seed: publicProcedure.mutation(async () => {
      const result = await seedInitialCodes();
      
      // ✅ 初始化数据后自动导出JSON
      try {
        await exportCodesToJSON();
        console.log("✅ 自动导出JSON成功");
      } catch (error) {
        console.error("❌ 自动导出JSON失败:", error);
      }
      
      return {
        success: true,
        ...result,
      };
    }),

    aiRefresh: publicProcedure.mutation(async () => {
      const result = await runAllAICrawlers();
      
      // ✅ AI爬取完成后自动导出JSON
      try {
        await exportCodesToJSON();
        console.log("✅ 自动导出JSON成功");
      } catch (error) {
        console.error("❌ 自动导出JSON失败:", error);
      }
      
      return {
        success: true,
        ...result,
      };
    }),

    reportInvalid: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.markCodeAsInvalid(input.id);
      }),

    markAsUsed: publicProcedure
      .input(z.object({ id: z.number(), success: z.boolean() }))
      .mutation(async ({ input }) => {
        return await db.submitUserFeedback(input.id, input.success);
      }),
  }),

  crawler: router({
    logs: publicProcedure
      .input(
        z
          .object({
            limit: z.number().min(1).max(100).optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const limit = input?.limit || 10;
        return db.getRecentCrawlerLogs(limit);
      }),
  }),

  user: router({
    getProfile: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;
      return db.getUserByOpenId(ctx.user.openId);
    }),

    updateProfile: publicProcedure
      .input(
        z.object({
          nickname: z.string().min(1).max(100).optional(),
          avatarUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("User not authenticated");
        return db.updateUserProfile(ctx.user.id, input);
      }),

    submitCode: publicProcedure
      .input(
        z.object({
          gameName: z.string().min(1),
          code: z.string().min(1),
          rewardDescription: z.string().optional(),
          sourcePlatform: z.string().optional(),
          sourceUrl: z.string().optional(),
          expireDate: z.string().optional(),
          codeType: z.enum(["permanent", "limited"]).default("permanent"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("User not authenticated");
        return db.submitUserCode(ctx.user.id, input);
      }),

    getMySubmissions: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return db.getUserSubmittedCodes(ctx.user.id);
    }),
  }),

  // Admin routes
  admin: router({
    getAllCodes: publicProcedure.query(async () => {
      return db.getAllRedemptionCodes();
    }),

    updateCodeStatus: publicProcedure
      .input(
        z.object({
          codeId: z.number(),
          isPublished: z.number().min(0).max(1),
        })
      )
      .mutation(async ({ input }) => {
        const result = await db.updateCodePublishStatus(input.codeId, input.isPublished);
        await db.addUpdateLog({
          title: input.isPublished === 1 ? "上架兑换码" : "下架兑换码",
          description: `兑换码 ID: ${input.codeId} 已${input.isPublished === 1 ? "上架" : "下架"}`,
          operationType: input.isPublished === 1 ? "publish" : "unpublish",
          affectedCount: 1,
        });
        
        // ✅ 更新状态后自动导出JSON
        try {
          await exportCodesToJSON();
          console.log("✅ 自动导出JSON成功");
        } catch (error) {
          console.error("❌ 自动导出JSON失败:", error);
        }
        
        return result;
      }),

    // ✅ 修复删除功能
    deleteCode: publicProcedure
      .input(
        z.object({
          codeId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await db.deleteRedemptionCode(input.codeId);
        await db.addUpdateLog({
          title: "删除兑换码",
          description: `兑换码 ID: ${input.codeId} 已删除`,
          operationType: "delete",
          affectedCount: 1,
        });
        
        // ✅ 删除后自动导出JSON
        try {
          await exportCodesToJSON();
          console.log("✅ 自动导出JSON成功");
        } catch (error) {
          console.error("❌ 自动导出JSON失败:", error);
        }
        
        return result;
      }),

    // ✅ 修复批量操作
    batchOperation: publicProcedure
      .input(
        z.object({
          codeIds: z.array(z.number()),
          operation: z.enum(["publish", "unpublish", "delete"]),
        })
      )
      .mutation(async ({ input }) => {
        // ✅ 添加批量删除限制
        if (input.operation === "delete" && input.codeIds.length > 20) {
          throw new Error("一次最多删除20条兑换码，请分批操作");
        }
        
        const result = await db.batchUpdateCodes(input.codeIds, input.operation);
        await db.addUpdateLog({
          title: `批量${input.operation === "publish" ? "上架" : input.operation === "unpublish" ? "下架" : "删除"}兑换码`,
          description: `批量操作影响 ${input.codeIds.length} 个兑换码`,
          operationType: "batch",
          affectedCount: input.codeIds.length,
        });
        
        // ✅ 批量操作后自动导出JSON
        try {
          await exportCodesToJSON();
          console.log("✅ 自动导出JSON成功");
        } catch (error) {
          console.error("❌ 自动导出JSON失败:", error);
        }
        
        return result;
      }),

    getLogs: publicProcedure
      .input(
        z
          .object({
            limit: z.number().min(1).max(100).optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const limit = input?.limit || 20;
        return db.getUpdateLogs(limit);
      }),

    getStats: publicProcedure.query(async () => {
      return db.getAdminStats();
    }),

    getCodesByGame: publicProcedure
      .input(
        z.object({
          gameName: z.string().min(1),
        })
      )
      .query(async ({ input }) => {
        return db.getRedemptionCodes(input.gameName);
      }),

    getPendingCodes: publicProcedure.query(async () => {
      return db.getPendingReviewCodes();
    }),

    reviewCode: publicProcedure
      .input(
        z.object({
          codeId: z.number(),
          action: z.enum(["approve", "reject"]),
          reviewNote: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await db.reviewSubmittedCode(
          input.codeId,
          input.action,
          input.reviewNote
        );
        await db.addUpdateLog({
          title: `${input.action === "approve" ? "审核通过" : "审核拒绝"}兑换码`,
          description: `兑换码 ID: ${input.codeId} ${input.action === "approve" ? "已通过审核" : "已被拒绝"}`,
          operationType: "edit",
          affectedCount: 1,
        });
        
        // ✅ 审核后自动导出JSON
        if (input.action === "approve") {
          try {
            await exportCodesToJSON();
            console.log("✅ 自动导出JSON成功");
          } catch (error) {
            console.error("❌ 自动导出JSON失败:", error);
          }
        }
        
        return result;
      }),

    getTasks: publicProcedure.query(async () => {
      return db.getScheduledTasks();
    }),

    createTask: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          cronExpression: z.string().min(1),
          taskType: z.enum(["crawl_all", "crawl_game"]).default("crawl_all"),
          gameName: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createScheduledTask(input);
      }),

    updateTask: publicProcedure
      .input(
        z.object({
          taskId: z.number(),
          isEnabled: z.number().min(0).max(1),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateScheduledTask(input.taskId, input.isEnabled);
      }),

    deleteTask: publicProcedure
      .input(
        z.object({
          taskId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return db.deleteScheduledTask(input.taskId);
      }),

    triggerTask: publicProcedure
      .input(
        z.object({
          taskId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return db.triggerScheduledTask(input.taskId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
