'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader, EmptyState, LoadingSkeleton } from '@/components/account'
import { OrderList } from '@/features/orders/components/OrderList'
import { OrderFilters } from '@/features/orders/components/OrderFilters'
import { OrderSearch } from '@/features/orders/components/OrderSearch'
import { Package } from 'lucide-react'
import * as orderAPI from '@/lib/api/orders'
import * as returnsAPI from '@/lib/api/returns'

function getCurrentUserId() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.id || user._id || null;
  } catch {
    return null;
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push('/');
      return;
    }
    fetchOrders(userId);

    // Listen for order and return updates
    const handleOrdersChanged = () => {
      fetchOrders(userId);
    };
    const handleReturnsChanged = () => {
      fetchOrders(userId);
    };

    window.addEventListener('ordersChanged', handleOrdersChanged);
    window.addEventListener('returnsChanged', handleReturnsChanged);
    
    return () => {
      window.removeEventListener('ordersChanged', handleOrdersChanged);
      window.removeEventListener('returnsChanged', handleReturnsChanged);
    };
  }, [router])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, statusFilter])

  const fetchOrders = async (userId) => {
    try {
      setLoading(true)
      const [ordersResponse, returnsResponse] = await Promise.all([
        orderAPI.getUserOrders(userId),
        returnsAPI.getUserReturns(userId).catch(() => ({ returns: [] })) // Ignore errors for returns
      ]);
      
      const ordersData = ordersResponse.orders || [];
      const returnsData = returnsResponse.returns || [];
      
      // Create a map of order_id to return status
      const orderReturnsMap = {};
      returnsData.forEach(ret => {
        const orderId = ret.order_id;
        if (ret.status === 'completed') {
          orderReturnsMap[orderId] = true;
        }
      });
      
      // Transform API data to match component expectations
      const transformedOrders = ordersData.map(order => {
        const orderId = order.id || order._id;
        const hasRefundCompleted = orderReturnsMap[orderId] || false;
        
        return {
          id: orderId,
          orderNumber: order.order_number || order.orderNumber,
          status: order.status || 'pending',
          total: order.total_amount || order.total || 0,
          date: order.created_at || order.date,
          createdAt: order.created_at,
          hasRefundCompleted, // Flag to indicate if this order has a completed return
          items: (order.items || []).map(item => ({
            id: item.product_id,
            name: item.product_name || item.name,
            image: item.product_image || item.image || '/images/placeholders/product-placeholder.svg',
            quantity: item.quantity || 1,
            price: item.price || 0,
            variant: item.variant_color || item.variant_size 
              ? `${item.variant_color || ''}${item.variant_color && item.variant_size ? ' • ' : ''}${item.variant_size || ''}`
              : null,
            variant_color: item.variant_color,
            variant_size: item.variant_size
          })),
          shipping_address: order.shipping_address,
          payment_method: order.payment_method || 'COD'
        };
      });
      
      setOrders(transformedOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Lỗi khi tải danh sách đơn hàng', type: 'error', duration: 3000 } 
        }));
      }
      setLoading(false);
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
      filtered = filtered.filter(order => {
        const orderNumber = (order.orderNumber || order.id || '').toLowerCase()
        const searchLower = searchQuery.toLowerCase()
        
        if (orderNumber.includes(searchLower)) {
          return true
        }
        
        if (order.items && order.items.some(item => {
          const itemName = (item.name || '').toLowerCase()
          return itemName.includes(searchLower)
        })) {
          return true
        }
        
        return false
      })
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
