'use client';

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon 
} from '@heroicons/react/24/outline';

/**
 * FilterSidebar Component
 * Faceted filtering với multi-select, search trong facet, facet counts
 * 
 * @note Wrapped with React.memo to prevent unnecessary re-renders
 * when parent component re-renders (e.g., during scroll events)
 */
function FilterSidebar({ 
  filters, 
  activeFilters, 
  onFilterChange,
  isOpen,
  onClose 
}) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    size: true,
    color: true,
    brand: true,
    features: true
  });

  const [searchTerms, setSearchTerms] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterToggle = (filterType, value) => {
    const current = activeFilters[filterType] || [];
    let updated;
    
    if (current.includes(value)) {
      updated = current.filter(v => v !== value);
    } else {
      updated = [...current, value];
    }
    
    onFilterChange(filterType, updated);
  };

  const handlePriceRange = (min, max) => {
    onFilterChange('priceRange', { min, max });
  };

  const filterOptionsBySearch = (options, searchTerm) => {
    if (!searchTerm) return options;
    return options.filter(opt => 
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const FilterSection = ({ title, filterKey, options, type = 'checkbox' }) => {
    const isExpanded = expandedSections[filterKey];
    const searchTerm = searchTerms[filterKey] || '';
    const filteredOptions = filterOptionsBySearch(options, searchTerm);
    const showSearch = options.length > 8;

    return (
      <div className="border-b border-gray-200 py-4">
        <button
          onClick={() => toggleSection(filterKey)}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-900 hover:text-blue-600 transition-colors"
        >
          <span>{title}</span>
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-2">
                {showSearch && (
                  <div className="relative mb-3">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Tìm ${title.toLowerCase()}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerms(prev => ({
                        ...prev,
                        [filterKey]: e.target.value
                      }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredOptions.map(option => {
                    const isActive = activeFilters[filterKey]?.includes(option.value);
                    const isDisabled = option.count === 0;

                    return (
                      <label
                        key={option.value}
                        className={`flex items-center justify-between py-1 cursor-pointer ${
                          isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:text-blue-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isActive}
                            disabled={isDisabled}
                            onChange={() => !isDisabled && handleFilterToggle(filterKey, option.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                          />
                          <span className="text-sm text-gray-700">
                            {option.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({option.count})
                        </span>
                      </label>
                    );
                  })}
                </div>

                {filteredOptions.length === 0 && (
                  <p className="text-sm text-gray-500 py-2">
                    Không tìm thấy kết quả
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const PriceRangeSection = () => {
    const priceRanges = [
      { label: 'Dưới 200K', min: 0, max: 200000 },
      { label: '200K - 500K', min: 200000, max: 500000 },
      { label: '500K - 1M', min: 500000, max: 1000000 },
      { label: 'Trên 1M', min: 1000000, max: 10000000 },
    ];

    const isExpanded = expandedSections.price;
    const currentRange = activeFilters.priceRange || {};

    return (
      <div className="border-b border-gray-200 py-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-900 hover:text-blue-600 transition-colors"
        >
          <span>Khoảng Giá</span>
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-2">
                {priceRanges.map(range => {
                  const isActive = currentRange.min === range.min && currentRange.max === range.max;
                  
                  return (
                    <label
                      key={range.label}
                      className="flex items-center py-1 cursor-pointer hover:text-blue-600"
                    >
                      <input
                        type="radio"
                        name="priceRange"
                        checked={isActive}
                        onChange={() => handlePriceRange(range.min, range.max)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {range.label}
                      </span>
                    </label>
                  );
                })}

                {/* Custom Range Slider */}
                <div className="pt-4 space-y-2">
                  <label className="text-xs text-gray-600 font-medium">
                    Hoặc chọn khoảng giá tùy chỉnh:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Từ"
                      min="0"
                      value={currentRange.min || ''}
                      onChange={(e) => handlePriceRange(parseInt(e.target.value) || 0, currentRange.max || 10000000)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Đến"
                      min="0"
                      value={currentRange.max || ''}
                      onChange={(e) => handlePriceRange(currentRange.min || 0, parseInt(e.target.value) || 10000000)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const FeaturesSection = () => {
    const features = [
      { label: 'Còn hàng', value: 'in_stock', count: 1234 },
      { label: 'Miễn phí vận chuyển', value: 'free_shipping', count: 567 },
      { label: 'Giảm giá', value: 'on_sale', count: 345 },
    ];

    const isExpanded = expandedSections.features;

    return (
      <div className="border-b border-gray-200 py-4">
        <button
          onClick={() => toggleSection('features')}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-900 hover:text-blue-600 transition-colors"
        >
          <span>Tính Năng</span>
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-2">
                {features.map(feature => {
                  const isActive = activeFilters.features?.includes(feature.value);

                  return (
                    <label
                      key={feature.value}
                      className="flex items-center justify-between py-1 cursor-pointer hover:text-blue-600"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => handleFilterToggle('features', feature.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {feature.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        ({feature.count})
                      </span>
                    </label>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Bộ Lọc</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Bộ Lọc</h2>
      </div>

      {/* Filters Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 1. Toàn Bộ Sản Phẩm (Categories) */}
        {filters.categories && (
          <FilterSection
            title="Toàn Bộ Sản Phẩm"
            filterKey="category"
            options={filters.categories}
          />
        )}

        {/* 2. Khoảng Giá (Price Range) */}
        <PriceRangeSection />

        {/* 3. Kích Thước (Size) */}
        {filters.sizes && (
          <FilterSection
            title="Kích Thước"
            filterKey="size"
            options={filters.sizes}
          />
        )}

        {/* Additional filters (can be hidden or shown based on needs) */}
        {filters.colors && (
          <FilterSection
            title="Màu Sắc"
            filterKey="color"
            options={filters.colors}
          />
        )}

        {filters.brands && (
          <FilterSection
            title="Thương Hiệu"
            filterKey="brand"
            options={filters.brands}
          />
        )}

        {filters.materials && (
          <FilterSection
            title="Chất Liệu"
            filterKey="material"
            options={filters.materials}
          />
        )}

        <FeaturesSection />
      </div>

      {/* Mobile Footer */}
      <div className="lg:hidden p-4 border-t border-gray-200 bg-white">
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Áp Dụng Bộ Lọc
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-1/4 shrink-0">
        <div className="sticky top-24">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Off-canvas */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[85%] max-w-sm z-50"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Custom comparison function for React.memo
// Only re-render if filters, activeFilters, or isOpen actually change
function arePropsEqual(prevProps, nextProps) {
  return (
    prevProps.filters === nextProps.filters &&
    JSON.stringify(prevProps.activeFilters) === JSON.stringify(nextProps.activeFilters) &&
    prevProps.isOpen === nextProps.isOpen
  );
}

export default memo(FilterSidebar, arePropsEqual);
