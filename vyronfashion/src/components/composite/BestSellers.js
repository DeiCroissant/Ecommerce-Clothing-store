'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { FireIcon } from '@heroicons/react/24/solid';

// Dữ liệu mẫu - sau này sẽ fetch từ API GET /analytics/hot-products
const BEST_SELLERS = [
  {
    id: 11,
    name: 'Áo Thun Trơn Basic',
    slug: 'ao-thun-tron-basic',
    price: 199000,
    originalPrice: 249000,
    image: '/images/products/bestseller-1.jpg',
    rating: 4.9,
    reviewCount: 342,
    discount: 20
  },
  {
    id: 12,
    name: 'Quần Jean Straight',
    slug: 'quan-jean-straight',
    price: 549000,
    originalPrice: 699000,
    image: '/images/products/bestseller-2.jpg',
    rating: 4.8,
    reviewCount: 298,
    discount: 21
  },
  {
    id: 13,
    name: 'Váy Midi Thanh Lịch',
    slug: 'vay-midi-thanh-lich',
    price: 399000,
    image: '/images/products/bestseller-3.jpg',
    rating: 4.7,
    reviewCount: 256
  },
  {
    id: 14,
    name: 'Áo Sơ Mi Trắng',
    slug: 'ao-so-mi-trang',
    price: 349000,
    originalPrice: 449000,
    image: '/images/products/bestseller-4.jpg',
    rating: 4.9,
    reviewCount: 387,
    discount: 22
  },
  {
    id: 15,
    name: 'Quần Tây Công Sở',
    slug: 'quan-tay-cong-so',
    price: 449000,
    image: '/images/products/bestseller-5.jpg',
    rating: 4.6,
    reviewCount: 213
  },
  {
    id: 16,
    name: 'Áo Khoác Cardigan',
    slug: 'ao-khoac-cardigan',
    price: 599000,
    originalPrice: 799000,
    image: '/images/products/bestseller-6.jpg',
    rating: 4.8,
    reviewCount: 276,
    discount: 25
  },
  {
    id: 17,
    name: 'Chân Váy Xếp Ly',
    slug: 'chan-vay-xep-ly',
    price: 299000,
    image: '/images/products/bestseller-7.jpg',
    rating: 4.7,
    reviewCount: 189
  },
  {
    id: 18,
    name: 'Áo Len Cổ Lọ',
    slug: 'ao-len-co-lo',
    price: 429000,
    originalPrice: 549000,
    image: '/images/products/bestseller-8.jpg',
    rating: 4.9,
    reviewCount: 324,
    discount: 22
  }
];

export default function BestSellers() {
  const [products, setProducts] = useState(BEST_SELLERS);
  const [loading, setLoading] = useState(false);

  // Trong tương lai, fetch dữ liệu từ API
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        // const response = await fetch('/api/analytics/hot-products');
        // const data = await response.json();
        // setProducts(data);
        
        // Hiện tại dùng dữ liệu mẫu
        setProducts(BEST_SELLERS);
      } catch (error) {
        console.error('Error fetching best sellers:', error);
      } finally {
        setLoading(false);
      }
    };

    // fetchBestSellers();
  }, []);

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
          {products.map((product, index) => (
            <div
              key={product.id}
              className="animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <a
            href="/products?filter=best-sellers"
            className="inline-block px-8 py-3 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Xem Tất Cả Sản Phẩm Bán Chạy
          </a>
        </div>
      </div>
    </section>
  );
}
