import { PageHeader, AccountCard } from '@/components/account'

export const metadata = {
  title: 'Địa chỉ giao hàng',
}

export default function AddressesPage() {
  return (
    <div className="addresses-page">
      <PageHeader
        title="Địa chỉ giao hàng"
        description="Quản lý địa chỉ nhận hàng của bạn"
      />

      <AccountCard title="Danh sách địa chỉ">
        <p className="text-gray-600">
          Address management coming in Phase 3...
        </p>
      </AccountCard>
    </div>
  )
}
