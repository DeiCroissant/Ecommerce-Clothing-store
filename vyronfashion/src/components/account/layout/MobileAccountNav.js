'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { mobileNavItems, isNavItemActive } from '@/lib/account/navigation'

export function MobileAccountNav() {
  const pathname = usePathname()

  return (
    <nav className="mobile-account-nav" role="navigation" aria-label="Điều hướng tài khoản">
      <div className="nav-header">
        <h1 className="nav-title">Tài khoản</h1>
      </div>

      <div className="nav-tabs" role="tablist">
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          const isActive = isNavItemActive(item.href, pathname)

          return (
            <Link
              key={item.href}
              href={item.href}
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              className={`nav-tab ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-tab-icon" size={20} />
              <span className="nav-tab-label">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
