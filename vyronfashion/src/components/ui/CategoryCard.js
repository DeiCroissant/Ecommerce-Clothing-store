'use client';

import Link from 'next/link';

export default function CategoryCard({ category }) {
  const { name, slug, image, productCount } = category;

  return (
    <Link
      href={`/category/${slug}`}
      className="group relative block overflow-hidden rounded-lg shadow-md hover:shadow-2xl transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image || '/images/placeholders/category-placeholder.jpg'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-2xl font-bold mb-1 group-hover:text-blue-300 transition-colors">
          {name}
        </h3>
        {productCount && (
          <p className="text-sm text-gray-200">
            {productCount} sản phẩm
          </p>
        )}
        
        {/* Arrow Icon */}
        <div className="mt-2 inline-flex items-center text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
          Xem ngay
          <svg
            className="ml-2 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
