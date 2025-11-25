'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/config';
import { PageHeader, AccountCard, LoadingSkeleton } from '@/components/account'
import { ProfileForm } from '@/components/account/profile/ProfileForm'
import { AvatarUpload } from '@/components/account/profile/AvatarUpload'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
        const response = await fetch(`${API_BASE_URL}/api/user/${userData.id}`)
        
        if (!response.ok) throw new Error('Không thể tải thông tin người dùng')

        const userDetails = await response.json()
        setUser(userDetails)
      } catch (err) {
        console.error('Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleUpdate = async (updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Cập nhật thất bại')
      }

      const updated = await response.json()
      setUser(updated)
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updated))
      
      // Dispatch event to refresh overview page
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('userUpdated'))
      }
    } catch (err) {
      console.error('Error updating:', err)
      throw err
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <PageHeader title="Thông tin cá nhân" />
        <LoadingSkeleton type="card" count={2} />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="profile-page">
        <PageHeader title="Lỗi" description={error || "Không tìm thấy thông tin"} />
      </div>
    )
  }

  return (
    <div className="profile-page">
      <PageHeader
        title="Thông tin cá nhân"
        description="Quản lý thông tin và tùy chỉnh hồ sơ của bạn"
      />

      <div className="profile-grid">
        <AccountCard title="Ảnh đại diện" description="Cập nhật ảnh đại diện của bạn">
          <AvatarUpload user={user} onUpdate={handleUpdate} />
        </AccountCard>

        <AccountCard title="Thông tin chi tiết" description="Cập nhật thông tin cá nhân">
          <ProfileForm user={user} onUpdate={handleUpdate} />
        </AccountCard>
      </div>

      <style jsx>{`
        .profile-page {
          max-width: 1200px;
        }

        .profile-grid {
          display: grid;
          gap: 2rem;
        }

        @media (min-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr 2fr;
          }
        }
      `}</style>
    </div>
  )
}
