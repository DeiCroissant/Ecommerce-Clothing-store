'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MinusIcon, 
  PlusIcon, 
  TrashIcon, 
  ShoppingBagIcon, 
  ArrowLeftIcon,
  TicketIcon,
  GiftIcon,
  MapPinIcon,
  BookmarkIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

// Mock cart data - sẽ thay bằng context/redux sau
const INITIAL_CART_ITEMS = [
  {
    id: '1',
    productId: 'prod-001',
    slug: 'ao-thun-basic-cotton-nam',
    name: 'Áo Thun Basic Cotton Nam Cao Cấp',
    brand: 'VYRON',
    sku: 'VRN-AT-001',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    color: { name: 'Đen', hex: '#000000' },
    size: 'M',
    price: {
      original: 499000,
      sale: 349000,
      discount: 30
    },
    quantity: 2,
    stock: 28,
    inStock: true
  },
  {
    id: '2',
    productId: 'prod-002',
    slug: 'ao-so-mi-trang',
    name: 'Áo Sơ Mi Trắng Oxford',
    brand: 'VYRON',
    sku: 'VRN-SM-002',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop',
    color: { name: 'Trắng', hex: '#FFFFFF' },
    size: 'L',
    price: {
      original: 599000,
      sale: 599000,
      discount: 0
    },
    quantity: 1,
    stock: 15,
    inStock: true
  },
  {
    id: '3',
    productId: 'prod-003',
    slug: 'quan-jean-slim-fit',
    name: 'Quần Jean Slim Fit',
    brand: 'VYRON',
    sku: 'VRN-QJ-003',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
    color: { name: 'Xanh đậm', hex: '#1E3A8A' },
    size: '32',
    price: {
      original: 799000,
      sale: 639000,
      discount: 20
    },
    quantity: 1,
    stock: 3, // Low stock
    inStock: true
  }
];

// Mock promo codes
const PROMO_CODES = {
  'WELCOME10': { discount: 10, type: 'percentage', minOrder: 200000 },
  'SUMMER2024': { discount: 50000, type: 'fixed', minOrder: 500000 },
  'FREESHIP': { discount: 30000, type: 'shipping', minOrder: 0 },
  'VIP20': { discount: 20, type: 'percentage', minOrder: 1000000 }
};

// Mock provinces for shipping estimator
const PROVINCES = [
  { id: 'hanoi', name: 'Hà Nội', shippingFee: 30000, estimatedDays: '1-2' },
  { id: 'hcm', name: 'TP. Hồ Chí Minh', shippingFee: 30000, estimatedDays: '1-2' },
  { id: 'danang', name: 'Đà Nẵng', shippingFee: 35000, estimatedDays: '2-3' },
  { id: 'haiphong', name: 'Hải Phòng', shippingFee: 32000, estimatedDays: '2-3' },
  { id: 'cantho', name: 'Cần Thơ', shippingFee: 40000, estimatedDays: '3-4' },
  { id: 'binhduong', name: 'Bình Dương', shippingFee: 28000, estimatedDays: '1-2' },
  { id: 'other', name: 'Tỉnh thành khác', shippingFee: 45000, estimatedDays: '4-5' }
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(INITIAL_CART_ITEMS);
  const [savedItems, setSavedItems] = useState([]);
  const [deletedItem, setDeletedItem] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  
  // Gift wrap states
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const giftWrapPrice = 15000;
  
  // Shipping estimator states
  const [selectedProvince, setSelectedProvince] = useState(null);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price.sale * item.quantity), 0);
  const shippingThreshold = 500000;
  
  // Calculate shipping fee
  let shippingFee = 30000; // Default
  if (selectedProvince) {
    shippingFee = selectedProvince.shippingFee;
  }
  if (subtotal >= shippingThreshold || (appliedPromo && appliedPromo.type === 'shipping')) {
    shippingFee = 0;
  }
  
  // Calculate discount
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percentage') {
      discount = Math.round(subtotal * appliedPromo.discount / 100);
    } else if (appliedPromo.type === 'fixed') {
      discount = appliedPromo.discount;
    } else if (appliedPromo.type === 'shipping') {
      discount = shippingFee;
    }
  }
  
  const tax = Math.round((subtotal - discount) * 0.1); // 10% VAT
  const giftWrapTotal = giftWrap ? giftWrapPrice : 0;
  const total = subtotal - discount + shippingFee + tax + giftWrapTotal;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Handle quantity change
  const handleQuantityChange = (itemId, newQuantity) => {
    const item = cartItems.find(i => i.id === itemId);
    
    // Validation
    if (newQuantity < 1 || newQuantity > item.stock) {
      return;
    }

    // Optimistic update
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    // Simulate API call
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 300);
  };

  // Handle delete item
  const handleDeleteItem = (itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    setDeletedItem(item);
    setCartItems(prev => prev.filter(i => i.id !== itemId));

    // Auto-clear undo after 5 seconds
    setTimeout(() => setDeletedItem(null), 5000);
  };

  // Handle undo delete
  const handleUndoDelete = () => {
    if (deletedItem) {
      setCartItems(prev => [...prev, deletedItem]);
      setDeletedItem(null);
    }
  };

  // Handle promo code
  const handleApplyPromo = () => {
    setPromoError('');
    
    const code = promoCode.toUpperCase().trim();
    if (!code) {
      setPromoError('Vui lòng nhập mã giảm giá');
      return;
    }
    
    const promo = PROMO_CODES[code];
    if (!promo) {
      setPromoError('Mã giảm giá không hợp lệ');
      return;
    }
    
    if (subtotal < promo.minOrder) {
      setPromoError(`Đơn hàng tối thiểu ${promo.minOrder.toLocaleString('vi-VN')}₫`);
      return;
    }
    
    setAppliedPromo({ code, ...promo });
    setPromoCode('');
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError('');
  };

  // Handle save for later
  const handleSaveForLater = (itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    if (item) {
      setSavedItems(prev => [...prev, item]);
      setCartItems(prev => prev.filter(i => i.id !== itemId));
    }
  };

  const handleMoveToCart = (itemId) => {
    const item = savedItems.find(i => i.id === itemId);
    if (item) {
      setCartItems(prev => [...prev, item]);
      setSavedItems(prev => prev.filter(i => i.id !== itemId));
    }
  };

  const handleRemoveSaved = (itemId) => {
    setSavedItems(prev => prev.filter(i => i.id !== itemId));
  };

  // Empty cart state
  if (cartItems.length === 0 && !deletedItem) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBagIcon className="w-16 h-16 text-gray-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Giỏ hàng trống
              </h1>
              <p className="text-gray-600 mb-8">
                Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Giỏ hàng ({totalItems} sản phẩm)
              </h1>
              <nav className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
                <span>/</span>
                <span className="text-gray-900">Giỏ hàng</span>
              </nav>
            </div>
            <Link
              href="/"
              className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>

      {/* Undo Delete Toast */}
      {deletedItem && (
        <div className="fixed top-24 right-8 bg-gray-900 text-white px-6 py-4 rounded-lg shadow-xl z-50 animate-slide-in-right">
          <div className="flex items-center gap-4">
            <span>Đã xóa "{deletedItem.name}"</span>
            <button
              onClick={handleUndoDelete}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Hoàn tác
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items - 65% */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onDelete={handleDeleteItem}
                onSaveForLater={handleSaveForLater}
                isUpdating={isUpdating}
              />
            ))}

            {/* Advanced Features Section */}
            <div className="space-y-4">
              {/* Promo Code */}
              <PromoCodeSection
                promoCode={promoCode}
                setPromoCode={setPromoCode}
                appliedPromo={appliedPromo}
                promoError={promoError}
                onApply={handleApplyPromo}
                onRemove={handleRemovePromo}
              />

              {/* Gift Wrap */}
              <GiftWrapSection
                giftWrap={giftWrap}
                setGiftWrap={setGiftWrap}
                giftMessage={giftMessage}
                setGiftMessage={setGiftMessage}
                giftWrapPrice={giftWrapPrice}
              />

              {/* Shipping Estimator */}
              <ShippingEstimator
                selectedProvince={selectedProvince}
                setSelectedProvince={setSelectedProvince}
                provinces={PROVINCES}
              />
            </div>

            {/* Saved Items */}
            {savedItems.length > 0 && (
              <SavedItemsSection
                savedItems={savedItems}
                onMoveToCart={handleMoveToCart}
                onRemove={handleRemoveSaved}
              />
            )}
          </div>

          {/* Order Summary - 35% */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <OrderSummary
                subtotal={subtotal}
                discount={discount}
                appliedPromo={appliedPromo}
                shippingFee={shippingFee}
                shippingThreshold={shippingThreshold}
                tax={tax}
                giftWrap={giftWrap}
                giftWrapPrice={giftWrapPrice}
                total={total}
                selectedProvince={selectedProvince}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 shadow-up">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">Tổng cộng</p>
            <p className="text-xl font-bold text-gray-900">
              {total.toLocaleString('vi-VN')}₫
            </p>
          </div>
          <Link
            href="/checkout"
            className="flex-1 max-w-xs bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            Thanh toán
          </Link>
        </div>
      </div>
    </div>
  );
}

// Cart Item Card Component
function CartItemCard({ item, onQuantityChange, onDelete, onSaveForLater, isUpdating }) {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      onQuantityChange(item.id, newQty);
    }
  };

  const handleIncrease = () => {
    if (quantity < item.stock) {
      const newQty = quantity + 1;
      setQuantity(newQty);
      onQuantityChange(item.id, newQty);
    }
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= item.stock) {
      setQuantity(value);
      onQuantityChange(item.id, value);
    }
  };

  const itemTotal = item.price.sale * quantity;
  const savings = item.price.discount > 0 
    ? (item.price.original - item.price.sale) * quantity 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex gap-4">
        {/* Product Image */}
        <Link href={`/products/${item.slug}`} className="flex-shrink-0">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover hover:scale-105 transition-transform"
              sizes="128px"
            />
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-4">
            <div className="flex-1">
              {/* Brand */}
              <p className="text-xs text-gray-500 mb-1">{item.brand}</p>
              
              {/* Product Name */}
              <Link 
                href={`/products/${item.slug}`}
                className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 mb-2"
              >
                {item.name}
              </Link>

              {/* SKU */}
              <p className="text-xs text-gray-500 mb-3">SKU: {item.sku}</p>

              {/* Variants */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                  <span 
                    className="w-3 h-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: item.color.hex }}
                  />
                  {item.color.name}
                </span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  Size: {item.size}
                </span>
              </div>

              {/* Stock Status */}
              {item.stock < 10 && item.inStock && (
                <p className="text-xs text-orange-600 mb-2">
                  ⚠️ Chỉ còn {item.stock} sản phẩm
                </p>
              )}
            </div>

            {/* Delete Button - Desktop */}
            <button
              onClick={() => onDelete(item.id)}
              className="hidden md:block text-gray-400 hover:text-red-500 transition-colors"
              title="Xóa"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Price & Quantity - Desktop */}
          <div className="hidden md:flex items-center justify-between mt-4">
            {/* Quantity Stepper */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-gray-300 rounded-lg">
                <button
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                
                <input
                  type="number"
                  min="1"
                  max={item.stock}
                  value={quantity}
                  onChange={handleInputChange}
                  className="w-12 text-center font-semibold focus:outline-none"
                />
                
                <button
                  onClick={handleIncrease}
                  disabled={quantity >= item.stock}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <div className="flex items-baseline gap-2">
                {item.price.discount > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    {item.price.original.toLocaleString('vi-VN')}₫
                  </span>
                )}
                <span className="text-lg font-bold text-gray-900">
                  {item.price.sale.toLocaleString('vi-VN')}₫
                </span>
              </div>
              {savings > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  Tiết kiệm: {savings.toLocaleString('vi-VN')}₫
                </p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                Tổng: <span className="font-semibold">{itemTotal.toLocaleString('vi-VN')}₫</span>
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4 mt-4">
            <button
              onClick={() => onSaveForLater(item.id)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
            >
              <BookmarkIcon className="w-4 h-4" />
              Lưu lại mua sau
            </button>
          </div>

          {/* Mobile: Quantity & Price */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mt-4">
              {/* Quantity */}
              <div className="flex items-center border-2 border-gray-300 rounded-lg">
                <button
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50"
                >
                  <MinusIcon className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleInputChange}
                  className="w-10 text-center text-sm font-semibold focus:outline-none"
                />
                <button
                  onClick={handleIncrease}
                  disabled={quantity >= item.stock}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50"
                >
                  <PlusIcon className="w-3 h-3" />
                </button>
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {itemTotal.toLocaleString('vi-VN')}₫
                </p>
                {savings > 0 && (
                  <p className="text-xs text-green-600">
                    Tiết kiệm: {savings.toLocaleString('vi-VN')}₫
                  </p>
                )}
              </div>
            </div>

            {/* Delete Button - Mobile */}
            <div className="mt-3 flex items-center gap-4">
              <button
                onClick={() => onDelete(item.id)}
                className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <TrashIcon className="w-4 h-4" />
                Xóa
              </button>
              
              <button
                onClick={() => onSaveForLater(item.id)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <BookmarkIcon className="w-4 h-4" />
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Promo Code Section Component
function PromoCodeSection({ promoCode, setPromoCode, appliedPromo, promoError, onApply, onRemove }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <TicketIcon className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Mã giảm giá</h3>
      </div>

      {!appliedPromo ? (
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && onApply()}
              placeholder="Nhập mã giảm giá"
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none uppercase"
            />
            <button
              onClick={onApply}
              disabled={!promoCode.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Áp dụng
            </button>
          </div>
          
          {promoError && (
            <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
              <XMarkIcon className="w-4 h-4" />
              {promoError}
            </p>
          )}

          {/* Sample codes hint */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 font-medium mb-2">Mã giảm giá khả dụng:</p>
            <div className="flex flex-wrap gap-2">
              <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200 cursor-pointer hover:bg-blue-100" onClick={() => setPromoCode('WELCOME10')}>
                WELCOME10
              </code>
              <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200 cursor-pointer hover:bg-blue-100" onClick={() => setPromoCode('SUMMER2024')}>
                SUMMER2024
              </code>
              <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200 cursor-pointer hover:bg-blue-100" onClick={() => setPromoCode('FREESHIP')}>
                FREESHIP
              </code>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800">
                  Mã "{appliedPromo.code}" đã được áp dụng
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {appliedPromo.type === 'percentage' && `Giảm ${appliedPromo.discount}%`}
                  {appliedPromo.type === 'fixed' && `Giảm ${appliedPromo.discount.toLocaleString('vi-VN')}₫`}
                  {appliedPromo.type === 'shipping' && 'Miễn phí vận chuyển'}
                </p>
              </div>
            </div>
            <button
              onClick={onRemove}
              className="text-green-600 hover:text-green-700 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Gift Wrap Section Component
function GiftWrapSection({ giftWrap, setGiftWrap, giftMessage, setGiftMessage, giftWrapPrice }) {
  const maxChars = 200;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <GiftIcon className="w-5 h-5 text-pink-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Gói quà tặng</h3>
            <p className="text-sm text-gray-500">+{giftWrapPrice.toLocaleString('vi-VN')}₫</p>
          </div>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={giftWrap}
            onChange={(e) => setGiftWrap(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {giftWrap && (
        <div className="mt-4 animate-slide-up">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lời nhắn (tùy chọn)
          </label>
          <textarea
            value={giftMessage}
            onChange={(e) => setGiftMessage(e.target.value.slice(0, maxChars))}
            placeholder="Viết lời chúc của bạn..."
            rows="3"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {giftMessage.length}/{maxChars} ký tự
          </p>
        </div>
      )}
    </div>
  );
}

// Shipping Estimator Component
function ShippingEstimator({ selectedProvince, setSelectedProvince, provinces }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPinIcon className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">Ước tính vận chuyển</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn tỉnh/thành phố
        </label>
        <select
          value={selectedProvince?.id || ''}
          onChange={(e) => {
            const province = provinces.find(p => p.id === e.target.value);
            setSelectedProvince(province);
          }}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          <option value="">-- Chọn địa điểm --</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>

        {selectedProvince && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200 animate-slide-up">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Phí vận chuyển:</span>
              <span className="font-semibold text-gray-900">
                {selectedProvince.shippingFee.toLocaleString('vi-VN')}₫
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-gray-700">Thời gian dự kiến:</span>
              <span className="font-semibold text-gray-900">
                {selectedProvince.estimatedDays} ngày
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Saved Items Section Component
function SavedItemsSection({ savedItems, onMoveToCart, onRemove }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <HeartIcon className="w-5 h-5 text-red-500" />
        <h3 className="font-semibold text-gray-900">
          Đã lưu để mua sau ({savedItems.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedItems.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 line-clamp-2 text-sm mb-1">
                  {item.name}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {item.price.sale.toLocaleString('vi-VN')}₫
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onMoveToCart(item.id)}
                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
                  >
                    Thêm vào giỏ
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-xs text-gray-600 hover:text-red-600 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Order Summary Component
function OrderSummary({ 
  subtotal, 
  discount, 
  appliedPromo, 
  shippingFee, 
  shippingThreshold, 
  tax, 
  giftWrap, 
  giftWrapPrice, 
  total,
  selectedProvince
}) {
  const progressToFreeShipping = Math.min((subtotal / shippingThreshold) * 100, 100);
  const amountToFreeShipping = shippingThreshold - subtotal;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Tóm tắt đơn hàng
      </h2>

      {/* Free Shipping Progress */}
      {shippingFee > 0 && !appliedPromo && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            Mua thêm <span className="font-semibold">{amountToFreeShipping.toLocaleString('vi-VN')}₫</span> để được <strong>miễn phí vận chuyển</strong>!
          </p>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>
      )}

      {shippingFee === 0 && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800 font-medium flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Bạn được miễn phí vận chuyển!
          </p>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Tạm tính:</span>
          <span className="font-medium">{subtotal.toLocaleString('vi-VN')}₫</span>
        </div>
        
        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span className="flex items-center gap-1">
              <TicketIcon className="w-4 h-4" />
              Giảm giá {appliedPromo?.type === 'percentage' && `(${appliedPromo.discount}%)`}:
            </span>
            <span className="font-medium">-{discount.toLocaleString('vi-VN')}₫</span>
          </div>
        )}
        
        <div className="flex justify-between text-gray-600">
          <span className="flex items-center gap-1">
            Phí vận chuyển
            {selectedProvince && (
              <span className="text-xs text-gray-500">({selectedProvince.name})</span>
            )}:
          </span>
          <span className="font-medium">
            {shippingFee === 0 ? (
              <span className="text-green-600">Miễn phí</span>
            ) : (
              `${shippingFee.toLocaleString('vi-VN')}₫`
            )}
          </span>
        </div>

        {/* Gift Wrap */}
        {giftWrap && (
          <div className="flex justify-between text-gray-600">
            <span className="flex items-center gap-1">
              <GiftIcon className="w-4 h-4" />
              Gói quà:
            </span>
            <span className="font-medium">{giftWrapPrice.toLocaleString('vi-VN')}₫</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600">
          <span>VAT (10%):</span>
          <span className="font-medium">{tax.toLocaleString('vi-VN')}₫</span>
        </div>
      </div>

      {/* Total */}
      <div className="pt-6 border-t border-gray-200 mb-6">
        <div className="flex justify-between items-baseline">
          <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
          <span className="text-2xl font-bold text-blue-600">
            {total.toLocaleString('vi-VN')}₫
          </span>
        </div>
        {discount > 0 && (
          <p className="text-sm text-green-600 text-right mt-1">
            Bạn tiết kiệm được {discount.toLocaleString('vi-VN')}₫
          </p>
        )}
      </div>

      {/* Checkout Button */}
      <Link
        href="/checkout"
        className="block w-full bg-blue-600 text-white text-center py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
      >
        Thanh toán
      </Link>

      {/* Continue Shopping */}
      <Link
        href="/"
        className="block w-full text-center text-blue-600 hover:text-blue-700 font-medium py-2"
      >
        Tiếp tục mua sắm
      </Link>

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Đổi trả trong 30 ngày</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Thanh toán an toàn 100%</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Hỗ trợ 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}
