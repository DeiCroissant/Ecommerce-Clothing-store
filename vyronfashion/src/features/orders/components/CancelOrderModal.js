import { AlertTriangle, X } from 'lucide-react';
import { formatCurrency } from '@/lib/mockOrdersData';

export function CancelOrderModal({ order, onConfirm, onClose }) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content cancel-order-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrapper">
            <AlertTriangle size={24} className="warning-icon" />
            <h3 className="modal-title">Xác nhận hủy đơn hàng</h3>
          </div>
          <button 
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p className="confirm-message">
            Bạn có chắc chắn muốn hủy đơn hàng này?
          </p>

          {/* Order Preview */}
          <div className="order-preview">
            <div className="order-preview-header">
              <span className="preview-label">Đơn hàng:</span>
              <span className="preview-order-id">{order.id}</span>
            </div>
            <div className="order-preview-body">
              <div className="preview-item">
                <span className="preview-label">Tổng giá trị:</span>
                <span className="preview-value">{formatCurrency(order.total)}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Số sản phẩm:</span>
                <span className="preview-value">{order.itemsCount} sản phẩm</span>
              </div>
            </div>
          </div>

          <div className="warning-box">
            <AlertTriangle size={16} />
            <p className="warning-text">
              Sau khi hủy, bạn sẽ không thể khôi phục đơn hàng này. Nếu đã thanh toán,
              số tiền sẽ được hoàn lại trong 5-7 ngày làm việc.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            className="btn-secondary"
            onClick={onClose}
          >
            Quay lại
          </button>
          <button 
            className="btn-danger"
            onClick={() => {
              onConfirm(order.id);
              onClose();
            }}
          >
            <X size={18} />
            Hủy đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}
