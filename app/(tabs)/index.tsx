import { useState, useEffect, useMemo } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Platform, ActivityIndicator, RefreshControl } from "react-native";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { CodeCard } from "@/components/code-card";
import { ResponsiveGrid } from "@/components/responsive-grid";
import { useColors } from "@/hooks/use-colors";
import { transformGitHubData, searchCodes, filterByGame, getGameList, filterByType, sortCodes } from "@/lib/github-api";
import { trpc } from "@/lib/trpc";

type SortOption = "latest" | "credibility" | "expiring";

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "🕒 最新发布", value: "latest" },
  { label: "⭐ 可信度最高", value: "credibility" },
  { label: "⏰ 即将过期", value: "expiring" },
];

export default function HomeScreen() {
  const colors = useColors();
  const [selectedGame, setSelectedGame] = useState<string | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<"all" | "permanent" | "limited">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  // 使用tRPC获取GitHub数据
  const { data: githubData, isLoading, error: queryError, refetch } = trpc.github.fetchData.useQuery();
  const [refreshing, setRefreshing] = useState(false);

  // 转换数据
  const allCodes = useMemo(() => {
    if (!githubData) return [];
    return transformGitHubData(githubData);
  }, [githubData]);

  const error = queryError ? (
    queryError instanceof Error ? queryError.message : "加载失败"
  ) : null;

  // 下拉刷新
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // 生成动态游戏筛选列表
  const gameFilters = useMemo(() => {
    if (!allCodes || allCodes.length === 0) {
      return [{ label: "全部", value: undefined }];
    }
    
    const games = getGameList(allCodes);
    
    return [
      { label: "全部", value: undefined },
      ...games.map(gameName => ({
        label: gameName,
        value: gameName
      }))
    ];
  }, [allCodes]);

  // 筛选和搜索
  const filteredCodes = useMemo(() => {
    let result = allCodes;
    
    // 按游戏筛选
    result = filterByGame(result, selectedGame);
    
    // 搜索
    if (searchQuery.trim()) {
      result = searchCodes(result, searchQuery);
    }
    
    // 按类型筛选
    result = filterByType(result, selectedType);
    
    return result;
  }, [allCodes, selectedGame, searchQuery, selectedType]);

  // 排序
  const sortedCodes = useMemo(() => {
    return sortCodes(filteredCodes, sortBy);
  }, [filteredCodes, sortBy]);

  const handleFilterPress = (value: string | undefined) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedGame(value);
    setSearchQuery("");
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-2xl mb-2">🎮</Text>
      <Text className="text-lg font-semibold text-foreground mb-2">
        {error ? "加载失败" : "暂无兑换码"}
      </Text>
      <Text className="text-sm text-muted text-center px-8">
        {error ? error : searchQuery ? "没有找到匹配的兑换码" : "下拉刷新获取最新兑换码"}
      </Text>
      {error && (
        <Pressable
          onPress={() => refetch()}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          className="mt-4"
        >
          <View className="bg-primary px-6 py-3 rounded-full">
            <Text className="text-white font-semibold">重试</Text>
          </View>
        </Pressable>
      )}
    </View>
  );

  if (isLoading && allCodes.length === 0) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">从云端加载数据...</Text>
        <Text className="text-xs text-muted mt-2">GitHub Raw API</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="flex-1 web:max-w-7xl web:mx-auto web:w-full">
        {/* Header */}
        <View className="px-4 pt-6 pb-3 web:px-8">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-3xl font-bold text-foreground">游戏码宝</Text>
              <Text className="text-sm text-muted mt-1">
                收集最新游戏兑换码 · 云端同步
              </Text>
            </View>
            <Text className="text-4xl">🎮</Text>
          </View>

          {/* Search Bar */}
          <View className="bg-surface rounded-2xl px-4 py-3.5 mb-4 shadow-sm web:max-w-2xl">
            <View className="flex-row items-center">
              <Text className="text-muted mr-2">🔍</Text>
              <TextInput
                placeholder="搜索游戏名称或兑换码..."
                placeholderTextColor={colors.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="text-foreground text-base flex-1"
                style={{ outline: 'none' } as any}
                returnKeyType="search"
              />
            </View>
          </View>

          {/* Game Filters */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-4"
            contentContainerStyle={{ gap: 8 }}
          >
            {gameFilters.map((filter) => (
              <Pressable
                key={filter.value || "all"}
                onPress={() => handleFilterPress(filter.value)}
                style={({ pressed }) => [{ 
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }]
                }]}
              >
                <View
                  className={
                    selectedGame === filter.value
                      ? "bg-primary px-5 py-2.5 rounded-full shadow-sm"
                      : "bg-surface px-5 py-2.5 rounded-full border border-border"
                  }
                >
                  <Text
                    className={
                      selectedGame === filter.value
                        ? "text-white font-bold text-sm"
                        : "text-muted font-medium text-sm"
                    }
                  >
                    {filter.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Codes List */}
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Sort Options */}
          <View className="mb-4">
            <View className="flex-row flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setSortBy(option.value);
                  }}
                  style={({ pressed }) => [{ 
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }]
                  }]}
                >
                  <View
                    className={
                      sortBy === option.value
                        ? "bg-primary px-4 py-2.5 rounded-xl shadow-sm"
                        : "bg-surface px-4 py-2.5 rounded-xl border border-border"
                    }
                  >
                    <Text
                      className={
                        sortBy === option.value
                          ? "text-white font-bold text-sm"
                          : "text-muted font-medium text-sm"
                      }
                    >
                      {option.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Type Filter */}
          <View className="flex-row flex-wrap gap-2 mb-3">
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setSelectedType("all");
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <View
                className={
                  selectedType === "all"
                    ? "bg-primary px-3 py-1.5 rounded-full"
                    : "bg-surface px-3 py-1.5 rounded-full border border-border"
                }
              >
                <Text
                  className={
                    selectedType === "all"
                      ? "text-white font-semibold text-xs"
                      : "text-muted font-medium text-xs"
                  }
                >
                  全部类型
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setSelectedType("permanent");
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <View
                className={
                  selectedType === "permanent"
                    ? "bg-primary px-3 py-1.5 rounded-full"
                    : "bg-surface px-3 py-1.5 rounded-full border border-border"
                }
              >
                <Text
                  className={
                    selectedType === "permanent"
                      ? "text-white font-semibold text-xs"
                      : "text-muted font-medium text-xs"
                  }
                >
                  ♾️ 永久
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setSelectedType("limited");
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <View
                className={
                  selectedType === "limited"
                    ? "bg-primary px-3 py-1.5 rounded-full"
                    : "bg-surface px-3 py-1.5 rounded-full border border-border"
                }
              >
                <Text
                  className={
                    selectedType === "limited"
                      ? "text-white font-semibold text-xs"
                      : "text-muted font-medium text-xs"
                  }
                >
                  ⏰ 限时
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Codes Grid */}
          {sortedCodes.length === 0 ? (
            renderEmpty()
          ) : (
            <ResponsiveGrid className="pb-4">
              {sortedCodes.map((code) => (
                <View key={code.code} className="w-full web:w-auto">
                  <CodeCard code={code} />
                </View>
              ))}
            </ResponsiveGrid>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
