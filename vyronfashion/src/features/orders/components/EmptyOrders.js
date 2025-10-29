import { Package, Search } from 'lucide-react';

export function EmptyOrders({ type = 'no-orders', onAddFirstOrder }) {
  if (type === 'no-results') {
    return (
      <div className="empty-orders empty-results">
        <Search size={64} className="empty-icon" />
        <h3 className="empty-title">Không tìm thấy đơn hàng</h3>
        <p className="empty-description">
          Không có đơn hàng nào phù hợp với bộ lọc của bạn. Thử điều chỉnh bộ lọc hoặc tìm kiếm khác.
        </p>
      </div>
    );
  }

  return (
    <div className="empty-orders empty-no-orders">
      <Package size={64} className="empty-icon" />
      <h3 className="empty-title">Chưa có đơn hàng nào</h3>
      <p className="empty-description">
        Bạn chưa có đơn hàng nào. Hãy khám phá các sản phẩm và bắt đầu mua sắm ngay!
      </p>
      <button 
        className="btn-primary btn-shop-now"
        onClick={() => {
          window.location.href = '/';
        }}
      >
        Bắt đầu mua sắm
      </button>
    </div>
  );
}
