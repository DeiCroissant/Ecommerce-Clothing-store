'use client'

import Link from 'next/link'
import { ShoppingBag, Gift, Heart, MapPin, ArrowRight } from 'lucide-react'
import { mockOrders, mockVouchers, mockWishlist, mockAddresses } from '@/lib/account/mockUserData'

export function QuickActionsGrid() {
  const actions = [
    {
      id: 'orders',
      title: 'Đơn hàng',
      icon: ShoppingBag,
      value: mockOrders.length,
      label: 'đơn hàng',
      href: '/account/orders',
      color: '#3b82f6',
    },
    {
      id: 'vouchers',
      title: 'Voucher',
      icon: Gift,
      value: mockVouchers.filter(v => v.isActive).length,
      label: 'khả dụng',
      href: '/account/credits',
      color: '#f59e0b',
    },
    {
      id: 'wishlist',
      title: 'Yêu thích',
      icon: Heart,
      value: mockWishlist.length,
      label: 'sản phẩm',
      href: '/account/wishlist',
      color: '#ec4899',
    },
    {
      id: 'address',
      title: 'Địa chỉ',
      icon: MapPin,
      value: mockAddresses.length,
      label: 'địa chỉ',
      href: '/account/addresses',
      color: '#10b981',
    },
  ]

  return (
    <div className="quick-actions-grid">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link
            key={action.id}
            href={action.href}
            className="quick-action-card"
            style={{ '--action-color': action.color }}
          >
            <div className="action-icon-wrapper">
              <Icon size={24} className="action-icon" />
            </div>
            <div className="action-content">
              <h3 className="action-title">{action.title}</h3>
              <div className="action-value">
                <span className="value">{action.value}</span>
                <span className="label">{action.label}</span>
              </div>
            </div>
            <ArrowRight size={20} className="action-arrow" />
          </Link>
        )
      })}
    </div>
  )
}
