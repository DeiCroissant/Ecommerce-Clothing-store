'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

export function ChangePassword({ user }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [errors, setErrors] = useState({})

  const validatePassword = (password) => {
    const errors = []
    if (password.length < 8) {
      errors.push('Mật khẩu phải có ít nhất 8 ký tự')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ hoa')
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt')
    }
    return errors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Clear message when user types
    if (message.text) {
      setMessage({ type: '', text: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate
    const newErrors = {}
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại'
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới'
    } else {
      const passwordErrors = validatePassword(formData.newPassword)
      if (passwordErrors.length > 0) {
        newErrors.newPassword = passwordErrors.join(', ')
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('http://localhost:8000/api/security/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          current_password: formData.currentPassword,
          new_password: formData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage({ 
          type: 'success', 
          text: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.' 
        })
        
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        
        // Optionally logout after 3 seconds
        setTimeout(() => {
          localStorage.removeItem('user')
          window.location.href = '/'
        }, 3000)
      } else {
        throw new Error(data.detail || 'Không thể đổi mật khẩu')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++
    
    if (strength <= 2) return { strength: 33, label: 'Yếu', color: '#ef4444' }
    if (strength <= 4) return { strength: 66, label: 'Trung bình', color: '#f59e0b' }
    return { strength: 100, label: 'Mạnh', color: '#22c55e' }
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)

  return (
    <div className="change-password">
      <form onSubmit={handleSubmit}>
        {/* Current Password */}
        <div className="form-group">
          <label htmlFor="currentPassword">
            <Lock className="label-icon" />
            Mật khẩu hiện tại
          </label>
          <div className="input-wrapper">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu hiện tại"
              disabled={loading}
              className={errors.currentPassword ? 'error' : ''}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="toggle-password"
              disabled={loading}
            >
              {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.currentPassword && (
            <span className="error-text">{errors.currentPassword}</span>
          )}
        </div>

        {/* New Password */}
        <div className="form-group">
          <label htmlFor="newPassword">
            <Lock className="label-icon" />
            Mật khẩu mới
          </label>
          <div className="input-wrapper">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu mới"
              disabled={loading}
              className={errors.newPassword ? 'error' : ''}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="toggle-password"
              disabled={loading}
            >
              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword && (
            <span className="error-text">{errors.newPassword}</span>
          )}
          
          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="password-strength">
              <div className="strength-bar">
                <div 
                  className="strength-fill" 
                  style={{ 
                    width: `${passwordStrength.strength}%`,
                    backgroundColor: passwordStrength.color
                  }}
                />
              </div>
              <span 
                className="strength-label"
                style={{ color: passwordStrength.color }}
              >
                {passwordStrength.label}
              </span>
            </div>
          )}
          
          {/* Password Requirements */}
          <div className="password-requirements">
            <p className="requirements-title">Yêu cầu mật khẩu:</p>
            <ul>
              <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>
                Ít nhất 8 ký tự
              </li>
              <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                Ít nhất 1 chữ hoa
              </li>
              <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword) ? 'valid' : ''}>
                Ít nhất 1 ký tự đặc biệt
              </li>
            </ul>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label htmlFor="confirmPassword">
            <Lock className="label-icon" />
            Xác nhận mật khẩu mới
          </label>
          <div className="input-wrapper">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu mới"
              disabled={loading}
              className={errors.confirmPassword ? 'error' : ''}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="toggle-password"
              disabled={loading}
            >
              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="error-text">{errors.confirmPassword}</span>
          )}
        </div>

        {/* Message */}
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="message-icon" />
            ) : (
              <AlertCircle className="message-icon" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </button>
      </form>

      <style jsx>{`
        .change-password {
          width: 100%;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #18181b;
        }

        .label-icon {
          width: 16px;
          height: 16px;
          color: #71717a;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          padding-right: 3rem;
          border: 1px solid #e4e4e7;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #18181b;
          box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.1);
        }

        input.error {
          border-color: #ef4444;
        }

        input:disabled {
          background-color: #f4f4f5;
          cursor: not-allowed;
        }

        .toggle-password {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: #71717a;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .toggle-password:hover:not(:disabled) {
          color: #18181b;
        }

        .toggle-password:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .error-text {
          font-size: 0.75rem;
          color: #ef4444;
        }

        .password-strength {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.25rem;
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          background-color: #e4e4e7;
          border-radius: 2px;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          transition: width 0.3s, background-color 0.3s;
        }

        .strength-label {
          font-size: 0.75rem;
          font-weight: 600;
          min-width: 80px;
          text-align: right;
        }

        .password-requirements {
          padding: 0.75rem;
          background-color: #f4f4f5;
          border-radius: 6px;
          margin-top: 0.5rem;
        }

        .requirements-title {
          margin: 0 0 0.5rem 0;
          font-size: 0.75rem;
          font-weight: 600;
          color: #52525b;
        }

        .password-requirements ul {
          margin: 0;
          padding-left: 1.25rem;
          list-style: none;
        }

        .password-requirements li {
          font-size: 0.75rem;
          color: #71717a;
          position: relative;
          padding-left: 0.5rem;
        }

        .password-requirements li::before {
          content: '○';
          position: absolute;
          left: -0.75rem;
        }

        .password-requirements li.valid {
          color: #22c55e;
        }

        .password-requirements li.valid::before {
          content: '✓';
          font-weight: bold;
        }

        .message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
        }

        .message.success {
          background-color: #f0fdf4;
          color: #16a34a;
          border: 1px solid #22c55e;
        }

        .message.error {
          background-color: #fef2f2;
          color: #dc2626;
          border: 1px solid #ef4444;
        }

        .message-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: #18181b;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #27272a;
        }
      `}</style>
    </div>
  )
}

