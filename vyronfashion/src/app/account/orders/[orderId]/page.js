'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { OrderDetailHeader } from '@/features/orders/components/OrderDetailHeader'
import { OrderTimeline } from '@/features/orders/components/OrderTimeline'
import { OrderProducts } from '@/features/orders/components/OrderProducts'
import { OrderShipping } from '@/features/orders/components/OrderShipping'
import { OrderPriceSummary } from '@/features/orders/components/OrderPriceSummary'
import { OrderActions } from '@/features/orders/components/OrderActions'
import { OrderReviewSection } from '@/features/orders/components/OrderReviewSection'
import * as orderAPI from '@/lib/api/orders'
import { formatDate, getStatusInfo } from '@/lib/mockOrdersData'
import '@/styles/account-order-detail.css'

// Loading spinner component
function LoadingSpinner({ size = 40 }) {
  return (
    <div className="flex items-center justify-center">
      <div 
        className="animate-spin rounded-full border-t-2 border-b-2 border-zinc-900"
        style={{ width: size, height: size }}
      />
    </div>
  )
}

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

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params?.orderId
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId) return;
    
    const userId = getCurrentUserId();
    if (!userId) {
      router.push('/');
      return;
    }

    fetchOrder();

    // Listen for order updates
    const handleOrdersChanged = () => {
      fetchOrder();
    };

    window.addEventListener('ordersChanged', handleOrdersChanged);
    
    return () => {
      window.removeEventListener('ordersChanged', handleOrdersChanged);
    };
  }, [orderId, router])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      const orderData = await orderAPI.getOrderById(orderId);
      
      // Transform API data to match component expectations
      const transformedOrder = {
        id: orderData.id || orderData._id,
        orderNumber: orderData.order_number || orderData.orderNumber || orderData.id,
        status: orderData.status || 'pending',
        total: orderData.total_amount || orderData.total || 0,
        date: orderData.created_at || orderData.date,
        orderDate: orderData.created_at || orderData.date,
        createdAt: orderData.created_at,
        items: (orderData.items || []).map(item => ({
          id: item.product_id || item.id,
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
        shipping_address: orderData.shipping_address || {},
        payment_method: orderData.payment_method || 'COD',
        note: orderData.note || ''
      };
      
      setOrder(transformedOrder);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError(error.message || 'Không thể tải chi tiết đơn hàng');
      setLoading(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Không thể tải chi tiết đơn hàng', type: 'error', duration: 3000 } 
        }));
      }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8 min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-zinc-900 mb-4">Không tìm thấy đơn hàng</h1>
        <p className="text-zinc-600 mb-6">{error || 'Đơn hàng không tồn tại'}</p>
        <button
          onClick={() => router.push('/account/orders')}
          className="btn-primary"
        >
          Quay lại danh sách đơn hàng
        </button>
      </div>
    )
  }

  // Calculate subtotal
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = order.total - subtotal;

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen">
      <OrderDetailHeader order={order} />

      <div className="order-detail-content">
        <div className="content-main">
          <OrderTimeline order={order} />
          <OrderProducts order={order} />
          <OrderReviewSection order={order} />
        </div>

        <div className="content-sidebar">
          <OrderShipping order={order} />
          <OrderPriceSummary 
            order={{
              ...order,
              subtotal,
              shippingFee,
              discount: 0
            }}
          />
          <OrderActions order={order} />
        </div>
      </div>
    </div>
  )
}

