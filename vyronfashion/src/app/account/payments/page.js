import { PageHeader, AccountCard } from '@/components/account'

export const metadata = {
  title: 'Phương thức thanh toán',
}

export default function PaymentsPage() {
  return (
    <div className="payments-page">
      <PageHeader
        title="Phương thức thanh toán"
        description="Quản lý thẻ và tài khoản thanh toán"
      />

      <AccountCard title="Danh sách phương thức">
        <p className="text-gray-600">
          Payment methods coming in Phase 5...
        </p>
      </AccountCard>
    </div>
  )
}
