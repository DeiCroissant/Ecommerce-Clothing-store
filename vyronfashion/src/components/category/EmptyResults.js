'use client';

import { motion } from 'framer-motion';
import { HeartIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

/**
 * EmptyResults Component
 * Hiển thị khi không có sản phẩm nào khớp với bộ lọc
 * Gợi ý gỡ filter + sản phẩm "For You"
 */
export default function EmptyResults({ 
  activeFilters, 
  onRemoveFilter,
  onClearFilters,
  recommendations = [] 
}) {
  const hasFilters = Object.values(activeFilters).some(
    val => (Array.isArray(val) && val.length > 0) || (typeof val === 'object' && Object.keys(val).length > 0)
  );

  return (
    <div className="py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Không Tìm Thấy Sản Phẩm
        </h2>
        <p className="text-gray-600 mb-8">
          Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn.
        </p>

        {/* Suggestions */}
        {hasFilters && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">
              💡 Gợi ý của chúng tôi:
            </h3>
            <ul className="text-left text-sm text-gray-700 space-y-2 mb-4">
              <li>• Thử xóa một vài bộ lọc để mở rộng kết quả</li>
              <li>• Kiểm tra lại các tiêu chí lọc (giá, size, màu sắc...)</li>
              <li>• Thử tìm kiếm với từ khóa khác</li>
            </ul>
            <button
              onClick={onClearFilters}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Xóa Tất Cả Bộ Lọc
            </button>
          </div>
        )}

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <SparklesIcon className="w-6 h-6 text-purple-500" />
              <h3 className="text-xl font-bold text-gray-900">
                Sản Phẩm Dành Cho Bạn
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all"
                >
                  {/* Product Image */}
                  <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-500 line-through">
                          {product.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Additional Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Xem Tất Cả Sản Phẩm
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors"
          >
            Về Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
