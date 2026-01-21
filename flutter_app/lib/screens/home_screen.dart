import 'package:flutter/material.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import '../models/game_code.dart';
import '../repositories/code_repository.dart';
import '../widgets/code_card.dart';
import '../theme/app_theme.dart';
import 'code_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  final CodeRepository _repository = CodeRepository();
  final RefreshController _refreshController = RefreshController(initialRefresh: false);
  final TextEditingController _searchController = TextEditingController();
  
  TabController? _tabController;
  GameCodeResponse? _gameData;
  List<GameCode> _filteredCodes = [];
  bool _isLoading = true;
  String? _errorMessage;
  
  // 筛选和排序状态
  String _selectedSortBy = 'latest';
  String _selectedType = 'all';
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _tabController?.dispose();
    _refreshController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  /// 加载数据（从jsDelivr CDN）
  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final data = await _repository.fetchGameCodes();
      
      setState(() {
        _gameData = data;
        _isLoading = false;
        
        // 初始化TabController（动态生成Tabs）
        _tabController = TabController(
          length: data.games.length + 1, // +1 for "全部" tab
          vsync: this,
        );
        
        _tabController!.addListener(_onTabChanged);
        
        // 初始显示所有兑换码
        _applyFilters();
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString();
      });
    }
  }

  /// 下拉刷新
  void _onRefresh() async {
    try {
      final data = await _repository.fetchGameCodes();
      
      setState(() {
        _gameData = data;
        _applyFilters();
      });
      
      _refreshController.refreshCompleted();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ 数据已更新'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      _refreshController.refreshFailed();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ 刷新失败: $e'),
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }

  /// Tab切换回调
  void _onTabChanged() {
    if (_tabController != null) {
      _applyFilters();
    }
  }

  /// 应用筛选和排序
  void _applyFilters() {
    if (_gameData == null) return;

    List<GameCode> codes = _gameData!.allCodes;

    // 按Tab筛选游戏
    if (_tabController != null && _tabController!.index > 0) {
      final gameName = _gameData!.games[_tabController!.index - 1].gameName;
      codes = _repository.filterByGame(codes, gameName);
    }

    // 按类型筛选
    codes = _repository.filterByType(codes, _selectedType);

    // 搜索
    codes = _repository.searchCodes(codes, _searchQuery);

    // 排序
    codes = _repository.sortCodes(codes, _selectedSortBy);

    setState(() {
      _filteredCodes = codes;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_isLoading) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 16),
              Text(
                '从云端加载数据...',
                style: theme.textTheme.bodyMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'jsDelivr CDN',
                style: theme.textTheme.bodySmall,
              ),
            ],
          ),
        ),
      );
    }

    if (_errorMessage != null) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('😕', style: TextStyle(fontSize: 48)),
                const SizedBox(height: 16),
                Text(
                  '加载失败',
                  style: theme.textTheme.headlineMedium,
                ),
                const SizedBox(height: 8),
                Text(
                  _errorMessage!,
                  style: theme.textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: _loadData,
                  icon: const Icon(Icons.refresh),
                  label: const Text('重试'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            // AppBar
            SliverAppBar(
              floating: true,
              pinned: true,
              snap: false,
              expandedHeight: 120,
              flexibleSpace: FlexibleSpaceBar(
                title: Row(
                  children: [
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '游戏码宝',
                          style: theme.textTheme.headlineLarge?.copyWith(
                            fontSize: 24,
                          ),
                        ),
                        Text(
                          '收集最新游戏兑换码 · 云端同步',
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
                    ),
                    const Spacer(),
                    const Text('🎮', style: TextStyle(fontSize: 32)),
                  ],
                ),
                titlePadding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
              ),
            ),
            
            // 搜索栏
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: '搜索游戏名称或兑换码...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              setState(() {
                                _searchQuery = '';
                                _applyFilters();
                              });
                            },
                          )
                        : null,
                  ),
                  onChanged: (value) {
                    setState(() {
                      _searchQuery = value;
                      _applyFilters();
                    });
                  },
                ),
              ),
            ),
            
            // 游戏Tabs（动态生成）
            if (_gameData != null && _tabController != null)
              SliverPersistentHeader(
                pinned: true,
                delegate: _SliverAppBarDelegate(
                  TabBar(
                    controller: _tabController,
                    isScrollable: true,
                    indicatorColor: AppTheme.primaryColor,
                    labelColor: AppTheme.primaryColor,
                    unselectedLabelColor: theme.brightness == Brightness.dark
                        ? AppTheme.mutedDark
                        : AppTheme.mutedLight,
                    tabs: [
                      const Tab(text: '全部'),
                      ..._gameData!.games.map((game) => Tab(text: game.gameName)),
                    ],
                  ),
                ),
              ),
          ];
        },
        body: SmartRefresher(
          controller: _refreshController,
          onRefresh: _onRefresh,
          child: _buildContent(theme),
        ),
      ),
    );
  }

  Widget _buildContent(ThemeData theme) {
    return CustomScrollView(
      slivers: [
        // 排序和筛选按钮
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Column(
              children: [
                // 排序选项
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildSortChip('🕒 最新发布', 'latest'),
                      const SizedBox(width: 8),
                      _buildSortChip('⭐ 可信度最高', 'reliability'),
                      const SizedBox(width: 8),
                      _buildSortChip('⏰ 即将过期', 'expiring'),
                    ],
                  ),
                ),
                
                const SizedBox(height: 8),
                
                // 类型筛选
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildTypeChip('全部类型', 'all'),
                      const SizedBox(width: 8),
                      _buildTypeChip('♾️ 永久', 'permanent'),
                      const SizedBox(width: 8),
                      _buildTypeChip('⏰ 限时', 'limited'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        
        // 兑换码列表
        if (_filteredCodes.isEmpty)
          SliverFillRemaining(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('🎮', style: TextStyle(fontSize: 48)),
                  const SizedBox(height: 16),
                  Text(
                    '暂无兑换码',
                    style: theme.textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _searchQuery.isNotEmpty ? '没有找到匹配的兑换码' : '下拉刷新获取最新兑换码',
                    style: theme.textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final code = _filteredCodes[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: CodeCard(
                      code: code,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => CodeDetailScreen(code: code),
                          ),
                        );
                      },
                    ),
                  );
                },
                childCount: _filteredCodes.length,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildSortChip(String label, String value) {
    final isSelected = _selectedSortBy == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _selectedSortBy = value;
          _applyFilters();
        });
      },
      selectedColor: AppTheme.primaryColor,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : null,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
    );
  }

  Widget _buildTypeChip(String label, String value) {
    final isSelected = _selectedType == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _selectedType = value;
          _applyFilters();
        });
      },
      selectedColor: AppTheme.primaryColor,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : null,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
    );
  }
}

// TabBar固定头部代理
class _SliverAppBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar _tabBar;

  _SliverAppBarDelegate(this._tabBar);

  @override
  double get minExtent => _tabBar.preferredSize.height;
  
  @override
  double get maxExtent => _tabBar.preferredSize.height;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: _tabBar,
    );
  }

  @override
  bool shouldRebuild(_SliverAppBarDelegate oldDelegate) {
    return false;
  }
}
