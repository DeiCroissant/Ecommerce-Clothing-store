import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatDate, getStatusInfo } from '@/lib/mockOrdersData';

export function OrderDetailHeader({ order }) {
  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="order-detail-header">
      <Link href="/account/orders" className="back-button">
        <ArrowLeft size={20} />
        <span>Quay lại danh sách</span>
      </Link>

      <div className="header-content">
        <h1 className="order-title">Chi Tiết Đơn Hàng</h1>
        
        <div className="order-meta">
          <span className="order-id">{order.id}</span>
          <span className="separator">•</span>
          <span 
            className={`status-pill status-${order.status}`}
            style={{ 
              backgroundColor: `${statusInfo.color}15`,
              color: statusInfo.color 
            }}
          >
            {statusInfo.label}
          </span>
          <span className="separator">•</span>
          <span className="order-date">{formatDate(order.orderDate)}</span>
        </div>
      </div>
    </div>
  );
}
