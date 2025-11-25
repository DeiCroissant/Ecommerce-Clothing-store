'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline, EyeIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export default function ProductInfo({ product }) {
  const { name, brand, sku, category, pricing, rating, short_description, badges } = product;
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const renderStars = (score) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= Math.floor(score) ? (
              <StarIcon className="w-5 h-5 text-yellow-400" />
            ) : star - score < 1 && star - score > 0 ? (
              <div className="relative">
                <StarOutline className="w-5 h-5 text-yellow-400" />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${(score % 1) * 100}%` }}
                >
                  <StarIcon className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
            ) : (
              <StarOutline className="w-5 h-5 text-gray-300" />
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">
          Trang chủ
        </Link>
        <span>/</span>
        <Link href={`/category/${category.slug}`} className="hover:text-blue-600">
          {category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900 truncate">{name}</span>
      </nav>

      {/* Brand */}
      {brand && (
        <div className="text-sm">
          <span className="text-gray-500">Thương hiệu: </span>
          <Link href={`/brands/${brand.slug}`} className="text-blue-600 hover:underline font-medium">
            {brand.name}
          </Link>
        </div>
      )}

      {/* Product Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
        {name}
      </h1>

      {/* SKU */}
      <p className="text-sm text-gray-500">
        Mã sản phẩm: <span className="font-mono">{sku}</span>
      </p>

      {/* Rating & Reviews */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {renderStars(rating.average)}
          <span className="text-lg font-semibold text-gray-900">{rating.average.toFixed(1)}</span>
        </div>
        <a
          href="#reviews"
          className="text-sm text-blue-600 hover:underline"
        >
          ({rating.count} đánh giá)
        </a>
      </div>

      {/* Price Block */}
      <div className="space-y-2 py-4 border-b border-gray-200">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-red-600">
            {pricing.sale.toLocaleString('vi-VN')}₫
          </span>
          {pricing.original > pricing.sale && (
            <>
              <span className="text-xl text-gray-400 line-through">
                {pricing.original.toLocaleString('vi-VN')}₫
              </span>
              <span className="inline-block bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                -{pricing.discount_percent}%
              </span>
            </>
          )}
        </div>
        {pricing.original > pricing.sale && (
          <p className="text-sm text-gray-600">
            Tiết kiệm: {(pricing.original - pricing.sale).toLocaleString('vi-VN')}₫
          </p>
        )}
      </div>

      {/* Badges & Features */}
      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
            >
              {badge.icon && <span>{badge.icon}</span>}
              {badge.text}
            </span>
          ))}
        </div>
      )}

      {/* Short Description - Accordion */}
      {short_description && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <EyeIcon className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Thông tin sản phẩm</span>
            </div>
            <ChevronDownIcon 
              className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                isDescriptionOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isDescriptionOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-4 py-4 text-gray-600 text-sm leading-relaxed whitespace-pre-line border-t border-gray-200">
              {short_description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
