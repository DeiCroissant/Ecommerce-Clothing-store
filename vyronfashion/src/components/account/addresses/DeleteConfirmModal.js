'use client'

import { X, AlertTriangle, MapPin, Trash2 } from 'lucide-react'
import { getAddressLabelInfo } from '@/lib/account/mockAddressData'

export function DeleteConfirmModal({ address, onConfirm, onCancel }) {
  if (!address) return null

  const labelInfo = getAddressLabelInfo(address.label)

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrapper">
            <AlertTriangle size={24} className="warning-icon" />
            <h2 className="modal-title">Xác nhận xóa địa chỉ</h2>
          </div>
          <button
            onClick={onCancel}
            className="modal-close"
            aria-label="Đóng"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p className="confirm-message">
            Bạn có chắc muốn xóa địa chỉ sau?
          </p>

          <div className="address-preview">
            <div className="address-preview-header">
              <span className="label-icon">{labelInfo.icon}</span>
              <span className="label-text">{labelInfo.text}</span>
            </div>
            <div className="address-preview-body">
              <p className="recipient-name">{address.recipientName}</p>
              <p className="recipient-phone">{address.phone}</p>
              <div className="address-text">
                <MapPin size={14} />
                <span>
                  {address.address}, {address.ward}, {address.district}, {address.province}
                </span>
              </div>
            </div>
          </div>

          <p className="warning-text">
            Hành động này không thể hoàn tác.
          </p>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            onClick={onCancel}
            className="btn-secondary"
            type="button"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="btn-danger"
            type="button"
          >
            <Trash2 size={18} />
            Xóa địa chỉ
          </button>
        </div>
      </div>
    </div>
  )
}
