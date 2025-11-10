'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Package, ArrowRight } from 'lucide-react'
import { getStatusInfo } from '@/lib/mockOrdersData'
import { EmptyState } from '@/components/account'

export function RecentOrdersWidget({ orders }) {
  if (orders.length === 0) {
    return (
      <div className="recent-orders-widget">
        <div className="widget-header">
          <h3 className="widget-title">Đơn hàng gần đây</h3>
        </div>
        <EmptyState
          icon={Package}
          title="Chưa có đơn hàng"
          description="Bạn chưa có đơn hàng nào. Hãy khám phá sản phẩm của chúng tôi!"
          action={
            <Link href="/category/ao-nam" className="btn-primary">
              Mua sắm ngay
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="recent-orders-widget">
      <div className="widget-header">
        <h3 className="widget-title">Đơn hàng gần đây</h3>
        <Link href="/account/orders" className="view-all-link">
          Xem tất cả
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="orders-list">
        {orders.map((order) => {
          // Check if order has completed return
          const hasRefundCompleted = order.hasRefundCompleted || false
          const displayStatus = (order.status === 'completed' && hasRefundCompleted) ? 'refunded' : order.status
          const statusInfo = getStatusInfo(displayStatus)
          return (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="order-item"
            >
              <div className="order-info">
                <div className="order-id">
                  <Package size={18} />
                  <span>#{order.orderNumber || order.id}</span>
                </div>
                <div className="order-date">
                  {format(new Date(order.date || order.createdAt), 'dd MMM yyyy', { locale: vi })}
                </div>
              </div>

              <div className="order-status">
                <span
                  className="status-badge"
                  style={{ '--status-color': statusInfo.color }}
                >
                  {statusInfo.label}
                </span>
              </div>

              <div className="order-total">
                {order.total.toLocaleString('vi-VN')}đ
              </div>

              <ArrowRight size={20} className="order-arrow" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
