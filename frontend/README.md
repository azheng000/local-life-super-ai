# 陵水本地生活智能体 - 前端项目

基于 React + TypeScript + Tailwind CSS 构建的智能对话式本地生活服务平台。

## 🎯 功能特点

- **对话式交互**：类似豆包的对话界面，流畅自然
- **智能推荐**：AI根据用户需求推荐本地商家
- **商家卡片**：展示商家信息、信任分、推荐理由
- **在线预约**：完整的预约流程
- **移动端优先**：适配微信小程序场景

## 🚀 快速开始

### 安装依赖

```bash
cd ./项目/陵水本地生活智能体/frontend
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 📁 项目结构

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/          # 组件目录
│   │   ├── Header.tsx       # 头部组件
│   │   ├── MessageBubble.tsx # 消息气泡
│   │   ├── MerchantCard.tsx # 商家卡片
│   │   ├── TypingIndicator.tsx # 加载动画
│   │   ├── InputArea.tsx    # 输入区域
│   │   ├── BookingModal.tsx # 预约弹窗
│   │   ├── MerchantDetailModal.tsx # 商家详情
│   │   └── WelcomeScreen.tsx # 欢迎页面
│   ├── hooks/
│   │   └── useChatStore.ts  # 状态管理
│   ├── types/
│   │   └── index.ts         # 类型定义
│   ├── utils/
│   │   └── mockData.ts      # 模拟数据
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🎨 设计规范

### 色彩系统

| 名称 | 色值 | 用途 |
|------|------|------|
| Brand Blue | `#4A90E2` | 主色调 |
| Brand Light | `#6BA3FF` | 渐变辅助 |
| Brand Dark | `#2E5C9A` | 深色变体 |

### 组件样式

- **卡片**：白色背景，圆角 16px，微妙阴影
- **消息气泡**：用户蓝色渐变，AI 白色背景
- **按钮**：渐变背景，圆角全圆

## 📱 核心交互流程

```
用户输入 → 显示用户消息 → 加载动画 → AI响应 → 展示商家卡片 → 用户操作
                                                              ↓
                                    ← 查看详情 ←  立即预约 → 填写信息 → 确认预约
```

## 🔧 技术栈

- **框架**：React 18 + TypeScript
- **样式**：Tailwind CSS
- **状态管理**：Zustand
- **图标**：Lucide React
- **日期处理**：date-fns
- **构建工具**：Vite

## 📋 功能优先级

| 优先级 | 功能 | 状态 |
|--------|------|------|
| P0 | 对话界面 | ✅ |
| P0 | 商家卡片 | ✅ |
| P0 | 预约功能 | ✅ |
| P1 | 商家详情 | ✅ |
| P1 | 历史记录 | ✅ |
| P2 | 用户登录 | ⏳ |
| P2 | 个人中心 | ⏳ |

## 🌐 适配说明

本项目针对移动端进行了优化：

- 响应式布局适配手机屏幕
- 安全区域适配（iPhone刘海屏）
- 触摸友好的交互设计
- 隐藏滚动条但保留功能

## 📄 License

MIT
