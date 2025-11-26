'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import * as wishlistAPI from '@/lib/api/wishlist';
import ProductReviews from '@/components/product/ProductReviews';
import SimilarProducts from '@/components/product/SimilarProducts';
import { getImageUrl } from '@/lib/imageHelper';

// Mock data - sẽ thay thế bằng API call sau
export default function ProductDetailPage({ params }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const router = useRouter();
  
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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
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

  // Check wishlist status
  useEffect(() => {
    const checkWishlist = async () => {
      const userId = getCurrentUserId();
      if (!userId || !product) return;
      
      try {
        const wishlistData = await wishlistAPI.getWishlist(userId);
        const productIds = wishlistData.wishlist?.map(item => item.product_id) || [];
        setIsWishlisted(productIds.includes(product.id));
      } catch (error) {
        console.error('Error checking wishlist:', error);
        setIsWishlisted(false);
      }
    };
    
    if (product) {
      checkWishlist();
    }
  }, [product]);

  // Load product từ API
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setReviewsLoading(true);
      try {
        // Decode URL-encoded slug (Next.js encodes special characters)
        const decodedSlug = decodeURIComponent(slug);
        console.log('🔍 Original slug:', slug);
        console.log('🔍 Decoded slug:', decodedSlug);
        
        // Tìm product theo slug
        const foundProduct = await productAPI.getProductBySlug(decodedSlug);
        
        console.log('📦 Product API response:', foundProduct);
        
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
          
          // Debug: Log product data để kiểm tra
          console.log('✅ Product loaded:', foundProduct.name);
          console.log('🔗 Product ID:', foundProduct.id);
          console.log('🏷️ Product slug:', foundProduct.slug);
          console.log('📸 Product image:', foundProduct.image);
          console.log('📸 Product images array:', foundProduct.images);
          console.log('🎨 Variants colors:', foundProduct.variants.colors);
          console.log('📏 Variants sizes:', foundProduct.variants.sizes);
          
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
          console.error('❌ Product not found for slug:', decodedSlug);
          setProduct(null);
        }
      } catch (error) {
        console.error('❌ Error loading product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [slug]);

  // Get all images from product - prioritize selected color's images
  // Each image includes metadata about which color it belongs to (if any)
  const productImages = product 
    ? (() => {
        console.log('🖼️ Building product images...')
        console.log('   Product variants:', product.variants)
        console.log('   Colors:', product.variants?.colors)
        
        const imagesMap = new Map(); // Use Map to avoid duplicates by URL
        const selectedColorImages = [];
        const otherImages = [];
        
        // 1. Collect selected color images first (if color is selected)
        if (selectedVariant.color && product.variants?.colors) {
          const selectedColorObj = product.variants.colors.find(c => c.slug === selectedVariant.color);
          console.log('   Selected color:', selectedColorObj)
          if (selectedColorObj && selectedColorObj.images && selectedColorObj.images.length > 0) {
            selectedColorObj.images.forEach((img, index) => {
              const imgUrl = getImageUrl(img);
              if (!imagesMap.has(imgUrl)) {
                const imageData = {
                  url: imgUrl,
                  alt: `${product.name} - ${selectedColorObj.name} - ${index + 1}`,
                  colorSlug: selectedColorObj.slug
                };
                imagesMap.set(imgUrl, imageData);
                selectedColorImages.push(imageData);
              }
            });
          }
        }
        
        // 2. Add main image (if exists and not duplicate)
        if (product.image) {
          const mainImgUrl = getImageUrl(product.image);
          if (!imagesMap.has(mainImgUrl)) {
            const imageData = {
              url: mainImgUrl,
              alt: product.name,
              colorSlug: null
            };
            imagesMap.set(mainImgUrl, imageData);
            otherImages.push(imageData);
          }
        }
        
        // 3. Add gallery images (if not duplicate)
        if (product.images && product.images.length > 0) {
          product.images.forEach(img => {
            const imgUrl = getImageUrl(img);
            if (!imagesMap.has(imgUrl)) {
              const imageData = {
                url: imgUrl,
                alt: `${product.name} - Gallery`,
                colorSlug: null
              };
              imagesMap.set(imgUrl, imageData);
              otherImages.push(imageData);
            }
          });
        }
        
        // 4. Add other color variant images (if not duplicate)
        if (product.variants?.colors && product.variants.colors.length > 0) {
          console.log('   Adding color images from', product.variants.colors.length, 'colors')
          product.variants.colors.forEach(color => {
            console.log('   Color:', color.name, '- images:', color.images)
            // Skip selected color (already added)
            if (color.slug === selectedVariant.color) return;
            
            if (color.images && color.images.length > 0) {
              color.images.forEach((img, index) => {
                const imgUrl = getImageUrl(img);
                if (!imagesMap.has(imgUrl)) {
                  const imageData = {
                    url: imgUrl,
                    alt: `${product.name} - ${color.name} - ${index + 1}`,
                    colorSlug: color.slug
                  };
                  imagesMap.set(imgUrl, imageData);
                  otherImages.push(imageData);
                }
              });
            }
          });
        }
        
        // Combine: selected color images first, then others
        const images = [...selectedColorImages, ...otherImages];
        console.log('   Total images:', images.length)
        console.log('   Final images:', images)
        
        // Nếu không có ảnh nào, dùng placeholder thay vì mock images
        if (images.length === 0) {
          console.warn('No product images found for slug:', slug);
          return [{
            url: getImageUrl(product.image) || '/images/placeholders/product-placeholder.svg',
            alt: product.name || 'Product image',
            colorSlug: null
          }];
        }
        
        return images;
      })()
    : [];

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    // Reset selected image to first when color changes
    if (variant.color !== selectedVariant.color) {
      // ProductGallery will automatically update when productImages changes
    }
  };

  const handleAddToCart = async (quantity) => {
    if (!selectedVariant.color || !selectedVariant.size) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Vui lòng chọn màu sắc và kích cỡ', type: 'warning', duration: 3000 } 
        }));
      }
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Vui lòng đăng nhập để thêm vào giỏ hàng', type: 'warning', duration: 3000 } 
        }));
      }
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

      // Dispatch event to update cart count in header
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartChanged'));
      }

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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Không thể thêm vào giỏ hàng', type: 'error', duration: 3000 } 
        }));
      }
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

  const handleBuyNow = async (quantity) => {
    if (!selectedVariant.color || !selectedVariant.size) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Vui lòng chọn màu sắc và kích cỡ', type: 'warning', duration: 3000 } 
        }));
      }
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Vui lòng đăng nhập để mua hàng', type: 'warning', duration: 3000 } 
        }));
      }
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

      // Thêm sản phẩm vào giỏ hàng như bình thường
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

      // Dispatch event to update cart count in header
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartChanged'));
      }

      // Trigger animations
      setFlyToCartActive(true);
      setConfettiActive(true);

      // Lấy item vừa thêm vào giỏ hàng để lưu vào localStorage
      // Tìm item khớp với product_id, color, size vừa thêm
      const addedItem = (cartData.items || []).find(item => 
        item.product_id === product.id &&
        item.variant_color === selectedVariant.color &&
        item.variant_size === selectedVariant.size
      );

      if (addedItem) {
        // Lưu thông tin sản phẩm mua ngay vào localStorage
        const buyNowItem = {
          product_id: addedItem.product_id,
          product_name: addedItem.product_name,
          product_image: addedItem.product_image,
          variant_color: addedItem.variant_color,
          variant_size: addedItem.variant_size,
          quantity: quantity,
          price: addedItem.price
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
          
          // Wait a bit for animation then redirect to checkout
          setTimeout(() => {
            router.push('/checkout?buyNow=true');
          }, 800);
        }
      } else {
        throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');
      }
    } catch (error) {
      console.error('Error during buy now:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Có lỗi xảy ra, vui lòng thử lại', type: 'error', duration: 3000 } 
        }));
      }
    }
  };

  const handleWishlistToggle = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      // Silently return if user not logged in - UI will show login prompt if needed
      return;
    }

    if (!product) return;

    try {
      setWishlistLoading(true);
      const result = await wishlistAPI.toggleWishlist(product.id, userId);
      
      // Update wishlist status
      setIsWishlisted(result.in_wishlist || false);
      
      // Update product wishlist_count silently
      if (result.in_wishlist) {
        setProduct(prev => ({
          ...prev,
          wishlist_count: (prev.wishlist_count || 0) + 1
        }));
      } else {
        setProduct(prev => ({
          ...prev,
          wishlist_count: Math.max(0, (prev.wishlist_count || 0) - 1)
        }));
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // Silently handle error - UI will show current state
    } finally {
      setWishlistLoading(false);
    }
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
          <Link href="/" className="text-blue-600 hover:underline">Quay lại trang chủ</Link>
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy sản phẩm
          </h1>
          <p className="text-gray-600 mb-6">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={() => router.push('/category/all')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Product Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] xl:grid-cols-[52%_48%] gap-6 lg:gap-8">
          {/* Left Column - Gallery */}
          <div className="flex justify-center lg:justify-end">
            <ProductGallery 
              images={productImages} 
              productName={product.name}
            />
          </div>

          {/* Right Column - Product Info & Actions */}
          <div className="lg:max-w-md xl:max-w-lg">
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
                  isWishlisted={isWishlisted}
                  onWishlistToggle={handleWishlistToggle}
                  wishlistLoading={wishlistLoading}
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

      {/* Similar Products Section - AI Powered */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <SimilarProducts 
            productId={product.id} 
            productName={product.name}
          />
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
