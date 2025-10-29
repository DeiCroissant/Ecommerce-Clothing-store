'use client'

import { useState } from 'react'
import { PageHeader, AccountCard } from '@/components/account'
import { ProfileForm } from '@/components/account/profile/ProfileForm'
import { mockUser } from '@/lib/account/mockUserData'

export default function ProfilePage() {
  const [user, setUser] = useState(mockUser)

  const handleUpdate = (updatedData) => {
    setUser({ ...user, ...updatedData })
  }

  return (
    <div className="profile-page">
      <PageHeader
        title="Thông tin cá nhân"
        description="Quản lý thông tin và tùy chỉnh hồ sơ của bạn"
      />

      <AccountCard>
        <ProfileForm user={user} onUpdate={handleUpdate} />
      </AccountCard>
    </div>
  )
}
