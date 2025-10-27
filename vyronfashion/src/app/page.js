import Link from 'next/link';
import HeroBanner from '@/components/layout/HeroBanner';
import FeaturedCategories from '@/components/composite/FeaturedCategories';
import NewArrivals from '@/components/composite/NewArrivals';
import BestSellers from '@/components/composite/BestSellers';

export default function HomePage() {
  return (
    <main className="bg-zinc-50">
      {/* DEV: Quick link to test Product Detail Page */}
      <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm mb-2">🚀 <strong>DEV MODE:</strong> Test Product Detail Page</p>
          <Link 
            href="/products/ao-thun-basic-cotton-nam"
            className="inline-block bg-white text-zinc-900 px-6 py-2 rounded-full font-semibold hover:bg-zinc-100 transition-colors shadow-lg"
          >
            👉 Xem trang chi tiết sản phẩm →
          </Link>
        </div>
      </div>

      {/* 1. Hero Banner - Banner chính với hình ảnh lớn và CTA */}
      <HeroBanner />
      
      {/* 2. Featured Categories - Danh mục nổi bật */}
      <FeaturedCategories />
      
      {/* 3. New Arrivals - Sản phẩm mới */}
      <NewArrivals />
      
      {/* 4. Best Sellers - Sản phẩm bán chạy */}
      <BestSellers />
      
      {/* Footer đã được đặt trong layout.js */}
    </main>
  );
}

