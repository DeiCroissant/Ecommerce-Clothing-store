import { Package, Calendar, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, getReturnStatusInfo } from '@/lib/mockReturnsData';
import { formatDate } from '@/lib/mockOrdersData';

export function ReturnCard({ returnItem, onCancel }) {
  const statusInfo = getReturnStatusInfo(returnItem.status);
  const firstProduct = returnItem.products[0];
  const remainingCount = returnItem.products.length - 1;

  const showCancelButton = returnItem.status === 'pending';

  return (
    <article className="return-card">
      {/* Header */}
      <div className="return-card-header">
        <div className="return-id-section">
          <RotateCcw size={20} />
          <div className="return-ids">
            <span className="return-id">{returnItem.id}</span>
            <span className="order-ref">Đơn hàng: {returnItem.orderId}</span>
          </div>
        </div>
        
        <div className="return-meta">
          <span 
            className={`status-pill status-${returnItem.status}`}
            style={{ 
              backgroundColor: `${statusInfo.color}15`,
              color: statusInfo.color 
            }}
          >
            {statusInfo.label}
          </span>
          <span className="return-date">
            <Calendar size={14} />
            {formatDate(returnItem.requestDate)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="return-card-body">
        {/* Product Preview */}
        <div className="return-preview">
          <div className="preview-image">
            <img 
              src={firstProduct.image} 
              alt={firstProduct.name}
              onError={(e) => {
                // Guard: prevent infinite loop if placeholder also fails
                if (e.target.src.includes('placeholder')) return;
                e.target.src = '/images/placeholders/product.jpg';
              }}
            />
          </div>
          <div className="preview-details">
            <h3 className="product-name">
              {firstProduct.name}
              {remainingCount > 0 && (
                <span className="remaining-count">
                  + {remainingCount} sản phẩm khác
                </span>
              )}
            </h3>
            <div className="return-info">
              <span className="return-reason">
                Lý do: {returnItem.reasonLabel}
              </span>
              <span className="refund-amount">
                Hoàn tiền: {formatCurrency(returnItem.refundAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="return-card-actions">
        <Link 
          href={`/account/returns/${returnItem.id}`}
          className="btn-return-action btn-view"
        >
          Xem chi tiết
        </Link>
        
        {showCancelButton && (
          <button 
            className="btn-return-action btn-cancel"
            onClick={() => onCancel && onCancel(returnItem)}
          >
            Hủy yêu cầu
          </button>
        )}
      </div>
    </article>
  );
}
