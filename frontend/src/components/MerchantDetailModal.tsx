import React from 'react'
import type { Merchant } from '../types'
import { X, MapPin, Star, Phone, Clock, Shield, Zap, Heart } from 'lucide-react'

interface MerchantDetailModalProps {
  isOpen: boolean
  merchant: Merchant | null
  onClose: () => void
  onBook?: (merchant: Merchant) => void
}

const TrustScoreBar: React.FC<{ label: string; score: number; icon: React.ReactNode; color: string }> = ({ 
  label, score, icon, color 
}) => (
  <div className="flex items-center gap-3">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-sm font-semibold text-gray-800">{score}分</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${color.replace('bg-', 'bg-').replace('-100', '-500')}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  </div>
)

const MerchantDetailModal: React.FC<MerchantDetailModalProps> = ({ isOpen, merchant, onClose, onBook }) => {
  if (!isOpen || !merchant) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* 模态框内容 */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* 关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* 头部 */}
        <div className="bg-gradient-to-br from-brand-blue to-brand-light p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="tag bg-white/20 text-white">{merchant.category}</span>
            <span className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              {merchant.rating}
            </span>
          </div>
          <h2 className="text-xl font-bold mb-1">{merchant.name}</h2>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <MapPin className="w-4 h-4" />
            <span>{merchant.distance}</span>
          </div>
        </div>
        
        {/* 内容 */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* 标签 */}
          <div className="flex flex-wrap gap-2">
            {merchant.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
          
          {/* 信任分 */}
          <div className="card p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">🏆 商家信任分</h4>
            <div className="space-y-3">
              <TrustScoreBar 
                label="质量分" 
                score={merchant.trustScore.quality} 
                icon={<Shield className="w-4 h-4 text-blue-600" />}
                color="bg-blue-100"
              />
              <TrustScoreBar 
                label="活跃分" 
                score={merchant.trustScore.activity} 
                icon={<Zap className="w-4 h-4 text-yellow-600" />}
                color="bg-yellow-100"
              />
              <TrustScoreBar 
                label="人情分" 
                score={merchant.trustScore.warmth} 
                icon={<Heart className="w-4 h-4 text-red-500" />}
                color="bg-red-100"
              />
            </div>
          </div>
          
          {/* 商家介绍 */}
          <div className="card p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">📖 商家介绍</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{merchant.description}</p>
          </div>
          
          {/* 商家信息 */}
          <div className="card p-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-700">📍 基本信息</h4>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-800">{merchant.address}</p>
              </div>
            </div>
            
            {merchant.hours && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{merchant.hours}</span>
              </div>
            )}
            
            {merchant.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href={`tel:${merchant.phone}`} className="text-sm text-brand-blue">
                  {merchant.phone}
                </a>
              </div>
            )}
            
            {merchant.priceRange && (
              <div className="flex items-center gap-3 pt-2 border-t">
                <span className="text-sm font-medium text-orange-500">{merchant.priceRange}</span>
              </div>
            )}
          </div>
          
          {/* 推荐理由 */}
          <div className="bg-yellow-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 为什么推荐</h4>
            <p className="text-sm text-yellow-700">{merchant.recommendReason}</p>
          </div>
        </div>
        
        {/* 底部操作 */}
        <div className="p-4 border-t bg-gray-50 safe-bottom">
          <div className="flex gap-3">
            <a 
              href={`tel:${merchant.phone}`}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              拨打电话
            </a>
            <button 
              onClick={() => onBook?.(merchant)}
              className="flex-1 btn-primary"
            >
              立即预约
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MerchantDetailModal
