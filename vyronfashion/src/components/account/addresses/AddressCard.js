'use client'

import { MapPin, Edit2, Trash2, Star } from 'lucide-react'
import { getAddressLabelInfo, formatFullAddress } from '@/lib/account/mockAddressData'

export function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  const labelInfo = getAddressLabelInfo(address.label)

  return (
    <div className="address-card">
      {/* Header */}
      <div className="address-card-header">
        <div className="address-label">
          <span className="label-icon">{labelInfo.icon}</span>
          <span className="label-text">{labelInfo.text}</span>
        </div>
        {address.isDefault && (
          <span className="default-badge">
            <Star size={14} fill="currentColor" />
            Mặc định
          </span>
        )}
      </div>

      {/* Body */}
      <div className="address-card-body">
        <div className="recipient-info">
          <h3 className="recipient-name">{address.recipientName}</h3>
          <p className="recipient-phone">{address.phone}</p>
        </div>

        <div className="address-details">
          <MapPin size={16} />
          <div className="address-text">
            <p>{address.address}</p>
            <p>{address.ward}, {address.district}</p>
            <p>{address.province}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="address-card-actions">
        <button
          onClick={() => onEdit(address.id)}
          className="btn-action btn-edit"
          type="button"
        >
          <Edit2 size={16} />
          <span>Chỉnh sửa</span>
        </button>

        <button
          onClick={() => onDelete(address.id)}
          className="btn-action btn-delete"
          type="button"
        >
          <Trash2 size={16} />
          <span>Xóa</span>
        </button>

        {!address.isDefault && (
          <button
            onClick={() => onSetDefault(address.id)}
            className="btn-action btn-set-default"
            type="button"
          >
            <Star size={16} />
            <span>Đặt mặc định</span>
          </button>
        )}
      </div>
    </div>
  )
}
