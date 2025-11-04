/**
 * Latest Orders Table Component
 * Shows recent orders with quick actions
 */

'use client'

import Link from 'next/link'
import { formatCurrency } from '@/lib/formatCurrency'
import { StatusBadge } from '@/components/admin/ui/Badge'
import { Eye } from 'lucide-react'

export function LatestOrdersTable({ orders }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        fontSize: 'var(--admin-text-sm)'
      }}>
        <thead>
          <tr style={{ 
            borderBottom: '1px solid var(--admin-border-base)',
            textAlign: 'left'
          }}>
            <th style={{ 
              padding: '0.75rem 0.5rem',
              fontWeight: 'var(--admin-font-semibold)',
              color: 'var(--admin-text-tertiary)',
              fontSize: 'var(--admin-text-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Mã đơn
            </th>
            <th style={{ 
              padding: '0.75rem 0.5rem',
              fontWeight: 'var(--admin-font-semibold)',
              color: 'var(--admin-text-tertiary)',
              fontSize: 'var(--admin-text-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Khách hàng
            </th>
            <th style={{ 
              padding: '0.75rem 0.5rem',
              fontWeight: 'var(--admin-font-semibold)',
              color: 'var(--admin-text-tertiary)',
              fontSize: 'var(--admin-text-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Ngày đặt
            </th>
            <th style={{ 
              padding: '0.75rem 0.5rem',
              fontWeight: 'var(--admin-font-semibold)',
              color: 'var(--admin-text-tertiary)',
              fontSize: 'var(--admin-text-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textAlign: 'right'
            }}>
              Tổng tiền
            </th>
            <th style={{ 
              padding: '0.75rem 0.5rem',
              fontWeight: 'var(--admin-font-semibold)',
              color: 'var(--admin-text-tertiary)',
              fontSize: 'var(--admin-text-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Thanh toán
            </th>
            <th style={{ 
              padding: '0.75rem 0.5rem',
              fontWeight: 'var(--admin-font-semibold)',
              color: 'var(--admin-text-tertiary)',
              fontSize: 'var(--admin-text-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Vận chuyển
            </th>
            <th style={{ 
              padding: '0.75rem 0.5rem',
              fontWeight: 'var(--admin-font-semibold)',
              color: 'var(--admin-text-tertiary)',
              fontSize: 'var(--admin-text-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textAlign: 'center'
            }}>
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr 
              key={order.id}
              style={{ 
                borderBottom: index < orders.length - 1 ? '1px solid var(--admin-border-light)' : 'none',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--admin-bg-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <td style={{ padding: '1rem 0.5rem' }}>
                <span style={{ 
                  fontFamily: 'var(--admin-font-mono)',
                  fontSize: 'var(--admin-text-sm)',
                  fontWeight: 'var(--admin-font-medium)',
                  color: 'var(--admin-text-primary)'
                }}>
                  {order.id}
                </span>
              </td>
              <td style={{ padding: '1rem 0.5rem' }}>
                <span style={{ color: 'var(--admin-text-secondary)' }}>
                  {order.customerName}
                </span>
              </td>
              <td style={{ padding: '1rem 0.5rem' }}>
                <span style={{ color: 'var(--admin-text-tertiary)' }}>
                  {order.date}
                </span>
              </td>
              <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                <span style={{ 
                  fontWeight: 'var(--admin-font-semibold)',
                  color: 'var(--admin-text-primary)'
                }}>
                  {formatCurrency(order.total)}
                </span>
              </td>
              <td style={{ padding: '1rem 0.5rem' }}>
                <StatusBadge status={order.paymentStatus} />
              </td>
              <td style={{ padding: '1rem 0.5rem' }}>
                <StatusBadge status={order.shippingStatus} />
              </td>
              <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="admin-btn-ghost"
                  style={{ 
                    padding: '0.375rem',
                    minWidth: 'auto'
                  }}
                  title="Xem chi tiết"
                >
                  <Eye size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
