'use client';

import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function ProductCard({ product }) {
  const {
    id,
    slug,
    name,
    price,
    originalPrice,
    image,
    rating = 0,
    reviewCount = 0,
    isNew = false,
    discount = 0
  } = product;

  return (
    <div className="group relative bg-white rounded-lg border border-zinc-200 hover:border-zinc-300 transition-all duration-300 overflow-hidden">
      {/* Badge */}
      {(isNew || discount > 0) && (
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {isNew && (
            <span className="bg-zinc-900 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
              MỚI
            </span>
          )}
          {discount > 0 && (
            <span className="bg-zinc-800 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
              -{discount}%
            </span>
          )}
        </div>
      )}

      {/* Image */}
      <Link href={`/products/${slug}`} className="block relative aspect-[3/4] overflow-hidden bg-stone-50">
        <img
          src={image || '/images/placeholders/product-placeholder.jpg'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Quick Add to Cart - hiện khi hover */}
        <button className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-zinc-900 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-zinc-800">
          <ShoppingCartIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Thêm vào giỏ</span>
        </button>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${slug}`} className="block">
          <h3 className="text-sm font-medium text-zinc-900 hover:text-zinc-600 transition-colors line-clamp-2 mb-2">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating) ? 'text-zinc-800 fill-zinc-800' : 'text-zinc-300'
                  }`}
                />
              ))}
            </div>
            {reviewCount > 0 && (
              <span className="text-xs text-zinc-500">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-zinc-900">
            {price.toLocaleString('vi-VN')}₫
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-zinc-400 line-through">
              {originalPrice.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
