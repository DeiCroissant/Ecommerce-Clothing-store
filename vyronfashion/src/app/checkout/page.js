'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '@/lib/config';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeftIcon,
  MapPinIcon,
  CreditCardIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import * as cartAPI from '@/lib/api/cart';
import * as addressAPI from '@/lib/api/addresses';
import * as orderAPI from '@/lib/api/orders';

function getCurrentUserId() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.id || user._id || null;
  } catch {
    return null;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(''); // cod, bank_transfer, momo
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);

  // Load payment options
  useEffect(() => {
    async function loadPaymentOptions() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings/payments`);
        const data = await response.json();

        if (data.success) {
          const enabledPayments = data.payment_methods.filter(p => p.enabled);
          setPaymentOptions(enabledPayments);
          if (enabledPayments.length > 0) {
            setPaymentMethod(enabledPayments[0].id);
          }
        } else {
           throw new Error('Failed to load payment methods');
        }
      } catch (e) {
        console.error('Error loading payment options:', e);
        const defaultPayments = [
          { id: 'cod', name: 'Thanh toán khi nhận hàng (COD)', description: 'Thanh toán bằng tiền mặt khi nhận hàng', enabled: true },
          { id: 'bank_transfer', name: 'Chuyển khoản ngân hàng', description: 'Chuyển khoản qua tài khoản ngân hàng', enabled: true },
        ];
        setPaymentOptions(defaultPayments);
        if (defaultPayments.length > 0) {
          setPaymentMethod(defaultPayments[0].id);
        }
      }
    }
    loadPaymentOptions();
  }, []);

  // Load selected shipping from local storage
  useEffect(() => {
    const savedShipping = localStorage.getItem('selectedShipping');
    if (savedShipping) {
      try {
        const shippingOption = JSON.parse(savedShipping);
        setSelectedShipping(shippingOption);
      } catch (e) {
        console.error('Error parsing selected shipping from localStorage:', e);
        // Redirect back to cart if shipping is invalid
        router.push('/cart');
      }
    } else {
      // If no shipping method is selected, redirect to cart page
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Vui lòng chọn phương thức vận chuyển trong giỏ hàng.', type: 'warning', duration: 3000 } 
        }));
      }
      router.push('/cart');
    }
  }, [router]);

  // Load user data
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Load cart items
  useEffect(() => {
    const loadCart = async () => {
      const userId = getCurrentUserId();
      if (!userId) {
        router.push('/');
        return;
      }

      try {
        setLoading(true);
        const cartData = await cartAPI.getCart(userId);
        const items = cartData.items || [];
        
        if (items.length === 0) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('showToast', { 
              detail: { message: 'Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng.', type: 'warning', duration: 3000 } 
            }));
          }
          router.push('/cart');
          return;
        }

        setCartItems(items);
      } catch (error) {
        console.error('Error loading cart:', error);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('showToast', { 
            detail: { message: 'Lỗi khi tải giỏ hàng', type: 'error', duration: 3000 } 
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [router]);

  // Load addresses
  useEffect(() => {
    const loadAddresses = async () => {
      const userId = getCurrentUserId();
      if (!userId) return;

      try {
        const response = await addressAPI.getUserAddresses(userId);
        const userAddresses = response.addresses || [];
        setAddresses(userAddresses);
        
        // Auto-select default address
        const defaultAddr = userAddresses.find(addr => addr.is_default);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        } else if (userAddresses.length > 0) {
          setSelectedAddress(userAddresses[0]);
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
      }
    };

    loadAddresses();
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalShippingFee = selectedShipping ? selectedShipping.price : 0;
  const tax = Math.round(subtotal * 0.1); // 10% VAT
  const finalTotal = subtotal + finalShippingFee + tax;



  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validate
    if (!selectedAddress) {
      setErrors({ address: 'Vui lòng chọn địa chỉ giao hàng' });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Vui lòng chọn địa chỉ giao hàng', type: 'warning', duration: 3000 } 
        }));
      }
      return;
    }

    if (!selectedShipping) {
      setErrors({ shipping: 'Vui lòng chọn phương thức vận chuyển' });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Vui lòng chọn phương thức vận chuyển', type: 'warning', duration: 3000 } 
        }));
      }
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      router.push('/');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare order items
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name || 'Sản phẩm',
        product_image: item.product_image || '',
        variant_color: item.variant_color || null,
        variant_size: item.variant_size || null,
        quantity: item.quantity,
        price: item.price
      }));

      // Prepare shipping address
      const shippingAddress = {
        full_name: selectedAddress.full_name,
        phone: selectedAddress.phone,
        email: selectedAddress.email || user?.email || '',
        street: selectedAddress.street,
        ward: selectedAddress.ward,
        city: selectedAddress.city
      };

      // Create order
      const orderData = {
        user_id: userId,
        items: orderItems,
        total_amount: finalTotal,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
        note: note.trim() || ''
      };

      const order = await orderAPI.createOrder(orderData);

      // Clear cart after successful order
      try {
        // Delete all cart items
        for (let i = cartItems.length - 1; i >= 0; i--) {
          await cartAPI.removeCartItem(userId, i);
        }
        
        // Dispatch cart changed event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cartChanged'));
        }
      } catch (cartError) {
        console.error('Error clearing cart:', cartError);
      }

      // Show success message
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Đặt hàng thành công!', type: 'success', duration: 3000 } 
        }));
      }

      // Redirect to order confirmation page
      router.push(`/checkout/success?orderId=${order.id}&orderNumber=${order.order_number}`);
    } catch (error) {
      console.error('Error creating order:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.', type: 'error', duration: 3000 } 
        }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/cart" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Quay lại giỏ hàng</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPinIcon className="w-6 h-6 text-gray-900" />
                <h2 className="text-xl font-semibold text-gray-900">Địa chỉ giao hàng</h2>
              </div>
              
              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id || address._id}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAddress?.id === address.id || selectedAddress?._id === address._id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id || address._id}
                        checked={selectedAddress?.id === address.id || selectedAddress?._id === address._id}
                        onChange={() => setSelectedAddress(address)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900">{address.full_name}</p>
                          {address.is_default && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Mặc định</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{address.phone}</p>
                        <p className="text-sm text-gray-600">
                          {address.street}, {address.ward}, {address.city}
                        </p>
                      </div>
                    </label>
                  ))}
                  <Link
                    href="/account/addresses"
                    className="block text-center text-blue-600 hover:text-blue-700 font-medium py-2"
                  >
                    + Thêm địa chỉ mới
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Bạn chưa có địa chỉ giao hàng</p>
                  <Link
                    href="/account/addresses"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Thêm địa chỉ mới
                  </Link>
                </div>
              )}
              {errors.address && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-4 h-4" />
                  {errors.address}
                </p>
              )}
            </div>

            {/* Shipping Method Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                  <h2 className="text-xl font-semibold text-gray-900">Phương thức vận chuyển</h2>
                </div>
                <Link href="/cart" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Thay đổi</Link>
              </div>
              
              {selectedShipping ? (
                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900">{selectedShipping.name}</p>
                      <p className="font-semibold text-blue-600">
                        {selectedShipping.price === 0 ? 'Miễn phí' : `${selectedShipping.price.toLocaleString('vi-VN')}₫`}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">{selectedShipping.description}</p>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Đang tải thông tin vận chuyển...
                </div>
              )}
               {errors.shipping && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-4 h-4" />
                  {errors.shipping}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCardIcon className="w-6 h-6 text-gray-900" />
                <h2 className="text-xl font-semibold text-gray-900">Phương thức thanh toán</h2>
              </div>
              
              <div className="space-y-3">
                {paymentOptions.map(option => (
                  <label key={option.id} className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === option.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value={option.id}
                      checked={paymentMethod === option.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{option.name}</p>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Order Note */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ghi chú đơn hàng (tùy chọn)</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú cho người bán hàng..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                rows={4}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
              
              {/* Order Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item, index) => {
                  const imageUrl = item.product_image || '';
                  const validImage = imageUrl && (
                    imageUrl.startsWith('/') || 
                    imageUrl.startsWith('http://') || 
                    imageUrl.startsWith('https://') ||
                    imageUrl.startsWith('data:image/')
                  ) ? imageUrl : '/images/placeholders/product-placeholder.svg';
                  
                  return (
                    <div key={index} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {validImage && (
                          <Image
                            src={validImage}
                            alt={item.product_name || 'Sản phẩm'}
                            fill
                            className="object-cover"
                            unoptimized={validImage.startsWith('data:image/')}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.product_name || 'Sản phẩm'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.variant_color && `Màu: ${item.variant_color}`}
                          {item.variant_color && item.variant_size && ' • '}
                          {item.variant_size && `Size: ${item.variant_size}`}
                        </p>
                        <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span>{finalShippingFee.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT (10%):</span>
                  <span>{tax.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Tổng cộng:</span>
                  <span>{finalTotal.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !selectedAddress || !selectedShipping || cartItems.length === 0}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <LockClosedIcon className="w-5 h-5" />
                    <span>Đặt hàng</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
                <LockClosedIcon className="w-4 h-4" />
                Thanh toán an toàn 100%
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

