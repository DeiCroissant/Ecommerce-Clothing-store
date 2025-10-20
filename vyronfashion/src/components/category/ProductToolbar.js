'use client';

import { ChevronDownIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterChips from './FilterChips';

/**
 * ProductToolbar Component
 * Sticky toolbar với breadcrumbs, count, sort, filter chips
 */
export default function ProductToolbar({
  breadcrumbs,
  totalProducts,
  currentSort,
  onSortChange,
  activeFilters,
  onRemoveFilter,
  onClearFilters,
  onOpenFilters,
  isSticky = false,
  isAuthenticated = false
}) {
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất', icon: null },
    { value: 'popular', label: 'Phổ biến', icon: null },
    ...(isAuthenticated ? [
      { value: 'ai_recommended', label: 'Phù hợp với bạn', icon: SparklesIcon }
    ] : []),
    { value: 'best_seller', label: 'Bán chạy', icon: null },
    { value: 'price_asc', label: 'Giá thấp đến cao', icon: null },
    { value: 'price_desc', label: 'Giá cao đến thấp', icon: null },
    { value: 'rating', label: 'Đánh giá cao', icon: null },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === currentSort)?.label || 'Sắp xếp';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.sort-dropdown')) {
        setShowSortMenu(false);
      }
    };

    if (showSortMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSortMenu]);

  return (
    <div
      className={`bg-white transition-all duration-300 ${
        isSticky ? 'sticky top-0 z-30 shadow-md' : 'border-b border-gray-200'
      }`}
    >
      <div className="container mx-auto px-4">
        {/* Top Row: Breadcrumbs (Desktop) */}
        <div className="hidden md:flex items-center py-3 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400">/</span>
              )}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
            </div>
          ))}
        </div>

        {/* Main Row: Count + Sort + Filter Button */}
        <div className="flex items-center justify-between py-4 gap-4">
          {/* Left: Product Count */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenFilters}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              <span className="font-medium">Lọc</span>
            </button>

            <div className="text-sm md:text-base">
              <span className="text-gray-600">Hiển thị </span>
              <span className="font-bold text-gray-900">{totalProducts.toLocaleString('vi-VN')}</span>
              <span className="text-gray-600"> sản phẩm</span>
            </div>
          </div>

          {/* Right: Sort Dropdown */}
          <div className="relative sort-dropdown">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-w-[180px] justify-between"
            >
              <span className="text-sm font-medium text-gray-700">
                {currentSortLabel}
              </span>
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${
                  showSortMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
                >
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = currentSort === option.value;

                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          onSortChange(option.value);
                          setShowSortMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-3 text-sm text-left transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        <span className="flex-1">{option.label}</span>
                        {option.value === 'ai_recommended' && (
                          <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full">
                            AI
                          </span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Filter Chips Row */}
        <div className="pb-4">
          <FilterChips
            activeFilters={activeFilters}
            onRemoveFilter={onRemoveFilter}
            onClearAll={onClearFilters}
          />
        </div>
      </div>
    </div>
  );
}
