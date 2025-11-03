'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/account'
import { UserWelcome } from '@/components/account/overview/UserWelcome'
import { EmailVerificationBanner } from '@/components/account/overview/EmailVerificationBanner'
import { QuickActionsGrid } from '@/components/account/overview/QuickActionsGrid'
import { RecentOrdersWidget } from '@/components/account/overview/RecentOrdersWidget'
import { mockOrders } from '@/lib/account/mockUserData'

export default function OverviewPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
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
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
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

  const recentOrders = mockOrders.slice(0, 3)

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
