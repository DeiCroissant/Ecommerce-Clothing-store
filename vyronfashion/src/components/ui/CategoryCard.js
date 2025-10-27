'use client';

import Link from 'next/link';

export default function CategoryCard({ category }) {
  const { name, slug, image, productCount } = category;

  return (
    <Link
      href={`/category/${slug}`}
      className="group relative block overflow-hidden rounded-lg border border-zinc-200 hover:border-zinc-300 transition-all duration-300 shadow-sm hover:shadow-md"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        <img
          src={image || '/images/placeholders/category-placeholder.jpg'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-2xl font-serif font-bold mb-1 group-hover:translate-x-1 transition-transform duration-300">
          {name}
        </h3>
        {productCount && (
          <p className="text-sm text-zinc-200">
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
