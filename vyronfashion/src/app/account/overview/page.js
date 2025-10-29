import { PageHeader } from '@/components/account'
import { UserWelcome } from '@/components/account/overview/UserWelcome'
import { EmailVerificationBanner } from '@/components/account/overview/EmailVerificationBanner'
import { QuickActionsGrid } from '@/components/account/overview/QuickActionsGrid'
import { RecentOrdersWidget } from '@/components/account/overview/RecentOrdersWidget'
import { mockUser, mockOrders } from '@/lib/account/mockUserData'

export const metadata = {
  title: 'Tổng quan',
}

export default function OverviewPage() {
  const user = mockUser
  const recentOrders = mockOrders.slice(0, 3)

  return (
    <div className="overview-page">
      <PageHeader
        title={`Xin chào, ${user.firstName}!`}
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
