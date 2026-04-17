# 本地生活超级AI MVP

> 🔥 **抖音优先策略** - 解决抖音核销率痛点的本地生活智能体平台

## 项目概述

本项目是陵水本地生活超级智能体的 MVP 版本，采用**抖音优先策略**，核心解决抖音本地生活的核销率痛点。

### 核心价值

| 痛点 | 解决方案 | 效果 |
|------|----------|------|
| 抖音核销率低（50-60%） | 即时响应机制 + 商家秒级确认 | 核销率提升至70%+ |
| 用户买了不用 | 实时推送 + 核销追踪 | 形成消费闭环 |
| 商家响应慢 | MCP协议 + 自动路由 | 30秒内响应 |

## 技术栈

- **运行时**: Node.js 18+
- **语言**: TypeScript
- **框架**: Express
- **数据库**: PostgreSQL + PostGIS
- **协议**: MCP (Model Context Protocol)
- **验证**: Zod

## 目录结构

```
lingshui-local-life-agent/
├── src/
│   ├── api/                    # API服务
│   │   ├── index.ts           # 入口文件
│   │   ├── routes/            # 路由
│   │   │   ├── agents.ts      # 商家管理
│   │   │   ├── reservations.ts # 预约管理
│   │   │   ├── notifications.ts # 通知推送
│   │   │   └── mcp.ts         # MCP协议
│   │   └── services/          # 服务层
│   │       └── mcp-tools.ts   # MCP工具配置
│   ├── db/
│   │   └── init.ts           # 数据库初始化
│   ├── mcp-server/           # 商家智能体MCP Server
│   │   └── index.ts
│   └── types/
│       └── index.ts          # 类型定义
├── scripts/                   # 脚本
├── docker/                    # Docker配置
├── package.json
├── tsconfig.json
└── .env.example
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等
```

### 3. 启动数据库（Docker）

```bash
docker run -d \
  --name lingshui-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lingshui_local_life \
  -p 5432:5432 \
  postgis/postgis:16-3.4
```

### 4. 初始化数据库

```bash
npm run db:init
```

### 5. 启动API服务

```bash
npm run dev
```

### 6. 启动商家MCP Server

```bash
# 在另一个终端
AGENT_ID=AGT_demo_001 npm run mcp:server
```

## API接口

### 商家管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/agents/register` | 注册商家智能体 |
| GET | `/api/agents` | 查询商家列表 |
| GET | `/api/agents/:agentId` | 获取商家详情 |
| PUT | `/api/agents/:agentId` | 更新商家信息 |
| DELETE | `/api/agents/:agentId` | 删除商家 |

### 预约管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/reservations` | 创建预约 |
| GET | `/api/reservations` | 查询预约列表 |
| GET | `/api/reservations/:id` | 获取预约详情 |
| POST | `/api/reservations/confirm` | 商家确认预约 |
| POST | `/api/reservations/:id/verify` | 核销预约 |

### 通知推送

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/notifications/send` | 发送通知 |
| GET | `/api/notifications` | 查询通知列表 |
| GET | `/api/notifications/stats` | 获取核销率统计 |

### MCP协议

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/mcp/:agentId/tools` | 获取商家MCP工具 |
| POST | `/api/mcp/:agentId/call` | 调用商家MCP工具 |
| POST | `/api/mcp/batch-call` | 批量调用MCP |
| GET | `/api/mcp/registry` | 获取MCP注册表 |

## MCP工具说明

每个商家智能体提供以下核心工具：

### 1. get_business_info
获取商家基本信息（名称、地址、营业时间等）

### 2. get_menu
获取菜单或服务项目列表

### 3. check_availability 🔥
查询预约可用时间/库存

### 4. make_reservation 🔥🔥
预约/下单！会自动推送给商家

### 5. get_story
获取商家故事和品牌特色

## 数据库表结构

### agents - 商家智能体主表
```sql
- agent_id: 智能体唯一标识
- agent_type: 类型（merchant/individual）
- status: 状态（active/inactive/pending）
```

### agent_basic_info - 基础信息
```sql
- name: 商家名称
- category: 分类
- address: 地址
- location: GPS坐标
- contact: 联系方式
```

### agent_trust_scores - 信任分
```sql
- quality_score: 质量分
- activity_score: 活跃分
- warmth_score: 人情分
- total_score: 综合分
```

### reservations - 预约表 🔥
```sql
- reservation_id: 预约号
- verification_code: 核销码
- status: 状态
- source: 来源（douyin/meituan等）
```

## 示例请求

### 注册商家

```bash
curl -X POST http://localhost:3001/api/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "陵水海鲜坊",
    "category": "餐饮",
    "address": "海南省陵水县椰林镇",
    "contact": "0898-83318888",
    "owner_name": "陈老板",
    "story": "开了20年的老店",
    "business_hours": "10:00-22:00",
    "services": [
      {"name": "清蒸石斑鱼", "price": 168},
      {"name": "蒜蓉扇贝", "price": 38}
    ]
  }'
```

### 创建预约

```bash
curl -X POST http://localhost:3001/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "AGT_demo_001",
    "customer_name": "张三",
    "customer_phone": "13800138000",
    "date": "2026-05-01",
    "time": "19:00",
    "party_size": 4,
    "source": "douyin"
  }'
```

### 商家确认预约

```bash
curl -X POST http://localhost:3001/api/reservations/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "reservation_id": "RSV_xxx",
    "action": "confirm"
  }'
```

## 核销率追踪

查看通知统计：

```bash
curl http://localhost:3001/api/notifications/stats?agent_id=AGT_demo_001
```

返回示例：
```json
{
  "success": true,
  "data": {
    "total": 100,
    "verification_rate": "68.50%",
    "confirmation_rate": "85.00%",
    "pending_count": 5
  }
}
```

## 开发说明

### 运行测试

```bash
npm run lint
npm run format
```

### 构建生产版本

```bash
npm run build
npm start
```

## Roadmap

- [x] Week 1: MVP核心功能
  - [x] 数据库初始化
  - [x] 商家智能体MCP Server
  - [x] API服务
  - [x] 订单实时推送

- [ ] Week 2: 平台完善
  - [ ] 超级智能体核心逻辑
  - [ ] 商家管理后台
  - [ ] 10个商家入驻测试

- [ ] Week 3-4: 核销率验证
  - [ ] 100个商家入驻
  - [ ] 核销率数据分析

## License

MIT
