/**
 * WISHLIST CARD (HIGHLY OPTIMIZED)
 * 
 * Performance optimizations:
 * ✅ React.memo with custom comparison
 * ✅ useMemo for computed values
 * ✅ Lazy load images
 * ✅ Price change indicators
 */

'use client';

import { memo, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, X, TrendingDown, AlertCircle, Star } from 'lucide-react';
import { formatCurrency, formatDateRelative, getPriceChange } from '@/lib/mockWishlistData';
import { WishlistButton } from './WishlistButton';
import styles from './WishlistCard.module.css';

export const WishlistCard = memo(function WishlistCard({
  item,
  onRemove,
  onAddToCart,
  onQuickView
}) {
  const { product } = item;

  // Memoize formatted values to prevent recalculation on every render
  const formattedData = useMemo(() => ({
    price: formatCurrency(product.price),
    originalPrice: product.originalPrice > product.price 
      ? formatCurrency(product.originalPrice) 
      : null,
    addedDate: formatDateRelative(item.addedAt),
    priceChange: getPriceChange(item)
  }), [product.price, product.originalPrice, item.addedAt, item]);

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove?.(product.id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    onQuickView?.(product);
  };

  return (
    <article className={styles.wishlistCard}>
      {/* Remove Button */}
      <button
        type="button"
        onClick={handleRemove}
        className={styles.removeButton}
        aria-label="Remove from wishlist"
      >
        <X size={16} />
      </button>

      {/* Price Drop Badge */}
      {formattedData.priceChange?.isDecrease && (
        <div className={styles.priceDropBadge}>
          <TrendingDown size={14} />
          <span>{formattedData.priceChange.percent}% OFF</span>
        </div>
      )}

      {/* Out of Stock Badge */}
      {!product.inStock && (
        <div className={styles.outOfStockBadge}>
          <AlertCircle size={14} />
          <span>Out of Stock</span>
        </div>
      )}

      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className={styles.imageContainer}>
        <Image
          src={product.image}
          alt={product.name}
          width={300}
          height={400}
          className={styles.image}
          loading="lazy"
          onError={(e) => {
            // Guard: prevent infinite loop if placeholder also fails
            if (e.target.src.includes('placeholder')) return;
            e.target.src = '/images/placeholders/product.jpg';
          }}
        />
      </Link>

      {/* Product Info */}
      <div className={styles.content}>
        <Link href={`/products/${product.slug}`} className={styles.productName}>
          {product.name}
        </Link>

        <div className={styles.category}>{product.category}</div>

        {/* Rating */}
        {product.rating && (
          <div className={styles.rating}>
            <Star size={14} fill="var(--color-primary)" stroke="var(--color-primary)" />
            <span>{product.rating}</span>
            <span className={styles.reviews}>({product.reviews})</span>
          </div>
        )}

        {/* Price */}
        <div className={styles.priceContainer}>
          <span className={styles.currentPrice}>{formattedData.price}</span>
          {formattedData.originalPrice && (
            <span className={styles.originalPrice}>{formattedData.originalPrice}</span>
          )}
          {product.discount > 0 && (
            <span className={styles.discount}>-{product.discount}%</span>
          )}
        </div>

        {/* Price Change Info */}
        {formattedData.priceChange && (
          <div className={`${styles.priceChangeInfo} ${
            formattedData.priceChange.isDecrease ? styles.decreased : styles.increased
          }`}>
            {formattedData.priceChange.isDecrease ? (
              <span>Price dropped by {formatCurrency(formattedData.priceChange.amount)}!</span>
            ) : (
              <span>Price increased by {formatCurrency(formattedData.priceChange.amount)}</span>
            )}
          </div>
        )}

        {/* Stock Info */}
        {product.inStock && product.stockCount <= 5 && (
          <div className={styles.lowStock}>
            Only {product.stockCount} left in stock!
          </div>
        )}

        {/* Added Date */}
        <div className={styles.addedDate}>
          Added {formattedData.addedDate}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={styles.addToCartButton}
          >
            <ShoppingCart size={18} />
            <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
          </button>

          <button
            type="button"
            onClick={handleQuickView}
            className={styles.quickViewButton}
          >
            Quick View
          </button>
        </div>
      </div>
    </article>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for React.memo
  // Only re-render if item data actually changed
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.product.price === nextProps.item.product.price &&
    prevProps.item.product.inStock === nextProps.item.product.inStock &&
    prevProps.item.priceChanged === nextProps.item.priceChanged
  );
});
