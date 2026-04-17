// API基础服务模块
import { API_ENDPOINTS, DEFAULT_REQUEST_CONFIG, RETRY_CONFIG } from '../config/api'

// API响应基础结构
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 自定义错误类型
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// 请求封装，支持重试
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries: number = RETRY_CONFIG.maxRetries
): Promise<ApiResponse<T>> {
  const config = { ...DEFAULT_REQUEST_CONFIG, ...options }

  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_REQUEST_CONFIG.timeout)

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(data.error || '请求失败', response.status, data)
      }

      return data as ApiResponse<T>
    } catch (error: any) {
      if (i === retries) {
        if (error instanceof ApiError) {
          throw error
        }
        if (error.name === 'AbortError') {
          throw new ApiError('请求超时，请稍后重试')
        }
        throw new ApiError(error.message || '网络错误')
      }

      // 等待后重试
      await new Promise((resolve) => setTimeout(resolve, RETRY_CONFIG.retryDelay * (i + 1)))
    }
  }

  throw new ApiError('请求失败')
}

// GET请求
export async function get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
  let queryString = ''
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    queryString = searchParams.toString()
  }

  const fullUrl = queryString ? `${url}?${queryString}` : url
  return fetchWithRetry<T>(fullUrl, { method: 'GET' })
}

// POST请求
export async function post<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
  return fetchWithRetry<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

// PUT请求
export async function put<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
  return fetchWithRetry<T>(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

// DELETE请求
export async function del<T = any>(url: string): Promise<ApiResponse<T>> {
  return fetchWithRetry<T>(url, { method: 'DELETE' })
}

// 健康检查
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await get<{ status: string }>(API_ENDPOINTS.HEALTH)
    return response.success && response.data?.status === 'ok'
  } catch {
    return false
  }
}
