'use client'

import { useState } from 'react'
import { AlertCircle, X } from 'lucide-react'

export function EmailVerificationBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState('')

  const handleResendEmail = async () => {
    setIsSending(true)
    setMessage('')

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    setMessage('Email xác thực đã được gửi! Vui lòng kiểm tra hộp thư của bạn.')
    setIsSending(false)

    // Auto hide message after 5s
    setTimeout(() => setMessage(''), 5000)
  }

  if (!isVisible) return null

  return (
    <div className="email-verification-banner">
      <div className="banner-content">
        <AlertCircle size={20} className="banner-icon" />
        <div className="banner-text">
          <strong>Email chưa được xác thực</strong>
          <p>Vui lòng xác thực email để bảo mật tài khoản và nhận thông báo đơn hàng.</p>
        </div>
      </div>
      
      <div className="banner-actions">
        <button
          onClick={handleResendEmail}
          disabled={isSending}
          className="resend-btn"
        >
          {isSending ? 'Đang gửi...' : 'Gửi lại email xác minh'}
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="close-btn"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}
    </div>
  )
}
