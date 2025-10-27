'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MinusIcon, PlusIcon, TrashIcon, ShoppingBagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

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

export default function CartPage() {
  const [cartItems, setCartItems] = useState(INITIAL_CART_ITEMS);
  const [deletedItem, setDeletedItem] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price.sale * item.quantity), 0);
  const shippingThreshold = 500000;
  const shippingFee = subtotal >= shippingThreshold ? 0 : 30000;
  const tax = Math.round(subtotal * 0.1); // 10% VAT
  const total = subtotal + shippingFee + tax;
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
                isUpdating={isUpdating}
              />
            ))}
          </div>

          {/* Order Summary - 35% */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <OrderSummary
                subtotal={subtotal}
                shippingFee={shippingFee}
                shippingThreshold={shippingThreshold}
                tax={tax}
                total={total}
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
function CartItemCard({ item, onQuantityChange, onDelete, isUpdating }) {
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
            <button
              onClick={() => onDelete(item.id)}
              className="mt-3 text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <TrashIcon className="w-4 h-4" />
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Order Summary Component
function OrderSummary({ subtotal, shippingFee, shippingThreshold, tax, total }) {
  const progressToFreeShipping = Math.min((subtotal / shippingThreshold) * 100, 100);
  const amountToFreeShipping = shippingThreshold - subtotal;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Tóm tắt đơn hàng
      </h2>

      {/* Free Shipping Progress */}
      {shippingFee > 0 && (
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
        
        <div className="flex justify-between text-gray-600">
          <span>Phí vận chuyển:</span>
          <span className="font-medium">
            {shippingFee === 0 ? (
              <span className="text-green-600">Miễn phí</span>
            ) : (
              `${shippingFee.toLocaleString('vi-VN')}₫`
            )}
          </span>
        </div>

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
