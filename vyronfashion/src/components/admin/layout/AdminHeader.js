'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Menu, 
  Search, 
  Bell, 
  User as UserIcon,
  LogOut,
  Command,
  ShoppingBag,
  Clock
} from 'lucide-react'
import * as adminOrderAPI from '@/lib/api/adminOrders'
import { formatCurrency } from '@/lib/formatCurrency'

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
  const [pendingOrders, setPendingOrders] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const router = useRouter()
  const userMenuRef = useRef(null)
  const notifRef = useRef(null)

  // Fetch pending orders for notifications
  const fetchPendingOrders = async () => {
    try {
      setLoadingNotifications(true)
      const orders = await adminOrderAPI.getPendingOrders(10)
      setPendingOrders(orders)
    } catch (error) {
      console.error('Error fetching pending orders:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }

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

    // Fetch pending orders
    fetchPendingOrders()

    // Poll for new orders every 30 seconds
    const interval = setInterval(fetchPendingOrders, 30000)

    // Listen for order changes
    const handleOrdersChanged = () => {
      fetchPendingOrders()
    }
    window.addEventListener('ordersChanged', handleOrdersChanged)

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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      clearInterval(interval)
      window.removeEventListener('ordersChanged', handleOrdersChanged)
    }
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }


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
            {pendingOrders.length > 0 && <span className="header-action-btn-badge" />}
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
                maxHeight: '500px',
                overflowY: 'auto',
                zIndex: 'var(--z-popover)'
              }}
            >
              <div style={{ 
                padding: 'var(--space-4)', 
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                background: 'var(--surface)',
                zIndex: 1
              }}>
                <h3 style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-semibold)',
                  margin: 0
                }}>
                  Thông báo
                </h3>
                {pendingOrders.length > 0 && (
                  <Link
                    href="/admin/orders?status=pending"
                    className="admin-btn-ghost admin-btn-sm"
                    style={{ padding: '4px 8px', textDecoration: 'none' }}
                    onClick={() => setShowNotifications(false)}
                  >
                    Xem tất cả
                  </Link>
                )}
              </div>

              {loadingNotifications ? (
                <div style={{ 
                  padding: 'var(--space-8)', 
                  textAlign: 'center', 
                  color: 'var(--text-tertiary)' 
                }}>
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Đang tải...</p>
                </div>
              ) : pendingOrders.length === 0 ? (
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
              ) : (
                <div style={{ padding: 'var(--space-2) 0' }}>
                  {pendingOrders.map((order) => (
                    <Link
                      key={order.id || order._id}
                      href={`/admin/orders/${order.id || order._id}`}
                      className="admin-dropdown-item"
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3) var(--space-4)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--border)',
                        transition: 'background-color var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => setShowNotifications(false)}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--brand-50)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <ShoppingBag size={20} style={{ color: 'var(--brand-600)' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-semibold)',
                          color: 'var(--text)',
                          marginBottom: 'var(--space-1)'
                        }}>
                          Đơn hàng mới: #{order.order_number || order.orderNumber || order.id}
                        </div>
                        <div style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-secondary)',
                          marginBottom: 'var(--space-1)'
                        }}>
                          {formatDate(order.created_at || order.createdAt || order.date)}
                        </div>
                        <div style={{
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-semibold)',
                          color: 'var(--brand-600)'
                        }}>
                          {formatCurrency(order.total_amount || order.total || 0)}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-1)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-base)',
                        backgroundColor: 'var(--brand-50)',
                        color: 'var(--brand-600)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-semibold)',
                        flexShrink: 0
                      }}>
                        <Clock size={12} />
                        Chờ xử lý
                      </div>
                    </Link>
                  ))}
                </div>
              )}
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
                  {user?.role === 'admin' ? 'Quản trị viên' : user?.role || 'Quản trị viên'}
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

