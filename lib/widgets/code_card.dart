import 'package:flutter/material.dart';
import '../models/game_code.dart';
import '../theme/app_theme.dart';

class CodeCard extends StatelessWidget {
  final GameCode code;
  final VoidCallback? onTap;

  const CodeCard({
    super.key,
    required this.code,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    // 根据isActive状态决定样式
    final isActive = code.isActive;
    final cardOpacity = isActive ? 1.0 : 0.5;
    final cardColor = isActive 
        ? (isDark ? AppTheme.surfaceDark : AppTheme.surfaceLight)
        : (isDark ? AppTheme.surfaceDark.withOpacity(0.5) : AppTheme.surfaceLight.withOpacity(0.5));

    return Opacity(
      opacity: cardOpacity,
      child: Card(
        color: cardColor,
        child: InkWell(
          onTap: isActive ? onTap : null,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 游戏名称和图标
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        code.gameName,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text('🎮', style: TextStyle(fontSize: 20)),
                  ],
                ),
                
                const SizedBox(height: 12),
                
                // 兑换码
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: isDark 
                        ? AppTheme.backgroundDark 
                        : AppTheme.backgroundLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    code.code,
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                
                const SizedBox(height: 12),
                
                // 奖励描述
                Row(
                  children: [
                    const Text('🎁', style: TextStyle(fontSize: 16)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        code.rewardDescription,
                        style: theme.textTheme.bodyMedium,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 12),
                
                // 底部信息栏
                Row(
                  children: [
                    // 类型标签
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: code.codeType == 'permanent'
                            ? AppTheme.primaryColor.withOpacity(0.1)
                            : AppTheme.warningColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            code.codeType == 'permanent' ? '♾️' : '⏰',
                            style: const TextStyle(fontSize: 12),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            code.codeType == 'permanent' ? '永久' : '限时',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: code.codeType == 'permanent'
                                  ? AppTheme.primaryColor
                                  : AppTheme.warningColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                    
                    const SizedBox(width: 8),
                    
                    // 可信度进度条
                    Expanded(
                      child: Row(
                        children: [
                          Text(
                            isActive ? '✓' : '✗',
                            style: TextStyle(
                              fontSize: 14,
                              color: isActive 
                                  ? AppTheme.successColor 
                                  : AppTheme.errorColor,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${code.reliability.toInt()}%',
                            style: theme.textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: _getReliabilityColor(code.reliability),
                            ),
                          ),
                        ],
                      ),
                    ),
                    
                    // 来源和日期
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          code.sourcePlatform,
                          style: theme.textTheme.bodySmall,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (code.publishDate != null)
                          Text(
                            _formatDate(code.publishDate!),
                            style: theme.textTheme.bodySmall,
                          ),
                      ],
                    ),
                  ],
                ),
                
                // 过期提示
                if (!isActive)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.errorColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.warning_amber_rounded,
                            size: 14,
                            color: AppTheme.errorColor,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '已过期',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: AppTheme.errorColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _getReliabilityColor(double reliability) {
    if (reliability >= 80) return AppTheme.successColor;
    if (reliability >= 60) return AppTheme.warningColor;
    return AppTheme.errorColor;
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return '${date.month.toString().padLeft(2, '0')}/${date.day.toString().padLeft(2, '0')}';
    } catch (e) {
      return '';
    }
  }
}
