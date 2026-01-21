import { View, Text, Pressable, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { GameCode } from "@/lib/github-api";
import { cn } from "@/lib/utils";

interface CodeCardProps {
  code: GameCode;
}

export function CodeCard({ code }: CodeCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/code-detail/${encodeURIComponent(code.code)}`);
  };

  // 计算过期状态
  const isExpired = code.expireDate && new Date(code.expireDate) < new Date();
  const isExpiringSoon = code.expireDate && !isExpired && 
    new Date(code.expireDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7天内

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <View className={cn(
        "bg-surface rounded-2xl p-4 shadow-sm border border-border",
        isExpired && "opacity-60"
      )}>
        {/* 游戏名称 */}
        <View className="flex-row items-center mb-3">
          <Text className="text-base font-bold text-foreground flex-1">
            {code.gameName}
          </Text>
          <Text className="text-2xl">🎮</Text>
        </View>

        {/* 兑换码 */}
        <View className="bg-background rounded-xl p-3 mb-3">
          <Text className="text-center text-foreground font-mono text-lg font-semibold">
            {code.code}
          </Text>
        </View>

        {/* 奖励描述 */}
        <View className="mb-3">
          <Text className="text-sm text-muted" numberOfLines={2}>
            🎁 {code.rewardDescription}
          </Text>
        </View>

        {/* 标签行 */}
        <View className="flex-row flex-wrap gap-2 mb-2">
          {/* 类型标签 */}
          <View className={cn(
            "px-2 py-1 rounded-full",
            code.codeType === "permanent" ? "bg-primary/10" : "bg-warning/10"
          )}>
            <Text className={cn(
              "text-xs font-medium",
              code.codeType === "permanent" ? "text-primary" : "text-warning"
            )}>
              {code.codeType === "permanent" ? "♾️ 永久" : "⏰ 限时"}
            </Text>
          </View>

          {/* 可信度标签 */}
          {code.credibilityScore && code.credibilityScore >= 70 && (
            <View className="bg-success/10 px-2 py-1 rounded-full">
              <Text className="text-xs font-medium text-success">
                ✓ {code.credibilityScore}%
              </Text>
            </View>
          )}

          {/* 过期状态标签 */}
          {isExpired && (
            <View className="bg-error/10 px-2 py-1 rounded-full">
              <Text className="text-xs font-medium text-error">
                已过期
              </Text>
            </View>
          )}
          {isExpiringSoon && (
            <View className="bg-warning/10 px-2 py-1 rounded-full">
              <Text className="text-xs font-medium text-warning">
                即将过期
              </Text>
            </View>
          )}
        </View>

        {/* 来源和时间 */}
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-muted">
            {code.sourcePlatform}
          </Text>
          {code.publishDate && (
            <Text className="text-xs text-muted">
              {formatDate(code.publishDate)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
