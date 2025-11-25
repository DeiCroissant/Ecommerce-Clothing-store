'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Tag,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronDown,
  Sparkles
} from 'lucide-react'
import * as adminOrderAPI from '@/lib/api/adminOrders'

/**
 * Admin Sidebar Navigation
 * - Desktop: expandable/collapsible (256px / 80px)
 * - Mobile: off-canvas overlay
 * - Submenu support with expand/collapse
 */

const navigationGroups = [
  {
    id: 'main',
    title: 'Chính',
    items: [
      { href: '/admin', label: 'Bảng điều khiển', icon: LayoutDashboard },
      { 
        href: '/admin/orders', 
        label: 'Đơn hàng', 
        icon: ShoppingBag,
        badge: null, // Will be set dynamically
        submenu: [
          { href: '/admin/orders', label: 'Tất cả đơn hàng' },
          { href: '/admin/returns', label: 'Yêu cầu đổi trả & Hoàn tiền' }
        ]
      },
      { 
        href: '/admin/products', 
        label: 'Sản phẩm', 
        icon: Package,
        submenu: [
          { href: '/admin/products', label: 'Tất cả sản phẩm' },
          { href: '/admin/products/categories', label: 'Danh mục' }
        ]
      },
      { href: '/admin/customers', label: 'Khách hàng', icon: Users }
    ]
  },
  {
    id: 'content',
    title: 'Nội dung',
    items: [
      { 
        href: '/admin/marketing', 
        label: 'Marketing', 
        icon: Tag,
        submenu: [
          { href: '/admin/marketing/coupons', label: 'Mã giảm giá' },
          { href: '/admin/marketing/campaigns', label: 'Chiến dịch' }
        ]
      },
      { 
        href: '/admin/cms', 
        label: 'CMS', 
        icon: FileText,
        submenu: [
          { href: '/admin/cms/banners', label: 'Banner' },
          { href: '/admin/cms/pages', label: 'Trang' }
        ]
      },
      { href: '/admin/analytics', label: 'Phân tích', icon: BarChart3 }
    ]
  },
  {
    id: 'settings',
    title: 'Cài đặt',
    items: [
      { 
        href: '/admin/settings', 
        label: 'Cài đặt', 
        icon: Settings,
        submenu: [
          { href: '/admin/settings/store', label: 'Cài đặt cửa hàng' },
          { href: '/admin/settings/payments', label: 'Thanh toán & Vận chuyển' }
        ]
      }
    ]
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState({})
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)

  // Fetch pending orders count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const count = await adminOrderAPI.getPendingOrdersCount()
        setPendingOrdersCount(count)
      } catch (error) {
        console.error('Error fetching pending orders count:', error)
      }
    }

    fetchPendingCount()
    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const isItemActive = (href) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const toggleSubmenu = (href) => {
    setExpandedMenus(prev => ({
      ...prev,
      [href]: !prev[href]
    }))
  }

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}
      >
        {/* Header */}
        <div className="sidebar-header">
          {/* Logo - Click để toggle khi collapsed */}
          {isCollapsed ? (
            <button
              className="sidebar-logo sidebar-logo-collapsed"
              onClick={() => setIsCollapsed(false)}
              title="Mở rộng thanh bên"
              type="button"
            >
              <div className="sidebar-logo-icon">
                <Sparkles size={20} />
              </div>
            </button>
          ) : (
            <>
              <Link href="/admin" className="sidebar-logo">
                <div className="sidebar-logo-icon">
                  <Sparkles size={20} />
                </div>
                <span className="sidebar-logo-text">VyronFashion</span>
              </Link>
              
              {/* Desktop Toggle - chỉ hiển thị khi mở rộng */}
              <button
                className="sidebar-toggle-btn"
                onClick={() => setIsCollapsed(true)}
                title="Thu gọn thanh bên"
                type="button"
              >
                <ChevronLeft size={20} />
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navigationGroups.map(group => (
            <div key={group.id} className="sidebar-nav-group">
              <div className="sidebar-nav-group-title">{group.title}</div>
              <ul className="sidebar-nav-items">
                {group.items.map(item => {
                  const Icon = item.icon
                  const isActive = isItemActive(item.href)
                  const hasSubmenu = item.submenu && item.submenu.length > 0
                  const isExpanded = expandedMenus[item.href]

                  return (
                    <li key={item.href}>
                      {hasSubmenu ? (
                        <>
                          <button
                            className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => toggleSubmenu(item.href)}
                          >
                            <Icon className="sidebar-nav-item-icon" size={20} />
                            <span className="sidebar-nav-item-text">{item.label}</span>
                            {item.href === '/admin/orders' && pendingOrdersCount > 0 && (
                              <span className="sidebar-nav-item-badge">{pendingOrdersCount}</span>
                            )}
                            {item.href !== '/admin/orders' && item.badge && (
                              <span className="sidebar-nav-item-badge">{item.badge}</span>
                            )}
                            <ChevronDown 
                              className={`sidebar-nav-item-arrow ${isExpanded ? 'expanded' : ''}`}
                              size={16} 
                            />
                          </button>
                          
                          {isExpanded && !isCollapsed && (
                            <ul className="sidebar-submenu">
                              {item.submenu.map(subitem => (
                                <li key={subitem.href}>
                                  <Link
                                    href={subitem.href}
                                    className={`sidebar-submenu-item ${pathname === subitem.href ? 'active' : ''}`}
                                  >
                                    {subitem.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                        >
                          <Icon className="sidebar-nav-item-icon" size={20} />
                          <span className="sidebar-nav-item-text">{item.label}</span>
                          {item.href === '/admin/orders' && pendingOrdersCount > 0 && (
                            <span className="sidebar-nav-item-badge">{pendingOrdersCount}</span>
                          )}
                          {item.href !== '/admin/orders' && item.badge && (
                            <span className="sidebar-nav-item-badge">{item.badge}</span>
                          )}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer - User Info */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">A</div>
            <div className="sidebar-user-info">
            <div className="sidebar-user-name">Quản trị viên</div>
            <div className="sidebar-user-role">Quản trị viên cấp cao</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

