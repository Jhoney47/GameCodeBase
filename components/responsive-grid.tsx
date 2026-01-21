import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 响应式网格布局组件
 * 移动端: 1列
 * Web端: 根据屏幕宽度自动调整列数
 */
export function ResponsiveGrid({ children, className, ...props }: ResponsiveGridProps) {
  return (
    <View
      className={cn(
        "flex-row flex-wrap gap-4",
        "web:grid web:grid-cols-1 web:md:grid-cols-2 web:lg:grid-cols-3 web:xl:grid-cols-4",
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}
