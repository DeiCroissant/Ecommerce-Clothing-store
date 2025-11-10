'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/account'
import { UserWelcome } from '@/components/account/overview/UserWelcome'
import { EmailVerificationBanner } from '@/components/account/overview/EmailVerificationBanner'
import { QuickActionsGrid } from '@/components/account/overview/QuickActionsGrid'
import { RecentOrdersWidget } from '@/components/account/overview/RecentOrdersWidget'
import * as orderAPI from '@/lib/api/orders'
import * as returnsAPI from '@/lib/api/returns'
import { formatDate, getStatusInfo } from '@/lib/mockOrdersData'

export default function OverviewPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const router = useRouter()

  const fetchUserData = async () => {
    try {
      // Lấy user từ localStorage
      const userFromStorage = localStorage.getItem('user')
      if (!userFromStorage) {
        router.push('/')
        return
      }

      const userData = JSON.parse(userFromStorage)
      
      // Fetch chi tiết user từ API
      const response = await fetch(`http://localhost:8000/api/user/${userData.id}`)
      
      if (!response.ok) {
        throw new Error('Không thể tải thông tin người dùng')
      }

      const userDetails = await response.json()
      setUser(userDetails)
      
      // Update localStorage with full user data
      localStorage.setItem('user', JSON.stringify(userDetails))
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentOrders = async (userId) => {
    try {
      const [ordersResponse, returnsResponse] = await Promise.all([
        orderAPI.getUserOrders(userId),
        returnsAPI.getUserReturns(userId).catch(() => ({ returns: [] })) // Ignore errors for returns
      ])
      
      const orders = ordersResponse.orders || []
      const returnsData = returnsResponse.returns || []
      
      // Create a map of order_id to return status
      const orderReturnsMap = {}
      returnsData.forEach(ret => {
        const orderId = ret.order_id
        if (ret.status === 'completed') {
          orderReturnsMap[orderId] = true
        }
      })
      
      // Transform orders to match component expectations
      const transformedOrders = orders
        .map(order => {
          const orderId = order.id || order._id
          const hasRefundCompleted = orderReturnsMap[orderId] || false
          
          return {
            id: orderId,
            orderNumber: order.order_number || order.orderNumber || order.id,
            status: order.status || 'pending',
            total: order.total_amount || order.total || 0,
            date: order.created_at || order.date,
            createdAt: order.created_at,
            hasRefundCompleted,
          }
        })
        .sort((a, b) => {
          // Sort by date descending (newest first)
          const dateA = new Date(a.date || a.createdAt)
          const dateB = new Date(b.date || b.createdAt)
          return dateB - dateA
        })
        .slice(0, 3) // Get 3 most recent
      
      setRecentOrders(transformedOrders)
    } catch (error) {
      console.error('Error fetching recent orders:', error)
      setRecentOrders([])
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchUserData()
      
      // Fetch recent orders after user data is loaded
      const userFromStorage = localStorage.getItem('user')
      if (userFromStorage) {
        try {
          const userData = JSON.parse(userFromStorage)
          const userId = userData.id || userData._id
          if (userId) {
            await fetchRecentOrders(userId)
          }
        } catch (error) {
          console.error('Error loading user data:', error)
        }
      }
    }
    
    loadData()
    
    // Listen for user updates
    const handleUserUpdate = () => {
      loadData()
    }
    
    // Listen for order and return updates
    const handleOrdersChanged = () => {
      const userFromStorage = localStorage.getItem('user')
      if (userFromStorage) {
        try {
          const userData = JSON.parse(userFromStorage)
          const userId = userData.id || userData._id
          if (userId) {
            fetchRecentOrders(userId)
          }
        } catch (error) {
          console.error('Error loading user data:', error)
        }
      }
    }
    
    const handleReturnsChanged = () => {
      const userFromStorage = localStorage.getItem('user')
      if (userFromStorage) {
        try {
          const userData = JSON.parse(userFromStorage)
          const userId = userData.id || userData._id
          if (userId) {
            fetchRecentOrders(userId)
          }
        } catch (error) {
          console.error('Error loading user data:', error)
        }
      }
    }
    
    window.addEventListener('userUpdated', handleUserUpdate)
    window.addEventListener('ordersChanged', handleOrdersChanged)
    window.addEventListener('returnsChanged', handleReturnsChanged)
    
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate)
      window.removeEventListener('ordersChanged', handleOrdersChanged)
      window.removeEventListener('returnsChanged', handleReturnsChanged)
    }
  }, [router])

  if (loading) {
    return (
      <div className="overview-page">
        <PageHeader
          title="Đang tải..."
          description="Vui lòng chờ trong giây lát"
        />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="overview-page">
        <PageHeader
          title="Lỗi"
          description="Không thể tải thông tin tài khoản"
        />
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="overview-page">
        <PageHeader
          title="Không tìm thấy tài khoản"
          description="Vui lòng đăng nhập lại"
        />
        <div className="text-center py-12">
          <button 
            onClick={() => router.push('/')} 
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="overview-page">
      <PageHeader
        title={`Xin chào, ${user.name}!`}
        description="Chào mừng trở lại tài khoản của bạn"
      />

      <div className="space-y-6">
        {/* Welcome Card */}
        <UserWelcome user={user} />

        {/* Email Verification Banner */}
        {!user.emailVerified && <EmailVerificationBanner />}

        {/* Quick Actions Grid */}
        <QuickActionsGrid />

        {/* Recent Orders */}
        <RecentOrdersWidget orders={recentOrders} />
      </div>
    </div>
  )
}
