import { PageHeader, AccountCard } from '@/components/account'

export const metadata = {
  title: 'Tùy chọn',
}

export default function PreferencesPage() {
  return (
    <div className="preferences-page">
      <PageHeader
        title="Tùy chọn"
        description="Ngôn ngữ, tiền tệ và tùy chỉnh giao diện"
      />

      <AccountCard title="Tùy chọn hiển thị">
        <p className="text-gray-600">
          Preferences coming in Phase 6...
        </p>
      </AccountCard>
    </div>
  )
}
