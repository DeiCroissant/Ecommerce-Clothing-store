'use client'

import { useState } from 'react'
import { Shield, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'

export function TwoFactorAuth({ user, enabled, onToggle }) {
  const [isEnabled, setIsEnabled] = useState(enabled)
  const [loading, setLoading] = useState(false)
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleEnable = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('http://localhost:8000/api/security/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsEnabled(true)
        onToggle(true)
        setMessage({ 
          type: 'success', 
          text: 'Đã bật xác thực 2FA thành công! Bạn sẽ nhận mã qua email khi đăng nhập.' 
        })
      } else {
        throw new Error(data.detail || 'Không thể bật 2FA')
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    if (!password) {
      setMessage({ type: 'error', text: 'Vui lòng nhập mật khẩu' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('http://localhost:8000/api/security/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id,
          password: password
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsEnabled(false)
        onToggle(false)
        setShowDisableConfirm(false)
        setPassword('')
        setMessage({ 
          type: 'success', 
          text: 'Đã tắt xác thực 2FA thành công!' 
        })
      } else {
        throw new Error(data.detail || 'Không thể tắt 2FA')
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelDisable = () => {
    setShowDisableConfirm(false)
    setPassword('')
    setMessage({ type: '', text: '' })
  }

  return (
    <div className="two-factor-auth">
      {/* Status Badge */}
      <div className={`status-badge ${isEnabled ? 'enabled' : 'disabled'}`}>
        <Shield className="icon" />
        <div className="status-text">
          <span className="label">Trạng thái:</span>
          <span className="value">{isEnabled ? 'Đã bật' : 'Chưa bật'}</span>
        </div>
      </div>

      {/* Description */}
      <div className="description">
        <Mail className="mail-icon" />
        <p>
          Xác thực hai yếu tố (2FA) giúp bảo vệ tài khoản của bạn bằng cách yêu cầu mã xác thực 
          được gửi qua email mỗi khi đăng nhập.
        </p>
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

      {/* Enable/Disable Section */}
      {!showDisableConfirm ? (
        <div className="action-section">
          {!isEnabled ? (
            <button
              onClick={handleEnable}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Đang xử lý...' : 'Bật xác thực 2FA'}
            </button>
          ) : (
            <button
              onClick={() => setShowDisableConfirm(true)}
              disabled={loading}
              className="btn btn-danger"
            >
              Tắt xác thực 2FA
            </button>
          )}
        </div>
      ) : (
        <div className="confirm-section">
          <div className="confirm-header">
            <AlertCircle className="warning-icon" />
            <h4>Xác nhận tắt 2FA</h4>
          </div>
          <p className="confirm-text">
            Nhập mật khẩu của bạn để xác nhận tắt xác thực hai yếu tố:
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            className="password-input"
            disabled={loading}
          />
          <div className="confirm-actions">
            <button
              onClick={handleDisable}
              disabled={loading || !password}
              className="btn btn-danger"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận tắt'}
            </button>
            <button
              onClick={handleCancelDisable}
              disabled={loading}
              className="btn btn-secondary"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .two-factor-auth {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          border: 2px solid;
        }

        .status-badge.enabled {
          background-color: #f0fdf4;
          border-color: #22c55e;
        }

        .status-badge.disabled {
          background-color: #fef2f2;
          border-color: #ef4444;
        }

        .status-badge .icon {
          width: 24px;
          height: 24px;
        }

        .status-badge.enabled .icon {
          color: #22c55e;
        }

        .status-badge.disabled .icon {
          color: #ef4444;
        }

        .status-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .status-text .label {
          font-size: 0.875rem;
          color: #71717a;
        }

        .status-text .value {
          font-size: 1rem;
          font-weight: 600;
        }

        .status-badge.enabled .value {
          color: #16a34a;
        }

        .status-badge.disabled .value {
          color: #dc2626;
        }

        .description {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background-color: #f4f4f5;
          border-radius: 8px;
        }

        .mail-icon {
          width: 20px;
          height: 20px;
          color: #71717a;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .description p {
          margin: 0;
          font-size: 0.875rem;
          color: #52525b;
          line-height: 1.6;
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

        .action-section {
          display: flex;
          justify-content: flex-start;
        }

        .confirm-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem;
          background-color: #fef2f2;
          border: 2px solid #ef4444;
          border-radius: 8px;
        }

        .confirm-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .warning-icon {
          width: 24px;
          height: 24px;
          color: #dc2626;
        }

        .confirm-header h4 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #18181b;
        }

        .confirm-text {
          margin: 0;
          font-size: 0.875rem;
          color: #52525b;
        }

        .password-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e4e4e7;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .password-input:focus {
          outline: none;
          border-color: #18181b;
          box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.1);
        }

        .password-input:disabled {
          background-color: #f4f4f5;
          cursor: not-allowed;
        }

        .confirm-actions {
          display: flex;
          gap: 0.75rem;
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

        .btn-danger {
          background-color: #dc2626;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background-color: #b91c1c;
        }

        .btn-secondary {
          background-color: #f4f4f5;
          color: #18181b;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #e4e4e7;
        }
      `}</style>
    </div>
  )
}

