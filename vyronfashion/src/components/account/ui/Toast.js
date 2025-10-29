'use client'

import { useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, X, RotateCcw } from 'lucide-react'

export function Toast({ type = 'success', message, onClose, onUndo, duration = 5000 }) {
  useEffect(() => {
    if (!onUndo) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose, onUndo])

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />,
  }

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <div className="toast-icon">{icons[type]}</div>
        <p className="toast-message">{message}</p>
      </div>
      
      <div className="toast-actions">
        {onUndo && (
          <button onClick={onUndo} className="toast-undo">
            <RotateCcw size={16} />
            Hoàn tác
          </button>
        )}
        <button onClick={onClose} className="toast-close" aria-label="Đóng">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
