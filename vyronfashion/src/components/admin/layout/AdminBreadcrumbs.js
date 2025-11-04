'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

// Simple breadcrumb mapping
const breadcrumbMap = {
  '/admin': 'Dashboard',
  '/admin/orders': 'Orders',
  '/admin/orders/pending': 'Pending Orders',
  '/admin/orders/cancelled': 'Cancelled Orders',
  '/admin/products': 'Products',
  '/admin/products/new': 'Add New Product',
  '/admin/products/categories': 'Categories',
  '/admin/products/attributes': 'Attributes',
  '/admin/customers': 'Customers',
  '/admin/marketing': 'Marketing',
  '/admin/marketing/coupons': 'Coupons',
  '/admin/marketing/campaigns': 'Campaigns',
  '/admin/cms': 'CMS',
  '/admin/cms/banners': 'Banners',
  '/admin/cms/pages': 'Pages',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
  '/admin/settings/store': 'Store Settings',
  '/admin/settings/payments': 'Payments & Shipping',
  '/admin/settings/admins': 'Admin & Permissions',
}

function getBreadcrumbs(pathname) {
  const parts = pathname.split('/').filter(Boolean)
  const breadcrumbs = []
  
  let currentPath = ''
  for (const part of parts) {
    currentPath += `/${part}`
    const label = breadcrumbMap[currentPath] || part.charAt(0).toUpperCase() + part.slice(1)
    breadcrumbs.push({ href: currentPath, label })
  }
  
  return breadcrumbs
}

export function AdminBreadcrumbs() {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  // Don't show breadcrumbs on dashboard
  if (pathname === '/admin') {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="admin-breadcrumbs">
      <div className="admin-breadcrumb-item">
        <Link href="/" className="admin-breadcrumb-link" title="Trang chủ">
          <Home size={16} />
        </Link>
      </div>

      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1

        return (
          <div key={crumb.href} className="admin-breadcrumb-item">
            <ChevronRight size={16} className="admin-breadcrumb-separator" />
            {isLast ? (
              <span className="admin-breadcrumb-current">
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href} className="admin-breadcrumb-link">
                {crumb.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}

