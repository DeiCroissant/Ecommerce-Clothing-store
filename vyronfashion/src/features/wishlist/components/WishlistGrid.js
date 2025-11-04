'use client'

import Link from 'next/link'
import { Trash2, Heart } from 'lucide-react'
import { formatCurrency } from '@/lib/formatCurrency'
import styles from './WishlistGrid.module.css'

export function WishlistGrid({ items = [], onRemove }) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className={styles.grid}>
      {items.map((product) => {
        const price = product.pricing?.sale || product.pricing?.original || 0
        const originalPrice = product.pricing?.original && product.pricing?.sale ? product.pricing.original : null
        const image = product.image || product.images?.[0] || ''
        
        return (
          <div key={product.id} className={styles.card}>
            <Link href={`/products/${product.slug}`} className={styles.imageLink}>
              <div className={styles.imageContainer}>
                <img
                  src={image}
                  alt={product.name}
                  className={styles.image}
                />
              </div>
            </Link>
            
            <div className={styles.content}>
              <Link href={`/products/${product.slug}`} className={styles.titleLink}>
                <h3 className={styles.title}>{product.name}</h3>
              </Link>
              
              <div className={styles.price}>
                <span className={styles.currentPrice}>
                  {formatCurrency(price)}
                </span>
                {originalPrice && originalPrice > price && (
                  <span className={styles.originalPrice}>
                    {formatCurrency(originalPrice)}
                  </span>
                )}
              </div>
              
              <button
                onClick={() => onRemove(product.id)}
                className={styles.removeButton}
                title="Xóa khỏi yêu thích"
              >
                <Trash2 size={18} />
                <span>Xóa</span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

