import React, { useState, useRef, useEffect } from 'react'
import { Header, MessageBubble, TypingIndicator, InputArea, BookingModal, MerchantDetailModal, WelcomeScreen } from './components'
import { useChatStore, useAIResponse } from './hooks/useChatStore'
import type { Merchant, Booking } from './types'

const App: React.FC = () => {
  const { messages, isLoading, addBooking } = useChatStore()
  const { sendMessage } = useAIResponse()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Modal状态
  const [bookingModalMerchant, setBookingModalMerchant] = useState<Merchant | null>(null)
  const [detailModalMerchant, setDetailModalMerchant] = useState<Merchant | null>(null)
  
  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])
  
  // 处理发送消息
  const handleSendMessage = async (message: string) => {
    await sendMessage(message)
  }
  
  // 处理快捷问题
  const handleQuickAction = (question: string) => {
    handleSendMessage(question)
  }
  
  // 处理预约
  const handleBook = (merchant: Merchant) => {
    setBookingModalMerchant(merchant)
  }
  
  // 处理查看详情
  const handleViewDetail = (merchant: Merchant) => {
    setDetailModalMerchant(merchant)
  }
  
  // 确认预约
  const handleConfirmBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date(),
    }
    addBooking(newBooking)
    setBookingModalMerchant(null)
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 头部 */}
      <Header />
      
      {/* 消息区域 */}
      <main className="flex-1 overflow-y-auto px-4 py-4 hide-scrollbar">
        <div className="max-w-lg mx-auto space-y-4">
          {messages.length === 0 ? (
            <WelcomeScreen onQuickAction={handleQuickAction} />
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onViewDetail={handleViewDetail}
                  onBook={handleBook}
                />
              ))}
              {isLoading && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>
      
      {/* 输入区域 */}
      <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
      
      {/* 预约Modal */}
      <BookingModal
        isOpen={!!bookingModalMerchant}
        merchant={bookingModalMerchant}
        onClose={() => setBookingModalMerchant(null)}
        onConfirm={handleConfirmBooking}
      />
      
      {/* 详情Modal */}
      <MerchantDetailModal
        isOpen={!!detailModalMerchant}
        merchant={detailModalMerchant}
        onClose={() => setDetailModalMerchant(null)}
        onBook={handleBook}
      />
    </div>
  )
}

export default App
