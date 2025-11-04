'use client'

import { X } from 'lucide-react'

export function DeleteConfirmModal({ onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Xác nhận xóa</h2>
          <button onClick={onClose} className="btn-close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p>Bạn có chắc chắn muốn xóa địa chỉ này không? Hành động này không thể hoàn tác.</p>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">
            Hủy
          </button>
          <button onClick={onConfirm} className="btn-delete">
            Xóa địa chỉ
          </button>
        </div>
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
          max-width: 400px;
          width: 100%;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e4e4e7;
        }

        .modal-title {
          font-size: 1.125rem;
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

        .modal-body {
          padding: 1.5rem;
        }

        .modal-body p {
          margin: 0;
          color: #71717a;
          line-height: 1.6;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          padding: 1.5rem;
          border-top: 1px solid #e4e4e7;
        }

        .btn-cancel,
        .btn-delete {
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

        .btn-delete {
          background: #dc2626;
          color: white;
          border: none;
        }

        .btn-delete:hover {
          background: #b91c1c;
        }
      `}</style>
    </div>
  )
}
