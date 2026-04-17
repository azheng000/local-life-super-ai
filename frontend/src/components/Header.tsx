import React from 'react'
import { Sparkles } from 'lucide-react'

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-brand-blue to-brand-light text-white px-4 py-4 shadow-lg">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <span className="text-xl font-bold">陵</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-1.5">
            陵水本地生活助手
            <Sparkles className="w-4 h-4" />
          </h1>
          <p className="text-xs text-white/80">AI智能匹配，有温度的本地服务</p>
        </div>
      </div>
    </header>
  )
}

export default Header
