'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

// Simple breadcrumb mapping
const breadcrumbMap = {
  '/admin': 'Bảng điều khiển',
  '/admin/orders': 'Đơn hàng',
  '/admin/orders/pending': 'Đơn hàng chờ xử lý',
  '/admin/orders/cancelled': 'Đơn hàng đã hủy',
  '/admin/products': 'Sản phẩm',
  '/admin/products/new': 'Thêm sản phẩm mới',
  '/admin/products/categories': 'Danh mục',
  '/admin/products/categories/[id]': 'Chi tiết danh mục',
  '/admin/products/attributes': 'Thuộc tính',
  '/admin/customers': 'Khách hàng',
  '/admin/marketing': 'Marketing',
  '/admin/marketing/coupons': 'Mã giảm giá',
  '/admin/settings': 'Cài đặt',
  '/admin/settings/store': 'Cài đặt cửa hàng',
  '/admin/settings/payments': 'Thanh toán & Vận chuyển',
  '/admin/settings/admins': 'Quản trị viên & Phân quyền',
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

