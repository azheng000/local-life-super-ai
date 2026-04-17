import React from 'react'
import type { Message } from '../types'
import { format } from 'date-fns'
import MerchantCard from './MerchantCard'

interface MessageBubbleProps {
  message: Message
  onViewDetail?: (merchant: any) => void
  onBook?: (merchant: any) => void
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onViewDetail, onBook }) => {
  const isUser = message.role === 'user'
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`${isUser ? 'message-bubble-user' : 'message-bubble-ai'}`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className={`text-[10px] text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {format(new Date(message.timestamp), 'HH:mm')}
        </p>
        
        {/* 推荐商家卡片 */}
        {message.recommendations && message.recommendations.length > 0 && (
          <div className="mt-3 space-y-3">
            {message.recommendations.map((merchant) => (
              <MerchantCard
                key={merchant.id}
                merchant={merchant}
                onViewDetail={onViewDetail}
                onBook={onBook}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageBubble
