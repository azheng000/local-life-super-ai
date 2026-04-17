# 陵水本地生活智能体 - 前后端联调指南

## 📋 联调概述

本次联调完成了H5前端与真实后端API的对接，实现了：
- ✅ API服务模块封装
- ✅ 商家查询API对接
- ✅ 预约创建API对接
- ✅ 降级方案（mock数据）
- ✅ 错误处理和重试机制

---

## 📁 新增/修改的文件

### 前端文件

```
frontend/src/
├── config/
│   └── api.ts              # API配置文件
├── services/
│   ├── baseApi.ts          # API基础服务（请求封装、重试）
│   ├── agentService.ts     # 商家相关API
│   ├── reservationService.ts  # 预约相关API
│   ├── notificationService.ts # 通知相关API
│   └── index.ts            # 服务导出
├── hooks/
│   └── useChatStore.ts     # 修改：支持真实API调用
├── .env                    # 环境变量
└── vite.config.ts          # 修改：添加代理配置
```

### 后端文件

```
src/api/
└── index.ts                # 修改：完善CORS配置
```

### 脚本文件

```
scripts/
└── init-test-data.ts       # 测试数据初始化脚本
```

---

## 🚀 启动指南

### 1. 启动后端API

```bash
cd ./项目/陵水本地生活智能体

# 初始化数据库（首次运行）
npm run db:init

# 初始化测试数据
npm run db:test-data

# 启动API服务
npm run dev
```

后端服务将运行在：`http://localhost:3001`

### 2. 启动前端开发服务器

```bash
cd ./项目/陵水本地生活智能体/frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将运行在：`http://localhost:3000`

### 3. 验证联调

访问 `http://localhost:3000`，打开浏览器控制台查看网络请求：

- ✅ 健康检查：`GET http://localhost:3001/health`
- ✅ 商家列表：`GET http://localhost:3001/api/agents`
- ✅ 商家详情：`GET http://localhost:3001/api/agents/:id`

---

## 📡 API接口对接

### 商家接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/agents` | GET | 获取商家列表 |
| `/api/agents/:agentId` | GET | 获取商家详情 |
| `/api/agents/register` | POST | 注册新商家 |

### 预约接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/reservations` | POST | 创建预约 |
| `/api/reservations/:id` | GET | 查询预约详情 |

### 通知接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/notifications/send` | POST | 发送通知 |

---

## 🔧 配置说明

### 前端环境变量

创建 `frontend/.env`：

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_USE_PROXY=true
```

### API代理

Vite配置了代理，将前端请求转发到后端：
- `/api/*` → `http://localhost:3001/api/*`
- `/health` → `http://localhost:3001/health`

### 后端CORS

后端允许以下来源：
- `http://localhost:3000`（前端开发服务器）
- `http://localhost:3001`（后端API）

---

## 🛡️ 降级策略

当前端无法连接后端API时，系统会自动降级到mock数据：

1. **商家推荐**：降级使用 `mockMerchants` 数据
2. **预约创建**：使用本地存储记录预约
3. **错误提示**：显示"无法连接服务器，使用本地数据"

---

## 🐛 常见问题

### 1. CORS错误

**问题**：浏览器报CORS错误

**解决**：
- 确认后端已启动
- 检查CORS白名单配置
- 清除浏览器缓存

### 2. 请求超时

**问题**：API请求超时

**解决**：
- 检查后端服务是否正常
- 增加超时时间配置
- 检查网络连接

### 3. 数据库连接失败

**问题**：`DATABASE_URL` 未设置

**解决**：
- 复制 `.env.example` 为 `.env`
- 配置正确的数据库连接字符串

### 4. mock数据与真实数据混合

**问题**：返回的商家数据不一致

**解决**：
- 这是正常现象，mock数据作为降级方案保留
- 真实API可用时优先使用真实数据

---

## 📊 测试检查清单

- [ ] 后端API启动成功（`/health` 返回正常）
- [ ] 数据库初始化成功（商家表有数据）
- [ ] 前端启动成功（`npm run dev` 无报错）
- [ ] 浏览器控制台无CORS错误
- [ ] 商家列表能正常加载
- [ ] 预约创建功能正常
- [ ] 离线/API不可用时能降级到mock数据

---

## 🔗 相关文档

- [项目README](./README.md)
- [后端API文档](./API.md)
- [前端组件文档](./frontend/README.md)
