'use client'

import Link from 'next/link'
import { PackageX, ArrowRight, Calendar, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { getImageUrl, handleImageError } from '@/lib/imageHelper'

const statusConfig = {
  pending: {
    label: 'Chờ xử lý',
    color: '#6b7280',
    bgColor: '#f3f4f6',
  },
  approved: {
    label: 'Đã duyệt',
    color: '#10b981',
    bgColor: '#d1fae5',
  },
  processing: {
    label: 'Đang xử lý',
    color: '#3b82f6',
    bgColor: '#dbeafe',
  },
  completed: {
    label: 'Hoàn thành',
    color: '#10b981',
    bgColor: '#d1fae5',
  },
  rejected: {
    label: 'Từ chối',
    color: '#ef4444',
    bgColor: '#fee2e2',
  },
}

export function ReturnCard({ returnItem }) {
  const returnId = returnItem.id || returnItem.return_id || returnItem.returnNumber
  const returnDate = returnItem.date || returnItem.createdAt || returnItem.created_at
  const returnStatus = returnItem.status || 'pending'
  const returnAmount = returnItem.amount || returnItem.refund_amount || 0
  const returnProducts = returnItem.products || returnItem.items || []

  const status = statusConfig[returnStatus] || statusConfig.pending

  // Format date
  let formattedDate = ''
  try {
    if (returnDate) {
      const date = typeof returnDate === 'string' ? new Date(returnDate) : returnDate
      formattedDate = format(date, 'dd/MM/yyyy', { locale: vi })
    }
  } catch (e) {
    formattedDate = returnDate || ''
  }

  return (
    <Link href={`/account/returns/${returnId}`} className="return-card">
      <div className="return-header">
        <div className="return-info">
          <div className="return-id-wrapper">
            <PackageX size={18} />
            <span className="return-id">#{returnId}</span>
          </div>
          <div className="return-date-wrapper">
            <Calendar size={14} />
            <span className="return-date">{formattedDate}</span>
          </div>
        </div>
        <div className="return-status-badge" style={{ 
          backgroundColor: status.bgColor,
          color: status.color 
        }}>
          {status.label}
        </div>
      </div>

      {returnProducts.length > 0 && (
        <div className="return-products">
          {returnProducts.slice(0, 3).map((product, index) => {
            const productImage = getImageUrl(product.image || product.product_image)
            const productName = product.name || product.product_name || 'Sản phẩm'
            const productQuantity = product.quantity || 1
            
            return (
              <div key={product.id || index} className="return-product">
                <div className="product-image-wrapper">
                  <img
                    src={productImage}
                    alt={productName}
                    className="product-image"
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem' }}
                    onError={handleImageError}
                  />
                </div>
                <div className="product-info">
                  <p className="product-name">{productName}</p>
                  {product.reason && (
                    <p className="product-reason">Lý do: {product.reason}</p>
                  )}
                  <p className="product-quantity">Số lượng: {productQuantity}</p>
                </div>
              </div>
            )
          })}
          {returnProducts.length > 3 && (
            <div className="more-products">
              +{returnProducts.length - 3} sản phẩm khác
            </div>
          )}
        </div>
      )}

      <div className="return-footer">
        <div className="return-amount">
          <span className="amount-label">Số tiền hoàn:</span>
          <span className="amount-value">
            {typeof returnAmount === 'number' 
              ? returnAmount.toLocaleString('vi-VN') 
              : returnAmount
            }₫
          </span>
        </div>
        <ArrowRight size={20} className="arrow-icon" />
      </div>

      <style jsx>{`
        .return-card {
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

        .return-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #18181b;
          transform: translateY(-2px);
        }

        .return-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f4f4f5;
        }

        .return-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .return-id-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #18181b;
        }

        .return-id {
          font-size: 1rem;
        }

        .return-date-wrapper {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          color: #71717a;
        }

        .return-status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .return-products {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .return-product {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .product-image-wrapper {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          border-radius: 0.5rem;
          overflow: hidden;
          background: #f4f4f5;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-info {
          flex: 1;
          min-width: 0;
        }

        .product-name {
          font-weight: 500;
          color: #18181b;
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .product-reason {
          font-size: 0.75rem;
          color: #71717a;
          margin: 0 0 0.25rem 0;
        }

        .product-quantity {
          font-size: 0.75rem;
          color: #71717a;
          margin: 0;
        }

        .more-products {
          font-size: 0.875rem;
          color: #71717a;
          font-style: italic;
          padding-left: 4.5rem;
        }

        .return-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #f4f4f5;
        }

        .return-amount {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .amount-label {
          font-size: 0.875rem;
          color: #71717a;
        }

        .amount-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: #10b981;
        }

        .arrow-icon {
          color: #71717a;
          transition: transform 0.2s;
        }

        .return-card:hover .arrow-icon {
          transform: translateX(4px);
          color: #18181b;
        }

        @media (max-width: 640px) {
          .return-card {
            padding: 1rem;
          }

          .return-header {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </Link>
  )
}

