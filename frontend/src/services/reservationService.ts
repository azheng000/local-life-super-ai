// 预约相关API服务
import { get, post, ApiResponse } from './baseApi'
import { API_ENDPOINTS } from '../config/api'
import type { Booking } from '../types'

// 预约数据结构（前端格式）
export interface ReservationRequest {
  agent_id: string
  customer_name: string
  customer_phone: string
  date: string // YYYY-MM-DD
  time?: string // HH:mm
  party_size?: number
  notes?: string
  source?: 'douyin' | 'meituan' | 'wechat' | 'mini_program' | 'direct'
}

// 预约响应数据
export interface ReservationResponse {
  reservation_id: string
  verification_code: string
  message?: string
}

// 预约详情数据
export interface ReservationDetail {
  reservation_id: string
  agent_id: string
  agent_name: string
  customer_name: string
  customer_phone: string
  reservation_date: string
  reservation_time?: string
  party_size: number
  notes?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  verification_code: string
  created_at: string
}

// 创建预约
export async function createReservation(data: ReservationRequest): Promise<ApiResponse<ReservationResponse>> {
  return post<ReservationResponse>(API_ENDPOINTS.RESERVATIONS, data)
}

// 查询预约详情
export async function getReservationDetail(reservationId: string): Promise<ApiResponse<ReservationDetail>> {
  return get<ReservationDetail>(API_ENDPOINTS.RESERVATION_DETAIL(reservationId))
}

// 转换后端预约数据为前端格式
export function transformToBooking(detail: ReservationDetail): Booking {
  return {
    id: detail.reservation_id,
    merchantId: detail.agent_id,
    merchantName: detail.agent_name,
    service: '', // 后端暂无此字段
    date: detail.reservation_date,
    time: detail.reservation_time || '',
    name: detail.customer_name,
    phone: detail.customer_phone,
    note: detail.notes,
    status: detail.status,
    createdAt: new Date(detail.created_at),
  }
}
