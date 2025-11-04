'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Menu, 
  Search, 
  Bell, 
  User as UserIcon,
  LogOut,
  Command
} from 'lucide-react'

/**
 * Admin Header
 * - Mobile menu toggle
 * - Command Palette search (⌘K)
 * - Notifications
 * - User menu
 */

export function AdminHeader({ onMenuToggle }) {
  const [user, setUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [hasNotifications, setHasNotifications] = useState(true)
  const router = useRouter()
  const userMenuRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    // Get user from localStorage
    if (typeof window !== 'undefined') {
      const userLS = localStorage.getItem('user')
      if (userLS) {
        try {
          setUser(JSON.parse(userLS))
        } catch (e) {
          console.error('Failed to parse user data', e)
        }
      }
    }

    // Close dropdowns when clicking outside
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      router.push('/')
    }
  }

  const handleSearchClick = () => {
    // TODO: Open Command Palette modal
    console.log('Open Command Palette')
  }

  return (
    <header className="admin-header">
      {/* Left Section */}
      <div className="header-left">
        {/* Mobile Menu Toggle */}
        <button
          className="header-menu-toggle"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        {/* Command Palette / Search */}
        <div className="header-search-wrapper">
          <Search className="header-search-icon" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm hoặc nhập lệnh..."
            className="header-search"
            onClick={handleSearchClick}
            readOnly
          />
          <kbd className="header-search-kbd">⌘K</kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="header-right">
        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="header-action-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            title="Thông báo"
          >
            <Bell size={20} />
            {hasNotifications && <span className="header-action-btn-badge" />}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div 
              className="admin-dropdown"
              style={{ 
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                minWidth: '360px',
                maxWidth: '400px',
                zIndex: 'var(--z-popover)'
              }}
            >
              <div style={{ 
                padding: 'var(--space-4)', 
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h3 style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-semibold)',
                  margin: 0
                }}>
                  Thông báo
                </h3>
                <button
                  className="admin-btn-ghost admin-btn-sm"
                  style={{ padding: '4px 8px' }}
                >
                  Đánh dấu đã đọc
                </button>
              </div>
              <div style={{ 
                padding: 'var(--space-16) var(--space-6)', 
                textAlign: 'center', 
                color: 'var(--text-tertiary)' 
              }}>
                <Bell size={48} style={{ opacity: 0.2, marginBottom: 'var(--space-3)' }} />
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Bạn đã xem hết thông báo
                </p>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button
            className="header-action-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: '4px',
              width: 'auto',
              height: 'auto'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--brand-400), var(--brand-600))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-semibold)'
            }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div 
              className="admin-dropdown" 
              style={{ 
                position: 'absolute',
                right: 0, 
                top: 'calc(100% + 8px)',
                minWidth: '240px',
                zIndex: 'var(--z-popover)'
              }}
            >
              <div style={{ 
                padding: 'var(--space-4)', 
                borderBottom: '1px solid var(--border)' 
              }}>
                <div style={{ 
                  fontWeight: 'var(--font-semibold)', 
                  fontSize: 'var(--text-sm)',
                  marginBottom: 'var(--space-1)',
                  color: 'var(--text)'
                }}>
                  {user?.name || 'Admin User'}
                </div>
                <div style={{ 
                  fontSize: 'var(--text-xs)', 
                  color: 'var(--text-tertiary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  {user?.email || 'admin@vyronfashion.com'}
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-base)',
                  backgroundColor: 'var(--brand-50)',
                  color: 'var(--brand-700)',
                  fontSize: '10px',
                  fontWeight: 'var(--font-bold)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {user?.role || 'Super Admin'}
                </div>
              </div>
              
              <div style={{ padding: 'var(--space-2) 0' }}>
                <button 
                  className="admin-dropdown-item" 
                  onClick={() => {
                    setShowUserMenu(false)
                    router.push('/account/overview')
                  }}
                >
                  <UserIcon size={16} />
                  <span>Tài khoản của tôi</span>
                </button>
              </div>

              <div style={{ 
                padding: 'var(--space-2) 0', 
                borderTop: '1px solid var(--border)' 
              }}>
                <button 
                  className="admin-dropdown-item" 
                  onClick={handleLogout}
                  style={{ color: 'var(--error-600)' }}
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

