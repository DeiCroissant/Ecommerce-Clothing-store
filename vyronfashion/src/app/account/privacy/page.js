import { PageHeader, AccountCard } from '@/components/account'

export const metadata = {
  title: 'Quyền riêng tư',
}

export default function PrivacyPage() {
  return (
    <div className="privacy-page">
      <PageHeader
        title="Quyền riêng tư"
        description="Tải dữ liệu cá nhân và xóa tài khoản"
      />

      <AccountCard title="Dữ liệu cá nhân">
        <p className="text-gray-600">
          Privacy & data management coming in Phase 8...
        </p>
      </AccountCard>
    </div>
  )
}
