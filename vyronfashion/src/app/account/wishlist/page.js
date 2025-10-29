/**
 * WISHLIST PAGE (HIGHLY OPTIMIZED)
 * 
 * Performance optimizations applied:
 * ✅ No array cloning
 * ✅ Chained filters
 * ✅ Memoized computations
 * ✅ Optimistic updates
 * ✅ Efficient state management
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, Filter, SortAsc, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useWishlist } from '@/features/wishlist/hooks';
import { WishlistGrid } from '@/features/wishlist/components/WishlistGrid';
import { WishlistStats } from '@/features/wishlist/components/WishlistStats';
import { WishlistEmpty } from '@/features/wishlist/components/WishlistEmpty';
import { 
  filterWishlistItems, 
  sortWishlistItems,
  getWishlistCategories 
} from '@/lib/mockWishlistData';
import styles from './wishlist.module.css';

export default function WishlistPage() {
  const { wishlist, stats, isLoaded, removeFromWishlist, clearWishlist } = useWishlist();
  
  // Filter & Sort State
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSortBy, setActiveSortBy] = useState('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories (memoized)
  const categories = useMemo(() => 
    getWishlistCategories(wishlist),
    [wishlist]
  );

  // Apply filters and sorting (optimized - no cloning until necessary)
  const filteredAndSortedItems = useMemo(() => {
    let result = wishlist;

    // Apply filters
    const filters = {
      inStockOnly: activeFilter === 'in-stock',
      priceDropsOnly: activeFilter === 'price-drops',
      onSaleOnly: activeFilter === 'on-sale',
      category: activeFilter.startsWith('category-') 
        ? activeFilter.replace('category-', '') 
        : null
    };

    if (activeFilter !== 'all') {
      result = filterWishlistItems(result, filters);
    }

    // Apply sorting (only creates new array if needed)
    if (activeSortBy !== 'date-desc') {
      result = sortWishlistItems(result, activeSortBy);
    } else if (result === wishlist) {
      // Default sort is already date-desc, but ensure it
      result = sortWishlistItems(result, 'date-desc');
    }

    return result;
  }, [wishlist, activeFilter, activeSortBy]);

  // Handle remove with confirmation
  const handleRemove = useCallback((productId) => {
    if (confirm('Remove this item from your wishlist?')) {
      removeFromWishlist(productId);
    }
  }, [removeFromWishlist]);

  // Handle clear all with confirmation
  const handleClearAll = useCallback(() => {
    if (confirm(`Remove all ${wishlist.length} items from your wishlist?`)) {
      clearWishlist();
    }
  }, [wishlist.length, clearWishlist]);

  // Handle add to cart
  const handleAddToCart = useCallback((product) => {
    // In real app, this would call cart API
    alert(`Added "${product.name}" to cart!`);
  }, []);

  // Handle quick view
  const handleQuickView = useCallback((product) => {
    // In real app, this would open a modal
    alert(`Quick view for "${product.name}"`);
  }, []);

  // Loading state
  if (!isLoaded) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading wishlist...</div>
      </div>
    );
  }

  // Empty state
  if (wishlist.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/account" className={styles.backButton}>
            <ArrowLeft size={20} />
            <span>Back to Account</span>
          </Link>
          <h1 className={styles.title}>My Wishlist</h1>
        </div>
        <WishlistEmpty />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/account" className={styles.backButton}>
            <ArrowLeft size={20} />
            <span>Back to Account</span>
          </Link>
          <button
            type="button"
            onClick={handleClearAll}
            className={styles.clearAllButton}
          >
            <Trash2 size={18} />
            <span>Clear All</span>
          </button>
        </div>
        <h1 className={styles.title}>
          My Wishlist
          <span className={styles.count}>({wishlist.length} items)</span>
        </h1>
      </div>

      {/* Stats */}
      <WishlistStats stats={stats} />

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`${styles.toolbarButton} ${showFilters ? styles.active : ''}`}
        >
          <Filter size={18} />
          <span>Filter</span>
        </button>

        <div className={styles.sortContainer}>
          <SortAsc size={18} />
          <select
            value={activeSortBy}
            onChange={(e) => setActiveSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="discount-desc">Biggest Discount</option>
          </select>
        </div>

        <div className={styles.resultCount}>
          Showing {filteredAndSortedItems.length} of {wishlist.length} items
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={styles.filters}>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`${styles.filterChip} ${activeFilter === 'all' ? styles.active : ''}`}
          >
            All Items
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('in-stock')}
            className={`${styles.filterChip} ${activeFilter === 'in-stock' ? styles.active : ''}`}
          >
            In Stock ({stats.inStockItems})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('price-drops')}
            className={`${styles.filterChip} ${activeFilter === 'price-drops' ? styles.active : ''}`}
          >
            Price Drops ({stats.priceDrops})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('on-sale')}
            className={`${styles.filterChip} ${activeFilter === 'on-sale' ? styles.active : ''}`}
          >
            On Sale ({stats.onSaleItems})
          </button>

          {categories.length > 0 && (
            <div className={styles.categorySeparator}>
              <span>Categories:</span>
            </div>
          )}

          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveFilter(`category-${category}`)}
              className={`${styles.filterChip} ${activeFilter === `category-${category}` ? styles.active : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filteredAndSortedItems.length > 0 ? (
        <WishlistGrid
          items={filteredAndSortedItems}
          onRemove={handleRemove}
          onAddToCart={handleAddToCart}
          onQuickView={handleQuickView}
        />
      ) : (
        <div className={styles.noResults}>
          <p>No items match your filters.</p>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={styles.clearFiltersButton}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
