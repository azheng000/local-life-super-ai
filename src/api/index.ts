import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { agentRoutes } from './routes/agents.js';
import { reservationRoutes } from './routes/reservations.js';
import { notificationRoutes } from './routes/notifications.js';
import { mcpRoutes } from './routes/mcp.js';

dotenv.config();

const PORT = parseInt(process.env.API_PORT || '3001');
const app = express();

// CORS配置
const getCorsOrigins = () => {
  const origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];
  
  // 生产环境：从环境变量添加允许的域名
  const prodOrigins = process.env.CORS_ORIGINS?.split(',').map(s => s.trim()) || [];
  return [...origins, ...prodOrigins];
};

const corsOptions: cors.CorsOptions = {
  origin: getCorsOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// 中间件
app.use(cors(corsOptions));
app.use(express.json());

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 路由
app.use('/api/agents', agentRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mcp', mcpRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: '陵水本地生活智能体平台API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API信息
app.get('/api', (req, res) => {
  res.json({
    name: '陵水本地生活智能体 API',
    version: '1.0.0',
    endpoints: {
      agents: '/api/agents',
      reservations: '/api/reservations',
      notifications: '/api/notifications',
      mcp: '/api/mcp',
    },
  });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Internal Server Error' 
  });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🔥 陵水本地生活智能体平台 API 已启动                      ║
║                                                           ║
║   📍 Port: ${PORT}                                          ║
║   🌐 URL: http://localhost:${PORT}                          ║
║                                                           ║
║   📚 API文档: http://localhost:${PORT}/api                  ║
║   💚 健康检查: http://localhost:${PORT}/health               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
