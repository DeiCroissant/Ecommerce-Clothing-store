'use client'

import { X } from 'lucide-react'

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmButtonClass = 'btn-confirm-default',
  showCloseButton = true
}) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal-content" onClick={e => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h2 className="confirm-modal-title">{title}</h2>
          {showCloseButton && (
            <button onClick={onClose} className="confirm-modal-close">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>

        <div className="confirm-modal-actions">
          <button onClick={onClose} className="confirm-modal-cancel">
            {cancelText}
          </button>
          <button onClick={handleConfirm} className={confirmButtonClass}>
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        .confirm-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .confirm-modal-content {
          background: white;
          border-radius: 1rem;
          max-width: 450px;
          width: 100%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.2s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .confirm-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e4e4e7;
        }

        .confirm-modal-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #18181b;
          margin: 0;
        }

        .confirm-modal-close {
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

        .confirm-modal-close:hover {
          background: #f4f4f5;
        }

        .confirm-modal-body {
          padding: 1.5rem;
        }

        .confirm-modal-body p {
          margin: 0;
          color: #52525b;
          line-height: 1.6;
          font-size: 0.9375rem;
        }

        .confirm-modal-actions {
          display: flex;
          gap: 0.75rem;
          padding: 1.5rem;
          border-top: 1px solid #e4e4e7;
        }

        .confirm-modal-cancel,
        .btn-confirm-default {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9375rem;
        }

        .confirm-modal-cancel {
          background: white;
          border: 1px solid #e4e4e7;
          color: #18181b;
        }

        .confirm-modal-cancel:hover {
          background: #f4f4f5;
        }

        .btn-confirm-default {
          background: #18181b;
          color: white;
          border: none;
        }

        .btn-confirm-default:hover {
          background: #27272a;
        }

        .btn-confirm-delete {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9375rem;
          background: #dc2626;
          color: white;
          border: none;
        }

        .btn-confirm-delete:hover {
          background: #b91c1c;
        }
      `}</style>
    </div>
  )
}

