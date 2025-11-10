'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader, AccountCard, LoadingSkeleton } from '@/components/account'
import { TwoFactorAuth } from '@/components/account/security/TwoFactorAuth'
import { ChangePassword } from '@/components/account/security/ChangePassword'

export default function SecurityPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userFromStorage = localStorage.getItem('user')
        if (!userFromStorage) {
          router.push('/')
          return
        }

        const userData = JSON.parse(userFromStorage)
        
        // Lấy thông tin user
        const userResponse = await fetch(`http://localhost:8000/api/user/${userData.id}`)
        if (!userResponse.ok) throw new Error('Không thể tải thông tin người dùng')
        const userDetails = await userResponse.json()
        setUser(userDetails)

        // Lấy trạng thái 2FA
        const twoFactorResponse = await fetch(`http://localhost:8000/api/security/2fa/status/${userData.id}`)
        if (twoFactorResponse.ok) {
          const twoFactorData = await twoFactorResponse.json()
          setTwoFactorEnabled(twoFactorData.two_factor_enabled)
        }
      } catch (err) {
        console.error('Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleTwoFactorToggle = (enabled) => {
    setTwoFactorEnabled(enabled)
  }

  if (loading) {
    return (
      <div className="security-page">
        <PageHeader title="Bảo mật" />
        <LoadingSkeleton type="card" count={2} />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="security-page">
        <PageHeader title="Lỗi" description={error || "Không tìm thấy thông tin"} />
      </div>
    )
  }

  return (
    <div className="security-page">
      <PageHeader
        title="Bảo mật"
        description="Quản lý cài đặt bảo mật và quyền riêng tư của bạn"
      />

      <div className="security-grid">
        <AccountCard 
          title="Xác thực hai yếu tố (2FA)" 
          description="Tăng cường bảo mật tài khoản với xác thực qua email"
        >
          <TwoFactorAuth 
            user={user} 
            enabled={twoFactorEnabled}
            onToggle={handleTwoFactorToggle}
          />
        </AccountCard>

        <AccountCard 
          title="Đổi mật khẩu" 
          description="Cập nhật mật khẩu để bảo vệ tài khoản"
        >
          <ChangePassword user={user} />
        </AccountCard>
      </div>

      <style jsx>{`
        .security-page {
          max-width: 1200px;
        }

        .security-grid {
          display: grid;
          gap: 2rem;
        }

        @media (min-width: 768px) {
          .security-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

