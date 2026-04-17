import React, { useState } from 'react'
import type { Merchant, Booking } from '../types'
import { X, Calendar, Clock, User, Phone, FileText, Check } from 'lucide-react'

interface BookingModalProps {
  isOpen: boolean
  merchant: Merchant | null
  onClose: () => void
  onConfirm: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => void
}

const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00']

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, merchant, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  if (!isOpen || !merchant) return null
  
  const handleSubmit = () => {
    if (!selectedDate || !selectedTime || !name || !phone) return
    
    onConfirm({
      merchantId: merchant.id,
      merchantName: merchant.name,
      service: merchant.category,
      date: selectedDate,
      time: selectedTime,
      name,
      phone,
      note: note || undefined,
    })
    
    setIsSubmitted(true)
    setTimeout(() => {
      onClose()
      // 重置表单
      setSelectedDate('')
      setSelectedTime('')
      setName('')
      setPhone('')
      setNote('')
      setIsSubmitted(false)
    }, 2000)
  }
  
  // 生成日期选项（未来7天）
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return {
      value: date.toISOString().split('T')[0],
      label: i === 0 ? '今天' : i === 1 ? '明天' : `${date.getMonth() + 1}/${date.getDate()}`,
    }
  })
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* 模态框内容 */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        {isSubmitted ? (
          <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">预约成功！</h3>
            <p className="text-gray-500 text-center">我们已收到您的预约请求</p>
            <p className="text-gray-500 text-center">商家稍后会与您联系确认</p>
          </div>
        ) : (
          <>
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">预约服务</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* 商家信息 */}
            <div className="px-4 py-3 bg-blue-50">
              <p className="font-medium text-brand-blue">{merchant.name}</p>
              <p className="text-xs text-gray-500">{merchant.category} · {merchant.address}</p>
            </div>
            
            {/* 表单 */}
            <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
              {/* 日期选择 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  选择日期
                </label>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  {dateOptions.map((date) => (
                    <button
                      key={date.value}
                      onClick={() => setSelectedDate(date.value)}
                      className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                        selectedDate === date.value
                          ? 'bg-brand-blue text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 时间选择 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4" />
                  选择时间
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedTime === time
                          ? 'bg-brand-blue text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 姓名 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  您的姓名
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入您的姓名"
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                />
              </div>
              
              {/* 手机号 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  手机号码
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入您的手机号"
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                />
              </div>
              
              {/* 备注 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4" />
                  备注（选填）
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="有什么特殊需求可以备注哦～"
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 resize-none"
                />
              </div>
            </div>
            
            {/* 提交按钮 */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={handleSubmit}
                disabled={!selectedDate || !selectedTime || !name || !phone}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认预约
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default BookingModal
