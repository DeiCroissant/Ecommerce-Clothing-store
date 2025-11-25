'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import EnhancedProductCard from '@/components/category/EnhancedProductCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import * as productAPI from '@/lib/api/products';

export default function NewArrivals() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load new products from API
  useEffect(() => {
    const loadNewProducts = async () => {
      try {
        setLoading(true);
        // Fetch newest products (sorted by created_at desc)
        const response = await productAPI.getProducts({
          status: 'active',
          sort: 'newest',
          limit: 4, // Only show 4 newest products in carousel
          page: 1
        });
        
        if (response.products && response.products.length > 0) {
          // Transform API products to match ProductCard format
          const transformedProducts = response.products.map(product => ({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.pricing?.sale || product.pricing?.original || 0,
            originalPrice: product.pricing?.original && product.pricing?.sale && product.pricing.original > product.pricing.sale ? product.pricing.original : null,
            image: product.image || '',
            rating: typeof product.rating === 'number' 
              ? product.rating 
              : (product.rating?.average || 0),
            reviewCount: typeof product.reviewCount === 'number'
              ? product.reviewCount
              : (product.rating?.count || 0),
            isNew: true, // Mark as new for display
            discount: product.pricing?.discount_percent || 0,
            // Include full product data for EnhancedProductCard
            ...product
          }));
          
          setNewProducts(transformedProducts);
        } else {
          setNewProducts([]);
        }
      } catch (error) {
        console.error('Error loading new products:', error);
        setNewProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadNewProducts();
  }, []);

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

  const maxIndex = Math.max(0, newProducts.length - itemsPerView);

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
        {loading ? (
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 px-3" style={{ width: `${100 / itemsPerView}%` }}>
                <div className="bg-gray-100 rounded-lg aspect-[3/4] animate-pulse" />
              </div>
            ))}
          </div>
        ) : newProducts.length > 0 ? (
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
              }}
            >
              {newProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 px-3"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <EnhancedProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có sản phẩm mới nào</p>
          </div>
        )}

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
            href="/new-arrivals"
            className="inline-block px-8 py-3 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors font-medium"
          >
            Xem Tất Cả Sản Phẩm Mới
          </a>
        </div>
      </div>
    </section>
  );
}
