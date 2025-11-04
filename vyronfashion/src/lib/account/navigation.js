import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  CreditCard,
  Settings, 
  Bell,
  Shield,
  RefreshCw,
  Eye,
  Ruler,
  Gift
} from 'lucide-react'

/**
 * Account navigation structure
 * Organized in groups for better UX
 */
export const accountNavigation = [
  {
    id: 'account',
    title: 'Tài khoản',
    items: [
      {
        href: '/account/overview',
        label: 'Tổng quan',
        description: 'Xem thông tin tài khoản tổng quan',
        icon: User
      },
      {
        href: '/account/profile',
        label: 'Thông tin cá nhân',
        description: 'Quản lý thông tin cá nhân',
        icon: User
      },
      {
        href: '/account/addresses',
        label: 'Địa chỉ',
        description: 'Quản lý địa chỉ giao hàng',
        icon: MapPin
      },
      {
        href: '/account/payments',
        label: 'Thanh toán',
        description: 'Quản lý phương thức thanh toán',
        icon: CreditCard
      }
    ]
  },
  {
    id: 'orders',
    title: 'Đơn hàng',
    items: [
      {
        href: '/account/orders',
        label: 'Đơn hàng của tôi',
        description: 'Xem lịch sử đơn hàng',
        icon: Package
      },
      {
        href: '/account/returns',
        label: 'Đổi trả & Hoàn tiền',
        description: 'Quản lý yêu cầu đổi trả',
        icon: RefreshCw
      }
    ]
  },
  {
    id: 'preferences',
    title: 'Sở thích',
    items: [
      {
        href: '/account/wishlist',
        label: 'Danh sách yêu thích',
        description: 'Sản phẩm bạn đã lưu',
        icon: Heart
      },
      {
        href: '/account/fit-profile',
        label: 'Số đo của tôi',
        description: 'Quản lý thông tin số đo',
        icon: Ruler
      },
      {
        href: '/account/credits',
        label: 'Tín dụng & Voucher',
        description: 'Xem tín dụng và voucher',
        icon: Gift
      }
    ]
  },
  {
    id: 'settings',
    title: 'Cài đặt',
    items: [
      {
        href: '/account/notifications',
        label: 'Thông báo',
        description: 'Cài đặt thông báo',
        icon: Bell
      },
      {
        href: '/account/preferences',
        label: 'Tuỳ chọn',
        description: 'Tuỳ chỉnh trải nghiệm',
        icon: Settings
      },
      {
        href: '/account/security',
        label: 'Bảo mật',
        description: 'Mật khẩu và bảo mật',
        icon: Shield
      },
      {
        href: '/account/privacy',
        label: 'Quyền riêng tư',
        description: 'Quản lý dữ liệu cá nhân',
        icon: Eye
      }
    ]
  }
]

/**
 * Mobile navigation items (simplified, most important items only)
 * Used for bottom tab navigation on mobile devices
 */
export const mobileNavItems = [
  {
    href: '/account/overview',
    label: 'Tổng quan',
    icon: User
  },
  {
    href: '/account/orders',
    label: 'Đơn hàng',
    icon: Package
  },
  {
    href: '/account/wishlist',
    label: 'Yêu thích',
    icon: Heart
  },
  {
    href: '/account/profile',
    label: 'Hồ sơ',
    icon: Settings
  }
]

/**
 * Check if a navigation item is active based on current pathname
 * @param {string} itemHref - The href of the navigation item
 * @param {string} pathname - The current pathname
 * @returns {boolean} - Whether the item is active
 */
export function isNavItemActive(itemHref, pathname) {
  if (!pathname) return false
  
  // Exact match for overview page
  if (itemHref === '/account/overview' && pathname === '/account') {
    return true
  }
  
  // Exact match
  if (itemHref === pathname) {
    return true
  }
  
  // Nested route match (e.g., /account/orders/123 matches /account/orders)
  if (pathname.startsWith(itemHref + '/')) {
    return true
  }
  
  return false
}

/**
 * Get the current navigation item based on pathname
 * @param {string} pathname - The current pathname
 * @returns {object|null} - The active navigation item or null
 */
export function getActiveNavItem(pathname) {
  for (const group of accountNavigation) {
    for (const item of group.items) {
      if (isNavItemActive(item.href, pathname)) {
        return item
      }
    }
  }
  return null
}

/**
 * Get all navigation items as a flat array
 * @returns {array} - All navigation items
 */
export function getAllNavItems() {
  return accountNavigation.flatMap(group => group.items)
}

/**
 * Get a navigation item by its href
 * @param {string} href - The href to search for
 * @returns {object|null} - The navigation item or null
 */
export function getNavItemByHref(href) {
  if (!href) return null
  
  for (const group of accountNavigation) {
    for (const item of group.items) {
      // Exact match
      if (item.href === href) {
        return item
      }
      // Nested route match (e.g., /account/orders/123 should return orders item)
      if (href.startsWith(item.href + '/')) {
        return item
      }
    }
  }
  
  // Handle /account root path
  if (href === '/account') {
    return accountNavigation[0].items.find(item => item.href === '/account/overview')
  }
  
  return null
}
