#!/bin/bash
# =============================================
# 陵水本地生活智能体 - 一键部署脚本
# =============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目目录
PROJECT_DIR="./项目/陵水本地生活智能体"
cd "$PROJECT_DIR"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  陵水本地生活智能体 - 云端部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查前置条件
echo -e "${YELLOW}[1/5] 检查前置条件...${NC}"

# 检查Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git未安装${NC}"
    exit 1
fi

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 前置条件检查通过${NC}"

# 步骤2：GitHub仓库
echo ""
echo -e "${YELLOW}[2/5] GitHub仓库设置${NC}"
echo "请在GitHub创建新仓库，地址格式：https://github.com/YOUR_USERNAME/lingshui-local-life-agent"
echo ""
read -p "请输入你的GitHub用户名: " GH_USERNAME
read -p "请输入仓库名称 (默认: lingshui-local-life-agent): " REPO_NAME
REPO_NAME=${REPO_NAME:-lingshui-local-life-agent}

echo ""
echo -e "${YELLOW}[3/5] 配置Git远程仓库...${NC}"

# 初始化Git（如果需要）
if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "feat: 陵水本地生活智能体 MVP - 初始版本"
fi

# 设置远程仓库
git remote set-url origin "https://github.com/$GH_USERNAME/$REPO_NAME.git"
git branch -M main

echo -e "${GREEN}✓ Git仓库配置完成${NC}"

# 步骤3：Neon数据库
echo ""
echo -e "${YELLOW}[4/5] Neon数据库配置${NC}"
echo "请访问 https://neon.tech 创建免费数据库"
echo "1. 点击 'New Project'"
echo "2. 填写项目名称: lingshui-local-life"
echo "3. 选择Region: Singapore"
echo "4. 创建后复制Connection string"
echo ""
read -p "请粘贴完整的Neon连接字符串: " NEON_URL

# 保存到临时文件（后续手动配置）
cat > .env.deployment << EOF
# ============================================
# 陵水本地生活智能体 - Railway部署配置
# ============================================
# 请将此文件内容复制到Railway的环境变量中

# 数据库连接（Neon PostgreSQL）
DATABASE_URL=$NEON_URL

# 服务配置
API_PORT=3001
NODE_ENV=production

# CORS配置（前端域名，部署后补充）
CORS_ORIGINS=

# 应用配置
APP_NAME=陵水本地生活智能体
EOF

echo -e "${GREEN}✓ 配置已保存到 .env.deployment${NC}"

# 步骤4：Railway部署说明
echo ""
echo -e "${YELLOW}[5/5] Railway部署说明${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  下一步操作${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "1. 访问 https://railway.app"
echo "2. 使用GitHub登录"
echo "3. 点击 'New Project' → 'Deploy from GitHub repo'"
echo "4. 选择 '$REPO_NAME' 仓库"
echo "5. 在环境变量中添加以下配置："
echo ""
echo "   DATABASE_URL=$NEON_URL"
echo "   API_PORT=3001"
echo "   NODE_ENV=production"
echo ""
echo "6. 部署完成后，在 'Networking' 中生成域名"
echo "7. 将Railway域名填入前端 .env.production"
echo ""
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}可选：推送到GitHub触发CI/CD${NC}"
read -p "是否立即推送到GitHub? (y/n): " PUSH_NOW
if [ "$PUSH_NOW" = "y" ] || [ "$PUSH_NOW" = "Y" ]; then
    echo ""
    echo "正在推送代码..."
    git push -u origin main
    echo -e "${GREEN}✓ 代码已推送，Railway将自动部署${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署配置完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📋 配置文件已生成："
echo "   - .env.deployment (Railway环境变量)"
echo ""
echo "📖 详细部署文档："
echo "   - ./部署文档/陵水本地生活智能体_云端部署方案.md"
echo ""
