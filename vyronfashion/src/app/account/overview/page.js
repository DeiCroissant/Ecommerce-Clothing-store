import { PageHeader, AccountCard } from '@/components/account'

export const metadata = {
  title: 'Tổng quan',
}

export default function OverviewPage() {
  return (
    <div className="overview-page">
      <PageHeader
        title="Tổng quan"
        description="Chào mừng trở lại! Đây là dashboard tài khoản của bạn."
      />

      <div className="overview-grid">
        <AccountCard title="Quick Stats">
          <p className="text-gray-600">
            Dashboard content coming in Phase 2...
          </p>
        </AccountCard>
      </div>
    </div>
  )
}
