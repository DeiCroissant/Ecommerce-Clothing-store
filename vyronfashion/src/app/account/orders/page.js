import { PageHeader, AccountCard } from '@/components/account'

export const metadata = {
  title: 'Đơn hàng của tôi',
}

export default function OrdersPage() {
  return (
    <div className="orders-page">
      <PageHeader
        title="Đơn hàng của tôi"
        description="Theo dõi và quản lý đơn hàng của bạn"
      />

      <AccountCard title="Lịch sử đơn hàng">
        <p className="text-gray-600">
          Orders list coming in Phase 3...
        </p>
      </AccountCard>
    </div>
  )
}
