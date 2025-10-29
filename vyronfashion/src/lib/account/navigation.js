import {
  User,
  MapPin,
  ShoppingBag,
  RefreshCw,
  Heart,
  CreditCard,
  Shield,
  Bell,
  Settings,
  Gift,
  Ruler,
  Lock,
  LayoutDashboard,
} from 'lucide-react'

/**
 * Account navigation structure
 * Organized in groups with nested items
 */
export const accountNavigation = [
  {
    id: 'account',
    title: 'Tài khoản',
    items: [
      {
        href: '/account/overview',
        label: 'Tổng quan',
        icon: LayoutDashboard,
        description: 'Dashboard và thông tin tổng quan',
      },
      {
        href: '/account/profile',
        label: 'Thông tin cá nhân',
        icon: User,
        description: 'Cập nhật thông tin và avatar',
      },
      {
        href: '/account/addresses',
        label: 'Địa chỉ',
        icon: MapPin,
        description: 'Quản lý địa chỉ giao hàng',
      },
    ],
  },
  {
    id: 'orders',
    title: 'Đơn hàng',
    items: [
      {
        href: '/account/orders',
        label: 'Đơn hàng của tôi',
        icon: ShoppingBag,
        description: 'Xem lịch sử đơn hàng',
      },
      {
        href: '/account/returns',
        label: 'Đổi trả hàng',
        icon: RefreshCw,
        description: 'Yêu cầu đổi/trả sản phẩm',
      },
    ],
  },
  {
    id: 'shopping',
    title: 'Mua sắm',
    items: [
      {
        href: '/account/wishlist',
        label: 'Yêu thích',
        icon: Heart,
        description: 'Sản phẩm đã lưu',
      },
      {
        href: '/account/credits',
        label: 'Ví & Voucher',
        icon: Gift,
        description: 'Quản lý voucher và store credit',
      },
      {
        href: '/account/fit-profile',
        label: 'Size của tôi',
        icon: Ruler,
        description: 'Thông tin số đo để gợi ý size',
      },
    ],
  },
  {
    id: 'settings',
    title: 'Cài đặt',
    items: [
      {
        href: '/account/payments',
        label: 'Thanh toán',
        icon: CreditCard,
        description: 'Quản lý phương thức thanh toán',
      },
      {
        href: '/account/security',
        label: 'Bảo mật',
        icon: Shield,
        description: 'Mật khẩu và 2FA',
      },
      {
        href: '/account/notifications',
        label: 'Thông báo',
        icon: Bell,
        description: 'Tùy chỉnh thông báo',
      },
      {
        href: '/account/preferences',
        label: 'Tùy chọn',
        icon: Settings,
        description: 'Ngôn ngữ, tiền tệ, chủ đề',
      },
      {
        href: '/account/privacy',
        label: 'Quyền riêng tư',
        icon: Lock,
        description: 'Tải dữ liệu & xóa tài khoản',
      },
    ],
  },
]

/**
 * Flat list for mobile navigation
 * Only includes top-level items without grouping
 */
export const mobileNavItems = accountNavigation.flatMap(group => group.items)

/**
 * Get navigation item by href
 */
export function getNavItemByHref(href) {
  return mobileNavItems.find(item => item.href === href)
}

/**
 * Check if a path is active
 * Supports exact match and nested routes
 */
export function isNavItemActive(itemHref, currentPath) {
  if (itemHref === currentPath) return true
  
  // Check if current path is a nested route under this item
  // e.g., /account/orders is active for /account/orders/123
  if (itemHref !== '/account/overview' && currentPath.startsWith(itemHref)) {
    return true
  }
  
  return false
}
