'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon, ArrowRightIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

function CheckoutSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!orderId || !orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy thông tin đơn hàng</p>
          <Link
            href="/account/orders"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Xem đơn hàng của tôi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Đặt hàng thành công!
          </h1>
          <p className="text-gray-600 mb-6">
            Cảm ơn bạn đã đặt hàng tại Vyron Fashion. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
          </p>

          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Mã đơn hàng:</span>
              <span className="font-semibold text-gray-900">{orderNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Mã ID:</span>
              <span className="font-semibold text-gray-900">{orderId}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/account/orders/${orderId}`}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              Xem chi tiết đơn hàng
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 border-2 border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Tiếp tục mua sắm
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>

          {/* Note */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Lưu ý:</strong> Chúng tôi sẽ gửi email xác nhận đơn hàng đến địa chỉ email của bạn. 
              Vui lòng kiểm tra hộp thư của bạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div>Loading...</div></div>}>
      <CheckoutSuccessPageContent />
    </Suspense>
  );
}

