import { PageHeader, AccountCard } from '@/components/account'

export const metadata = {
  title: 'Thông báo',
}

export default function NotificationsPage() {
  return (
    <div className="notifications-page">
      <PageHeader
        title="Thông báo"
        description="Tùy chỉnh cách bạn nhận thông báo"
      />

      <AccountCard title="Cài đặt thông báo">
        <p className="text-gray-600">
          Notification settings coming in Phase 6...
        </p>
      </AccountCard>
    </div>
  )
}
