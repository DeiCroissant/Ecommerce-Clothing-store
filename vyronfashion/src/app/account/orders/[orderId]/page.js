import { notFound } from 'next/navigation'
import { PageHeader, AccountCard } from '@/components/account'

export const metadata = {
  title: 'Chi tiết đơn hàng',
}

export default function OrderDetailPage({ params }) {
  // Mock check - replace with real data fetching
  const orderId = params.orderId

  return (
    <div className="order-detail-page">
      <PageHeader
        title={`Đơn hàng #${orderId}`}
        description="Chi tiết đơn hàng và thông tin giao hàng"
      />

      <AccountCard title="Thông tin đơn hàng">
        <p className="text-gray-600">
          Order detail coming in Phase 3...
        </p>
      </AccountCard>
    </div>
  )
}
