/**
 * WISHLIST HOOKS (FIXED - NO INFINITE LOOP)
 * 
 * Now using Context API to prevent nested hook calls
 * ✅ Single source of truth
 * ✅ No infinite loops
 * ✅ Performance optimized
 */

// Re-export from context to maintain backward compatibility
export { 
  useWishlist, 
  useWishlistItem,
  WishlistProvider 
} from './context';

import { useMemo } from 'react';
import { useWishlist } from './context';
import {
  filterWishlistItems,
  sortWishlistItems
} from '@/lib/mockWishlistData';

/**
 * Hook for filtered & sorted wishlist
 * ✅ Efficient filtering
 * ✅ Memoized results
 */
export function useFilteredWishlist(filters = {}, sortBy = 'date-desc') {
  const { wishlist } = useWishlist();

  const filteredAndSorted = useMemo(() => {
    let result = wishlist;

    // Apply filters (chained, no cloning until necessary)
    if (filters.inStockOnly || filters.priceDropsOnly || filters.onSaleOnly || filters.category) {
      result = filterWishlistItems(result, filters);
    }

    // Apply sort (creates new array)
    if (sortBy && sortBy !== 'date-desc') {
      result = sortWishlistItems(result, sortBy);
    }

    return result;
  }, [wishlist, filters, sortBy]);

  return filteredAndSorted;
}

/**
 * Hook for wishlist price tracking
 * ✅ Detects price changes
 */
export function useWishlistPriceTracking() {
  const { wishlist, updateNotifications } = useWishlist();

  // Get items with price changes
  const priceChanges = useMemo(() => {
    return wishlist.filter(item => {
      if (!item.priceChanged) return false;
      const change = item.product.price - item.priceAtAdd;
      return change !== 0;
    }).map(item => ({
      ...item,
      priceChange: item.product.price - item.priceAtAdd,
      percentChange: ((item.product.price - item.priceAtAdd) / item.priceAtAdd * 100).toFixed(0)
    }));
  }, [wishlist]);

  // Get price drops only
  const priceDrops = useMemo(() => {
    return priceChanges.filter(item => item.priceChange < 0);
  }, [priceChanges]);

  return {
    priceChanges,
    priceDrops,
    hasPriceChanges: priceChanges.length > 0,
    hasPriceDrops: priceDrops.length > 0
  };
}
