'use client'

import { CheckCircle2, Clock, Package, Truck, XCircle, RotateCcw, CreditCard } from 'lucide-react'
import { formatDate } from '@/lib/mockOrdersData'

export function OrderTimeline({ order }) {
  const status = order?.status || 'pending'
  const createdAt = order?.created_at || order?.date
  const updatedAt = order?.updated_at

  // Determine which steps are completed, active, or pending
  const getStepStatus = (stepStatus) => {
    // Map completed to delivered for timeline display
    const displayStatus = status === 'completed' ? 'delivered' : status
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered', 'completed']
    const currentIndex = statusOrder.indexOf(displayStatus)
    const stepIndex = statusOrder.indexOf(stepStatus)
    
    if (status === 'cancelled' || status === 'returned') {
      if (stepStatus === 'placed') return { completed: true, active: false, current: false }
      if (status === 'cancelled' && stepStatus === 'cancelled') return { completed: true, active: true, current: true }
      if (status === 'returned' && stepStatus === 'returned') return { completed: true, active: true, current: true }
      return { completed: false, active: false, current: false }
    }
    
    // For completed orders, mark delivered step as completed and current
    if (status === 'completed' && stepStatus === 'delivered') {
      return { completed: true, active: true, current: true }
    }
    
    if (stepIndex <= currentIndex) {
      return {
        completed: stepIndex < currentIndex,
        active: true,
        current: stepIndex === currentIndex
      }
    }
    return { completed: false, active: false, current: false }
  }

  const timelineSteps = [
    {
      status: 'placed',
      label: 'Đặt hàng',
      icon: CheckCircle2,
      description: 'Đơn hàng đã được đặt thành công',
      timestamp: createdAt,
      color: '#10b981'
    },
    {
      status: 'confirmed',
      label: 'Xác nhận thanh toán',
      icon: CreditCard,
      description: 'Thanh toán đã được xác nhận',
      timestamp: status !== 'pending' ? createdAt : null,
      color: '#3b82f6'
    },
    {
      status: 'processing',
      label: 'Đang xử lý',
      icon: Package,
      description: 'Đang chuẩn bị hàng',
      timestamp: ['processing', 'shipped', 'delivered', 'completed'].includes(status) ? (updatedAt || createdAt) : null,
      color: '#f59e0b'
    },
    {
      status: 'shipped',
      label: 'Đang giao',
      icon: Truck,
      description: 'Đơn hàng đang trên đường giao đến bạn',
      timestamp: ['shipped', 'delivered', 'completed'].includes(status) ? (updatedAt || createdAt) : null,
      color: '#6366f1'
    },
    {
      status: 'delivered',
      label: 'Đã giao hàng',
      icon: CheckCircle2,
      description: 'Đã giao hàng thành công',
      timestamp: ['delivered', 'completed'].includes(status) ? (updatedAt || createdAt) : null,
      color: '#10b981'
    }
  ]

  // Add cancelled or returned step if applicable
  if (status === 'cancelled') {
    timelineSteps.push({
      status: 'cancelled',
      label: 'Đã hủy',
      icon: XCircle,
      description: 'Đơn hàng đã bị hủy',
      timestamp: updatedAt || createdAt,
      color: '#ef4444'
    })
  }

  if (status === 'returned') {
    timelineSteps.push({
      status: 'returned',
      label: 'Đã trả hàng',
      icon: RotateCcw,
      description: 'Đơn hàng đã được hoàn trả',
      timestamp: updatedAt || createdAt,
      color: '#ec4899'
    })
  }

  return (
    <div className="order-timeline-container">
      <h2 className="timeline-title">Tiến trình đơn hàng</h2>
      <div className="timeline">
        {timelineSteps.map((step, index) => {
          const Icon = step.icon
          const isLast = index === timelineSteps.length - 1
          const stepStatus = getStepStatus(step.status)
          
          return (
            <div
              key={step.status}
              className={`timeline-item ${stepStatus.completed ? 'completed' : ''} ${stepStatus.active ? 'active' : ''} ${stepStatus.current ? 'current' : ''}`}
            >
              <div className="timeline-marker">
                <div 
                  className={`timeline-icon timeline-${step.status}`}
                  style={{
                    backgroundColor: stepStatus.completed || stepStatus.current ? `${step.color}15` : 'transparent',
                    borderColor: stepStatus.completed || stepStatus.current ? step.color : '#e4e4e7',
                    color: stepStatus.completed || stepStatus.current ? step.color : '#a1a1aa'
                  }}
                >
                  {stepStatus.completed ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <Icon size={20} />
                  )}
                </div>
                {!isLast && (
                  <div 
                    className="timeline-line"
                    style={{
                      backgroundColor: stepStatus.completed ? step.color : '#e4e4e7'
                    }}
                  />
                )}
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <h3 
                    className="timeline-label"
                    style={{
                      color: stepStatus.completed || stepStatus.current ? '#18181b' : '#71717a',
                      fontWeight: stepStatus.current ? 700 : 600
                    }}
                  >
                    {step.label}
                    {stepStatus.current && (
                      <span className="timeline-badge-current">
                        {status === 'completed' && step.status === 'delivered' ? 'Hoàn thành' : 'Đang xử lý'}
                      </span>
                    )}
                  </h3>
                  {step.timestamp && (stepStatus.completed || stepStatus.current) && (
                    <span className="timeline-time">
                      {formatDate(step.timestamp)}
                    </span>
                  )}
                </div>
                <p 
                  className="timeline-description"
                  style={{
                    color: stepStatus.completed || stepStatus.current ? '#52525b' : '#a1a1aa'
                  }}
                >
                  {status === 'completed' && step.status === 'delivered' 
                    ? 'Đơn hàng đã hoàn thành' 
                    : step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

