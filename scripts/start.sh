#!/bin/bash
# 陵水本地生活智能体 - 快速启动脚本

set -e

echo "🔥 陵水本地生活超级智能体 MVP"
echo "================================"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

# 安装依赖
echo ""
echo "📦 安装依赖..."
npm install

# 检查.env文件
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  .env 文件不存在，复制 .env.example"
    cp .env.example .env
    echo "   请编辑 .env 文件配置数据库连接"
fi

# Docker启动数据库
echo ""
echo "🐘 启动PostgreSQL数据库..."
docker compose -f docker/docker-compose.yml up -d postgres

# 等待数据库就绪
echo "⏳ 等待数据库就绪..."
sleep 5

# 初始化数据库
echo ""
echo "📊 初始化数据库..."
npm run db:init

echo ""
echo "================================"
echo "🎉 启动完成！"
echo ""
echo "启动API服务: npm run dev"
echo "启动MCP Server: AGENT_ID=AGT_demo_001 npm run mcp:server"
echo ""
echo "API地址: http://localhost:3001"
echo "API文档: http://localhost:3001/api"
echo "================================"
