'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { accountNavigation, isNavItemActive } from '@/lib/account/navigation'

export function AccountSidebar() {
  const pathname = usePathname()

  return (
    <aside className="account-sidebar">
      <nav role="navigation" aria-label="Điều hướng tài khoản">
        <ul className="nav-groups">
          {accountNavigation.map((group) => (
            <li key={group.id} className="nav-group">
              <div className="nav-group-title">{group.title}</div>
              <ul className="nav-items">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = isNavItemActive(item.href, pathname)

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                        title={item.description}
                      >
                        <Icon className="nav-item-icon" size={20} />
                        <span className="nav-item-label">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
