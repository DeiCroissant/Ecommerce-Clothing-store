import { PageHeader, AccountCard } from '@/components/account'

export const metadata = {
  title: 'Bảo mật',
}

export default function SecurityPage() {
  return (
    <div className="security-page">
      <PageHeader
        title="Bảo mật"
        description="Quản lý mật khẩu và cài đặt bảo mật"
      />

      <AccountCard title="Cài đặt bảo mật">
        <p className="text-gray-600">
          Security settings coming in Phase 5...
        </p>
      </AccountCard>
    </div>
  )
}
