#!/bin/bash
# =============================================
# 陵水本地生活智能体 - 本地测试脚本
# =============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="./项目/陵水本地生活智能体"
cd "$PROJECT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  陵水本地生活智能体 - 本地测试${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查Docker
echo -e "${YELLOW}[1/6] 检查Docker环境...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker已安装${NC}"
    docker --version
else
    echo -e "${RED}❌ Docker未安装，跳过Docker测试${NC}"
    DOCKER_AVAILABLE=false
fi

# 检查Node.js
echo ""
echo -e "${YELLOW}[2/6] 检查Node.js环境...${NC}"
NODE_VERSION=$(node -v 2>/dev/null || echo "未安装")
echo -e "Node.js版本: ${GREEN}$NODE_VERSION${NC}"

if [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
    echo -e "${RED}⚠️ Node.js版本低于18，可能存在兼容性问题${NC}"
fi

# 安装依赖
echo ""
echo -e "${YELLOW}[3/6] 安装项目依赖...${NC}"
npm install 2>&1 | tail -5
echo -e "${GREEN}✓ 依赖安装完成${NC}"

# 构建后端
echo ""
echo -e "${YELLOW}[4/6] 构建后端TypeScript...${NC}"
npm run build 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 后端构建成功${NC}"
else
    echo -e "${RED}❌ 后端构建失败${NC}"
    exit 1
fi

# 构建前端
echo ""
echo -e "${YELLOW}[5/6] 构建前端React应用...${NC}"
cd frontend
npm install 2>&1 | tail -3
npm run build 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 前端构建成功${NC}"
else
    echo -e "${RED}❌ 前端构建失败${NC}"
    exit 1
fi
cd ..

# 测试启动
echo ""
echo -e "${YELLOW}[6/6] 启动服务测试...${NC}"

# 启动数据库（使用Docker）
if command -v docker &> /dev/null; then
    echo "启动PostgreSQL数据库..."
    docker run -d \
        --name lingshui-test-postgres \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=lingshui_local_life \
        -p 5432:5432 \
        postgis/postgis:16-3.4 \
        2>/dev/null || echo "数据库可能已在运行"
    
    # 等待数据库就绪
    echo "等待数据库启动..."
    sleep 5
fi

# 导出测试环境变量
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lingshui_local_life
export API_PORT=3001

# 初始化数据库
echo "初始化数据库..."
npm run db:init 2>&1 || echo "数据库初始化跳过（可能需要先启动数据库）"

# 启动后端
echo "启动后端API..."
timeout 10s npx tsx src/api/index.ts &
BACKEND_PID=$!
sleep 3

# 测试API
echo ""
echo -e "${BLUE}测试API响应...${NC}"
if curl -s http://localhost:3001/health 2>/dev/null; then
    echo ""
    echo -e "${GREEN}✓ 后端API测试通过${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️ 后端API测试失败，可能需要配置数据库${NC}"
fi

# 清理
kill $BACKEND_PID 2>/dev/null || true

# 总结
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  测试完成${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "📊 构建产物："
echo "   - 后端：./dist/"
echo "   - 前端：./frontend/dist/"
echo ""
echo "📋 下一步："
echo "   1. 确保PostgreSQL数据库运行中"
echo "   2. 运行 npm run dev 启动开发服务器"
echo "   3. 访问 http://localhost:3000 查看前端"
echo "   4. 确认无误后执行部署"
echo ""
