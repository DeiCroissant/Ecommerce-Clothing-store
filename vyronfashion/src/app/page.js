import HeroBanner from '@/components/layout/HeroBanner';
import FeaturedCategories from '@/components/composite/FeaturedCategories';
import NewArrivals from '@/components/composite/NewArrivals';
import BestSellers from '@/components/composite/BestSellers';

export default function HomePage() {
  return (
    <main className="bg-zinc-50">
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

