import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const GameCodeApp());
}

class GameCodeApp extends StatelessWidget {
  const GameCodeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '游戏码宝',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const HomeScreen(),
    );
  }
}
