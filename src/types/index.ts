// 商家智能体相关类型定义

export interface Agent {
  id: number;
  agent_id: string;
  agent_type: 'merchant' | 'individual';
  status: 'active' | 'inactive' | 'pending';
  created_at: Date;
  updated_at: Date;
}

export interface AgentBasicInfo {
  id: number;
  agent_id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  contact: string;
  owner_name?: string;
}

export interface AgentBrandInfo {
  id: number;
  agent_id: string;
  story: string;
  personality: string;
  keywords: string[];
}

export interface ServiceItem {
  name: string;
  description?: string;
  price: number;
  category?: string;
}

export interface AgentServiceInfo {
  id: number;
  agent_id: string;
  services: ServiceItem[];
  price_range: [number, number];
  business_hours: string;
  special_tags: string[];
}

export interface AgentTrustScores {
  id: number;
  agent_id: string;
  quality_score: number;
  activity_score: number;
  warmth_score: number;
  total_score: number;
  updated_at: Date;
}

export interface AgentMCPConfig {
  id: number;
  agent_id: string;
  endpoint: string;
  tools: MCPTool[];
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, any>;
    required?: string[];
  };
}

// 预约/订单相关类型
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired';

export interface Reservation {
  id: number;
  reservation_id: string;
  agent_id: string;
  customer_name: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time?: string;
  party_size?: number;
  notes?: string;
  status: ReservationStatus;
  source: 'douyin' | 'meituan' | 'wechat' | 'mini_program' | 'direct';
  verification_code?: string;
  confirmed_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// 对话日志
export interface ConversationLog {
  id: number;
  user_id?: string;
  agent_id?: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

// API请求/响应类型
export interface RegisterAgentRequest {
  agent_type?: 'merchant' | 'individual';
  name: string;
  category: string;
  address: string;
  lat?: number;
  lng?: number;
  contact: string;
  owner_name?: string;
  story?: string;
  personality?: string;
  keywords?: string[];
  services?: ServiceItem[];
  price_range?: [number, number];
  business_hours?: string;
  special_tags?: string[];
}

export interface RegisterAgentResponse {
  success: boolean;
  agent_id?: string;
  mcp_endpoint?: string;
  qrcode_url?: string;
  message: string;
  error?: string;
}

export interface QueryAgentsRequest {
  category?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  limit?: number;
}

export interface MakeReservationRequest {
  agent_id: string;
  customer_name: string;
  customer_phone: string;
  date: string;
  time?: string;
  party_size?: number;
  notes?: string;
  source?: string;
}

export interface MakeReservationResponse {
  success: boolean;
  reservation_id?: string;
  verification_code?: string;
  message: string;
  error?: string;
}

export interface ConfirmReservationRequest {
  reservation_id: string;
  action: 'confirm' | 'cancel';
  reason?: string;
}

export interface OrderNotification {
  type: 'new_reservation' | 'reservation_confirmed' | 'reservation_cancelled' | 'verification';
  reservation_id: string;
  agent_id: string;
  customer_name: string;
  customer_phone: string;
  date: string;
  time?: string;
  party_size?: number;
  verification_code?: string;
  timestamp: Date;
}
