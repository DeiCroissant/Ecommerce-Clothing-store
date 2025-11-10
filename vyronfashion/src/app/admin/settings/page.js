'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Store, CreditCard, Truck, ArrowRight } from 'lucide-react'

export default function AdminSettingsPage() {
  const pathname = usePathname()

  const settingsSections = [
    {
      id: 'store',
      title: 'Cài đặt cửa hàng',
      description: 'Thông tin cửa hàng, logo, địa chỉ, liên hệ',
      icon: Store,
      href: '/admin/settings/store',
      color: 'blue'
    },
    {
      id: 'payments',
      title: 'Thanh toán & Vận chuyển',
      description: 'Cấu hình phương thức thanh toán và vận chuyển',
      icon: CreditCard,
      href: '/admin/settings/payments',
      color: 'green'
    }
  ]

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--text)',
          marginBottom: 'var(--space-1)',
          fontFamily: 'var(--font-display)'
        }}>
          Cài đặt
        </h1>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)'
        }}>
          Quản lý cấu hình hệ thống và cửa hàng
        </p>
      </div>

      {/* Settings Cards */}
      <div className="admin-grid admin-grid-cols-2" style={{ gap: 'var(--space-6)' }}>
        {settingsSections.map((section) => {
          const Icon = section.icon
          const isActive = pathname === section.href

          return (
            <Link
              key={section.id}
              href={section.href}
              className="admin-card"
              style={{
                textDecoration: 'none',
                display: 'block',
                transition: 'all var(--transition-base)',
                border: isActive ? '2px solid var(--brand-500)' : '1px solid var(--border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-base)'
              }}
            >
              <div className="admin-card-content">
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-4)',
                  marginBottom: 'var(--space-4)'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: `var(--${section.color}-50)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={24} style={{ color: `var(--${section.color}-600)` }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--text)',
                      marginBottom: 'var(--space-1)'
                    }}>
                      {section.title}
                    </h2>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5'
                    }}>
                      {section.description}
                    </p>
                  </div>
                  <ArrowRight size={20} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

