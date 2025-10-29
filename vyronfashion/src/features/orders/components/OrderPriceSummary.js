import { formatCurrency, PAYMENT_METHODS } from '@/lib/mockOrdersData';

export function OrderPriceSummary({ subtotal, shipping, discount, total, paymentMethod }) {
  return (
    <div className="order-price-summary">
      <h3 className="summary-title">Tổng Cộng</h3>

      <div className="summary-items">
        <div className="summary-item">
          <span className="summary-label">Tạm tính</span>
          <span className="summary-value">{formatCurrency(subtotal)}</span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Phí vận chuyển</span>
          <span className="summary-value">
            {shipping > 0 ? formatCurrency(shipping) : 'Miễn phí'}
          </span>
        </div>

        {discount > 0 && (
          <div className="summary-item discount">
            <span className="summary-label">Giảm giá</span>
            <span className="summary-value">-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className="summary-divider" />

        <div className="summary-item total">
          <span className="summary-label">Tổng cộng</span>
          <span className="summary-value">{formatCurrency(total)}</span>
        </div>

        <div className="payment-info">
          <span className="payment-label">Phương thức thanh toán:</span>
          <span className="payment-method">{PAYMENT_METHODS[paymentMethod]}</span>
        </div>
      </div>
    </div>
  );
}
