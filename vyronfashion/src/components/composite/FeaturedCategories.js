'use client';

import CategoryCard from '@/components/ui/CategoryCard';

// Dữ liệu mẫu - sau này sẽ fetch từ API
const FEATURED_CATEGORIES = [
  {
    id: 1,
    name: 'Áo Thun',
    slug: 'ao-thun',
    image: '/images/categories/tshirts.jpg',
    productCount: 150
  },
  {
    id: 2,
    name: 'Quần Jean',
    slug: 'quan-jean',
    image: '/images/categories/jeans.jpg',
    productCount: 89
  },
  {
    id: 3,
    name: 'Váy Đầm',
    slug: 'vay-dam',
    image: '/images/categories/dresses.jpg',
    productCount: 124
  },
  {
    id: 4,
    name: 'Phụ Kiện',
    slug: 'phu-kien',
    image: '/images/categories/accessories.jpg',
    productCount: 200
  }
];

export default function FeaturedCategories() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 mb-4">
            Danh Mục Nổi Bật
          </h2>
          <p className="text-zinc-600 max-w-2xl mx-auto">
            Khám phá các bộ sưu tập thời trang đa dạng và phong phú của chúng tôi
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
