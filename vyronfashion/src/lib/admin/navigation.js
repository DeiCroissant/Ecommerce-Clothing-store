/**
 * Admin Navigation Configuration
 * Defines the sidebar menu structure for admin panel
 */

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Megaphone,
  FileText,
  BarChart3,
  Settings,
  Shield,
  PackagePlus,
  ListOrdered,
  PackageX,
  FolderTree,
  Palette,
  Ticket,
  Zap,
  Image as ImageIcon,
  FileCode,
  TrendingUp,
  PieChart,
  Store,
  CreditCard,
  Truck,
  UserCog,
  Key
} from 'lucide-react'

/**
 * Admin Navigation Structure
 * Organized by functional groups
 */
export const adminNavigation = [
  {
    id: 'overview',
    title: 'Tổng quan',
    items: [
      {
        href: '/admin',
        label: 'Bảng điều khiển',
        description: 'Tổng quan và thống kê',
        icon: LayoutDashboard
      }
    ]
  },
  {
    id: 'products',
    title: 'Quản lý Sản phẩm',
    items: [
      {
        href: '/admin/products',
        label: 'Tất cả sản phẩm',
        description: 'Danh sách và quản lý sản phẩm',
        icon: Package
      },
      {
        href: '/admin/products/new',
        label: 'Thêm sản phẩm',
        description: 'Tạo sản phẩm mới',
        icon: PackagePlus
      },
      {
        href: '/admin/products/categories',
        label: 'Danh mục',
        description: 'Quản lý danh mục sản phẩm',
        icon: FolderTree
      },
      {
        href: '/admin/attributes',
        label: 'Thuộc tính',
        description: 'Quản lý size, màu sắc, v.v.',
        icon: Palette
      }
    ]
  },
  {
    id: 'orders',
    title: 'Quản lý Đơn hàng',
    items: [
      {
        href: '/admin/orders',
        label: 'Tất cả đơn hàng',
        description: 'Danh sách đơn hàng',
        icon: ShoppingCart,
        badge: 12 // Dynamic count
      },
      {
        href: '/admin/orders/pending',
        label: 'Chờ xử lý',
        description: 'Đơn hàng chờ xác nhận',
        icon: ListOrdered,
        badge: 5
      },
      {
        href: '/admin/orders/cancelled',
        label: 'Đã hủy',
        description: 'Đơn hàng đã hủy',
        icon: PackageX
      }
    ]
  },
  {
    id: 'customers',
    title: 'Khách hàng',
    items: [
      {
        href: '/admin/customers',
        label: 'Danh sách khách hàng',
        description: 'Quản lý thông tin khách hàng',
        icon: Users
      }
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing',
    items: [
      {
        href: '/admin/coupons',
        label: 'Mã giảm giá',
        description: 'Quản lý coupon và voucher',
        icon: Ticket
      },
      {
        href: '/admin/campaigns',
        label: 'Chiến dịch',
        description: 'Chiến dịch và khuyến mãi',
        icon: Megaphone
      }
    ]
  },
  {
    id: 'content',
    title: 'Nội dung (CMS)',
    items: [
      {
        href: '/admin/banners',
        label: 'Banners',
        description: 'Quản lý hero banners',
        icon: ImageIcon
      },
      {
        href: '/admin/pages',
        label: 'Trang tĩnh',
        description: 'Về chúng tôi, Chính sách, v.v.',
        icon: FileCode
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Phân tích',
    items: [
      {
        href: '/admin/analytics/revenue',
        label: 'Báo cáo doanh thu',
        description: 'Thống kê doanh thu',
        icon: TrendingUp
      },
      {
        href: '/admin/analytics/products',
        label: 'Báo cáo sản phẩm',
        description: 'Top sản phẩm, tồn kho',
        icon: PieChart
      }
    ]
  },
  {
    id: 'settings',
    title: 'Cài đặt',
    items: [
      {
        href: '/admin/settings/store',
        label: 'Thông tin cửa hàng',
        description: 'Cấu hình cơ bản',
        icon: Store
      },
      {
        href: '/admin/settings/payment',
        label: 'Thanh toán',
        description: 'Cấu hình payment gateways',
        icon: CreditCard
      },
      {
        href: '/admin/settings/shipping',
        label: 'Vận chuyển',
        description: 'Cấu hình shipping methods',
        icon: Truck
      },
      {
        href: '/admin/settings/admins',
        label: 'Tài khoản Admin',
        description: 'Quản lý admin users',
        icon: UserCog
      },
      {
        href: '/admin/settings/permissions',
        label: 'Phân quyền',
        description: 'Vai trò & Phân quyền',
        icon: Key,
        requiresSuper: true // Only Super Admin can see
      }
    ]
  }
]

/**
 * Get navigation item by href
 */
export function getAdminNavItemByHref(href) {
  for (const section of adminNavigation) {
    const item = section.items.find(item => item.href === href)
    if (item) return item
  }
  return null
}

/**
 * Check if nav item is active
 */
export function isAdminNavItemActive(itemHref, currentPath) {
  if (itemHref === '/admin') {
    return currentPath === '/admin'
  }
  return currentPath.startsWith(itemHref)
}

/**
 * Get breadcrumb trail for current path
 */
export function getAdminBreadcrumbs(pathname) {
  const breadcrumbs = [
    { label: 'Bảng điều khiển', href: '/admin' }
  ]

  if (pathname === '/admin') {
    return breadcrumbs
  }

  // Find matching item
  const item = getAdminNavItemByHref(pathname)
  if (item) {
    breadcrumbs.push({
      label: item.label,
      href: item.href
    })
  } else {
    // Build from pathname
    const segments = pathname.split('/').filter(Boolean).slice(1) // Remove 'admin'
    segments.forEach((segment, index) => {
      const href = '/admin/' + segments.slice(0, index + 1).join('/')
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
      breadcrumbs.push({ label, href })
    })
  }

  return breadcrumbs
}
