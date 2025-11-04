'use client';

import { useState, useRef, useEffect, use } from 'react';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import VariantSelector from '@/components/product/VariantSelector';
import ProductActions from '@/components/product/ProductActions';
import ProductDetails from '@/components/product/ProductDetails';
import FlyToCart from '@/components/product/FlyToCart';
import Confetti from '@/components/product/Confetti';
import MiniCartSlideIn from '@/components/product/MiniCartSlideIn';
import { getProductImages } from '@/lib/mockImages';
import * as productAPI from '@/lib/api/products';
import * as reviewAPI from '@/lib/api/reviews';
import * as cartAPI from '@/lib/api/cart';
import ProductReviews from '@/components/product/ProductReviews';

// Mock data - sẽ thay thế bằng API call sau
export default function ProductDetailPage({ params }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
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

  // Get current user ID
  const getCurrentUserId = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.id || user._id;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };

  // Load cart on mount
  useEffect(() => {
    const loadCart = async () => {
      const userId = getCurrentUserId();
      if (userId) {
        try {
          const cartData = await cartAPI.getCart(userId);
          setCartItems(cartData.items || []);
        } catch (error) {
          console.error('Error loading cart:', error);
        }
      }
    };
    loadCart();
  }, []);

  // Load product từ API
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setReviewsLoading(true);
      try {
        // Tìm product theo slug
        const foundProduct = await productAPI.getProductBySlug(slug);
        
        if (foundProduct) {
          // Ensure variants structure is correct
          if (!foundProduct.variants) {
            foundProduct.variants = { colors: [], sizes: [] };
          }
          if (!foundProduct.variants.colors) {
            foundProduct.variants.colors = [];
          }
          if (!foundProduct.variants.sizes) {
            foundProduct.variants.sizes = [];
          }
          
          // Debug: Log variants để kiểm tra
          console.log('Product loaded - variants:', foundProduct.variants);
          console.log('Product loaded - sizes:', foundProduct.variants.sizes);
          
          setProduct(foundProduct);
          
          // Load reviews
          try {
            const reviewsData = await reviewAPI.getProductReviews(foundProduct.id);
            setReviews(reviewsData.reviews || []);
            
            // Cập nhật rating từ reviews
            if (reviewsData.average_rating) {
              setProduct(prev => ({
                ...prev,
                rating: {
                  average: reviewsData.average_rating,
                  count: reviewsData.total
                }
              }))
            }
          } catch (reviewError) {
            console.error('Error loading reviews:', reviewError);
            setReviews([]);
          } finally {
            setReviewsLoading(false);
          }
        } else {
          console.log('Product not found for slug:', slug);
          setProduct(null);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [slug]);

  // Get images from product
  // Combine main image and gallery images
  const productImages = product 
    ? (() => {
        const images = [];
        // Add main image first
        if (product.image) {
          images.push({ url: product.image, alt: product.name });
        }
        // Add gallery images
        if (product.images && product.images.length > 0) {
          product.images.forEach(img => {
            // Only add if not duplicate of main image
            if (img !== product.image) {
              images.push({ url: img, alt: `${product.name} - Gallery` });
            }
          });
        }
        // Fallback to mock images if no images at all
        if (images.length === 0) {
          return getProductImages(slug);
        }
        return images;
      })()
    : [];

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
  };

  const handleAddToCart = async (quantity) => {
    if (!selectedVariant.color || !selectedVariant.size) {
      alert('Vui lòng chọn màu sắc và kích cỡ');
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    try {
      // Get button position for animations
      if (addToCartButtonRef.current) {
        const buttonRect = addToCartButtonRef.current.getBoundingClientRect();
        const startX = buttonRect.left + buttonRect.width / 2;
        const startY = buttonRect.top + buttonRect.height / 2;
        
        setFlyToCartPosition({ x: startX, y: startY });
        setConfettiOrigin({ x: startX, y: startY });
      }

      // Add to cart via API
      await cartAPI.addToCart(
        userId,
        product.id,
        selectedVariant.color,
        selectedVariant.size,
        quantity
      );

      // Reload cart
      const cartData = await cartAPI.getCart(userId);
      setCartItems(cartData.items || []);

      // Trigger animations
      setFlyToCartActive(true);
      setConfettiActive(true);

      console.log('Add to cart:', {
        product: product.name,
        variant: selectedVariant,
        quantity
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Không thể thêm vào giỏ hàng');
    }
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
      product: product?.name,
      variant: selectedVariant,
      quantity
    });

    // Redirect to checkout
    // router.push('/checkout');
    alert('Chuyển đến trang thanh toán...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h1>
          <p className="text-gray-600 mb-4">Sản phẩm bạn đang tìm không tồn tại.</p>
          <a href="/" className="text-blue-600 hover:underline">Quay lại trang chủ</a>
        </div>
      </div>
    )
  }

  const handleReviewSubmit = async (reviewData) => {
    try {
      await reviewAPI.createReview({
        ...reviewData,
        product_id: product.id
      })
      
      // Reload reviews
      const reviewsData = await reviewAPI.getProductReviews(product.id)
      setReviews(reviewsData.reviews || [])
      
      // Cập nhật rating
      if (reviewsData.average_rating) {
        setProduct(prev => ({
          ...prev,
          rating: {
            average: reviewsData.average_rating,
            count: reviewsData.total
          }
        }))
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Product Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Gallery (58%) */}
          <div className="lg:col-span-7">
            <ProductGallery 
              images={productImages} 
              productName={product.name}
            />
          </div>

          {/* Right Column - Product Info & Actions (42%) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              {/* Product Info */}
              <ProductInfo product={product} />

              {/* Stock Status */}
              {product.inventory?.quantity < product.inventory?.low_stock_threshold && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-800 font-medium">
                    ⚠️ Chỉ còn {product.inventory.quantity} sản phẩm trong kho!
                  </p>
                </div>
              )}

              {/* Variant Selector */}
              <VariantSelector 
                variants={product.variants || { colors: [], sizes: [] }}
                onVariantChange={handleVariantChange}
              />

              {/* Actions */}
              <div ref={addToCartButtonRef}>
                <ProductActions
                  maxStock={product.inventory?.quantity || 0}
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
          <ProductDetails product={product} />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <ProductReviews
              product={product}
              reviews={reviews}
              loading={reviewsLoading}
              onSubmit={handleReviewSubmit}
            />
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
              {(product.pricing?.sale || product.pricing?.original || 0).toLocaleString('vi-VN')}₫
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
        productImage={productImages[0]?.url || product.image}
        productName={product.name}
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
