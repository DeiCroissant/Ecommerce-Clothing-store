/**
 * WISHLIST CONTEXT (FIX INFINITE LOOP)
 * 
 * Single source of truth for wishlist state
 * ✅ No nested hooks
 * ✅ No infinite loops
 * ✅ Performance optimized
 */

'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  loadWishlistFromStorage,
  saveWishlistToStorage,
  getWishlistStats
} from '@/lib/mockWishlistData';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (only once)
  useEffect(() => {
    const stored = loadWishlistFromStorage();
    setWishlist(stored);
    setIsLoaded(true);
  }, []);

  // Save to localStorage on changes (with debounce)
  useEffect(() => {
    if (!isLoaded) return; // Don't save during initial load

    const timeoutId = setTimeout(() => {
      saveWishlistToStorage(wishlist);
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [wishlist, isLoaded]);

  // Create Set of product IDs for O(1) lookups
  const wishlistProductIds = useMemo(() => {
    return new Set(wishlist.map(item => item.productId));
  }, [wishlist]);

  // Calculate stats (memoized)
  const stats = useMemo(() => {
    return getWishlistStats(wishlist);
  }, [wishlist]);

  // Add to wishlist (optimistic)
  const addToWishlist = useCallback((product) => {
    if (wishlistProductIds.has(product.id)) {
      return { success: false, message: 'Already in wishlist' };
    }

    const newItem = {
      id: `wish-${Date.now()}`,
      productId: product.id,
      product: product,
      addedAt: new Date().toISOString(),
      priceAtAdd: product.price,
      priceChanged: false,
      notifyOnSale: true,
      notifyOnStock: !product.inStock
    };

    setWishlist(prev => [...prev, newItem]);
    return { success: true, message: 'Added to wishlist', item: newItem };
  }, [wishlistProductIds]);

  // Remove from wishlist (optimistic)
  const removeFromWishlist = useCallback((productId) => {
    setWishlist(prev => prev.filter(item => item.productId !== productId));
    return { success: true, message: 'Removed from wishlist' };
  }, []);

  // Toggle wishlist (add/remove)
  const toggleWishlist = useCallback((product) => {
    if (wishlistProductIds.has(product.id)) {
      return removeFromWishlist(product.id);
    } else {
      return addToWishlist(product);
    }
  }, [wishlistProductIds, addToWishlist, removeFromWishlist]);

  // Check if product is in wishlist (O(1))
  const isInWishlist = useCallback((productId) => {
    return wishlistProductIds.has(productId);
  }, [wishlistProductIds]);

  // Update notification settings
  const updateNotifications = useCallback((productId, notifications) => {
    setWishlist(prev => prev.map(item => 
      item.productId === productId
        ? { ...item, ...notifications }
        : item
    ));
  }, []);

  // Clear all wishlist
  const clearWishlist = useCallback(() => {
    setWishlist([]);
    return { success: true, message: 'Wishlist cleared' };
  }, []);

  // Move to cart
  const moveToCart = useCallback((productId) => {
    const item = wishlist.find(w => w.productId === productId);
    if (!item) return { success: false, message: 'Item not found' };

    removeFromWishlist(productId);
    return { 
      success: true, 
      message: 'Moved to cart',
      product: item.product 
    };
  }, [wishlist, removeFromWishlist]);

  const value = {
    wishlist,
    stats,
    isLoaded,
    wishlistProductIds,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    updateNotifications,
    clearWishlist,
    moveToCart
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

// Hook to use wishlist context
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}

// Hook for single wishlist item
export function useWishlistItem(productId) {
  const { wishlist, isInWishlist, removeFromWishlist, updateNotifications } = useWishlist();

  const item = useMemo(() => {
    return wishlist.find(w => w.productId === productId);
  }, [wishlist, productId]);

  const inWishlist = useMemo(() => {
    return isInWishlist(productId);
  }, [isInWishlist, productId]);

  return {
    item,
    inWishlist,
    removeFromWishlist: () => removeFromWishlist(productId),
    updateNotifications: (notifications) => updateNotifications(productId, notifications)
  };
}
