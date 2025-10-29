import { PageHeader, AccountCard } from '@/components/account'

export const metadata = {
  title: 'Thông tin cá nhân',
}

export default function ProfilePage() {
  return (
    <div className="profile-page">
      <PageHeader
        title="Thông tin cá nhân"
        description="Quản lý thông tin và tùy chỉnh hồ sơ của bạn"
      />

      <AccountCard title="Thông tin tài khoản">
        <p className="text-gray-600">
          Profile form coming in Phase 2...
        </p>
      </AccountCard>
    </div>
  )
}
