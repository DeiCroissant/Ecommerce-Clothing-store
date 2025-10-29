/**
 * WISHLIST GRID (OPTIMIZED)
 * 
 * ✅ Responsive CSS Grid
 * ✅ Empty state handling
 * ✅ Virtual scroll ready
 */

'use client';

import { memo } from 'react';
import { WishlistCard } from './WishlistCard';
import styles from './WishlistGrid.module.css';

export const WishlistGrid = memo(function WishlistGrid({
  items,
  onRemove,
  onAddToCart,
  onQuickView
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.wishlistGrid}>
      {items.map((item) => (
        <WishlistCard
          key={item.id}
          item={item}
          onRemove={onRemove}
          onAddToCart={onAddToCart}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
});
