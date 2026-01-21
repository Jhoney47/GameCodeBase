import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/game_code.dart';

class CodeRepository {
  // 使用jsDelivr CDN加速，确保国内无障碍访问
  static const String _baseUrl =
      'https://cdn.jsdelivr.net/gh/Jhoney47/GameCodeBase@main/GameCodeBase.json';

  /// 获取游戏兑换码数据
  /// 
  /// 关键特性：
  /// 1. 使用jsDelivr CDN，国内用户无需VPN即可访问
  /// 2. 添加时间戳参数破除CDN缓存，确保获取最新数据
  /// 3. 设置超时时间，避免长时间等待
  Future<GameCodeResponse> fetchGameCodes() async {
    try {
      // 添加时间戳参数破除CDN缓存
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final url = Uri.parse('$_baseUrl?v=$timestamp');

      print('🌐 正在从CDN获取数据: $url');

      // 发起HTTP GET请求
      final response = await http.get(
        url,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      ).timeout(
        const Duration(seconds: 15),
        onTimeout: () {
          throw Exception('请求超时，请检查网络连接');
        },
      );

      print('📡 HTTP状态码: ${response.statusCode}');

      if (response.statusCode == 200) {
        // 解析UTF-8编码的JSON数据
        final jsonData = json.decode(utf8.decode(response.bodyBytes));
        print('✅ 数据获取成功，共 ${jsonData['totalCodes']} 个兑换码');
        
        return GameCodeResponse.fromJson(jsonData);
      } else {
        throw Exception('服务器返回错误: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ 数据获取失败: $e');
      rethrow;
    }
  }

  /// 按游戏名称筛选兑换码
  List<GameCode> filterByGame(List<GameCode> codes, String? gameName) {
    if (gameName == null || gameName.isEmpty) {
      return codes;
    }
    return codes.where((code) => code.gameName == gameName).toList();
  }

  /// 按类型筛选兑换码
  List<GameCode> filterByType(List<GameCode> codes, String type) {
    if (type == 'all') return codes;
    return codes.where((code) => code.codeType == type).toList();
  }

  /// 按状态筛选兑换码
  List<GameCode> filterByStatus(List<GameCode> codes, bool activeOnly) {
    if (!activeOnly) return codes;
    return codes.where((code) => code.isActive).toList();
  }

  /// 搜索兑换码（按游戏名称或兑换码内容）
  List<GameCode> searchCodes(List<GameCode> codes, String query) {
    if (query.isEmpty) return codes;
    
    final lowerQuery = query.toLowerCase();
    return codes.where((code) {
      return code.gameName.toLowerCase().contains(lowerQuery) ||
          code.code.toLowerCase().contains(lowerQuery) ||
          code.rewardDescription.toLowerCase().contains(lowerQuery);
    }).toList();
  }

  /// 排序兑换码
  List<GameCode> sortCodes(List<GameCode> codes, String sortBy) {
    final sortedCodes = List<GameCode>.from(codes);

    switch (sortBy) {
      case 'latest':
        // 按发布日期降序（最新的在前）
        sortedCodes.sort((a, b) {
          if (a.publishDate == null) return 1;
          if (b.publishDate == null) return -1;
          return b.publishDate!.compareTo(a.publishDate!);
        });
        break;

      case 'reliability':
        // 按可信度降序（准确率最高的在前）
        sortedCodes.sort((a, b) => b.reliability.compareTo(a.reliability));
        break;

      case 'expiring':
        // 即将过期的在前，然后按过期时间升序
        sortedCodes.sort((a, b) {
          if (a.expireDate == null && b.expireDate == null) return 0;
          if (a.expireDate == null) return 1;
          if (b.expireDate == null) return -1;
          return a.expireDate!.compareTo(b.expireDate!);
        });
        break;

      default:
        break;
    }

    return sortedCodes;
  }
}
