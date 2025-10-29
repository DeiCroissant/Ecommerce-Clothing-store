import { Download, Truck, RotateCcw, MessageCircle, XCircle } from 'lucide-react';
import { canReturnOrder, canCancelOrder, RETURN_WINDOW_DAYS } from '@/lib/mockOrdersData';

export function OrderActions({ order, onCancel, onRequestReturn }) {
  const canReturn = canReturnOrder(order);
  const canCancel = canCancelOrder(order);
  const showTrack = ['shipped', 'processing'].includes(order.status);

  const handleDownloadInvoice = () => {
    // Simulate invoice download
    alert(`Đang tải hóa đơn cho đơn hàng ${order.id}...`);
    console.log('Download invoice:', order.id);
    // TODO: Implement actual PDF generation
  };

  const handleTrackShipment = () => {
    if (order.trackingNumber) {
      window.open(`https://tracking.example.com/${order.trackingNumber}`, '_blank');
    }
  };

  const handleContactSupport = () => {
    // Open support chat or WhatsApp
    const message = encodeURIComponent(`Xin chào, tôi cần hỗ trợ về đơn hàng ${order.id}`);
    window.open(`https://wa.me/1234567890?text=${message}`, '_blank');
  };

  return (
    <div className="order-actions-container">
      <h3 className="actions-title">Thao Tác</h3>

      <div className="actions-list">
        {/* Download Invoice */}
        <button 
          className="action-button btn-invoice"
          onClick={handleDownloadInvoice}
        >
          <Download size={20} />
          <span>Tải hóa đơn</span>
        </button>

        {/* Track Shipment */}
        {showTrack && order.trackingNumber && (
          <button 
            className="action-button btn-track"
            onClick={handleTrackShipment}
          >
            <Truck size={20} />
            <span>Theo dõi vận chuyển</span>
          </button>
        )}

        {/* Cancel Order */}
        {canCancel && (
          <button 
            className="action-button btn-cancel"
            onClick={onCancel}
          >
            <XCircle size={20} />
            <span>Hủy đơn hàng</span>
          </button>
        )}

        {/* Request Return */}
        {canReturn && (
          <button 
            className="action-button btn-return"
            onClick={onRequestReturn}
          >
            <RotateCcw size={20} />
            <span>Yêu cầu trả hàng</span>
          </button>
        )}

        {/* Contact Support */}
        <button 
          className="action-button btn-support"
          onClick={handleContactSupport}
        >
          <MessageCircle size={20} />
          <span>Liên hệ hỗ trợ</span>
        </button>
      </div>

      {/* Return eligibility notice */}
      {order.status === 'delivered' && (
        <div className="return-notice">
          {canReturn ? (
            <p className="notice-text success">
              ✓ Đơn hàng này có thể trả lại trong vòng {RETURN_WINDOW_DAYS} ngày kể từ ngày giao hàng.
            </p>
          ) : (
            <p className="notice-text info">
              ℹ️ Thời gian trả hàng đã hết ({RETURN_WINDOW_DAYS} ngày).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
