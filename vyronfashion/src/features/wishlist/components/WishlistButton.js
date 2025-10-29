/**
 * WISHLIST BUTTON - Heart Icon (OPTIMIZED)
 * 
 * Reusable button for add/remove from wishlist
 * ✅ React.memo for performance
 * ✅ Optimistic updates
 * ✅ Accessible
 */

'use client';

import { memo } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../hooks';
import styles from './WishlistButton.module.css';

export const WishlistButton = memo(function WishlistButton({
  product,
  size = 'medium',
  showLabel = false,
  className = '',
  onToggle
}) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const result = toggleWishlist(product);
    onToggle?.(result);
  };

  const sizeClass = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large
  }[size];

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.wishlistButton} ${sizeClass} ${inWishlist ? styles.active : ''} ${className}`}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart 
        className={styles.icon}
        fill={inWishlist ? 'currentColor' : 'none'}
      />
      {showLabel && (
        <span className={styles.label}>
          {inWishlist ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
});
