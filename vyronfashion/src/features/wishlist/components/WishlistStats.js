'use client'

import { Heart } from 'lucide-react'
import styles from './WishlistStats.module.css'

export function WishlistStats({ items = [] }) {
  const totalItems = items.length
  const totalValue = items.reduce((sum, item) => {
    const price = item.pricing?.sale || item.pricing?.original || 0
    return sum + price
  }, 0)

  return (
    <div className={styles.stats}>
      <div className={styles.statCard}>
        <div className={styles.icon}>
          <Heart size={24} />
        </div>
        <div className={styles.content}>
          <div className={styles.label}>Tổng sản phẩm</div>
          <div className={styles.value}>{totalItems}</div>
        </div>
      </div>
      
      <div className={styles.statCard}>
        <div className={styles.icon}>
          <Heart size={24} />
        </div>
        <div className={styles.content}>
          <div className={styles.label}>Tổng giá trị</div>
          <div className={styles.value}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(totalValue)}
          </div>
        </div>
      </div>
    </div>
  )
}

