'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { getImageUrl, handleImageError } from '@/lib/imageHelper';

export default function MiniCartSlideIn({ isOpen, onClose, items = [] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when cart is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ShoppingCartIcon className="w-6 h-6 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                Giỏ hàng ({totalItems})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCartIcon className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium mb-2">
                  Giỏ hàng trống
                </p>
                <p className="text-gray-400 text-sm">
                  Thêm sản phẩm để bắt đầu mua sắm
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-3 bg-gray-50 rounded-lg animate-slide-in-right"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <img
                      src={getImageUrl(item.product_image || item.image || '/images/placeholders/product-placeholder.jpg')}
                      alt={item.product_name || item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={handleImageError}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {item.product_name || item.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.variant_color || item.color} / {item.variant_size || item.size}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">
                          x{item.quantity}
                        </span>
                        <span className="font-semibold text-blue-600">
                          {item.price.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold text-gray-900">Tổng cộng:</span>
                <span className="font-bold text-blue-600">
                  {totalPrice.toLocaleString('vi-VN')}₫
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Link
                  href="/cart"
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  onClick={onClose}
                >
                  Xem giỏ hàng
                </Link>
                <Link
                  href="/checkout"
                  className="block w-full bg-orange-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                  onClick={onClose}
                >
                  Thanh toán ngay
                </Link>
              </div>

              <button
                onClick={onClose}
                className="w-full text-gray-600 text-sm hover:text-gray-800 transition-colors"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
