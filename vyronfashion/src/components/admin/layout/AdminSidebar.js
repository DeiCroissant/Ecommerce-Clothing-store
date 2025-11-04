'use client'

import { useState } from 'react'
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
  ChevronRight,
  X,
  ChevronDown
} from 'lucide-react'

/**
 * Admin Sidebar Navigation
 * - Desktop: expandable/collapsible (256px / 80px)
 * - Mobile: off-canvas overlay
 * - Submenu support with expand/collapse
 */

const navigationGroups = [
  {
    id: 'main',
    title: 'Main',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { 
        href: '/admin/orders', 
        label: 'Orders', 
        icon: ShoppingBag,
        badge: 12,
        submenu: [
          { href: '/admin/orders', label: 'All Orders' },
          { href: '/admin/orders/pending', label: 'Pending' },
          { href: '/admin/orders/cancelled', label: 'Cancelled' }
        ]
      },
      { 
        href: '/admin/products', 
        label: 'Products', 
        icon: Package,
        submenu: [
          { href: '/admin/products', label: 'All Products' },
          { href: '/admin/products/new', label: 'Add New' },
          { href: '/admin/products/categories', label: 'Categories' },
          { href: '/admin/products/attributes', label: 'Attributes' }
        ]
      },
      { href: '/admin/customers', label: 'Customers', icon: Users }
    ]
  },
  {
    id: 'content',
    title: 'Content',
    items: [
      { 
        href: '/admin/marketing', 
        label: 'Marketing', 
        icon: Tag,
        submenu: [
          { href: '/admin/marketing/coupons', label: 'Coupons' },
          { href: '/admin/marketing/campaigns', label: 'Campaigns' }
        ]
      },
      { 
        href: '/admin/cms', 
        label: 'CMS', 
        icon: FileText,
        submenu: [
          { href: '/admin/cms/banners', label: 'Banners' },
          { href: '/admin/cms/pages', label: 'Pages' }
        ]
      },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 }
    ]
  },
  {
    id: 'settings',
    title: 'Settings',
    items: [
      { 
        href: '/admin/settings', 
        label: 'Settings', 
        icon: Settings,
        submenu: [
          { href: '/admin/settings/store', label: 'Store Settings' },
          { href: '/admin/settings/payments', label: 'Payments & Shipping' },
          { href: '/admin/settings/admins', label: 'Admin & Permissions' }
        ]
      }
    ]
  }
]

export function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState({})

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
      {/* Mobile Overlay */}
      <div 
        className={`admin-overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside 
        className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}
      >
        {/* Header */}
        <div className="sidebar-header">
          <Link href="/admin" className="sidebar-logo">
            <div className="sidebar-logo-icon">V</div>
            <span className="sidebar-logo-text">VyronAdmin</span>
          </Link>
          
          {/* Desktop Toggle */}
          <button
            className="sidebar-toggle-btn hidden lg:flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          {/* Mobile Close */}
          <button
            className="sidebar-toggle-btn lg:hidden"
            onClick={onClose}
            title="Close sidebar"
          >
            <X size={20} />
          </button>
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
                            {item.badge && (
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
                                    onClick={onClose}
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
                          onClick={onClose}
                        >
                          <Icon className="sidebar-nav-item-icon" size={20} />
                          <span className="sidebar-nav-item-text">{item.label}</span>
                          {item.badge && (
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
              <div className="sidebar-user-name">Admin User</div>
              <div className="sidebar-user-role">Super Admin</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

