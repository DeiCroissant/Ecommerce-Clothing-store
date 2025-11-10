'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FilterSidebar from '@/components/category/FilterSidebar';
import ProductToolbar from '@/components/category/ProductToolbar';
import EnhancedProductCard from '@/components/category/EnhancedProductCard';
import EmptyResults from '@/components/category/EmptyResults';
import { motion } from 'framer-motion';

/**
 * New Arrivals Page Component
 * Displays all newly uploaded products sorted by created_at desc
 * Similar to category page but without category filter
 */
export default function NewArrivalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Sort & Pagination - Always sort by newest by default
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
  }, [activeFilters, currentSort, currentPage]);

  // Sticky toolbar detection
  useEffect(() => {
    const handleScroll = () => {
      const shouldBeSticky = window.scrollY > 200;
      setIsToolbarSticky(prev => {
        if (prev !== shouldBeSticky) {
          return shouldBeSticky;
        }
        return prev;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch products from API - Always sort by newest
  const fetchProducts = async () => {
    setIsLoading(true);

    try {
      // Import product API
      const productAPI = await import('@/lib/api/products');
      
      // Fetch all products sorted by newest (created_at desc)
      const response = await productAPI.getProducts({
        status: 'active',
        page: currentPage,
        limit: 24,
        sort: 'newest' // Always sort by newest for new arrivals
      });

      setProducts(response.products || []);
      setTotalProducts(response.total || 0);
      setHasMore(currentPage < response.totalPages);
      
      // Mock filter options (có thể tạo API riêng sau)
      const mockFilterOptions = generateMockFilterOptions();
      setFilterOptions(mockFilterOptions);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setTotalProducts(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
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

    // Add sort and page (but always keep sort as newest)
    if (newSort !== 'newest') params.set('sort', newSort);
    if (newPage > 1) params.set('page', newPage.toString());

    router.push(`/new-arrivals?${params.toString()}`, { scroll: false });
  };

  // Filter handlers - Memoized to prevent unnecessary re-renders
  const handleFilterChange = useCallback((filterType, value) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: value
    };
    setActiveFilters(newFilters);
    setCurrentPage(1); // Reset to page 1
    updateURL(newFilters, currentSort, 1);
  }, [activeFilters, currentSort]);

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

  // Sort handler (but always keep newest as default)
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
    { label: 'Sản Phẩm Mới', href: null }
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
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sản Phẩm Mới
              </h1>
              <p className="text-gray-600">
                Khám phá những sản phẩm mới nhất được cập nhật hàng ngày
              </p>
            </div>

            {isLoading && currentPage === 1 ? (
              <ProductGridSkeleton />
            ) : products.length === 0 ? (
              <EmptyResults
                activeFilters={activeFilters}
                onRemoveFilter={handleRemoveFilter}
                onClearFilters={handleClearFilters}
                recommendations={products.slice(0, 4)}
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
                      className="px-8 py-3 bg-zinc-900 text-white rounded-lg font-semibold hover:bg-zinc-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Đang tải...' : 'Xem Thêm Sản Phẩm'}
                    </button>
                  </div>
                )}

                {/* Page Info */}
                <div className="mt-8 text-center text-sm text-gray-600">
                  Đang xem trang {currentPage} - Tổng {totalProducts} sản phẩm mới
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

