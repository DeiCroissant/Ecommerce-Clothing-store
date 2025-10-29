import { PageHeader, AccountCard } from '@/components/account'

export const metadata = {
  title: 'Size của tôi',
}

export default function FitProfilePage() {
  return (
    <div className="fit-profile-page">
      <PageHeader
        title="Size của tôi"
        description="Thông tin số đo để gợi ý size phù hợp"
      />

      <AccountCard title="Số đo cơ thể">
        <p className="text-gray-600">
          Fit profile coming in Phase 7...
        </p>
      </AccountCard>
    </div>
  )
}
