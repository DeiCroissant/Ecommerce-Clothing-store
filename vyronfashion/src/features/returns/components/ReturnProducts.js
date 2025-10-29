import { formatCurrency } from '@/lib/mockReturnsData';

export function ReturnProducts({ products }) {
  return (
    <div className="return-products-container">
      <h3 className="products-title">Sản Phẩm Trả Hàng</h3>
      
      <div className="products-list">
        {products.map((product) => (
          <div key={product.productId} className="product-item">
            <div className="product-image-wrapper">
              <img 
                src={product.image} 
                alt={product.name}
                className="product-image"
              />
            </div>
            
            <div className="product-info">
              <h4 className="product-name">{product.name}</h4>
              
              <div className="product-variants">
                {product.color && (
                  <span className="variant">Màu: {product.color}</span>
                )}
                {product.size && (
                  <span className="variant">Size: {product.size}</span>
                )}
              </div>
              
              <div className="product-meta">
                <span className="product-quantity">x{product.quantity}</span>
                <span className="product-price">{formatCurrency(product.price)}</span>
              </div>
            </div>
            
            <div className="product-reason">
              <span className="reason-label">Lý do:</span>
              <span className="reason-text">{product.reason}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="products-summary">
        <div className="summary-row">
          <span>Tổng số sản phẩm:</span>
          <span className="summary-value">
            {products.reduce((sum, p) => sum + p.quantity, 0)} sản phẩm
          </span>
        </div>
        <div className="summary-row total">
          <span>Tổng giá trị:</span>
          <span className="summary-value">
            {formatCurrency(products.reduce((sum, p) => sum + (p.price * p.quantity), 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
