'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/formatCurrency'
import { getImageUrl, handleImageError } from '@/lib/imageHelper'

export function OrderProducts({ order }) {
  const items = order?.items || []

  if (items.length === 0) {
    return null
  }

  return (
    <div className="order-products-container">
      <div className="products-header">
        <h2 className="products-title">Sản phẩm</h2>
        <span className="products-count">{items.length} sản phẩm</span>
      </div>

      <div className="products-list">
        {items.map((item, index) => {
          const itemImage = getImageUrl(item.image || item.product_image || '/images/placeholders/product-placeholder.svg')
          const itemName = item.name || item.product_name || 'Sản phẩm'
          const itemQuantity = item.quantity || 1
          const itemPrice = item.price || 0
          
          // Build variant string
          let variantStr = item.variant || '';
          if (!variantStr && (item.variant_color || item.variant_size)) {
            const parts = [];
            if (item.variant_color) parts.push(`Màu: ${item.variant_color}`);
            if (item.variant_size) parts.push(`Size: ${item.variant_size}`);
            variantStr = parts.join(' • ');
          }

          return (
            <div key={item.id || item.product_id || index} className="product-item">
              <div className="product-image">
                {itemImage.startsWith('data:image/') || itemImage.startsWith('http') || itemImage.startsWith('/') ? (
                  <Image
                    src={itemImage}
                    alt={itemName}
                    width={80}
                    height={80}
                    className="product-image"
                    unoptimized={itemImage.startsWith('data:image/')}
                  />
                ) : (
                  <img
                    src={itemImage}
                    alt={itemName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </div>
              <div className="product-details">
                <Link href={`/products/${item.slug || item.id}`} className="product-name">
                  {itemName}
                </Link>
                {variantStr && (
                  <div className="product-variants">
                    <span className="variant-item">{variantStr}</span>
                  </div>
                )}
                <div className="product-quantity">Số lượng: {itemQuantity}</div>
              </div>
              <div className="product-price">
                <span className="price-amount">{formatCurrency(itemPrice * itemQuantity)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

