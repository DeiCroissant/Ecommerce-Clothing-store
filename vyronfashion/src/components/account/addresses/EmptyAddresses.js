'use client'

import { MapPin, Plus } from 'lucide-react'

export function EmptyAddresses({ onAddAddress }) {
  return (
    <div className="empty-addresses">
      <div className="empty-icon">
        <MapPin size={64} strokeWidth={1.5} />
      </div>
      <h3 className="empty-title">Chưa có địa chỉ nào</h3>
      <p className="empty-description">
        Thêm địa chỉ giao hàng để thanh toán nhanh hơn
      </p>
      <button onClick={onAddAddress} className="btn-primary btn-add-first">
        <Plus size={20} />
        Thêm địa chỉ mới
      </button>
    </div>
  )
}
