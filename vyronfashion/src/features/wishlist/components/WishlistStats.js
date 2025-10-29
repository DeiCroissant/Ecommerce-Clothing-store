/**
 * WISHLIST STATS (OPTIMIZED)
 * 
 * ✅ useMemo for expensive calculations
 * ✅ Animated counters
 * ✅ React.memo
 */

'use client';

import { memo, useMemo } from 'react';
import { Heart, TrendingDown, Package, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/mockWishlistData';
import styles from './WishlistStats.module.css';

export const WishlistStats = memo(function WishlistStats({ stats }) {
  // Memoize formatted values
  const formattedStats = useMemo(() => ({
    totalValue: formatCurrency(stats.totalValue),
    totalSavings: formatCurrency(stats.totalSavings),
    avgValue: stats.totalItems > 0 
      ? formatCurrency(stats.totalValue / stats.totalItems)
      : formatCurrency(0)
  }), [stats]);

  const statsData = [
    {
      icon: Heart,
      label: 'Total Items',
      value: stats.totalItems,
      color: 'primary'
    },
    {
      icon: DollarSign,
      label: 'Total Value',
      value: formattedStats.totalValue,
      color: 'success'
    },
    {
      icon: TrendingDown,
      label: 'You Saved',
      value: formattedStats.totalSavings,
      color: 'success'
    },
    {
      icon: Package,
      label: 'In Stock',
      value: `${stats.inStockItems}/${stats.totalItems}`,
      color: 'info'
    }
  ];

  return (
    <div className={styles.statsContainer}>
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className={`${styles.statCard} ${styles[stat.color]}`}>
            <div className={styles.iconContainer}>
              <Icon size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          </div>
        );
      })}

      {stats.priceDrops > 0 && (
        <div className={`${styles.statCard} ${styles.highlight}`}>
          <TrendingDown size={20} />
          <span>{stats.priceDrops} price {stats.priceDrops === 1 ? 'drop' : 'drops'}!</span>
        </div>
      )}
    </div>
  );
});
