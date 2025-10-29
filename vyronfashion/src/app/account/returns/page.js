import { PageHeader, AccountCard } from '@/components/account'

export const metadata = {
  title: 'Đổi trả hàng',
}

export default function ReturnsPage() {
  return (
    <div className="returns-page">
      <PageHeader
        title="Đổi trả hàng"
        description="Yêu cầu đổi hoặc trả sản phẩm"
      />

      <AccountCard title="Yêu cầu đổi trả">
        <p className="text-gray-600">
          Returns wizard coming in Phase 4...
        </p>
      </AccountCard>
    </div>
  )
}
