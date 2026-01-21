import { View, Text, Pressable, Platform, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { GameCode } from "@/lib/github-api";
import { cn } from "@/lib/utils";

interface CodeCardProps {
  code: GameCode;
}

export function CodeCard({ code }: CodeCardProps) {
  // 复制兑换码到剪贴板
  const handleCopy = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    await Clipboard.setStringAsync(code.code);
    
    if (Platform.OS === "web") {
      alert("已复制兑换码");
    } else {
      Alert.alert("✅ 已复制", `兑换码 ${code.code} 已复制到剪贴板`);
    }
  };

  // 计算过期状态
  const isExpired = code.expireDate && new Date(code.expireDate) < new Date();
  const daysUntilExpire = code.expireDate 
    ? Math.ceil((new Date(code.expireDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const isExpiringSoon = daysUntilExpire !== null && daysUntilExpire > 0 && daysUntilExpire <= 7;

  // 格式化日期
  const formatExpireDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", { 
      year: "numeric",
      month: "2-digit", 
      day: "2-digit" 
    });
  };

  return (
    <View className={cn(
      "bg-surface rounded-2xl p-4 shadow-sm border border-border",
      isExpired && "opacity-60"
    )}>
      {/* 游戏名称 */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-bold text-foreground flex-1">
          {code.gameName}
        </Text>
        <Text className="text-2xl">🎮</Text>
      </View>

      {/* 兑换码 */}
      <View className="bg-background rounded-xl p-4 mb-3">
        <Text className="text-center text-foreground font-mono text-xl font-bold">
          {code.code}
        </Text>
      </View>

      {/* 奖励描述 */}
      <View className="mb-3">
        <Text className="text-sm text-foreground" numberOfLines={2}>
          🎁 {code.rewardDescription}
        </Text>
      </View>

      {/* 截止日期和警告 */}
      {code.expireDate && (
        <View className="mb-3">
          {isExpired ? (
            <View className="bg-error/10 px-3 py-2 rounded-lg">
              <Text className="text-xs font-medium text-error text-center">
                ❌ 已过期 - {formatExpireDate(code.expireDate)}
              </Text>
            </View>
          ) : isExpiringSoon ? (
            <View className="bg-warning/10 px-3 py-2 rounded-lg border border-warning">
              <Text className="text-xs font-bold text-warning text-center">
                ⚠️ 即将过期 - {formatExpireDate(code.expireDate)} (还剩{daysUntilExpire}天)
              </Text>
            </View>
          ) : (
            <View className="bg-primary/10 px-3 py-2 rounded-lg">
              <Text className="text-xs font-medium text-primary text-center">
                ⏰ 截止日期: {formatExpireDate(code.expireDate)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 永久标签 */}
      {code.codeType === "permanent" && (
        <View className="mb-3">
          <View className="bg-success/10 px-3 py-2 rounded-lg">
            <Text className="text-xs font-medium text-success text-center">
              ♾️ 永久有效
            </Text>
          </View>
        </View>
      )}

      {/* 复制按钮 */}
      <Pressable
        onPress={handleCopy}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        <View className="bg-primary rounded-xl py-3">
          <Text className="text-white font-bold text-center text-base">
            📋 一键复制
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
