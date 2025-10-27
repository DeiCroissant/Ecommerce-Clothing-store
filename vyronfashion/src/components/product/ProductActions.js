'use client';

import { useState } from 'react';
import { MinusIcon, PlusIcon, ShoppingCartIcon, BoltIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

export default function ProductActions({ maxStock = 10, onAddToCart, onBuyNow }) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < maxStock) setQuantity(quantity + 1);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= maxStock) {
      setQuantity(value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quantity Selector */}
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-3">
          Số lượng:
        </label>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center border-2 border-gray-300 rounded-lg">
            <button
              onClick={handleDecrease}
              disabled={quantity <= 1}
              className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            
            <input
              type="number"
              min="1"
              max={maxStock}
              value={quantity}
              onChange={handleQuantityChange}
              className="w-16 text-center font-semibold focus:outline-none"
            />
            
            <button
              onClick={handleIncrease}
              disabled={quantity >= maxStock}
              className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>

          <span className="text-sm text-gray-500">
            {maxStock} sản phẩm có sẵn
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Add to Cart */}
        <button
          onClick={() => onAddToCart(quantity)}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <ShoppingCartIcon className="w-5 h-5" />
          Thêm vào giỏ hàng
        </button>

        {/* Buy Now */}
        <button
          onClick={() => onBuyNow(quantity)}
          className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-4 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl"
        >
          <BoltIcon className="w-5 h-5" />
          Mua ngay
        </button>

        {/* Favorite */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="border-2 border-gray-300 p-4 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
          title={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        >
          {isFavorite ? (
            <HeartSolid className="w-6 h-6 text-red-500" />
          ) : (
            <HeartIcon className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Trust Cues */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Đổi trả trong 30 ngày</p>
            <p className="text-xs text-gray-500">Miễn phí đổi trả</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Giao hàng nhanh</p>
            <p className="text-xs text-gray-500">Giao trong 2-3 ngày</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Thanh toán COD</p>
            <p className="text-xs text-gray-500">Thanh toán khi nhận hàng</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Bảo hành chính hãng</p>
            <p className="text-xs text-gray-500">Bảo hành 12 tháng</p>
          </div>
        </div>
      </div>
    </div>
  );
}
