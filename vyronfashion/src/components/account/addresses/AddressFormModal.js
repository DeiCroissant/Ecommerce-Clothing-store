'use client'

import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'

export function AddressFormModal({ address, onSave, onClose }) {
  // Get user info from localStorage
  const getUserInfo = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          return JSON.parse(userStr)
        } catch (e) {
          return null
        }
      }
    }
    return null
  }

  const user = getUserInfo()

  const [formData, setFormData] = useState({
    fullName: address?.full_name || address?.fullName || user?.name || '',
    phone: address?.phone || user?.phone || '',
    email: address?.email || user?.email || '',
    street: address?.street || '',
    ward: address?.ward || '',
    city: address?.city || '',
    isDefault: address?.is_default || address?.isDefault || false,
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await onSave(formData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {address ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </h2>
          <button onClick={onClose} className="btn-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="fullName">Họ và tên *</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={!!user?.name}
              className={user?.name ? 'disabled-input' : ''}
            />
            {user?.name && (
              <p className="form-hint">Thông tin từ tài khoản của bạn</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Số điện thoại *</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={!!user?.phone}
              className={user?.phone ? 'disabled-input' : ''}
            />
            {user?.phone && (
              <p className="form-hint">Thông tin từ tài khoản của bạn</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!!user?.email}
              className={user?.email ? 'disabled-input' : ''}
            />
            {user?.email && (
              <p className="form-hint">Thông tin từ tài khoản của bạn</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="street">Địa chỉ cụ thể *</label>
            <input
              id="street"
              name="street"
              type="text"
              value={formData.street}
              onChange={handleChange}
              placeholder="Số nhà, tên đường"
              required
            />
          </div>

            <div className="form-group">
              <label htmlFor="ward">Phường/Xã *</label>
              <input
                id="ward"
                name="ward"
                type="text"
                value={formData.ward}
                onChange={handleChange}
                required
              />
          </div>

          <div className="form-group">
            <label htmlFor="city">Tỉnh/Thành phố *</label>
            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-checkbox">
            <input
              id="isDefault"
              name="isDefault"
              type="checkbox"
              checked={formData.isDefault}
              onChange={handleChange}
            />
            <label htmlFor="isDefault">Đặt làm địa chỉ mặc định</label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" disabled={saving} className="btn-save">
              <Save size={18} />
              {saving ? 'Đang lưu...' : 'Lưu địa chỉ'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 1rem;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e4e4e7;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #18181b;
          margin: 0;
        }

        .btn-close {
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 0.5rem;
          color: #71717a;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: #f4f4f5;
        }

        .modal-form {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #18181b;
        }

        .form-group input {
          padding: 0.75rem;
          border: 1px solid #e4e4e7;
          border-radius: 0.5rem;
          font-size: 1rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: #18181b;
          box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.1);
        }

        .form-group input.disabled-input {
          background: #f4f4f5;
          color: #71717a;
          cursor: not-allowed;
        }

        .form-hint {
          font-size: 0.75rem;
          color: #71717a;
          margin: 0.25rem 0 0 0;
          font-style: italic;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-checkbox input {
          width: 1.25rem;
          height: 1.25rem;
          cursor: pointer;
        }

        .form-checkbox label {
          font-size: 0.875rem;
          color: #18181b;
          cursor: pointer;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid #e4e4e7;
        }

        .btn-cancel,
        .btn-save {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel {
          background: white;
          border: 1px solid #e4e4e7;
          color: #18181b;
        }

        .btn-cancel:hover {
          background: #f4f4f5;
        }

        .btn-save {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #18181b;
          color: white;
          border: none;
        }

        .btn-save:hover:not(:disabled) {
          background: #27272a;
        }

        .btn-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
