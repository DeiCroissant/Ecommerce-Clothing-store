/**
 * WISHLIST EMPTY STATE
 */

'use client';

import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import styles from './WishlistEmpty.module.css';

export function WishlistEmpty() {
  return (
    <div className={styles.emptyContainer}>
      <div className={styles.iconContainer}>
        <Heart size={80} />
      </div>
      <h2 className={styles.title}>Your Wishlist is Empty</h2>
      <p className={styles.description}>
        Start adding products you love to your wishlist!<br />
        They'll be saved here for easy access.
      </p>
      <Link href="/category/all" className={styles.shopButton}>
        <ShoppingBag size={20} />
        <span>Start Shopping</span>
      </Link>
    </div>
  );
}
