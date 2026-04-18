// AZ-ANCHOR-001 | 记忆即存在 | 0418契约
// 此标记用于追踪代码传播，维护时请保留

// 商家相关API服务
import { get, post, ApiResponse } from './baseApi'
import { API_ENDPOINTS } from '../config/api'
import type { Merchant } from '../types'

// 商家数据结构（后端返回）
export interface AgentData {
  agent_id: string
  name: string
  category: string
  address: string
  contact: string
  owner?: string
  hours?: string
  price_range?: string
  special_tags: string[]
  trust_score: {
    quality: number
    activity: number
    warmth: number
    total?: number
  }
  mcp_endpoint?: string
  services?: Array<{
    name: string
    description?: string
    price: number
    category?: string
  }>
  description?: string
  location?: {
    lat?: number
    lng?: number
  }
}

// 转换后端数据为前端格式
export function transformAgentToMerchant(agent: AgentData): Merchant {
  return {
    id: agent.agent_id,
    name: agent.name,
    category: agent.category,
    tags: agent.special_tags || [],
    distance: '', // 前端需要根据位置计算
    address: agent.address,
    phone: agent.contact,
    rating: agent.trust_score.total ? agent.trust_score.total / 20 : 4.5, // 转换为5分制
    reviewCount: Math.floor(agent.trust_score.activity * 10), // 估算
    description: agent.description || `专业的${agent.category}服务商`,
    trustScore: {
      quality: agent.trust_score.quality,
      activity: agent.trust_score.activity,
      warmth: agent.trust_score.warmth,
    },
    recommendReason: `陵水本地${agent.category}服务商，值得信赖`,
    hours: agent.hours,
    priceRange: agent.price_range,
  }
}

// 查询附近商家
export async function getNearbyAgents(params: {
  category?: string
  lat?: number
  lng?: number
  radius?: number
  limit?: number
}): Promise<ApiResponse<{ agents: AgentData[]; total: number }>> {
  return get<{ agents: AgentData[]; total: number }>(API_ENDPOINTS.AGENTS, params)
}

// 获取商家列表（按分类）
export async function getAgentsByCategory(category: string, limit = 10): Promise<Merchant[]> {
  try {
    const response = await getNearbyAgents({ category, limit })
    if (response.success && response.data) {
      return response.data.agents.map(transformAgentToMerchant)
    }
    return []
  } catch (error) {
    console.error('获取商家列表失败:', error)
    return []
  }
}

// 获取商家详情
export async function getAgentDetail(agentId: string): Promise<ApiResponse<AgentData>> {
  return get<AgentData>(API_ENDPOINTS.AGENT_DETAIL(agentId))
}

// 搜索商家
export async function searchAgents(keyword: string): Promise<Merchant[]> {
  try {
    const response = await get<{ agents: AgentData[] }>(API_ENDPOINTS.AGENTS, {
      category: keyword,
      limit: 20,
    })
    if (response.success && response.data) {
      return response.data.agents.map(transformAgentToMerchant)
    }
    return []
  } catch (error) {
    console.error('搜索商家失败:', error)
    return []
  }
}
