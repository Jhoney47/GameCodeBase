import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/game_code.dart';
import '../theme/app_theme.dart';

class CodeDetailScreen extends StatefulWidget {
  final GameCode code;

  const CodeDetailScreen({
    super.key,
    required this.code,
  });

  @override
  State<CodeDetailScreen> createState() => _CodeDetailScreenState();
}

class _CodeDetailScreenState extends State<CodeDetailScreen> {
  bool _copied = false;

  /// 复制兑换码到剪贴板
  Future<void> _copyCode() async {
    await Clipboard.setData(ClipboardData(text: widget.code.code));
    
    setState(() {
      _copied = true;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✓ 兑换码已复制'),
          duration: Duration(seconds: 2),
        ),
      );
    }

    // 2秒后恢复按钮状态
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _copied = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final isExpired = !widget.code.isActive;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(widget.code.gameName),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 游戏信息
            Center(
              child: Column(
                children: [
                  const Text('🎮', style: TextStyle(fontSize: 64)),
                  const SizedBox(height: 16),
                  Text(
                    widget.code.gameName,
                    style: theme.textTheme.headlineMedium,
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // 兑换码卡片
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Text(
                      '兑换码',
                      style: theme.textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 12),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isDark 
                            ? AppTheme.backgroundDark 
                            : AppTheme.backgroundLight,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        widget.code.code,
                        style: theme.textTheme.headlineMedium?.copyWith(
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.5,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // 复制按钮
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _copyCode,
                        icon: Icon(_copied ? Icons.check : Icons.copy),
                        label: Text(_copied ? '✓ 已复制' : '复制兑换码'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _copied 
                              ? AppTheme.successColor 
                              : AppTheme.primaryColor,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // 奖励信息
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('🎁', style: TextStyle(fontSize: 24)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '奖励内容',
                            style: theme.textTheme.bodyMedium,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            widget.code.rewardDescription,
                            style: theme.textTheme.titleMedium,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // 详细信息
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '详细信息',
                      style: theme.textTheme.titleLarge,
                    ),
                    const SizedBox(height: 16),
                    
                    _buildInfoRow(
                      context,
                      '类型',
                      widget.code.codeType == 'permanent' ? '♾️ 永久有效' : '⏰ 限时有效',
                      color: widget.code.codeType == 'permanent' 
                          ? AppTheme.primaryColor 
                          : AppTheme.warningColor,
                    ),
                    
                    const Divider(height: 24),
                    
                    _buildInfoRow(
                      context,
                      '状态',
                      isExpired ? '已过期' : '有效',
                      color: isExpired ? AppTheme.errorColor : AppTheme.successColor,
                    ),
                    
                    const Divider(height: 24),
                    
                    _buildInfoRow(
                      context,
                      '可信度',
                      '${widget.code.reliability.toInt()}%',
                      showProgressBar: true,
                      progress: widget.code.reliability / 100,
                    ),
                    
                    const Divider(height: 24),
                    
                    _buildInfoRow(
                      context,
                      '验证次数',
                      '${widget.code.verificationCount} 次',
                    ),
                    
                    const Divider(height: 24),
                    
                    _buildInfoRow(
                      context,
                      '来源平台',
                      widget.code.sourcePlatform,
                    ),
                    
                    if (widget.code.publishDate != null) ...[
                      const Divider(height: 24),
                      _buildInfoRow(
                        context,
                        '发布时间',
                        _formatDate(widget.code.publishDate!),
                      ),
                    ],
                    
                    if (widget.code.expireDate != null) ...[
                      const Divider(height: 24),
                      _buildInfoRow(
                        context,
                        '过期时间',
                        _formatDate(widget.code.expireDate!),
                        color: isExpired ? AppTheme.errorColor : null,
                      ),
                    ],
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(
    BuildContext context,
    String label,
    String value, {
    Color? color,
    bool showProgressBar = false,
    double? progress,
  }) {
    final theme = Theme.of(context);
    
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 2,
          child: Text(
            label,
            style: theme.textTheme.bodyMedium,
          ),
        ),
        Expanded(
          flex: 3,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                value,
                style: theme.textTheme.titleMedium?.copyWith(
                  color: color,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.right,
              ),
              if (showProgressBar && progress != null) ...[
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: progress,
                    backgroundColor: color?.withOpacity(0.2) ?? 
                        AppTheme.primaryColor.withOpacity(0.2),
                    valueColor: AlwaysStoppedAnimation<Color>(
                      color ?? AppTheme.primaryColor,
                    ),
                    minHeight: 6,
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
    } catch (e) {
      return dateString;
    }
  }
}
