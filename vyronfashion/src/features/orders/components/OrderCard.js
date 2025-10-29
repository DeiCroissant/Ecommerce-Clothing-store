import { Package, MapPin, Calendar, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate, getStatusInfo, PAYMENT_METHODS } from '@/lib/mockOrdersData';

export function OrderCard({ order, onReorder }) {
  const statusInfo = getStatusInfo(order.status);
  const firstItem = order.items[0];
  const remainingCount = order.itemsCount - 1;

  // Determine which actions to show based on status
  const showTrackButton = ['shipped', 'processing'].includes(order.status);
  const showReorderButton = ['delivered', 'cancelled', 'returned'].includes(order.status);
  const showCancelButton = order.status === 'pending';

  return (
    <article className="order-card">
      {/* Header */}
      <div className="order-card-header">
        <div className="order-id-section">
          <Package size={20} />
          <span className="order-id">{order.id}</span>
        </div>
        
        <div className="order-meta">
          <span 
            className={`status-pill status-${order.status}`}
            style={{ 
              backgroundColor: `${statusInfo.color}15`,
              color: statusInfo.color 
            }}
          >
            {statusInfo.label}
          </span>
          <span className="order-date">
            <Calendar size={14} />
            {formatDate(order.orderDate)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="order-card-body">
        {/* Product Preview */}
        <div className="order-preview">
          <div className="preview-image">
            <img 
              src={firstItem.image} 
              alt={firstItem.name}
              onError={(e) => {
                e.target.src = '/images/placeholders/product.jpg';
              }}
            />
          </div>
          <div className="preview-details">
            <h3 className="product-name">
              {firstItem.name}
              {remainingCount > 0 && (
                <span className="remaining-count">
                  + {remainingCount} sản phẩm khác
                </span>
              )}
            </h3>
            <div className="order-summary">
              <span className="items-count">
                {order.itemsCount} sản phẩm
              </span>
              <span className="order-total">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="order-info">
          <div className="info-item">
            <MapPin size={14} />
            <span>{order.shippingAddress.recipientName}</span>
          </div>
          <div className="info-item">
            <CreditCard size={14} />
            <span>{PAYMENT_METHODS[order.paymentMethod]}</span>
          </div>
          {order.trackingNumber && (
            <div className="info-item tracking-number">
              <span>Mã vận đơn: {order.trackingNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="order-card-actions">
        <Link 
          href={`/account/orders/${order.id}`}
          className="btn-order-action btn-view"
        >
          Xem chi tiết
        </Link>
        
        {showTrackButton && order.trackingNumber && (
          <button 
            className="btn-order-action btn-track"
            onClick={() => {
              // Open tracking in new window
              window.open(`https://tracking.example.com/${order.trackingNumber}`, '_blank');
            }}
          >
            Theo dõi
          </button>
        )}
        
        {showReorderButton && (
          <button 
            className="btn-order-action btn-reorder"
            onClick={() => onReorder && onReorder(order)}
          >
            Mua lại
          </button>
        )}
        
        {showCancelButton && (
          <button 
            className="btn-order-action btn-cancel"
            onClick={() => {
              // Handle cancel order
              if (confirm(`Bạn có chắc muốn hủy đơn hàng ${order.id}?`)) {
                console.log('Cancel order:', order.id);
                // TODO: Implement cancel logic
              }
            }}
          >
            Hủy đơn
          </button>
        )}
      </div>
    </article>
  );
}
