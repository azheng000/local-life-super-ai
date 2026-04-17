import React from 'react'
import { Bot } from 'lucide-react'

interface WelcomeScreenProps {
  onQuickAction: (question: string) => void
}

const features = [
  { icon: '🍜', text: '本地美食推荐' },
  { icon: '🏨', text: '优质住宿选择' },
  { icon: '🏝️', text: '热门景点攻略' },
  { icon: '🚗', text: '便捷出行服务' },
]

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onQuickAction }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 animate-fade-in">
      {/* Logo */}
      <div className="w-20 h-20 bg-gradient-to-br from-brand-blue to-brand-light rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
        <span className="text-3xl font-bold text-white">陵</span>
      </div>
      
      {/* 标题 */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">陵水本地生活助手</h2>
      <p className="text-sm text-gray-500 mb-8 text-center">
        AI智能匹配，为您找到最合适的本地服务
      </p>
      
      {/* 功能特点 */}
      <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-sm">
        {features.map((feature, index) => (
          <button
            key={index}
            onClick={() => onQuickAction(feature.text.replace('推荐', '').replace('选择', '').replace('攻略', '').replace('服务', ''))}
            className="card p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow active:scale-95"
          >
            <span className="text-2xl">{feature.icon}</span>
            <span className="text-xs text-gray-600">{feature.text}</span>
          </button>
        ))}
      </div>
      
      {/* AI助手提示 */}
      <div className="flex items-start gap-3 bg-white rounded-2xl p-4 max-w-sm shadow-sm">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">试试这样问我</p>
          <p className="text-sm text-gray-700">
            "陵水有什么好吃的海鲜餐厅？" "分界洲岛一日游怎么安排？"
          </p>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen
