import { PageHeader, AccountCard } from '@/components/account'

export const metadata = {
  title: 'Ví & Voucher',
}

export default function CreditsPage() {
  return (
    <div className="credits-page">
      <PageHeader
        title="Ví & Voucher"
        description="Quản lý store credit, gift card và voucher"
      />

      <AccountCard title="Số dư ví">
        <p className="text-gray-600">
          Credits & vouchers coming in Phase 7...
        </p>
      </AccountCard>
    </div>
  )
}
