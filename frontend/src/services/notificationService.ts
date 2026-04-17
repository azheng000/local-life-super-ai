// 通知相关API服务
import { post, ApiResponse } from './baseApi'
import { API_ENDPOINTS } from '../config/api'

// 通知类型
export type NotificationType = 
  | 'new_reservation'
  | 'reservation_confirmed'
  | 'reservation_cancelled'
  | 'reminder'
  | 'promotion'

// 通知请求数据
export interface NotificationRequest {
  type: NotificationType
  agent_id?: string
  reservation_id?: string
  customer_name?: string
  customer_phone?: string
  title?: string
  content?: string
  channel?: 'wechat' | 'sms' | 'app'
}

// 发送通知
export async function sendNotification(data: NotificationRequest): Promise<ApiResponse<{ sent: boolean }>> {
  return post<{ sent: boolean }>(API_ENDPOINTS.NOTIFICATIONS + '/send', data)
}

// 发送新预约通知（给商家）
export async function notifyNewReservation(data: {
  reservation_id: string
  agent_id: string
  customer_name: string
  customer_phone: string
  date: string
  time?: string
  party_size: number
  verification_code: string
}): Promise<boolean> {
  try {
    const response = await sendNotification({
      type: 'new_reservation',
      ...data,
    })
    return response.success
  } catch (error) {
    console.error('发送通知失败:', error)
    return false
  }
}
