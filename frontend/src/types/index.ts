// 消息类型
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  recommendations?: Merchant[]
}

// 商家类型
export interface Merchant {
  id: string
  name: string
  category: string
  tags: string[]
  distance: string
  address: string
  phone: string
  rating: number
  reviewCount: number
  image?: string
  description: string
  trustScore: TrustScore
  recommendReason: string
  hours?: string
  priceRange?: string
}

// 信任分
export interface TrustScore {
  quality: number      // 质量分
  activity: number    // 活跃分
  warmth: number       // 人情分
}

// 预约信息
export interface Booking {
  id: string
  merchantId: string
  merchantName: string
  service: string
  date: string
  time: string
  name: string
  phone: string
  note?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: Date
}

// 快捷问题
export interface QuickQuestion {
  id: string
  text: string
  icon: string
}

// 商家分类
export type MerchantCategory = 
  | 'restaurant' 
  | 'hotel' 
  | 'attraction' 
  | 'transport' 
  | 'shopping'
  | 'entertainment'
  | 'other'

// 组件 Props 类型
export interface MerchantCardProps {
  merchant: Merchant
  onViewDetail?: (merchant: Merchant) => void
  onBook?: (merchant: Merchant) => void
}

export interface MessageBubbleProps {
  message: Message
}

export interface BookingModalProps {
  isOpen: boolean
  merchant: Merchant | null
  onClose: () => void
  onConfirm: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => void
}

export interface MerchantDetailModalProps {
  isOpen: boolean
  merchant: Merchant | null
  onClose: () => void
  onBook?: (merchant: Merchant) => void
}
