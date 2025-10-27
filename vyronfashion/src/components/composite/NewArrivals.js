'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// Dữ liệu mẫu - sau này sẽ fetch từ API
const NEW_PRODUCTS = [
  {
    id: 1,
    name: 'Áo Thun Cotton Premium',
    slug: 'ao-thun-cotton-premium',
    price: 299000,
    originalPrice: 399000,
    image: '/images/products/tshirt-1.jpg',
    rating: 4.5,
    reviewCount: 128,
    isNew: true,
    discount: 25
  },
  {
    id: 2,
    name: 'Quần Jean Slim Fit',
    slug: 'quan-jean-slim-fit',
    price: 599000,
    originalPrice: 799000,
    image: '/images/products/jeans-1.jpg',
    rating: 4.8,
    reviewCount: 95,
    isNew: true,
    discount: 25
  },
  {
    id: 3,
    name: 'Váy Đầm Hoa Nhẹ Nhàng',
    slug: 'vay-dam-hoa-nhe-nhang',
    price: 449000,
    image: '/images/products/dress-1.jpg',
    rating: 4.6,
    reviewCount: 73,
    isNew: true
  },
  {
    id: 4,
    name: 'Áo Sơ Mi Oxford',
    slug: 'ao-so-mi-oxford',
    price: 399000,
    originalPrice: 499000,
    image: '/images/products/shirt-1.jpg',
    rating: 4.7,
    reviewCount: 112,
    isNew: true,
    discount: 20
  },
  {
    id: 5,
    name: 'Quần Short Kaki',
    slug: 'quan-short-kaki',
    price: 349000,
    image: '/images/products/shorts-1.jpg',
    rating: 4.4,
    reviewCount: 86,
    isNew: true
  },
  {
    id: 6,
    name: 'Áo Khoác Denim',
    slug: 'ao-khoac-denim',
    price: 699000,
    originalPrice: 899000,
    image: '/images/products/jacket-1.jpg',
    rating: 4.9,
    reviewCount: 142,
    isNew: true,
    discount: 22
  },
  {
    id: 7,
    name: 'Váy Maxi Bohemian',
    slug: 'vay-maxi-bohemian',
    price: 549000,
    image: '/images/products/dress-2.jpg',
    rating: 4.5,
    reviewCount: 67,
    isNew: true
  },
  {
    id: 8,
    name: 'Áo Polo Classic',
    slug: 'ao-polo-classic',
    price: 329000,
    originalPrice: 429000,
    image: '/images/products/polo-1.jpg',
    rating: 4.6,
    reviewCount: 94,
    isNew: true,
    discount: 23
  }
];

export default function NewArrivals() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, NEW_PRODUCTS.length - itemsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 mb-2">
              Sản Phẩm Mới
            </h2>
            <p className="text-zinc-600">
              Khám phá những sản phẩm mới nhất vừa được cập nhật
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-full border-2 border-zinc-300 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-zinc-400 disabled:hover:border-zinc-300 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className="p-2 rounded-full border-2 border-zinc-300 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-zinc-400 disabled:hover:border-zinc-300 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
            }}
          >
            {NEW_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 px-3"
                style={{ width: `${100 / itemsPerView}%` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation Dots */}
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          {[...Array(maxIndex + 1)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-zinc-900 w-8'
                  : 'bg-zinc-300 hover:bg-zinc-400'
              }`}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <a
            href="/products?filter=new"
            className="inline-block px-8 py-3 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors font-medium"
          >
            Xem Tất Cả Sản Phẩm Mới
          </a>
        </div>
      </div>
    </section>
  );
}
