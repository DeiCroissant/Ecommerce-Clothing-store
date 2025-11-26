'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { getImageUrl } from '@/lib/imageHelper';
import * as productAPI from '@/lib/api/products';

/**
 * Component hiển thị sản phẩm tương tự (Content-Based Filtering)
 * Sử dụng TF-IDF + Cosine Similarity từ backend
 */
export default function SimilarProducts({ productId, productName }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!productId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await productAPI.getProductRecommendations(productId, 8);
        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Không thể tải sản phẩm gợi ý');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId]);

  // Render stars
  const renderStars = (score) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= Math.floor(score) ? (
              <StarIcon className="w-3.5 h-3.5 text-yellow-400" />
            ) : (
              <StarOutline className="w-3.5 h-3.5 text-gray-300" />
            )}
          </span>
        ))}
      </div>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <section className="mt-16 border-t border-gray-200 pt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Sản phẩm tương tự
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // No recommendations
  if (!recommendations.length) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-gray-200 pt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Có thể bạn sẽ thích
        </h2>
        <span className="text-sm text-gray-500">
          Dựa trên sản phẩm bạn đang xem
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {recommendations.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group block"
          >
            {/* Product Image */}
            <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-3">
              <Image
                src={getImageUrl(product.image)}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              
              {/* Similarity Badge */}
              {product.similarity_score && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {Math.round(product.similarity_score * 100)}% tương tự
                </div>
              )}

              {/* Discount Badge */}
              {product.pricing?.discount_percent > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  -{product.pricing.discount_percent}%
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-1">
              {/* Category */}
              {product.category?.name && (
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {product.category.name}
                </p>
              )}

              {/* Name */}
              <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>

              {/* Rating */}
              {product.rating && product.rating.count > 0 && (
                <div className="flex items-center gap-1">
                  {renderStars(product.rating.average)}
                  <span className="text-xs text-gray-500">
                    ({product.rating.count})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-red-600">
                  {product.pricing?.sale?.toLocaleString('vi-VN')}₫
                </span>
                {product.pricing?.original > product.pricing?.sale && (
                  <span className="text-sm text-gray-400 line-through">
                    {product.pricing.original.toLocaleString('vi-VN')}₫
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* AI Powered Badge */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z"/>
          <path d="M10 5a1 1 0 011 1v3.586l2.707 2.707a1 1 0 01-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/>
        </svg>
        <span>Gợi ý bởi AI • Content-Based Filtering</span>
      </div>
    </section>
  );
}
