/**
 * Metric Card Component
 * Displays key metric with trend indicator
 */

import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/formatCurrency'

const colorClasses = {
  blue: {
    bg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    shadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
  },
  green: {
    bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    shadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
  },
  purple: {
    bg: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    shadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
  },
  orange: {
    bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    shadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
  }
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  trend,
  icon: Icon,
  isCurrency = false,
  color = 'blue'
}) {
  const isPositive = trend === 'up'
  const TrendIcon = isPositive ? TrendingUp : TrendingDown
  const colorStyle = colorClasses[color] || colorClasses.blue

  return (
    <div className="admin-card admin-metric-card">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '1.25rem'
      }}>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: 'var(--admin-text-sm)',
            color: 'var(--admin-text-tertiary)',
            marginBottom: '0.75rem',
            fontWeight: 'var(--admin-font-medium)',
            letterSpacing: 'var(--admin-tracking-normal)'
          }}>
            {title}
          </p>
          <p style={{
            fontSize: 'var(--admin-text-4xl)',
            fontWeight: 'var(--admin-font-bold)',
            color: 'var(--admin-text-primary)',
            lineHeight: '1',
            marginBottom: '0.5rem'
          }}>
            {isCurrency ? formatCurrency(value) : value.toLocaleString()}
          </p>
        </div>
        {Icon && (
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--admin-radius-lg)',
            background: colorStyle.bg,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: colorStyle.shadow
          }}>
            <Icon size={28} strokeWidth={2.5} />
          </div>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.375rem'
      }}>
        <TrendIcon 
          size={16} 
          style={{ 
            color: isPositive ? 'var(--admin-success-strong)' : 'var(--admin-danger-strong)' 
          }} 
        />
        <span style={{
          fontSize: 'var(--admin-text-sm)',
          fontWeight: 'var(--admin-font-semibold)',
          color: isPositive ? 'var(--admin-success-text)' : 'var(--admin-danger-text)'
        }}>
          {Math.abs(change)}%
        </span>
        <span style={{
          fontSize: 'var(--admin-text-sm)',
          color: 'var(--admin-text-tertiary)'
        }}>
          so với hôm qua
        </span>
      </div>
    </div>
  )
}
