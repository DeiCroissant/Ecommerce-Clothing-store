'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function PaymentQRPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 phút = 600 giây
  const [paymentCreatedAt, setPaymentCreatedAt] = useState(null);

  // Calculate time left based on payment creation time
  useEffect(() => {
    if (!paymentCreatedAt || paid || loading) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const createdTime = new Date(paymentCreatedAt).getTime();
      const elapsedSeconds = Math.floor((now - createdTime) / 1000);
      const remainingSeconds = Math.max(0, 600 - elapsedSeconds); // 10 phút = 600 giây
      
      if (remainingSeconds === 0) {
        // Hết thời gian thanh toán - redirect về giỏ hàng
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('showToast', { 
            detail: { message: 'Hết thời gian thanh toán. Vui lòng đặt hàng lại.', type: 'error', duration: 3000 } 
          }));
        }
        router.push('/cart');
      }
      
      return remainingSeconds;
    };

    // Set initial time
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentCreatedAt, paid, loading, router]);

  // Format time MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // 1. Tạo QR code khi load page
    const initPayment = async () => {
      try {
        // Lấy thông tin order
        const orderRes = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
        const orderData = await orderRes.json();
        
        if (!orderData.id) {
          throw new Error('Không tìm thấy đơn hàng');
        }

        // Set payment creation time first (before QR generation)
        const createdAt = orderData.payment?.created_at || orderData.created_at || new Date().toISOString();
        setPaymentCreatedAt(createdAt);

        // Tạo QR code VietQR
        const qrRes = await fetch(`${API_BASE_URL}/api/payments/vietqr/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderId,
            amount: orderData.total_amount,
            description: `Thanh toan don ${orderId}`
          })
        });

        const qrResult = await qrRes.json();
        
        if (qrResult.success) {
          setQrData(qrResult);
        } else {
          throw new Error(qrResult.message || 'Không thể tạo QR code');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initPayment();

    // 2. Poll payment status mỗi 5 giây
    const checkPaymentInterval = setInterval(async () => {
      try {
        const statusRes = await fetch(`${API_BASE_URL}/api/payments/status/${orderId}`);
        const statusData = await statusRes.json();
        
        if (statusData.paid) {
          setPaid(true);
          clearInterval(checkPaymentInterval);
          
          // Clear cart after successful payment
          try {
            const pendingCheckoutStr = localStorage.getItem('pendingCheckout');
            if (pendingCheckoutStr) {
              const pendingCheckout = JSON.parse(pendingCheckoutStr);
              
              if (pendingCheckout.orderId === orderId && pendingCheckout.userId) {
                if (pendingCheckout.isBuyNow && pendingCheckout.buyNowItem) {
                  // Remove specific item for Buy Now
                  const buyNowItem = JSON.parse(pendingCheckout.buyNowItem);
                  await fetch(`${API_BASE_URL}/api/cart/${pendingCheckout.userId}/item`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      product_id: buyNowItem.product_id,
                      variant_color: buyNowItem.variant_color,
                      variant_size: buyNowItem.variant_size
                    })
                  });
                  localStorage.removeItem('buyNowItem');
                } else {
                  // Clear entire cart for normal checkout
                  await fetch(`${API_BASE_URL}/api/cart/${pendingCheckout.userId}/clear`, {
                    method: 'DELETE'
                  });
                  localStorage.removeItem('appliedCoupon');
                }
                
                // Dispatch cart changed event
                window.dispatchEvent(new Event('cartChanged'));
                
                // Clear pending checkout
                localStorage.removeItem('pendingCheckout');
                console.log('✅ Cart cleared after successful payment');
              }
            }
          } catch (error) {
            console.error('Error clearing cart after payment:', error);
          }
          
          // Show success toast
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('showToast', { 
              detail: { message: 'Thanh toán thành công! Đơn hàng đang được xử lý.', type: 'success', duration: 3000 } 
            }));
          }
          
          // Redirect sau 2 giây
          setTimeout(() => {
            router.push(`/account/orders/${orderId}`);
          }, 2000);
        }
      } catch (err) {
        console.error('Check payment error:', err);
      }
    }, 5000);

    return () => clearInterval(checkPaymentInterval);
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tạo mã QR thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h2>
          <p className="text-gray-600 mb-4">Đơn hàng của bạn đang được xử lý</p>
          <div className="animate-pulse text-sm text-gray-500">
            Đang chuyển hướng...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-lg shadow-lg p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Thanh Toán Đơn Hàng
          </h1>
          <p className="text-gray-600">
            Mã đơn hàng: <span className="font-mono font-semibold">{orderId.slice(-8)}</span>
          </p>
        </div>

        {/* QR Code Section */}
        <div className="bg-white shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Quét mã QR để thanh toán
            </h2>
            <p className="text-gray-600 text-sm">
              Sử dụng app ngân hàng để quét mã QR bên dưới
            </p>
          </div>

          {/* QR Code Image với Scan Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative inline-block">
              {/* QR Code Container */}
              <div className="bg-white p-6 rounded-2xl shadow-xl border-4 border-gray-100 relative overflow-hidden">
                {qrData?.qr_data_url && (
                  <img 
                    src={qrData.qr_data_url}
                    alt="QR Code" 
                    className="w-96 h-96 object-contain relative z-10"
                  />
                )}
                
                {/* Scanning Line Animation */}
                <div className="absolute inset-0 pointer-events-none z-20">
                  <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70 animate-scan-line"></div>
                </div>
                
                {/* Corner Decorations */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
              </div>
            </div>
          </div>
          
          {/* Add custom CSS for scan animation */}
          <style jsx>{`
            @keyframes scan-line {
              0% {
                top: 0;
                opacity: 0;
              }
              50% {
                opacity: 0.7;
              }
              100% {
                top: 100%;
                opacity: 0;
              }
            }
            .animate-scan-line {
              animation: scan-line 2s ease-in-out infinite;
            }
          `}</style>

          {/* Payment Info */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Ngân hàng:</span>
              <span className="font-semibold text-gray-800">
                {qrData?.payment_info?.bank_name || 'MB Bank'}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Số tài khoản:</span>
              <span className="font-mono font-semibold text-gray-800">
                {qrData?.payment_info?.account_number}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Chủ tài khoản:</span>
              <span className="font-semibold text-gray-800">
                {qrData?.payment_info?.account_name || 'VYRON FASHION'}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Số tiền:</span>
              <span className="font-bold text-2xl text-red-600">
                {qrData?.payment_info?.amount?.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nội dung:</span>
              <span className="font-mono text-sm text-gray-800 text-right">
                {qrData?.payment_info?.description}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="font-semibold text-blue-800 mb-2">📱 Hướng dẫn thanh toán:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li>Mở app ngân hàng trên điện thoại</li>
              <li>Chọn chức năng &quot;Quét QR&quot; hoặc &quot;Chuyển khoản&quot;</li>
              <li>Quét mã QR ở trên</li>
              <li>Kiểm tra thông tin và xác nhận chuyển khoản</li>
              <li>Trang sẽ tự động cập nhật khi thanh toán thành công</li>
            </ol>
          </div>

          {/* Status Indicator with Countdown */}
          <div className="mt-6 text-center space-y-4">
            {/* Countdown Timer */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-red-600 text-2xl">⏰</span>
                <span className="text-xl font-bold text-red-600">{formatTime(timeLeft)}</span>
              </div>
              <p className="text-sm text-red-700">
                Thời gian thanh toán còn lại
              </p>
              {timeLeft < 60 && (
                <p className="text-xs text-red-600 mt-1 font-semibold">
                  ⚠️ Vui lòng hoàn tất thanh toán trước khi hết giờ
                </p>
              )}
            </div>

            {/* Status */}
            <div className="inline-flex items-center space-x-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full">
              <div className="animate-pulse">⏳</div>
              <span className="text-sm font-medium">Đang chờ thanh toán...</span>
            </div>
            <p className="text-xs text-gray-500">
              Trang sẽ tự động cập nhật sau khi bạn chuyển khoản
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-b-lg shadow-lg p-4 text-center">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
