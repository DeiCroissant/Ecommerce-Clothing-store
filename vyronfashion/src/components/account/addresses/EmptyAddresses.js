'use client'

import { MapPin, Plus } from 'lucide-react'

export function EmptyAddresses({ onAddAddress }) {
  return (
    <div className="empty-addresses">
      <div className="empty-icon">
        <MapPin size={64} strokeWidth={1.5} />
      </div>
      
      <h3 className="empty-title">Chưa có địa chỉ giao hàng</h3>
      
      <p className="empty-description">
        Thêm địa chỉ giao hàng để việc thanh toán trở nên nhanh chóng và thuận tiện hơn
      </p>
      
      <button onClick={onAddAddress} className="btn-add">
        <Plus size={20} />
        Thêm địa chỉ mới
      </button>

      <style jsx>{`
        .empty-addresses {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          background: white;
          border-radius: 1rem;
          border: 2px dashed #e4e4e7;
        }

        .empty-icon {
          color: #a1a1aa;
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #18181b;
          margin: 0 0 0.75rem 0;
        }

        .empty-description {
          font-size: 1rem;
          color: #71717a;
          max-width: 400px;
          margin: 0 0 2rem 0;
          line-height: 1.6;
        }

        .btn-add {
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

        .btn-add:hover {
          background: #27272a;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  )
}
