'use client'

import { formatCurrency } from '@/lib/formatCurrency'

export function OrderPriceSummary({ order }) {
  const subtotal = order?.subtotal || 0
  const shippingFee = order?.shippingFee || 0
  const discount = order?.discount || 0
  const total = order?.total || order?.total_amount || 0

  return (
    <div className="order-price-summary-container">
      <h2 className="summary-title">Tóm tắt đơn hàng</h2>
      
      <div className="summary-items">
        <div className="summary-item">
          <span className="summary-label">Tạm tính</span>
          <span className="summary-value">{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">Phí vận chuyển</span>
          <span className="summary-value">{formatCurrency(shippingFee)}</span>
        </div>
        
        {discount > 0 && (
          <div className="summary-item">
            <span className="summary-label">Giảm giá</span>
            <span className="summary-value discount">-{formatCurrency(discount)}</span>
          </div>
        )}
      </div>

      <div className="summary-total">
        <span className="total-label">Tổng cộng</span>
        <span className="total-value">{formatCurrency(total)}</span>
      </div>

      {order?.note && (
        <div className="order-note">
          <div className="note-label">Ghi chú:</div>
          <div className="note-content">{order.note}</div>
        </div>
      )}
    </div>
  )
}

