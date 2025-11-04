'use client'

import { useState } from 'react'
import { Save, Loader } from 'lucide-react'

export function ProfileForm({ user, onUpdate }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vui lòng nhập tên'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Vui lòng nhập họ'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setSaving(true)
      await onUpdate(formData)
      alert('Cập nhật thông tin thành công!')
    } catch (error) {
      console.error('Error saving:', error)
      alert('Cập nhật thất bại. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">
            Tên <span className="required">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            className={`form-input ${errors.firstName ? 'error' : ''}`}
          />
          {errors.firstName && <p className="form-error">{errors.firstName}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="lastName" className="form-label">
            Họ <span className="required">*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            className={`form-input ${errors.lastName ? 'error' : ''}`}
          />
          {errors.lastName && <p className="form-error">{errors.lastName}</p>}
        </div>
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
          onChange={handleChange}
          className={`form-input ${errors.email ? 'error' : ''}`}
        />
        {errors.email && <p className="form-error">{errors.email}</p>}
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
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="dateOfBirth" className="form-label">
            Ngày sinh
          </label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender" className="form-label">
            Giới tính
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Chọn giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
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

        .form-input.error {
          border-color: #dc2626;
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
