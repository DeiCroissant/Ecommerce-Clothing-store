'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FilterSidebar from '@/components/category/FilterSidebar';
import ProductToolbar from '@/components/category/ProductToolbar';
import EnhancedProductCard from '@/components/category/EnhancedProductCard';
import EmptyResults from '@/components/category/EmptyResults';
import { motion } from 'framer-motion';

/**
 * Category Page Component
 * Full-featured product listing with:
 * - Faceted filtering (multi-select + single-select)
 * - URL sync for all filters/sort/pagination
 * - AI-powered sorting (when authenticated)
 * - Infinite scroll + Load More
 * - Sticky toolbar
 * - Mobile off-canvas filters
 * 
 * @note Next.js 15: params is now a Promise, unwrap with React.use()
 */
export default function CategoryPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Unwrap params Promise (Next.js 15 requirement)
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  // UI State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isToolbarSticky, setIsToolbarSticky] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter State (synced with URL)
  const [activeFilters, setActiveFilters] = useState({
    category: [],
    size: [],
    color: [],
    brand: [],
    material: [],
    features: [],
    priceRange: {}
  });

  // Sort & Pagination
  const [currentSort, setCurrentSort] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Data
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filterOptions, setFilterOptions] = useState({});

  // User state (mock - replace with real auth)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Read URL params on mount
  useEffect(() => {
    const filters = {
      category: searchParams.getAll('category'),
      size: searchParams.getAll('size'),
      color: searchParams.getAll('color'),
      brand: searchParams.getAll('brand'),
      material: searchParams.getAll('material'),
      features: searchParams.getAll('features'),
      priceRange: {}
    };

    const minPrice = searchParams.get('price_min');
    const maxPrice = searchParams.get('price_max');
    if (minPrice && maxPrice) {
      filters.priceRange = { min: parseInt(minPrice), max: parseInt(maxPrice) };
    }

    setActiveFilters(filters);
    setCurrentSort(searchParams.get('sort') || 'newest');
    setCurrentPage(parseInt(searchParams.get('page') || '1'));
  }, [searchParams]);

  // Fetch products when filters/sort/page changes
  useEffect(() => {
    fetchProducts();
  }, [activeFilters, currentSort, currentPage, slug]);

  // Sticky toolbar detection
  useEffect(() => {
    const handleScroll = () => {
      setIsToolbarSticky(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch products from API
  const fetchProducts = async () => {
    setIsLoading(true);

    // Mock API call - replace with real API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock data
    const mockProducts = generateMockProducts(24);
    const mockFilterOptions = generateMockFilterOptions();

    setProducts(mockProducts);
    setTotalProducts(mockProducts.length);
    setFilterOptions(mockFilterOptions);
    setHasMore(currentPage < 3); // Mock pagination

    setIsLoading(false);
  };

  // Update URL when filters change
  const updateURL = (newFilters, newSort, newPage) => {
    const params = new URLSearchParams();

    // Add filter params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (key === 'priceRange' && value.min !== undefined && value.max !== undefined) {
        params.set('price_min', value.min.toString());
        params.set('price_max', value.max.toString());
      } else if (Array.isArray(value) && value.length > 0) {
        value.forEach(v => params.append(key, v));
      }
    });

    // Add sort and page
    if (newSort !== 'newest') params.set('sort', newSort);
    if (newPage > 1) params.set('page', newPage.toString());

    router.push(`/category/${slug}?${params.toString()}`, { scroll: false });
  };

  // Filter handlers
  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: value
    };
    setActiveFilters(newFilters);
    setCurrentPage(1); // Reset to page 1
    updateURL(newFilters, currentSort, 1);
  };

  const handleRemoveFilter = (filterType, value) => {
    if (filterType === 'priceRange') {
      const newFilters = { ...activeFilters, priceRange: {} };
      setActiveFilters(newFilters);
      updateURL(newFilters, currentSort, currentPage);
    } else {
      const newValues = activeFilters[filterType].filter(v => v !== value);
      handleFilterChange(filterType, newValues);
    }
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      category: [],
      size: [],
      color: [],
      brand: [],
      material: [],
      features: [],
      priceRange: {}
    };
    setActiveFilters(emptyFilters);
    setCurrentPage(1);
    updateURL(emptyFilters, currentSort, 1);
  };

  // Sort handler
  const handleSortChange = (newSort) => {
    setCurrentSort(newSort);
    setCurrentPage(1);
    updateURL(activeFilters, newSort, 1);
  };

  // Pagination handlers
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    updateURL(activeFilters, currentSort, nextPage);
  };

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Danh mục', href: '/category' },
    { label: getCategoryName(slug), href: null }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <ProductToolbar
        breadcrumbs={breadcrumbs}
        totalProducts={totalProducts}
        currentSort={currentSort}
        onSortChange={handleSortChange}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onClearFilters={handleClearFilters}
        onOpenFilters={() => setIsMobileFilterOpen(true)}
        isSticky={isToolbarSticky}
        isAuthenticated={isAuthenticated}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Handles both Desktop (25% fixed) and Mobile (off-canvas) */}
          <FilterSidebar
            filters={filterOptions}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            isOpen={isMobileFilterOpen}
            onClose={() => setIsMobileFilterOpen(false)}
          />

          {/* Main Content - 75% */}
          <main className="flex-1">
            {isLoading && currentPage === 1 ? (
              <ProductGridSkeleton />
            ) : products.length === 0 ? (
              <EmptyResults
                activeFilters={activeFilters}
                onRemoveFilter={handleRemoveFilter}
                onClearFilters={handleClearFilters}
                recommendations={generateMockProducts(4)}
              />
            ) : (
              <>
                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {products.map((product) => (
                    <EnhancedProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Đang tải...' : 'Xem Thêm Sản Phẩm'}
                    </button>
                  </div>
                )}

                {/* Page Info */}
                <div className="mt-8 text-center text-sm text-gray-600">
                  Đang xem trang {currentPage} - Tổng {totalProducts} sản phẩm
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Skeleton Loader
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden">
          <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper Functions
function getCategoryName(slug) {
  const categories = {
    'ao-thun': 'Áo Thun',
    'ao-nam': 'Áo Nam',
    'quan-jean': 'Quần Jean',
    'vay-dam': 'Váy Đầm',
    'phu-kien': 'Phụ Kiện'
  };
  return categories[slug] || 'Danh Mục';
}

function generateMockProducts(count) {
  const products = [];
  for (let i = 1; i <= count; i++) {
    products.push({
      id: i,
      name: `Sản phẩm thời trang ${i}`,
      slug: `product-${i}`,
      price: Math.floor(Math.random() * 1000000) + 200000,
      originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 1500000) + 300000 : null,
      discount: Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 10 : null,
      image: `/images/products/product-${i}.jpg`,
      rating: 4 + Math.random(),
      reviewCount: Math.floor(Math.random() * 500) + 10,
      isNew: Math.random() > 0.7,
      isBestSeller: Math.random() > 0.8,
      isAiPick: Math.random() > 0.85,
      availableSizes: ['S', 'M', 'L', 'XL'],
      availableColors: [
        { name: 'Đen', hex: '#000000' },
        { name: 'Trắng', hex: '#FFFFFF' },
        { name: 'Xám', hex: '#808080' }
      ],
      inStock: Math.random() > 0.1
    });
  }
  return products;
}

function generateMockFilterOptions() {
  return {
    categories: [
      { label: 'Áo thun', value: 'ao-thun', count: 123 },
      { label: 'Áo sơ mi', value: 'ao-so-mi', count: 89 },
      { label: 'Áo khoác', value: 'ao-khoac', count: 56 }
    ],
    sizes: [
      { label: 'XS', value: 'XS', count: 45 },
      { label: 'S', value: 'S', count: 123 },
      { label: 'M', value: 'M', count: 234 },
      { label: 'L', value: 'L', count: 198 },
      { label: 'XL', value: 'XL', count: 87 },
      { label: 'XXL', value: 'XXL', count: 34 }
    ],
    colors: [
      { label: 'Đen', value: 'black', count: 234 },
      { label: 'Trắng', value: 'white', count: 198 },
      { label: 'Xám', value: 'gray', count: 156 },
      { label: 'Xanh dương', value: 'blue', count: 123 },
      { label: 'Đỏ', value: 'red', count: 89 }
    ],
    brands: Array.from({ length: 15 }, (_, i) => ({
      label: `Brand ${i + 1}`,
      value: `brand-${i + 1}`,
      count: Math.floor(Math.random() * 100) + 10
    })),
    materials: [
      { label: 'Cotton', value: 'cotton', count: 234 },
      { label: 'Polyester', value: 'polyester', count: 123 },
      { label: 'Linen', value: 'linen', count: 67 }
    ]
  };
}
