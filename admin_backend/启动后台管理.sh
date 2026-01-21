#!/bin/bash

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================"
echo -e "  游戏码宝 - 后台管理系统"
echo -e "========================================${NC}"
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo -e "${RED}[错误] 未检测到Node.js，请先安装Node.js${NC}"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}[1/3] 检查Node.js版本...${NC}"
node --version
echo ""

# 检查pnpm是否安装
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}[警告] 未检测到pnpm，正在安装...${NC}"
    npm install -g pnpm
    echo ""
fi

echo -e "${GREEN}[2/3] 检查依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo "首次运行，正在安装依赖..."
    pnpm install
    echo ""
fi

echo -e "${GREEN}[3/3] 启动后台服务...${NC}"
echo ""
echo -e "${BLUE}========================================"
echo -e "  后台管理系统已启动！"
echo -e "========================================${NC}"
echo ""
echo -e "  ${GREEN}管理后台:${NC} http://localhost:8081"
echo -e "  ${GREEN}API服务:${NC}  http://localhost:3000"
echo ""
echo -e "  按 ${YELLOW}Ctrl+C${NC} 停止服务"
echo -e "${BLUE}========================================${NC}"
echo ""

# 启动服务
pnpm dev
