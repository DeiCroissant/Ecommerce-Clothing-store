import { AccountSidebar } from '@/components/account/layout/AccountSidebar'
import { MobileAccountNav } from '@/components/account/layout/MobileAccountNav'
import { SkipToContent } from '@/components/account/layout/SkipToContent'
import { AccountBreadcrumbs } from '@/components/account/layout/AccountBreadcrumbs'
import '@/styles/account.css'

export const metadata = {
  title: {
    template: '%s | Tài khoản | VyronFashion',
    default: 'Tài khoản của tôi',
  },
  description: 'Quản lý tài khoản, đơn hàng và thông tin cá nhân của bạn',
}

export default function AccountLayout({ children }) {
  return (
    <>
      <SkipToContent />

      {/* Mobile Navigation - visible < 1024px */}
      <MobileAccountNav />

      <div className="account-container">
        {/* Desktop Sidebar - visible ≥ 1024px */}
        <AccountSidebar />

        {/* Main Content */}
        <main
          id="account-main"
          className="account-main"
          tabIndex={-1}
        >
          <AccountBreadcrumbs />
          {children}
        </main>
      </div>
    </>
  )
}
