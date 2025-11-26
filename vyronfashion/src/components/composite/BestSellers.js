'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EnhancedProductCard from '@/components/category/EnhancedProductCard';
import { FireIcon } from '@heroicons/react/24/solid';
import * as productAPI from '@/lib/api/products';

export default function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = giảm dần, 'asc' = tăng dần

  // Fetch sản phẩm bán chạy từ API
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        // Gọi API với sort = best_sellers để lấy sản phẩm có sold_count cao nhất
        const response = await productAPI.getProducts({
          sort: sortOrder === 'desc' ? 'best_sellers' : 'least_sold',
          limit: 8,
          status: 'active'
        });
        
        console.log('📊 Best sellers loaded:', response.products?.length || 0);
        
        // Sắp xếp lại nếu cần
        let sortedProducts = response.products || [];
        if (sortOrder === 'asc') {
          sortedProducts = [...sortedProducts].sort((a, b) => (a.sold_count || 0) - (b.sold_count || 0));
        }
        
        setProducts(sortedProducts);
      } catch (error) {
        console.error('Error fetching best sellers:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, [sortOrder]);

  if (loading) {
    return (
      <section className="py-24 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center">Đang tải...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-stone-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FireIcon className="w-8 h-8 text-zinc-800 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900">
              Sản Phẩm Bán Chạy
            </h2>
            <FireIcon className="w-8 h-8 text-zinc-800 animate-pulse" />
          </div>
          <p className="text-zinc-600 max-w-2xl mx-auto">
            Những sản phẩm được yêu thích và lựa chọn nhiều nhất bởi khách hàng
          </p>
          
          {/* Sort Toggle */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <span className="text-sm text-zinc-600">Sắp xếp theo lượt bán:</span>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-4 py-2 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors text-sm font-medium flex items-center gap-2"
            >
              {sortOrder === 'desc' ? '↓ Nhiều nhất' : '↑ Ít nhất'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>
          
          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-zinc-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-zinc-800" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Hơn 10,000+ đánh giá tích cực</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-zinc-800" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Đánh giá trung bình 4.8/5</span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => {
            // Transform API data to EnhancedProductCard format
            const transformedProduct = {
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.pricing?.sale || product.pricing?.original || 0,
              originalPrice: product.pricing?.original && product.pricing?.sale && product.pricing.original > product.pricing.sale ? product.pricing.original : null,
              image: product.image || product.images?.[0] || '',
              rating: typeof product.rating === 'number' 
                ? product.rating 
                : (product.rating?.average || 0),
              reviewCount: typeof product.reviewCount === 'number'
                ? product.reviewCount
                : (product.rating?.count || 0),
              discount: product.pricing?.discount_percent || 0,
              sold_count: product.sold_count || 0,
              // Include full product data for EnhancedProductCard
              ...product
            };

            return (
              <div
                key={product.id}
                className="animate-fadeInUp relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Badge hiển thị số lượng bán */}
                <div className="absolute top-2 left-2 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <FireIcon className="w-3 h-3" />
                  {product.sold_count || 0} đã bán
                </div>
                <EnhancedProductCard product={transformedProduct} />
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/best-sellers"
            className="inline-block px-8 py-3 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Xem Tất Cả Sản Phẩm Bán Chạy
          </Link>
        </div>
      </div>
    </section>
  );
}
