#!/bin/bash
# 陵水本地生活智能体 - API测试脚本

API_BASE="http://localhost:3001"

echo "========================================"
echo "🧪 陵水本地生活智能体 API测试"
echo "========================================"
echo ""

# 1. 健康检查
echo "1️⃣  健康检查..."
curl -s "$API_BASE/health" | jq '.' || echo "❌ 后端未启动"
echo ""

# 2. API信息
echo "2️⃣  API信息..."
curl -s "$API_BASE/api" | jq '.'
echo ""

# 3. 获取商家列表
echo "3️⃣  获取商家列表..."
curl -s "$API_BASE/api/agents?limit=3" | jq '.'
echo ""

# 4. 测试预约创建（模拟）
echo "4️⃣  测试预约创建..."
curl -s -X POST "$API_BASE/api/reservations" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "TEST_001",
    "customer_name": "测试用户",
    "customer_phone": "13800138000",
    "date": "2026-04-20",
    "time": "12:00",
    "party_size": 2,
    "source": "direct"
  }' | jq '.'
echo ""

echo "========================================"
echo "✅ 测试完成"
echo "========================================"
