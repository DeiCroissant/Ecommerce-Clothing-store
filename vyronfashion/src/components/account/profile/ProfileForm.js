'use client'

import { useState, useEffect } from 'react'
import { Save, Loader } from 'lucide-react'

export function ProfileForm({ user, onUpdate }) {
  // Load data from database - user.name, user.email, user.phone
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // Update formData when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}

    // Only validate phone (name and email are read-only)
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setSaving(true)
      // Only send phone (name and email are read-only)
      await onUpdate({ phone: formData.phone })
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Cập nhật số điện thoại thành công!', type: 'success', duration: 3000 } 
        }));
      }
    } catch (error) {
      console.error('Error saving:', error)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Cập nhật thất bại. Vui lòng thử lại.', type: 'error', duration: 3000 } 
        }));
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Tên <span className="required">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          disabled
          readOnly
          className="form-input disabled"
        />
        <p className="form-hint">Tên không thể chỉnh sửa</p>
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email <span className="required">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          disabled
          readOnly
          className="form-input disabled"
        />
        <p className="form-hint">Email không thể chỉnh sửa</p>
      </div>

      <div className="form-group">
        <label htmlFor="phone" className="form-label">
          Số điện thoại
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          className={`form-input ${errors.phone ? 'error' : ''}`}
          placeholder="0912345678"
        />
        {errors.phone && <p className="form-error">{errors.phone}</p>}
        {!errors.phone && <p className="form-hint">Nhập số điện thoại của bạn (10-11 số)</p>}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={saving} className="btn-save">
          {saving ? (
            <>
              <Loader size={18} className="spinner" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save size={18} />
              Lưu thay đổi
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr 1fr;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #18181b;
        }

        .required {
          color: #dc2626;
        }

        .form-input {
          padding: 0.75rem;
          border: 1px solid #e4e4e7;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: all 0.2s;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: #18181b;
          box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.1);
        }

        .form-input.disabled {
          background: #f4f4f5;
          color: #71717a;
          cursor: not-allowed;
          border-color: #e4e4e7;
        }

        .form-input.error {
          border-color: #dc2626;
        }

        .form-hint {
          font-size: 0.75rem;
          color: #71717a;
          margin: 0.25rem 0 0 0;
        }

        .form-error {
          font-size: 0.875rem;
          color: #dc2626;
          margin: 0;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #f4f4f5;
        }

        .btn-save {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #18181b;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-save:hover:not(:disabled) {
          background: #27272a;
        }

        .btn-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            justify-content: stretch;
          }

          .btn-save {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </form>
  )
}
