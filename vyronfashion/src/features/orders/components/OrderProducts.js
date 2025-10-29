import Link from 'next/link';
import { formatCurrency } from '@/lib/mockOrdersData';

export function OrderProducts({ items, itemsCount }) {
  return (
    <div className="order-products-container">
      <div className="products-header">
        <h3 className="products-title">Sản Phẩm</h3>
        <span className="products-count">{itemsCount} sản phẩm</span>
      </div>

      <div className="products-list">
        {items.map((item, index) => (
          <div key={index} className="product-item">
            <Link href={`/products/${item.slug}`} className="product-image">
              <img 
                src={item.image} 
                alt={item.name}
                onError={(e) => {
                  e.target.src = '/images/placeholders/product.jpg';
                }}
              />
            </Link>

            <div className="product-details">
              <Link href={`/products/${item.slug}`} className="product-name">
                {item.name}
              </Link>
              
              <div className="product-variants">
                {item.variant.size && (
                  <span className="variant-item">Size: {item.variant.size}</span>
                )}
                {item.variant.color && (
                  <>
                    <span className="variant-separator">•</span>
                    <span className="variant-item">Màu: {item.variant.color}</span>
                  </>
                )}
              </div>

              <div className="product-quantity">
                Số lượng: <strong>x{item.quantity}</strong>
              </div>
            </div>

            <div className="product-price">
              {formatCurrency(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
