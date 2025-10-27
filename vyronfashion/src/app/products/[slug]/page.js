'use client';

import { useState, useRef } from 'react';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import VariantSelector from '@/components/product/VariantSelector';
import ProductActions from '@/components/product/ProductActions';
import ProductDetails from '@/components/product/ProductDetails';
import FlyToCart from '@/components/product/FlyToCart';
import Confetti from '@/components/product/Confetti';
import MiniCartSlideIn from '@/components/product/MiniCartSlideIn';
import { getProductImages } from '@/lib/mockImages';

// Mock data - sẽ thay thế bằng API call sau
const MOCK_PRODUCT = {
  id: '1',
  slug: 'ao-thun-basic-cotton-nam',
  name: 'Áo Thun Basic Cotton Nam Cao Cấp',
  brand: {
    name: 'VYRON',
    slug: 'vyron'
  },
  sku: 'VRN-AT-001',
  category: {
    name: 'Áo Nam',
    slug: 'ao-nam'
  },
  pricing: {
    original: 499000,
    sale: 349000,
    discount_percent: 30,
    currency: 'VND'
  },
  rating: {
    average: 4.5,
    count: 128
  },
  short_description: 'Áo thun nam basic với chất liệu cotton 100% thoáng mát, form dáng regular fit thoải mái. Thiết kế tối giản, dễ phối đồ, phù hợp cho mọi hoàn cảnh.',
  badges: [
    { text: 'Miễn phí vận chuyển', icon: '🚚' },
    { text: 'Cotton 100%', icon: '🌿' },
    { text: 'Best Seller', icon: '⭐' }
  ],
  variants: {
    colors: [
      { name: 'Đen', slug: 'black', hex: '#000000', available: true },
      { name: 'Trắng', slug: 'white', hex: '#FFFFFF', available: true },
      { name: 'Xám', slug: 'gray', hex: '#6B7280', available: true },
      { name: 'Navy', slug: 'navy', hex: '#1E3A8A', available: true },
      { name: 'Olive', slug: 'olive', hex: '#84A98C', available: false }
    ],
    sizes: [
      { name: 'S', available: true, stock: 15 },
      { name: 'M', available: true, stock: 28 },
      { name: 'L', available: true, stock: 32 },
      { name: 'XL', available: true, stock: 4 },
      { name: '2XL', available: false, stock: 0 }
    ]
  },
  inventory: {
    in_stock: true,
    quantity: 79,
    low_stock_threshold: 10
  },
  attributes: {
    material: '100% Cotton, 220gsm',
    origin: 'Việt Nam',
    features: [
      'Vải cotton mềm mại, thấm hút mồ hôi tốt',
      'Form regular fit thoải mái',
      'Đường may chắc chắn, tỉ mỉ',
      'Không xù lông sau nhiều lần giặt',
      'Màu sắc bền đẹp theo thời gian'
    ],
    care: [
      'Giặt máy ở nhiệt độ thường (30°C)',
      'Không sử dụng chất tẩy',
      'Ủi ở nhiệt độ trung bình',
      'Có thể giặt khô',
      'Phơi trong bóng mát'
    ]
  },
  policies: {
    return_days: 30,
    warranty: '12 tháng đổi mới nếu có lỗi từ nhà sản xuất',
    shipping: 'Giao hàng toàn quốc, nhận hàng trong 2-3 ngày'
  },
  size_chart: [
    { size: 'S', shoulder: '42', chest: '90', waist: '86', length: '66' },
    { size: 'M', shoulder: '44', chest: '94', waist: '90', length: '68' },
    { size: 'L', shoulder: '46', chest: '98', waist: '94', length: '70' },
    { size: 'XL', shoulder: '48', chest: '102', waist: '98', length: '72' },
    { size: '2XL', shoulder: '50', chest: '106', waist: '102', length: '74' }
  ]
};

export default function ProductDetailPage({ params }) {
  const [selectedVariant, setSelectedVariant] = useState({
    color: null,
    size: null
  });
  const [showToast, setShowToast] = useState(false);
  const [flyToCartActive, setFlyToCartActive] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [flyToCartPosition, setFlyToCartPosition] = useState(null);
  const [confettiOrigin, setConfettiOrigin] = useState({ x: 0, y: 0 });
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const addToCartButtonRef = useRef(null);

  // Get images from mock data
  const productImages = getProductImages(MOCK_PRODUCT.slug);

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
  };

  const handleAddToCart = (quantity) => {
    if (!selectedVariant.color || !selectedVariant.size) {
      alert('Vui lòng chọn màu sắc và kích cỡ');
      return;
    }

    // Get button position for animations
    if (addToCartButtonRef.current) {
      const buttonRect = addToCartButtonRef.current.getBoundingClientRect();
      const startX = buttonRect.left + buttonRect.width / 2;
      const startY = buttonRect.top + buttonRect.height / 2;
      
      setFlyToCartPosition({ x: startX, y: startY });
      setConfettiOrigin({ x: startX, y: startY });
    }

    // Add to cart items (mock)
    const newItem = {
      name: MOCK_PRODUCT.name,
      image: productImages[0].url,
      price: MOCK_PRODUCT.pricing.sale,
      color: MOCK_PRODUCT.variants.colors.find(c => c.slug === selectedVariant.color)?.name,
      size: selectedVariant.size,
      quantity: quantity,
    };
    
    setCartItems(prev => [...prev, newItem]);

    // Trigger animations
    setFlyToCartActive(true);
    setConfettiActive(true);

    console.log('Add to cart:', {
      product: MOCK_PRODUCT.name,
      variant: selectedVariant,
      quantity
    });
  };

  const handleFlyToCartComplete = () => {
    setFlyToCartActive(false);
    // Show toast
    setShowToast(true);
    // Open mini cart
    setTimeout(() => {
      setMiniCartOpen(true);
    }, 300);
    // Hide toast
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleConfettiComplete = () => {
    setConfettiActive(false);
  };

  const handleBuyNow = (quantity) => {
    if (!selectedVariant.color || !selectedVariant.size) {
      alert('Vui lòng chọn màu sắc và kích cỡ');
      return;
    }

    console.log('Buy now:', {
      product: MOCK_PRODUCT.name,
      variant: selectedVariant,
      quantity
    });

    // Redirect to checkout
    // router.push('/checkout');
    alert('Chuyển đến trang thanh toán...');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Product Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Gallery (58%) */}
          <div className="lg:col-span-7">
            <ProductGallery 
              images={productImages} 
              productName={MOCK_PRODUCT.name}
            />
          </div>

          {/* Right Column - Product Info & Actions (42%) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              {/* Product Info */}
              <ProductInfo product={MOCK_PRODUCT} />

              {/* Stock Status */}
              {MOCK_PRODUCT.inventory.quantity < MOCK_PRODUCT.inventory.low_stock_threshold && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-800 font-medium">
                    ⚠️ Chỉ còn {MOCK_PRODUCT.inventory.quantity} sản phẩm trong kho!
                  </p>
                </div>
              )}

              {/* Variant Selector */}
              <VariantSelector 
                variants={MOCK_PRODUCT.variants}
                onVariantChange={handleVariantChange}
              />

              {/* Actions */}
              <div ref={addToCartButtonRef}>
                <ProductActions
                  maxStock={MOCK_PRODUCT.inventory.quantity}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Thông tin chi tiết
          </h2>
          <ProductDetails product={MOCK_PRODUCT} />
        </div>
      </div>

      {/* Reviews Section - Placeholder */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 id="reviews" className="text-2xl font-bold text-gray-900 mb-6">
              Đánh giá sản phẩm ({MOCK_PRODUCT.rating.count})
            </h2>
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              <p>Phần đánh giá sẽ được phát triển trong phase tiếp theo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section - Placeholder */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Sản phẩm tương tự
          </h2>
          <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
            <p>Gợi ý sản phẩm sẽ được phát triển trong phase tiếp theo</p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-slide-up z-50">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Đã thêm vào giỏ hàng!</span>
        </div>
      )}

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 shadow-up">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">Giá chỉ</p>
            <p className="text-xl font-bold text-red-600">
              {MOCK_PRODUCT.pricing.sale.toLocaleString('vi-VN')}₫
            </p>
          </div>
          <button
            onClick={() => handleAddToCart(1)}
            className="flex-1 max-w-xs bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>

      {/* Animations & Overlays */}
      <FlyToCart
        isActive={flyToCartActive}
        productImage={productImages[0].url}
        productName={MOCK_PRODUCT.name}
        startPosition={flyToCartPosition}
        onComplete={handleFlyToCartComplete}
      />

      <Confetti
        isActive={confettiActive}
        origin={confettiOrigin}
        onComplete={handleConfettiComplete}
      />

      <MiniCartSlideIn
        isOpen={miniCartOpen}
        onClose={() => setMiniCartOpen(false)}
        items={cartItems}
      />
    </div>
  );
}
