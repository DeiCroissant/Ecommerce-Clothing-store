'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrderDetailHeader } from '@/features/orders/components/OrderDetailHeader';
import { OrderTimeline } from '@/features/orders/components/OrderTimeline';
import { OrderProducts } from '@/features/orders/components/OrderProducts';
import { OrderShipping } from '@/features/orders/components/OrderShipping';
import { OrderPriceSummary } from '@/features/orders/components/OrderPriceSummary';
import { OrderActions } from '@/features/orders/components/OrderActions';
import { CancelOrderModal } from '@/features/orders/components/CancelOrderModal';
import { getOrderById, generateTimeline } from '@/lib/mockOrdersData';
import '@/styles/account-order-detail.css';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId;

  // Get order data
  const order = getOrderById(orderId);

  // State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Handle 404
  if (!order) {
    return (
      <div className="order-not-found">
        <div className="not-found-content">
          <h1 className="not-found-title">Không tìm thấy đơn hàng</h1>
          <p className="not-found-description">
            Đơn hàng <strong>{orderId}</strong> không tồn tại hoặc đã bị xóa.
          </p>
          <button 
            className="btn-primary"
            onClick={() => router.push('/account/orders')}
          >
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  // Generate timeline
  const timeline = generateTimeline(order);

  // Handlers
  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = (orderId) => {
    console.log('Cancel order:', orderId);
    setToastMessage('Đơn hàng đã được hủy thành công');
    setShowToast(true);
    
    // TODO: Implement actual cancel logic
    // After cancelling, could redirect to orders list
    setTimeout(() => {
      router.push('/account/orders');
    }, 2000);
  };

  const handleRequestReturn = () => {
    console.log('Request return for order:', order.id);
    setToastMessage('Yêu cầu trả hàng đã được gửi. Chúng tôi sẽ liên hệ với bạn sớm.');
    setShowToast(true);
    
    // TODO: Implement return request logic
  };

  return (
    <div className="order-detail-page">
      {/* Header */}
      <OrderDetailHeader order={order} />

      {/* Main Content */}
      <div className="order-detail-content">
        {/* Left Column */}
        <div className="content-main">
          {/* Timeline */}
          <OrderTimeline 
            timeline={timeline} 
            currentStatus={order.status}
          />

          {/* Products */}
          <OrderProducts 
            items={order.items}
            itemsCount={order.itemsCount}
          />

          {/* Shipping Info (Mobile - shows here) */}
          <div className="mobile-only">
            <OrderShipping 
              shippingAddress={order.shippingAddress}
              trackingNumber={order.trackingNumber}
            />
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="content-sidebar">
          {/* Actions */}
          <OrderActions 
            order={order}
            onCancel={handleCancelOrder}
            onRequestReturn={handleRequestReturn}
          />

          {/* Shipping Info (Desktop - shows here) */}
          <div className="desktop-only">
            <OrderShipping 
              shippingAddress={order.shippingAddress}
              trackingNumber={order.trackingNumber}
            />
          </div>

          {/* Price Summary */}
          <OrderPriceSummary 
            subtotal={order.subtotal}
            shipping={order.shipping}
            discount={order.discount}
            total={order.total}
            paymentMethod={order.paymentMethod}
          />
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <CancelOrderModal
          order={order}
          onConfirm={handleConfirmCancel}
          onClose={() => setShowCancelModal(false)}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          <p>{toastMessage}</p>
          <button onClick={() => setShowToast(false)}>×</button>
        </div>
      )}
    </div>
  );
}
