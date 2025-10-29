'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { getNavItemByHref } from '@/lib/account/navigation'

export function AccountBreadcrumbs() {
  const pathname = usePathname()
  const currentItem = getNavItemByHref(pathname)

  // Don't show breadcrumbs on overview page
  if (pathname === '/account/overview' || pathname === '/account') {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="account-breadcrumbs">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link href="/" className="breadcrumb-link">
            <Home size={16} />
            <span className="sr-only">Trang chủ</span>
          </Link>
        </li>
        
        <li className="breadcrumb-separator" aria-hidden="true">
          <ChevronRight size={16} />
        </li>
        
        <li className="breadcrumb-item">
          <Link href="/account/overview" className="breadcrumb-link">
            Tài khoản
          </Link>
        </li>

        {currentItem && (
          <>
            <li className="breadcrumb-separator" aria-hidden="true">
              <ChevronRight size={16} />
            </li>
            <li className="breadcrumb-item">
              <span className="breadcrumb-current" aria-current="page">
                {currentItem.label}
              </span>
            </li>
          </>
        )}
      </ol>
    </nav>
  )
}
