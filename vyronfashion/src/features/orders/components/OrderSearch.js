'use client'

import { Search } from 'lucide-react'

export function OrderSearch({ value, onChange }) {
  return (
    <div className="order-search">
      <Search size={18} className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tìm kiếm theo mã đơn hàng hoặc sản phẩm..."
        className="search-input"
      />
      
      <style jsx>{`
        .order-search {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          max-width: 500px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: #71717a;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border: 1px solid #e4e4e7;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #18181b;
          box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.1);
        }

        .search-input::placeholder {
          color: #a1a1aa;
        }

        @media (max-width: 640px) {
          .order-search {
            max-width: 100%;
          }

          .search-input {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

