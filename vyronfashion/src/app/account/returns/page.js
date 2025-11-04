'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PageHeader, EmptyState, LoadingSkeleton } from '@/components/account'
import { ReturnList } from '@/features/returns/components/ReturnList'
import { ReturnFilters } from '@/features/returns/components/ReturnFilters'
import { PackageX, Plus } from 'lucide-react'
import { mockReturns } from '@/lib/mockReturnsData'

export default function ReturnsPage() {
  const [returns, setReturns] = useState([])
  const [filteredReturns, setFilteredReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchReturns()
  }, [])

  useEffect(() => {
    filterReturns()
  }, [returns, statusFilter])

  const fetchReturns = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      setTimeout(() => {
        setReturns(mockReturns)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching returns:', error)
      setLoading(false)
    }
  }

  const filterReturns = () => {
    if (statusFilter === 'all') {
      setFilteredReturns(returns)
    } else {
      setFilteredReturns(returns.filter(ret => ret.status === statusFilter))
    }
  }

  if (loading) {
    return (
      <div className="returns-page">
        <PageHeader title="Trả hàng & Hoàn tiền" />
        <LoadingSkeleton type="card" count={2} />
      </div>
    )
  }

  return (
    <div className="returns-page">
      <PageHeader
        title="Trả hàng & Hoàn tiền"
        description="Quản lý yêu cầu trả hàng và hoàn tiền"
        action={
          <Link href="/account/returns/new" className="btn-primary">
            <Plus size={20} />
            Tạo yêu cầu mới
          </Link>
        }
      />

      {returns.length === 0 ? (
        <EmptyState
          icon={PackageX}
          title="Chưa có yêu cầu trả hàng"
          description="Bạn chưa có yêu cầu trả hàng nào"
          actionLabel="Tạo yêu cầu trả hàng"
          actionHref="/account/returns/new"
        />
      ) : (
        <>
          <ReturnFilters activeFilter={statusFilter} onChange={setStatusFilter} />

          {filteredReturns.length === 0 ? (
            <EmptyState
              icon={PackageX}
              title="Không tìm thấy yêu cầu"
              description="Không có yêu cầu nào phù hợp với bộ lọc"
            />
          ) : (
            <ReturnList returns={filteredReturns} />
          )}
        </>
      )}

      <style jsx>{`
        .returns-page {
          max-width: 1200px;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: #18181b;
          color: white;
          border-radius: 0.5rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #27272a;
          transform: translateY(-1px);
        }

        @media (max-width: 640px) {
          .btn-primary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}
