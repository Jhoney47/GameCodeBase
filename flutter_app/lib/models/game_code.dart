import 'package:json_annotation/json_annotation.dart';

part 'game_code.g.dart';

@JsonSerializable()
class GameCode {
  final String code;
  final String rewardDescription;
  final String sourcePlatform;
  final String? sourceUrl;
  final String? expireDate;
  final String status;
  final String codeType;
  final String? publishDate;
  final int verificationCount;
  final String reviewStatus;
  
  // 计算属性
  String? _gameName;
  
  GameCode({
    required this.code,
    required this.rewardDescription,
    required this.sourcePlatform,
    this.sourceUrl,
    this.expireDate,
    required this.status,
    required this.codeType,
    this.publishDate,
    required this.verificationCount,
    required this.reviewStatus,
  });

  // 设置游戏名称（从外部注入）
  void setGameName(String name) {
    _gameName = name;
  }

  String get gameName => _gameName ?? '';

  // 是否激活（有效）
  bool get isActive {
    if (status != 'active') return false;
    if (expireDate == null) return true;
    
    try {
      final expiry = DateTime.parse(expireDate!);
      return expiry.isAfter(DateTime.now());
    } catch (e) {
      return true;
    }
  }

  // 可信度/准确率（基于验证次数和来源平台）
  double get reliability {
    double score = 50.0; // 基础分
    
    // 根据验证次数加分
    if (verificationCount >= 10) {
      score += 30.0;
    } else if (verificationCount >= 5) {
      score += 20.0;
    } else if (verificationCount >= 1) {
      score += 10.0;
    }
    
    // 根据来源平台加分
    if (sourcePlatform.contains('官方') || sourcePlatform.contains('TapTap')) {
      score += 20.0;
    } else if (sourcePlatform.contains('Bilibili') || sourcePlatform.contains('BWIKI')) {
      score += 15.0;
    }
    
    // 审核状态加分
    if (reviewStatus == 'approved') {
      score += 10.0;
    }
    
    return score.clamp(0.0, 100.0);
  }

  // 是否即将过期（7天内）
  bool get isExpiringSoon {
    if (expireDate == null || codeType == 'permanent') return false;
    
    try {
      final expiry = DateTime.parse(expireDate!);
      final now = DateTime.now();
      final diff = expiry.difference(now);
      return diff.inDays <= 7 && diff.inDays >= 0;
    } catch (e) {
      return false;
    }
  }

  factory GameCode.fromJson(Map<String, dynamic> json) => _$GameCodeFromJson(json);
  Map<String, dynamic> toJson() => _$GameCodeToJson(this);
}

@JsonSerializable()
class GameData {
  final String gameName;
  final int codeCount;
  final List<GameCode> codes;

  GameData({
    required this.gameName,
    required this.codeCount,
    required this.codes,
  }) {
    // 为每个code设置游戏名称
    for (var code in codes) {
      code.setGameName(gameName);
    }
  }

  factory GameData.fromJson(Map<String, dynamic> json) => _$GameDataFromJson(json);
  Map<String, dynamic> toJson() => _$GameDataToJson(this);
}

@JsonSerializable()
class GameCodeResponse {
  final String version;
  final String lastUpdated;
  final int totalCodes;
  final List<GameData> games;

  GameCodeResponse({
    required this.version,
    required this.lastUpdated,
    required this.totalCodes,
    required this.games,
  });

  // 获取所有兑换码的扁平列表
  List<GameCode> get allCodes {
    return games.expand((game) => game.codes).toList();
  }

  // 获取所有游戏名称列表
  List<String> get gameNames {
    return games.map((game) => game.gameName).toList();
  }

  factory GameCodeResponse.fromJson(Map<String, dynamic> json) => _$GameCodeResponseFromJson(json);
  Map<String, dynamic> toJson() => _$GameCodeResponseToJson(this);
}
