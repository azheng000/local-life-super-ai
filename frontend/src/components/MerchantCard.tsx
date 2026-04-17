import React from 'react'
import type { Merchant } from '../types'
import { MapPin, Star, Phone, Clock, ChevronRight, Shield, Zap, Heart } from 'lucide-react'

interface MerchantCardProps {
  merchant: Merchant
  onViewDetail?: (merchant: Merchant) => void
  onBook?: (merchant: Merchant) => void
}

const TrustBadge: React.FC<{ label: string; score: number; icon: React.ReactNode }> = ({ label, score, icon }) => (
  <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full">
    <span className="text-gray-400">{icon}</span>
    <span className="text-xs text-gray-500">{label}</span>
    <span className={`text-xs font-semibold ${score >= 90 ? 'text-green-600' : score >= 80 ? 'text-blue-600' : 'text-gray-600'}`}>
      {score}
    </span>
  </div>
)

const MerchantCard: React.FC<MerchantCardProps> = ({ merchant, onViewDetail, onBook }) => {
  return (
    <div className="card p-4 animate-slide-up hover:shadow-md transition-shadow">
      {/* 头部信息 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-800">{merchant.name}</h3>
            <span className="tag">{merchant.category}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="font-medium text-gray-700">{merchant.rating}</span>
              <span>({merchant.reviewCount})</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {merchant.distance}
            </span>
          </div>
        </div>
      </div>
      
      {/* 标签 */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {merchant.tags.map((tag, index) => (
          <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
            {tag}
          </span>
        ))}
      </div>
      
      {/* 信任分 */}
      <div className="flex flex-wrap gap-2 mb-3">
        <TrustBadge label="质量" score={merchant.trustScore.quality} icon={<Shield className="w-3 h-3" />} />
        <TrustBadge label="活跃" score={merchant.trustScore.activity} icon={<Zap className="w-3 h-3" />} />
        <TrustBadge label="人情" score={merchant.trustScore.warmth} icon={<Heart className="w-3 h-3" />} />
      </div>
      
      {/* 推荐理由 */}
      <p className="text-xs text-gray-600 bg-yellow-50 p-2 rounded-lg mb-3">
        💡 {merchant.recommendReason}
      </p>
      
      {/* 信息 */}
      <div className="space-y-1 mb-3 text-xs text-gray-500">
        {merchant.address && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{merchant.address}</span>
          </div>
        )}
        {merchant.hours && (
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>{merchant.hours}</span>
          </div>
        )}
        {merchant.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3" />
            <span>{merchant.phone}</span>
          </div>
        )}
        {merchant.priceRange && (
          <div className="text-orange-500 font-medium">
            {merchant.priceRange}
          </div>
        )}
      </div>
      
      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetail?.(merchant)}
          className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"
        >
          查看详情
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onBook?.(merchant)}
          className="flex-1 btn-primary text-sm"
        >
          立即预约
        </button>
      </div>
    </div>
  )
}

export default MerchantCard
