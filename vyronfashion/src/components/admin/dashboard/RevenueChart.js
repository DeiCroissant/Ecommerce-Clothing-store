/**
 * Revenue Chart Component
 * Simple CSS-based bar chart showing revenue trend
 */

'use client'

import { formatCurrency } from '@/lib/formatCurrency'

export function RevenueChart({ data }) {
  // Calculate max for scaling
  const maxRevenue = Math.max(...data.map(d => d.revenue))
  
  // Show only last 14 days for better visibility
  const recentData = data.slice(-14)

  return (
    <div style={{ height: '300px', position: 'relative' }}>
      {/* Chart Container */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '250px',
        gap: '4px',
        padding: '0 0.5rem'
      }}>
        {recentData.map((item, index) => {
          const heightPercent = (item.revenue / maxRevenue) * 100

          return (
            <div
              key={index}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {/* Bar */}
              <div
                style={{
                  width: '100%',
                  height: `${heightPercent}%`,
                  backgroundColor: 'var(--admin-accent-500)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                title={`${item.date}: ${formatCurrency(item.revenue)}`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--admin-accent-600)'
                  e.currentTarget.style.transform = 'scaleY(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--admin-accent-500)'
                  e.currentTarget.style.transform = 'scaleY(1)'
                }}
              />
            </div>
          )
        })}
      </div>

      {/* X-Axis Labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '0.75rem',
        padding: '0 0.5rem'
      }}>
        {recentData.map((item, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 'var(--admin-text-xs)',
              color: 'var(--admin-text-disabled)',
              fontWeight: 'var(--admin-font-medium)'
            }}
          >
            {item.date}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div style={{
        marginTop: '1.5rem',
        display: 'flex',
        justifyContent: 'space-around',
        paddingTop: '1rem',
        borderTop: '1px solid var(--admin-border-light)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 'var(--admin-text-xs)',
            color: 'var(--admin-text-tertiary)',
            marginBottom: '0.25rem'
          }}>
            Tổng cộng
          </div>
          <div style={{
            fontSize: 'var(--admin-text-lg)',
            fontWeight: 'var(--admin-font-bold)',
            color: 'var(--admin-text-primary)'
          }}>
            {formatCurrency(recentData.reduce((sum, d) => sum + d.revenue, 0))}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 'var(--admin-text-xs)',
            color: 'var(--admin-text-tertiary)',
            marginBottom: '0.25rem'
          }}>
            Trung bình/ngày
          </div>
          <div style={{
            fontSize: 'var(--admin-text-lg)',
            fontWeight: 'var(--admin-font-bold)',
            color: 'var(--admin-text-primary)'
          }}>
            {formatCurrency(Math.round(recentData.reduce((sum, d) => sum + d.revenue, 0) / recentData.length))}
          </div>
        </div>
      </div>
    </div>
  )
}
