'use client'

import { MapPin, Phone, Mail } from 'lucide-react'

export function OrderShipping({ order }) {
  const shippingAddress = order?.shipping_address || {}
  const paymentMethod = order?.payment_method || 'COD'

  const paymentMethodLabels = {
    'COD': 'Thanh toán khi nhận hàng',
    'BankTransfer': 'Chuyển khoản ngân hàng',
    'MoMo': 'Ví điện tử MoMo'
  }

  return (
    <div className="order-shipping-container">
      <h2 className="shipping-title">Thông tin giao hàng</h2>
      
      <div className="shipping-info">
        <div className="info-item">
          <MapPin size={18} className="info-icon" />
          <div className="info-content">
            <div className="info-label">Địa chỉ nhận hàng</div>
            <div className="info-value">
              {shippingAddress.full_name && (
                <div className="recipient-name">{shippingAddress.full_name}</div>
              )}
              <div className="address-line">
                {shippingAddress.street && <span>{shippingAddress.street}</span>}
                {shippingAddress.ward && <span>, {shippingAddress.ward}</span>}
                {shippingAddress.city && <span>, {shippingAddress.city}</span>}
              </div>
            </div>
          </div>
        </div>

        {shippingAddress.phone && (
          <div className="info-item">
            <Phone size={18} className="info-icon" />
            <div className="info-content">
              <div className="info-label">Số điện thoại</div>
              <div className="info-value">{shippingAddress.phone}</div>
            </div>
          </div>
        )}

        {shippingAddress.email && (
          <div className="info-item">
            <Mail size={18} className="info-icon" />
            <div className="info-content">
              <div className="info-label">Email</div>
              <div className="info-value">{shippingAddress.email}</div>
            </div>
          </div>
        )}

        <div className="info-item">
          <div className="info-icon" />
          <div className="info-content">
            <div className="info-label">Phương thức thanh toán</div>
            <div className="info-value">{paymentMethodLabels[paymentMethod] || paymentMethod}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

