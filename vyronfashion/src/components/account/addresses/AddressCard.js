'use client'

import { MapPin, Edit2, Trash2, Star } from 'lucide-react'

export function AddressCard({ address, onEdit, onDelete }) {
  const isDefault = address.is_default || address.isDefault
  
  return (
    <div className={`address-card ${isDefault ? 'default' : ''}`}>
      {isDefault && (
        <div className="default-badge">
          <Star size={14} fill="currentColor" />
          Mặc định
        </div>
      )}

      <div className="address-header">
        <div className="address-icon">
          <MapPin size={20} />
        </div>
        <div className="address-info">
          <h3 className="address-name">{address.full_name || address.fullName}</h3>
          <p className="address-phone">{address.phone}</p>
        </div>
      </div>

      <div className="address-body">
        <p className="address-street">{address.street}</p>
        <p className="address-location">
          {[address.ward, address.city].filter(Boolean).join(', ')}
        </p>
      </div>

      <div className="address-actions">
        <button onClick={onEdit} className="btn-edit">
          <Edit2 size={16} />
          Chỉnh sửa
        </button>
        <button onClick={onDelete} className="btn-delete">
          <Trash2 size={16} />
          Xóa
        </button>
      </div>

      <style jsx>{`
        .address-card {
          background: white;
          border: 1px solid #e4e4e7;
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 0.2s;
          position: relative;
        }

        .address-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .address-card.default {
          border-color: #18181b;
          background: #fafafa;
          border-width: 2px;
        }

        .default-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          background: #18181b;
          color: white;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .address-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .address-icon {
          flex-shrink: 0;
          width: 2.5rem;
          height: 2.5rem;
          background: #f4f4f5;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #71717a;
        }

        .address-info {
          flex: 1;
        }

        .address-name {
          font-size: 1rem;
          font-weight: 600;
          color: #18181b;
          margin: 0 0 0.25rem 0;
        }

        .address-phone {
          font-size: 0.875rem;
          color: #71717a;
          margin: 0;
        }

        .address-body {
          margin-bottom: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 0.5rem;
        }

        .address-street {
          font-size: 0.875rem;
          color: #18181b;
          margin: 0 0 0.5rem 0;
          font-weight: 500;
        }

        .address-location {
          font-size: 0.875rem;
          color: #71717a;
          margin: 0;
        }

        .address-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-edit,
        .btn-delete {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          border: 1px solid #e4e4e7;
          border-radius: 0.5rem;
          background: white;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-edit {
          color: #18181b;
        }

        .btn-edit:hover {
          background: #f4f4f5;
          border-color: #d4d4d8;
        }

        .btn-delete {
          color: #dc2626;
        }

        .btn-delete:hover {
          background: #fef2f2;
          border-color: #fecaca;
        }
      `}</style>
    </div>
  )
}
