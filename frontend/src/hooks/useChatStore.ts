import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Message, Merchant, Booking } from '../types'
import { mockMerchants, generateAIResponse } from '../utils/mockData'
import { getNearbyAgents, transformAgentToMerchant } from '../services/agentService'
import { createReservation } from '../services/reservationService'
import { checkHealth } from '../services/baseApi'

interface ChatState {
  messages: Message[]
  isLoading: boolean
  isApiAvailable: boolean
  bookings: Booking[]
  error: string | null
  addMessage: (role: 'user' | 'assistant', content: string, recommendations?: Merchant[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addBooking: (booking: Booking) => void
  clearMessages: () => void
  checkApiStatus: () => Promise<boolean>
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      isApiAvailable: false,
      bookings: [],
      error: null,
      
      addMessage: (role, content, recommendations) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          role,
          content,
          timestamp: new Date(),
          recommendations,
        }
        set((state) => ({
          messages: [...state.messages, newMessage],
        }))
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      addBooking: (booking) => set((state) => ({
        bookings: [...state.bookings, booking],
      })),
      
      clearMessages: () => set({ messages: [] }),
      
      // 检查API可用性
      checkApiStatus: async () => {
        const isAvailable = await checkHealth()
        set({ isApiAvailable: isAvailable })
        return isAvailable
      },
    }),
    {
      name: 'lingshui-chat-storage',
      partialize: (state) => ({ 
        messages: state.messages.slice(-50),
        bookings: state.bookings.slice(-20),
        isApiAvailable: state.isApiAvailable,
      }),
    }
  )
)

// 扩展AI响应Hook，支持真实API调用
export const useAIResponse = () => {
  const { addMessage, setLoading, setError, checkApiStatus, isApiAvailable } = useChatStore()
  
  // 获取商家推荐（优先真实API，降级到mock）
  const fetchRecommendations = async (category?: string): Promise<Merchant[]> => {
    // 先检查API状态
    const apiOk = isApiAvailable || await checkApiStatus()
    
    if (apiOk) {
      try {
        const response = await getNearbyAgents({ 
          category: category || '美食',
          limit: 6 
        })
        
        if (response.success && response.data?.agents) {
          return response.data.agents.map(transformAgentToMerchant)
        }
      } catch (error) {
        console.warn('API获取失败，使用mock数据:', error)
        setError('无法连接服务器，使用本地数据')
      }
    }
    
    // 降级到mock数据
    if (category) {
      return mockMerchants.filter(m => 
        m.category.includes(category) || 
        m.tags.some(t => t.includes(category))
      ).slice(0, 6)
    }
    return mockMerchants.slice(0, 6)
  }
  
  const sendMessage = async (userMessage: string, category?: string) => {
    setLoading(true)
    setError(null)
    
    // 添加用户消息
    addMessage('user', userMessage)
    
    try {
      // 模拟AI思考延迟
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))
      
      // 获取推荐商家
      const recommendations = await fetchRecommendations(category)
      
      // 生成AI响应（仍然使用本地逻辑，保留MCP调用能力）
      const response = generateAIResponse(userMessage, recommendations)
      
      // 添加AI消息
      addMessage('assistant', response.text, response.recommendations || recommendations)
      
    } catch (error: any) {
      console.error('AI响应失败:', error)
      setError(error.message || '生成响应失败')
      
      // 使用mock数据作为最终降级
      const response = generateAIResponse(userMessage, mockMerchants)
      addMessage('assistant', response.text, response.recommendations)
    } finally {
      setLoading(false)
    }
  }
  
  // 创建预约
  const submitBooking = async (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    const apiOk = isApiAvailable || await checkApiStatus()
    
    if (apiOk) {
      try {
        const response = await createReservation({
          agent_id: booking.merchantId,
          customer_name: booking.name,
          customer_phone: booking.phone,
          date: booking.date,
          time: booking.time,
          party_size: parseInt(booking.service) || 1,
          notes: booking.note,
          source: 'wechat',
        })
        
        if (response.success) {
          const newBooking: Booking = {
            ...booking,
            id: response.data?.reservation_id || `local_${Date.now()}`,
            status: 'pending',
            createdAt: new Date(),
          }
          
          const { addBooking } = useChatStore.getState()
          addBooking(newBooking)
          
          return { success: true, booking: newBooking }
        }
      } catch (error) {
        console.warn('预约API失败，使用本地存储:', error)
      }
    }
    
    // 降级：本地存储预约
    const newBooking: Booking = {
      ...booking,
      id: `local_${Date.now()}`,
      status: 'pending',
      createdAt: new Date(),
    }
    
    addBooking(newBooking)
    return { success: true, booking: newBooking, isLocal: true }
  }
  
  return { sendMessage, submitBooking }
}
