#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
游戏码宝 - 后台管理系统启动器
支持 Windows、macOS、Linux
双击运行即可启动后台管理系统
"""

import os
import sys
import subprocess
import platform
import webbrowser
import time
from pathlib import Path

# ANSI颜色代码（Windows 10+支持）
class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_colored(text, color=Colors.WHITE):
    """打印彩色文本"""
    if platform.system() == 'Windows':
        # 启用Windows 10+的ANSI颜色支持
        os.system('')
    print(f"{color}{text}{Colors.RESET}")

def print_header():
    """打印标题"""
    print_colored("\n" + "=" * 50, Colors.BLUE)
    print_colored("  游戏码宝 - 后台管理系统", Colors.CYAN + Colors.BOLD)
    print_colored("=" * 50 + "\n", Colors.BLUE)

def check_command(command):
    """检查命令是否存在"""
    try:
        subprocess.run(
            [command, '--version'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def install_pnpm():
    """安装pnpm"""
    print_colored("[提示] 正在安装pnpm...", Colors.YELLOW)
    try:
        subprocess.run(['npm', 'install', '-g', 'pnpm'], check=True)
        print_colored("[成功] pnpm安装完成", Colors.GREEN)
        return True
    except subprocess.CalledProcessError:
        print_colored("[错误] pnpm安装失败", Colors.RED)
        return False

def install_dependencies():
    """安装项目依赖"""
    print_colored("[2/4] 检查项目依赖...", Colors.GREEN)
    
    if not Path('node_modules').exists():
        print_colored("首次运行，正在安装依赖（可能需要几分钟）...", Colors.YELLOW)
        try:
            subprocess.run(['pnpm', 'install'], check=True)
            print_colored("[成功] 依赖安装完成\n", Colors.GREEN)
        except subprocess.CalledProcessError:
            print_colored("[错误] 依赖安装失败", Colors.RED)
            return False
    else:
        print_colored("[成功] 依赖已安装\n", Colors.GREEN)
    
    return True

def open_browser(url, delay=3):
    """延迟打开浏览器"""
    time.sleep(delay)
    try:
        webbrowser.open(url)
    except Exception as e:
        print_colored(f"[警告] 无法自动打开浏览器: {e}", Colors.YELLOW)

def main():
    """主函数"""
    # 切换到脚本所在目录
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    print_header()
    
    # 1. 检查Node.js
    print_colored("[1/4] 检查Node.js...", Colors.GREEN)
    if not check_command('node'):
        print_colored("[错误] 未检测到Node.js", Colors.RED)
        print_colored("请先安装Node.js: https://nodejs.org/", Colors.YELLOW)
        input("\n按回车键退出...")
        sys.exit(1)
    
    # 显示Node.js版本
    result = subprocess.run(['node', '--version'], capture_output=True, text=True)
    print_colored(f"[成功] Node.js版本: {result.stdout.strip()}\n", Colors.GREEN)
    
    # 2. 检查pnpm
    if not check_command('pnpm'):
        print_colored("[警告] 未检测到pnpm", Colors.YELLOW)
        if not install_pnpm():
            input("\n按回车键退出...")
            sys.exit(1)
    
    # 3. 安装依赖
    if not install_dependencies():
        input("\n按回车键退出...")
        sys.exit(1)
    
    # 4. 启动服务
    print_colored("[3/4] 启动后台服务...\n", Colors.GREEN)
    
    print_colored("=" * 50, Colors.BLUE)
    print_colored("  后台管理系统已启动！", Colors.CYAN + Colors.BOLD)
    print_colored("=" * 50, Colors.BLUE)
    print()
    print_colored(f"  管理后台: {Colors.BOLD}http://localhost:8081{Colors.RESET}", Colors.GREEN)
    print_colored(f"  API服务:  {Colors.BOLD}http://localhost:3000{Colors.RESET}", Colors.GREEN)
    print()
    print_colored(f"  按 {Colors.BOLD}Ctrl+C{Colors.RESET} 停止服务", Colors.YELLOW)
    print_colored("=" * 50 + "\n", Colors.BLUE)
    
    print_colored("[4/4] 正在打开浏览器...\n", Colors.GREEN)
    
    # 延迟3秒后打开浏览器
    import threading
    browser_thread = threading.Thread(
        target=open_browser,
        args=('http://localhost:8081', 3)
    )
    browser_thread.daemon = True
    browser_thread.start()
    
    # 启动开发服务器
    try:
        if platform.system() == 'Windows':
            subprocess.run(['pnpm', 'dev'], shell=True)
        else:
            subprocess.run(['pnpm', 'dev'])
    except KeyboardInterrupt:
        print_colored("\n\n[提示] 服务已停止", Colors.YELLOW)
    except Exception as e:
        print_colored(f"\n[错误] 服务启动失败: {e}", Colors.RED)
        input("\n按回车键退出...")
        sys.exit(1)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print_colored("\n\n[提示] 用户取消操作", Colors.YELLOW)
        sys.exit(0)
    except Exception as e:
        print_colored(f"\n[错误] 发生未知错误: {e}", Colors.RED)
        input("\n按回车键退出...")
        sys.exit(1)
