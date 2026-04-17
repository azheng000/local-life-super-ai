import React, { useState } from 'react'
import { Send, Smile } from 'lucide-react'
import { quickQuestions } from '../utils/mockData'

interface InputAreaProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('')
  
  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim())
      setInputValue('')
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  const handleQuickQuestion = (question: string) => {
    if (!isLoading) {
      onSendMessage(question)
    }
  }
  
  return (
    <div className="bg-white border-t border-gray-100 safe-bottom">
      {/* 快捷问题 */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto hide-scrollbar">
        {quickQuestions.map((q) => (
          <button
            key={q.id}
            onClick={() => handleQuickQuestion(q.text)}
            disabled={isLoading}
            className="quick-btn whitespace-nowrap flex items-center gap-1 disabled:opacity-50"
          >
            <span>{q.icon}</span>
            <span>{q.text}</span>
          </button>
        ))}
      </div>
      
      {/* 输入框 */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-end gap-2 bg-gray-100 rounded-2xl px-4 py-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="输入您的问题..."
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent resize-none text-sm focus:outline-none disabled:opacity-50 max-h-24"
            style={{ minHeight: '24px' }}
          />
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="p-2 bg-gradient-to-r from-brand-blue to-brand-light text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-90"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          陵水本地生活助手 · AI驱动
        </p>
      </div>
    </div>
  )
}

export default InputArea
