#!/bin/bash
# 本地生活超级AI - 一键部署脚本
# 使用方法：./deploy.sh

echo "🚀 本地生活超级AI 部署脚本"
echo "=============================="

# 检查 Railway CLI
if ! command -v railway &> /dev/null; then
    echo "📦 安装 Railway CLI..."
    curl -fsSL https://railway.app/install.sh | bash
    export PATH="$HOME/.railway/bin:$PATH"
fi

# 登录 Railway
echo ""
echo "🔐 请在浏览器中完成 Railway 登录..."
railway login

# 创建项目
echo ""
echo "📦 创建 Railway 项目..."
railway init

# 设置环境变量
echo ""
echo "⚙️ 配置环境变量..."
railway variables set DATABASE_URL="postgresql://neondb_owner:npg_bsgDcCLJ54Mu@ep-hidden-forest-ae532vl5-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
railway variables set PORT=3000
railway variables set NODE_ENV=production

# 部署
echo ""
echo "🚀 开始部署..."
railway up

# 获取 URL
echo ""
echo "✅ 部署完成！"
railway domain

echo ""
echo "🎉 后端部署成功！"
echo "前端部署请运行：cd frontend && npm run build"
