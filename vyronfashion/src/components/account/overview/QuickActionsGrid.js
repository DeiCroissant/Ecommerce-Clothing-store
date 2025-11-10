'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Gift, Heart, MapPin, ArrowRight } from 'lucide-react'
import * as orderAPI from '@/lib/api/orders'
import * as wishlistAPI from '@/lib/api/wishlist'
import * as addressAPI from '@/lib/api/addresses'

function getCurrentUserId() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.id || user._id || null;
  } catch {
    return null;
  }
}

export function QuickActionsGrid() {
  const [ordersCount, setOrdersCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [addressesCount, setAddressesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const userId = getCurrentUserId()
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        // Fetch orders count
        try {
          const ordersResponse = await orderAPI.getUserOrders(userId)
          setOrdersCount(ordersResponse.orders?.length || 0)
        } catch (error) {
          console.error('Error fetching orders:', error)
        }

        // Fetch wishlist count
        try {
          const wishlistResponse = await wishlistAPI.getWishlistProducts(userId)
          setWishlistCount(wishlistResponse.products?.length || wishlistResponse.total || 0)
        } catch (error) {
          console.error('Error fetching wishlist:', error)
        }

        // Fetch addresses count
        try {
          const addressesResponse = await addressAPI.getUserAddresses(userId)
          setAddressesCount(addressesResponse.addresses?.length || 0)
        } catch (error) {
          console.error('Error fetching addresses:', error)
        }
      } catch (error) {
        console.error('Error fetching overview data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Listen for updates
    const handleDataUpdate = () => {
      fetchData()
    }
    
    window.addEventListener('ordersChanged', handleDataUpdate)
    window.addEventListener('wishlistChanged', handleDataUpdate)
    window.addEventListener('addressesChanged', handleDataUpdate)
    
    return () => {
      window.removeEventListener('ordersChanged', handleDataUpdate)
      window.removeEventListener('wishlistChanged', handleDataUpdate)
      window.removeEventListener('addressesChanged', handleDataUpdate)
    }
  }, [])

  const actions = [
    {
      id: 'orders',
      title: 'Đơn hàng',
      icon: ShoppingBag,
      value: loading ? '...' : ordersCount,
      label: 'đơn hàng',
      href: '/account/orders',
      color: '#3b82f6',
    },
    {
      id: 'vouchers',
      title: 'Voucher',
      icon: Gift,
      value: 0, // Vouchers chưa có API, để 0 hoặc có thể implement sau
      label: 'khả dụng',
      href: '/account/credits',
      color: '#f59e0b',
    },
    {
      id: 'wishlist',
      title: 'Yêu thích',
      icon: Heart,
      value: loading ? '...' : wishlistCount,
      label: 'sản phẩm',
      href: '/account/wishlist',
      color: '#ec4899',
    },
    {
      id: 'address',
      title: 'Địa chỉ',
      icon: MapPin,
      value: loading ? '...' : addressesCount,
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
