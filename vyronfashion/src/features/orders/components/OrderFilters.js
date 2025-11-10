'use client'

import { Filter } from 'lucide-react'

const statusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipped', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'returned', label: 'Đã trả' },
]

export function OrderFilters({ activeFilter, onChange }) {
  return (
    <div className="order-filters">
      <div className="filter-wrapper">
        <Filter size={18} className="filter-icon" />
        <select
          value={activeFilter}
          onChange={(e) => onChange(e.target.value)}
          className="filter-select"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <style jsx>{`
        .order-filters {
          display: flex;
          align-items: center;
        }

        .filter-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: 1px solid #e4e4e7;
          border-radius: 0.5rem;
          background: white;
        }

        .filter-icon {
          color: #71717a;
        }

        .filter-select {
          border: none;
          outline: none;
          font-size: 0.875rem;
          font-weight: 500;
          color: #18181b;
          background: transparent;
          cursor: pointer;
          min-width: 150px;
        }

        .filter-select:focus {
          outline: none;
        }

        @media (max-width: 640px) {
          .filter-wrapper {
            width: 100%;
          }

          .filter-select {
            flex: 1;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  )
}

