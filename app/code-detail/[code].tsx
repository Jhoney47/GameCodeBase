import { useState, useEffect } from "react";
import { View, Text, Pressable, Platform, ActivityIndicator, Alert, ScrollView } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { GameCode, transformGitHubData } from "@/lib/github-api";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export default function CodeDetailScreen() {
  const { code: codeParam } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const colors = useColors();
  const [codeData, setCodeData] = useState<GameCode | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: githubData, isLoading } = trpc.github.fetchData.useQuery();

  useEffect(() => {
    if (githubData && codeParam) {
      const allCodes = transformGitHubData(githubData);
      const found = allCodes.find(c => c.code === decodeURIComponent(codeParam));
      setCodeData(found || null);
    }
  }, [githubData, codeParam]);

  const handleCopy = async () => {
    if (!codeData) return;

    try {
      await Clipboard.setStringAsync(codeData.code);
      setCopied(true);
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      if (Platform.OS === "web") {
        alert("复制失败，请手动复制");
      } else {
        Alert.alert("复制失败", "请手动复制兑换码");
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", { 
      year: "numeric",
      month: "2-digit", 
      day: "2-digit" 
    });
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">加载中...</Text>
      </ScreenContainer>
    );
  }

  if (!codeData) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="text-2xl mb-4">😕</Text>
        <Text className="text-lg font-semibold text-foreground mb-2">
          未找到兑换码
        </Text>
        <Text className="text-sm text-muted text-center mb-6">
          该兑换码可能已被删除或不存在
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <View className="bg-primary px-6 py-3 rounded-full">
            <Text className="text-white font-semibold">返回</Text>
          </View>
        </Pressable>
      </ScreenContainer>
    );
  }

  const isExpired = codeData.expireDate && new Date(codeData.expireDate) < new Date();

  return (
    <ScreenContainer>
      <ScrollView className="flex-1">
        <View className="p-6 web:max-w-2xl web:mx-auto web:w-full">
          {/* 返回按钮 */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="mb-6"
          >
            <View className="flex-row items-center">
              <Text className="text-primary text-base font-medium">← 返回</Text>
            </View>
          </Pressable>

          {/* 游戏信息 */}
          <View className="items-center mb-6">
            <Text className="text-5xl mb-3">🎮</Text>
            <Text className="text-2xl font-bold text-foreground text-center">
              {codeData.gameName}
            </Text>
          </View>

          {/* 兑换码卡片 */}
          <View className="bg-surface rounded-2xl p-6 mb-6 shadow-sm border border-border">
            <Text className="text-sm text-muted text-center mb-2">兑换码</Text>
            <View className="bg-background rounded-xl p-4 mb-4">
              <Text className="text-center text-foreground font-mono text-2xl font-bold">
                {codeData.code}
              </Text>
            </View>

            {/* 复制按钮 */}
            <Pressable
              onPress={handleCopy}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View className={cn(
                "py-4 rounded-full",
                copied ? "bg-success" : "bg-primary"
              )}>
                <Text className="text-white text-center font-bold text-base">
                  {copied ? "✓ 已复制" : "复制兑换码"}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* 奖励信息 */}
          <View className="bg-surface rounded-2xl p-5 mb-4 shadow-sm border border-border">
            <View className="flex-row items-start mb-3">
              <Text className="text-xl mr-2">🎁</Text>
              <View className="flex-1">
                <Text className="text-sm text-muted mb-1">奖励内容</Text>
                <Text className="text-base text-foreground font-medium">
                  {codeData.rewardDescription}
                </Text>
              </View>
            </View>
          </View>

          {/* 详细信息 */}
          <View className="bg-surface rounded-2xl p-5 shadow-sm border border-border">
            <Text className="text-base font-bold text-foreground mb-4">详细信息</Text>

            {/* 类型 */}
            <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-border">
              <Text className="text-sm text-muted">类型</Text>
              <View className={cn(
                "px-3 py-1.5 rounded-full",
                codeData.codeType === "permanent" ? "bg-primary/10" : "bg-warning/10"
              )}>
                <Text className={cn(
                  "text-sm font-medium",
                  codeData.codeType === "permanent" ? "text-primary" : "text-warning"
                )}>
                  {codeData.codeType === "permanent" ? "♾️ 永久有效" : "⏰ 限时有效"}
                </Text>
              </View>
            </View>

            {/* 状态 */}
            <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-border">
              <Text className="text-sm text-muted">状态</Text>
              <View className={cn(
                "px-3 py-1.5 rounded-full",
                isExpired ? "bg-error/10" : "bg-success/10"
              )}>
                <Text className={cn(
                  "text-sm font-medium",
                  isExpired ? "text-error" : "text-success"
                )}>
                  {isExpired ? "已过期" : "有效"}
                </Text>
              </View>
            </View>

            {/* 可信度 */}
            {codeData.credibilityScore && (
              <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-border">
                <Text className="text-sm text-muted">可信度</Text>
                <Text className="text-sm font-medium text-foreground">
                  {codeData.credibilityScore}%
                </Text>
              </View>
            )}

            {/* 验证次数 */}
            <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-border">
              <Text className="text-sm text-muted">验证次数</Text>
              <Text className="text-sm font-medium text-foreground">
                {codeData.verificationCount} 次
              </Text>
            </View>

            {/* 来源平台 */}
            <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-border">
              <Text className="text-sm text-muted">来源平台</Text>
              <Text className="text-sm font-medium text-foreground">
                {codeData.sourcePlatform}
              </Text>
            </View>

            {/* 发布时间 */}
            {codeData.publishDate && (
              <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-border">
                <Text className="text-sm text-muted">发布时间</Text>
                <Text className="text-sm font-medium text-foreground">
                  {formatDate(codeData.publishDate)}
                </Text>
              </View>
            )}

            {/* 过期时间 */}
            {codeData.expireDate && (
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">过期时间</Text>
                <Text className={cn(
                  "text-sm font-medium",
                  isExpired ? "text-error" : "text-foreground"
                )}>
                  {formatDate(codeData.expireDate)}
                </Text>
              </View>
            )}
          </View>

          {/* 底部间距 */}
          <View className="h-8" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
