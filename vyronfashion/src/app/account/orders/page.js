'use client'

import { useState, useEffect } from 'react'
import { PageHeader, EmptyState, LoadingSkeleton } from '@/components/account'
import { OrderList } from '@/features/orders/components/OrderList'
import { OrderFilters } from '@/features/orders/components/OrderFilters'
import { OrderSearch } from '@/features/orders/components/OrderSearch'
import { Package } from 'lucide-react'
import { mockOrders } from '@/lib/mockOrdersData'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const response = await fetch('/api/orders')
      // const data = await response.json()
      
      // Mock data for now
      setTimeout(() => {
        setOrders(mockOrders)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    setFilteredOrders(filtered)
  }

  if (loading) {
    return (
      <div className="orders-page">
        <PageHeader title="Đơn hàng của tôi" />
        <LoadingSkeleton type="card" count={3} />
      </div>
    )
  }

  return (
    <div className="orders-page">
      <PageHeader
        title="Đơn hàng của tôi"
        description="Theo dõi và quản lý đơn hàng của bạn"
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Chưa có đơn hàng nào"
          description="Bạn chưa đặt đơn hàng nào. Hãy khám phá sản phẩm và đặt hàng ngay!"
          actionLabel="Mua sắm ngay"
          actionHref="/"
        />
      ) : (
        <>
          <div className="orders-controls">
            <OrderSearch value={searchQuery} onChange={setSearchQuery} />
            <OrderFilters activeFilter={statusFilter} onChange={setStatusFilter} />
          </div>

          {filteredOrders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Không tìm thấy đơn hàng"
              description="Không có đơn hàng nào phù hợp với bộ lọc của bạn"
            />
          ) : (
            <OrderList orders={filteredOrders} />
          )}
        </>
      )}

      <style jsx>{`
        .orders-page {
          max-width: 1200px;
        }

        .orders-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        @media (min-width: 768px) {
          .orders-controls {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  )
}
