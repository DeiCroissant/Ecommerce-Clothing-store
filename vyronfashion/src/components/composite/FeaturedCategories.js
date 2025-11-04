'use client';

import CategoryCard from '@/components/ui/CategoryCard';
import { FEATURED_CATEGORIES } from '@/lib/categories';

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
            Khám phá thời trang Nam & Nữ với phong cách riêng biệt
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
