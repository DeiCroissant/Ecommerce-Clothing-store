'use client'

import Link from 'next/link'
import { Package, ArrowRight, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { getImageUrl, handleImageError } from '@/lib/imageHelper'

const statusConfig = {
  pending: {
    label: 'Chờ xác nhận',
    color: '#6b7280',
    bgColor: '#f3f4f6',
  },
  processing: {
    label: 'Đang xử lý',
    color: '#3b82f6',
    bgColor: '#dbeafe',
  },
  shipped: {
    label: 'Đang giao',
    color: '#a855f7',
    bgColor: '#f3e8ff',
  },
  delivered: {
    label: 'Đã giao',
    color: '#10b981',
    bgColor: '#d1fae5',
  },
  completed: {
    label: 'Hoàn thành',
    color: '#10b981',
    bgColor: '#d1fae5',
  },
  refunded: {
    label: 'Hoàn tiền',
    color: '#ef4444',
    bgColor: '#fee2e2',
  },
  cancelled: {
    label: 'Đã hủy',
    color: '#ef4444',
    bgColor: '#fee2e2',
  },
  returned: {
    label: 'Đã trả',
    color: '#f59e0b',
    bgColor: '#fef3c7',
  },
}

export function OrderCard({ order }) {
  const orderId = order.id || order.order_number || order.orderNumber || order.order_id
  const orderDate = order.date || order.created_at || order.createdAt || order.orderDate
  const orderStatus = order.status || 'pending'
  const orderTotal = order.total || order.total_amount || 0
  const orderItems = order.items || []
  const hasRefundCompleted = order.hasRefundCompleted || false

  // If order is completed and has a completed return, show "Hoàn tiền" instead
  const displayStatus = (orderStatus === 'completed' && hasRefundCompleted) ? 'refunded' : orderStatus
  const status = statusConfig[displayStatus] || statusConfig.pending

  // Format date
  let formattedDate = ''
  try {
    if (orderDate) {
      const date = typeof orderDate === 'string' ? new Date(orderDate) : orderDate
      formattedDate = format(date, 'dd/MM/yyyy', { locale: vi })
    }
  } catch (e) {
    formattedDate = orderDate || ''
  }

  const displayOrderNumber = order.orderNumber || order.order_number || orderId;

  return (
    <Link href={`/account/orders/${orderId}`} className="order-card">
      <div className="order-header">
        <div className="order-info">
          <div className="order-id-wrapper">
            <Package size={18} />
            <span className="order-id">#{displayOrderNumber}</span>
          </div>
          <div className="order-date-wrapper">
            <Calendar size={14} />
            <span className="order-date">{formattedDate}</span>
          </div>
        </div>
        <div className="order-status-badge" style={{ 
          backgroundColor: status.bgColor,
          color: status.color 
        }}>
          {status.label}
        </div>
      </div>

      <div className="order-items">
        {orderItems.slice(0, 3).map((item, index) => {
          const itemImage = getImageUrl(item.image || item.product_image || '/images/placeholders/product-placeholder.svg')
          const itemName = item.name || item.product_name || 'Sản phẩm'
          const itemQuantity = item.quantity || 1
          
          // Build variant string
          let variantStr = item.variant || '';
          if (!variantStr && (item.variant_color || item.variant_size)) {
            const parts = [];
            if (item.variant_color) parts.push(`Màu: ${item.variant_color}`);
            if (item.variant_size) parts.push(`Size: ${item.variant_size}`);
            variantStr = parts.join(' • ');
          }
          
          return (
            <div key={item.id || item.product_id || index} className="order-item">
              <div className="item-image-wrapper">
                <img
                  src={itemImage}
                  alt={itemName}
                  className="item-image"
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem' }}
                  onError={handleImageError}
                />
              </div>
              <div className="item-info">
                <p className="item-name">{itemName}</p>
                {variantStr && (
                  <p className="item-variant">{variantStr}</p>
                )}
                <p className="item-quantity">Số lượng: {itemQuantity}</p>
              </div>
            </div>
          )
        })}
        {orderItems.length > 3 && (
          <div className="more-items">
            +{orderItems.length - 3} sản phẩm khác
          </div>
        )}
      </div>

      <div className="order-footer">
        <div className="order-total">
          <span className="total-label">Tổng tiền:</span>
          <span className="total-value">
            {typeof orderTotal === 'number' 
              ? orderTotal.toLocaleString('vi-VN') 
              : orderTotal
            }₫
          </span>
        </div>
        <ArrowRight size={20} className="arrow-icon" />
      </div>

      <style jsx>{`
        .order-card {
          display: block;
          background: white;
          border: 1px solid #e4e4e7;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1rem;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }

        .order-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #18181b;
          transform: translateY(-2px);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f4f4f5;
        }

        .order-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .order-id-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #18181b;
        }

        .order-id {
          font-size: 1rem;
        }

        .order-date-wrapper {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          color: #71717a;
        }

        .order-status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .order-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .order-item {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .item-image-wrapper {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          border-radius: 0.5rem;
          overflow: hidden;
          background: #f4f4f5;
        }

        .item-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-info {
          flex: 1;
          min-width: 0;
        }

        .item-name {
          font-weight: 500;
          color: #18181b;
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-variant {
          font-size: 0.75rem;
          color: #71717a;
          margin: 0 0 0.25rem 0;
        }

        .item-quantity {
          font-size: 0.75rem;
          color: #71717a;
          margin: 0;
        }

        .more-items {
          font-size: 0.875rem;
          color: #71717a;
          font-style: italic;
          padding-left: 4.5rem;
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #f4f4f5;
        }

        .order-total {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .total-label {
          font-size: 0.875rem;
          color: #71717a;
        }

        .total-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: #18181b;
        }

        .arrow-icon {
          color: #71717a;
          transition: transform 0.2s;
        }

        .order-card:hover .arrow-icon {
          transform: translateX(4px);
          color: #18181b;
        }

        @media (max-width: 640px) {
          .order-card {
            padding: 1rem;
          }

          .order-header {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </Link>
  )
}

