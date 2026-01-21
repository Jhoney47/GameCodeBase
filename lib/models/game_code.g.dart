// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'game_code.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

GameCode _$GameCodeFromJson(Map<String, dynamic> json) => GameCode(
      code: json['code'] as String,
      rewardDescription: json['rewardDescription'] as String,
      sourcePlatform: json['sourcePlatform'] as String,
      sourceUrl: json['sourceUrl'] as String?,
      expireDate: json['expireDate'] as String?,
      status: json['status'] as String,
      codeType: json['codeType'] as String,
      publishDate: json['publishDate'] as String?,
      verificationCount: json['verificationCount'] as int,
      reviewStatus: json['reviewStatus'] as String,
    );

Map<String, dynamic> _$GameCodeToJson(GameCode instance) => <String, dynamic>{
      'code': instance.code,
      'rewardDescription': instance.rewardDescription,
      'sourcePlatform': instance.sourcePlatform,
      'sourceUrl': instance.sourceUrl,
      'expireDate': instance.expireDate,
      'status': instance.status,
      'codeType': instance.codeType,
      'publishDate': instance.publishDate,
      'verificationCount': instance.verificationCount,
      'reviewStatus': instance.reviewStatus,
    };

GameData _$GameDataFromJson(Map<String, dynamic> json) => GameData(
      gameName: json['gameName'] as String,
      codeCount: json['codeCount'] as int,
      codes: (json['codes'] as List<dynamic>)
          .map((e) => GameCode.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$GameDataToJson(GameData instance) => <String, dynamic>{
      'gameName': instance.gameName,
      'codeCount': instance.codeCount,
      'codes': instance.codes,
    };

GameCodeResponse _$GameCodeResponseFromJson(Map<String, dynamic> json) =>
    GameCodeResponse(
      version: json['version'] as String,
      lastUpdated: json['lastUpdated'] as String,
      totalCodes: json['totalCodes'] as int,
      games: (json['games'] as List<dynamic>)
          .map((e) => GameData.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$GameCodeResponseToJson(GameCodeResponse instance) =>
    <String, dynamic>{
      'version': instance.version,
      'lastUpdated': instance.lastUpdated,
      'totalCodes': instance.totalCodes,
      'games': instance.games,
    };
