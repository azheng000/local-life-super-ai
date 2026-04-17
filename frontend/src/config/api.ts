// API配置文件
// 开发环境：后端API地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// API端点配置
export const API_ENDPOINTS = {
  // 商家相关
  AGENTS: `${API_BASE_URL}/api/agents`,
  AGENT_DETAIL: (id: string) => `${API_BASE_URL}/api/agents/${id}`,

  // 预约相关
  RESERVATIONS: `${API_BASE_URL}/api/reservations`,
  RESERVATION_DETAIL: (id: string) => `${API_BASE_URL}/api/reservations/${id}`,

  // 通知相关
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,

  // 健康检查
  HEALTH: `${API_BASE_URL}/health`,
}

// 默认请求配置
export const DEFAULT_REQUEST_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒超时
}

// 重试配置
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1秒
}
