'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const Icon = icons[type] || CheckCircle

  return (
    <div className={`toast toast-${type} ${isVisible ? 'visible' : ''}`}>
      <div className="toast-icon">
        <Icon size={20} />
      </div>
      
      <p className="toast-message">{message}</p>
      
      <button 
        onClick={handleClose}
        className="toast-close"
        aria-label="Đóng thông báo"
      >
        <X size={16} />
      </button>
      
      <style jsx>{`
        .toast {
          position: fixed;
          top: 2rem;
          right: 2rem;
          min-width: 300px;
          max-width: 500px;
          padding: 1rem 1.25rem;
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          z-index: 9999;
          opacity: 0;
          transform: translateY(-1rem);
          transition: all 0.3s ease;
          border-left: 4px solid currentColor;
        }
        
        .toast.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .toast-success {
          color: #16a34a;
        }
        
        .toast-error {
          color: #dc2626;
        }
        
        .toast-warning {
          color: #ea580c;
        }
        
        .toast-info {
          color: #2563eb;
        }
        
        .toast-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        
        .toast-message {
          flex: 1;
          margin: 0;
          color: #18181b;
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.5;
        }
        
        .toast-close {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
          height: 1.5rem;
          background: transparent;
          border: none;
          border-radius: 0.25rem;
          color: #71717a;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .toast-close:hover {
          background: #f4f4f5;
          color: #18181b;
        }
        
        @media (max-width: 640px) {
          .toast {
            top: 1rem;
            right: 1rem;
            left: 1rem;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  )
}

// Toast Container để quản lý nhiều toast
export function ToastContainer({ toasts = [], onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map((toast, index) => (
        <div key={toast.id || index} style={{ top: `${2 + index * 5}rem` }}>
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemove?.(toast.id || index)}
          />
        </div>
      ))}
    </div>
  )
}
