import { MapPin, Phone, User } from 'lucide-react';

export function OrderShipping({ shippingAddress, trackingNumber }) {
  return (
    <div className="order-shipping-container">
      <h3 className="shipping-title">Thông Tin Giao Hàng</h3>

      <div className="shipping-details">
        <div className="shipping-item">
          <User size={18} className="shipping-icon" />
          <div className="shipping-content">
            <span className="shipping-label">Người nhận</span>
            <span className="shipping-value">{shippingAddress.recipientName}</span>
          </div>
        </div>

        <div className="shipping-item">
          <Phone size={18} className="shipping-icon" />
          <div className="shipping-content">
            <span className="shipping-label">Số điện thoại</span>
            <span className="shipping-value">{shippingAddress.phone}</span>
          </div>
        </div>

        <div className="shipping-item">
          <MapPin size={18} className="shipping-icon" />
          <div className="shipping-content">
            <span className="shipping-label">Địa chỉ</span>
            <span className="shipping-value">{shippingAddress.fullAddress}</span>
          </div>
        </div>

        {trackingNumber && (
          <div className="tracking-info">
            <span className="tracking-label">Mã vận đơn:</span>
            <span className="tracking-number">{trackingNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
}
