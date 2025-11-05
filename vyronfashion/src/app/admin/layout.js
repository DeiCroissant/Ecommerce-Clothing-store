'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { AdminBreadcrumbs } from '@/components/admin/layout/AdminBreadcrumbs'
import '@/styles/admin-design-system.css'
import '@/styles/admin-layout.css'
import '@/styles/admin-components.css'
import '@/styles/admin-isolation.css'

export default function AdminLayout({ children }) {
  const [authorized, setAuthorized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Kiểm tra quyền truy cập - chỉ dành cho admin
  useEffect(() => {
    try {
      const userLS = localStorage.getItem('user')
      if (!userLS) {
        // Không có thông tin user, chuyển về trang chủ
        router.replace('/')
        return
      }
      const user = JSON.parse(userLS)
      // Chỉ cho phép role 'admin' truy cập
      if (user?.role?.toLowerCase() !== 'admin') {
        // User không phải admin, chuyển về trang chủ
        router.replace('/')
        return
      }
      // User là admin, cho phép truy cập
      setAuthorized(true)
    } catch {
      // Lỗi khi parse user data, chuyển về trang chủ
      router.replace('/')
    }
  }, [router])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (!authorized) {
    return null
  }

  return (
    <div className="admin-root admin-layout" style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
      backgroundColor: 'var(--neutral-50)',
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Wrapper */}
      <div className="admin-layout-wrapper" style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main Content */}
        <main className="admin-main" style={{
          flex: 1,
          overflow: 'auto'
        }}>
          <AdminBreadcrumbs />
          {children}
        </main>
      </div>
    </div>
  )
}

