'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon, 
  ShoppingBagIcon,
  HeartIcon,
  EyeIcon,
  SparklesIcon,
  XMarkIcon,
  BoltIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import Image from 'next/image';
import * as wishlistAPI from '@/lib/api/wishlist';
import * as cartAPI from '@/lib/api/cart';

/**
 * Enhanced ProductCard Component
 * Features:
 * - Badges: New, Discount, Best-seller, AI pick
 * - Quick add with size selection
 * - Lazy loading images with fixed aspect ratio (3:4)
 * - Hover: Available colors + Quick View
 * - Wishlist toggle
 */
export default function EnhancedProductCard({ product }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(product.wishlist_count || 0);
  const [quickViewImageIndex, setQuickViewImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Kiểm tra user đã đăng nhập chưa (tạm thời lấy từ localStorage)
  const getCurrentUserId = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          return user.id || user._id
        } catch (e) {
          return null
        }
      }
    }
    return null
  }
  
  // Kiểm tra product có trong wishlist không (khi mount)
  useEffect(() => {
    const checkWishlist = async () => {
      const userId = getCurrentUserId()
      if (!userId) return
      
      try {
        const wishlist = await wishlistAPI.getWishlist(userId)
        const productInWishlist = wishlist.wishlist?.some(
          item => (typeof item === 'object' ? item.product_id : item) === product.id
        )
        setIsWishlisted(productInWishlist || false)
      } catch (error) {
        console.error('Error checking wishlist:', error)
      }
    }
    
    checkWishlist()
  }, [product.id])

  // Map từ API format sang format cũ của component
  const price = product.pricing?.sale || product.pricing?.original || product.price || 0
  const originalPrice = product.pricing?.original && product.pricing?.sale ? product.pricing.original : product.originalPrice
  const discount = product.pricing?.discount_percent || product.discount || 0
  const image = product.image || product.images?.[0] || ''
  
  // Xử lý rating: đảm bảo luôn là số, không phải object
  let rating = 0
  if (typeof product.rating === 'number') {
    rating = product.rating
  } else if (product.rating && typeof product.rating === 'object' && typeof product.rating.average === 'number') {
    rating = product.rating.average
  }
  
  // Xử lý reviewCount
  let reviewCount = 0
  if (typeof product.reviewCount === 'number') {
    reviewCount = product.reviewCount
  } else if (product.rating && typeof product.rating === 'object' && typeof product.rating.count === 'number') {
    reviewCount = product.rating.count
  }
  const availableSizes = product.variants?.sizes?.filter(s => s.available).map(s => s.name) || product.availableSizes || ['S', 'M', 'L', 'XL']
  const availableColors = product.variants?.colors?.filter(c => c.available) || product.availableColors || []
  const inStock = product.inventory?.in_stock !== false && product.inventory?.quantity > 0
  
  // Get all images for quick view - prioritize selected color images
  const quickViewImages = (() => {
    const imagesMap = new Map();
    const selectedColorImages = [];
    const otherImages = [];
    
    // If color is selected, add its images first
    if (selectedColor && product.variants?.colors) {
      const colorObj = product.variants.colors.find(c => (c.slug || c.name) === selectedColor);
      if (colorObj?.images && colorObj.images.length > 0) {
        colorObj.images.forEach(img => {
          if (!imagesMap.has(img)) {
            imagesMap.set(img, true);
            selectedColorImages.push(img);
          }
        });
      }
    }
    
    // Add main image
    if (image && !imagesMap.has(image)) {
      imagesMap.set(image, true);
      otherImages.push(image);
    }
    
    // Add gallery images
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (!imagesMap.has(img)) {
          imagesMap.set(img, true);
          otherImages.push(img);
        }
      });
    }
    
    // Combine: selected color images first, then others
    return [...selectedColorImages, ...otherImages];
  })();
  
  // Initialize selected color when quick view opens
  useEffect(() => {
    if (showQuickView && availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0].slug || availableColors[0].name);
    }
  }, [showQuickView]);
  
  // Reset image index when color changes or quick view opens
  useEffect(() => {
    if (showQuickView) {
      setQuickViewImageIndex(0);
    }
  }, [selectedColor, showQuickView]);
  
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showQuickView) {
        setShowQuickView(false);
      }
    };
    
    if (showQuickView) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showQuickView]);

  const {
    id,
    name,
    slug,
    isNew = false,
    isBestSeller = false,
    isAiPick = false
  } = product;

  const handleQuickAdd = () => {
    if (!selectedSize) {
      // Show size selection if not selected
      return;
    }
    // Add to cart logic here
    console.log(`Added ${name} - Size: ${selectedSize} to cart`);
  };

  const handleQuickViewAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
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
          detail: { message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', type: 'warning', duration: 3000 } 
        }));
      }
      return;
    }
    
    try {
      setAddingToCart(true);
      await cartAPI.addToCart(userId, product.id, selectedColor, selectedSize, quantity);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Đã thêm vào giỏ hàng!', type: 'success', duration: 3000 } 
        }));
      }
      setShowQuickView(false);
      // Dispatch event to update cart count in header
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartChanged'));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Có lỗi xảy ra khi thêm vào giỏ hàng', type: 'error', duration: 3000 } 
        }));
      }
    } finally {
      setAddingToCart(false);
    }
  };
  
  const handleQuickViewBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Vui lòng chọn màu sắc và kích cỡ', type: 'warning', duration: 3000 } 
        }));
      }
      return;
    }
    // Navigate to checkout
    window.location.href = `/products/${slug}?color=${selectedColor}&size=${selectedSize}&quantity=${quantity}`;
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    
    const userId = getCurrentUserId()
    if (!userId) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Vui lòng đăng nhập để thêm sản phẩm vào yêu thích', type: 'warning', duration: 3000 } 
        }));
      }
      return
    }
    
    try {
      const result = await wishlistAPI.toggleWishlist(product.id, userId)
      setIsWishlisted(result.is_added)
      setWishlistCount(result.wishlist_count || 0)
      
      // Cập nhật wishlist_count trong product object (nếu component cha cần)
      if (product.wishlist_count !== undefined) {
        product.wishlist_count = result.wishlist_count
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Có lỗi xảy ra khi cập nhật yêu thích', type: 'error', duration: 3000 } 
        }));
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-lg overflow-hidden border border-zinc-200 hover:border-zinc-300 transition-all duration-300"
    >
      <Link href={`/products/${slug}`} className="block">
        {/* Image Container - Fixed 3:4 Aspect Ratio */}
        <div className="relative aspect-[3/4] bg-stone-50 overflow-hidden">
          {/* Skeleton Loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-200 animate-pulse" />
          )}

          {/* Product Image */}
          <img
            src={image}
            alt={name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && (
              <span className="bg-zinc-900 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg uppercase tracking-wide">
                NEW
              </span>
            )}
            {discount && (
              <span className="bg-zinc-800 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg uppercase tracking-wide">
                -{discount}%
              </span>
            )}
            {isBestSeller && (
              <span className="bg-zinc-700 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg uppercase tracking-wide">
                Best Seller
              </span>
            )}
            {isAiPick && (
              <span className="bg-gradient-to-r from-zinc-800 to-zinc-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-wide">
                <SparklesIcon className="w-3 h-3" />
                AI Pick
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110 z-10"
          >
            {isWishlisted ? (
              <HeartIconSolid className="w-5 h-5 text-zinc-900" />
            ) : (
              <HeartIcon className="w-5 h-5 text-zinc-700" />
            )}
          </button>

          {/* Hover Overlay: Colors + Quick View */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
            {/* Available Colors */}
            {availableColors.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-white text-xs font-medium">Màu:</span>
                <div className="flex gap-1.5">
                  {availableColors.slice(0, 5).map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                  {availableColors.length > 5 && (
                    <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs">+{availableColors.length - 5}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick View Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowQuickView(true);
              }}
              className="w-full flex items-center justify-center gap-2 bg-white/95 backdrop-blur-sm text-zinc-900 py-3 rounded-lg font-semibold hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              <EyeIcon className="w-5 h-5" />
              <span>Xem Nhanh</span>
            </button>
          </div>

          {/* Out of Stock Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-zinc-900 text-white px-4 py-2 rounded-lg font-bold uppercase tracking-wide">
                HẾT HÀNG
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Product Name */}
          <h3 className="font-semibold text-zinc-900 mb-2 line-clamp-2 group-hover:text-zinc-600 transition-colors">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? 'text-zinc-800 fill-zinc-800'
                      : 'text-zinc-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-zinc-600">
              {rating} ({reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-zinc-900">
              {price.toLocaleString('vi-VN')}đ
            </span>
            {originalPrice && (
              <span className="text-sm text-zinc-500 line-through">
                {originalPrice.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          {/* Size Selection + Quick Add */}
          {inStock && (
            <div className="space-y-2">
              {/* Size Selector */}
              <div className="flex flex-wrap gap-1.5">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedSize(size);
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded border transition-all ${
                      selectedSize === size
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {/* Quick Add Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleQuickAdd();
                }}
                disabled={!selectedSize}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all ${
                  selectedSize
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-lg'
                    : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <span>{selectedSize ? 'Thêm Vào Giỏ' : 'Chọn Size'}</span>
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && (
          <>
            {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuickView(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
              {/* Modal */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Xem Nhanh</h2>
              <button
                onClick={() => setShowQuickView(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="grid md:grid-cols-2 gap-8 p-6">
                    {/* Left: Images */}
                    <div className="space-y-4">
                      {/* Main Image */}
                      <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden group">
                        {quickViewImages.length > 0 ? (
                          <>
                            {(quickViewImages[quickViewImageIndex] || quickViewImages[0]).startsWith('data:image/') ? (
                              <img
                                src={quickViewImages[quickViewImageIndex] || quickViewImages[0]}
                                alt={name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Image
                                src={quickViewImages[quickViewImageIndex] || quickViewImages[0]}
                                alt={name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                unoptimized={(quickViewImages[quickViewImageIndex] || quickViewImages[0]).startsWith('http') && !(quickViewImages[quickViewImageIndex] || quickViewImages[0]).includes('localhost')}
                              />
                            )}
                            
                            {/* Navigation */}
                            {quickViewImages.length > 1 && (
                              <>
                                <button
                                  onClick={() => setQuickViewImageIndex(prev => 
                                    prev === 0 ? quickViewImages.length - 1 : prev - 1
                                  )}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                  <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
                                </button>
                                <button
                                  onClick={() => setQuickViewImageIndex(prev => 
                                    prev === quickViewImages.length - 1 ? 0 : prev + 1
                                  )}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                  <ChevronRightIcon className="w-5 h-5 text-gray-700" />
                                </button>
                              </>
                            )}
                            
                            {/* Image Counter */}
                            {quickViewImages.length > 1 && (
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                                {quickViewImageIndex + 1} / {quickViewImages.length}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Không có hình ảnh
                          </div>
                        )}
                      </div>

                      {/* Thumbnails */}
                      {quickViewImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {quickViewImages.map((img, index) => {
                            const isBase64 = img.startsWith('data:image/');
                            return (
                              <button
                                key={index}
                                onClick={() => setQuickViewImageIndex(index)}
                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                  quickViewImageIndex === index
                                    ? 'border-blue-600 shadow-md scale-105'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                {isBase64 ? (
                                  <img
                                    src={img}
                                    alt={`${name} - ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Image
                                    src={img}
                                    alt={`${name} - ${index + 1}`}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                    unoptimized={img.startsWith('http') && !img.includes('localhost')}
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="space-y-6">
                      {/* Product Name */}
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">{name}</h3>
                        <p className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(rating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {rating.toFixed(1)} ({reviewCount} đánh giá)
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-bold text-gray-900">
                          {price.toLocaleString('vi-VN')}₫
                        </span>
                        {originalPrice && originalPrice > price && (
                          <>
                            <span className="text-xl text-gray-500 line-through">
                              {originalPrice.toLocaleString('vi-VN')}₫
                            </span>
                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                              -{discount}%
                            </span>
                          </>
                        )}
                      </div>

                      {/* Color Selection */}
                      {availableColors.length > 0 && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Màu sắc: <span className="font-normal text-gray-600">
                              {availableColors.find(c => (c.slug || c.name) === selectedColor)?.name || availableColors[0]?.name}
                            </span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {availableColors.map((color, index) => {
                              const colorValue = color.slug || color.name;
                              const isSelected = selectedColor === colorValue;
                              return (
                                <button
                                  key={index}
                                  onClick={() => setSelectedColor(colorValue)}
                                  className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                                    isSelected
                                      ? 'border-blue-600 shadow-lg scale-110'
                                      : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                  style={{ backgroundColor: color.hex || '#000000' }}
                                  title={color.name}
                                >
                                  {isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Size Selection */}
                      {availableSizes.length > 0 && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Kích cỡ: {selectedSize && (
                              <span className="font-normal text-gray-600">{selectedSize}</span>
                            )}
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {availableSizes.map((size) => (
                              <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all ${
                                  selectedSize === size
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                    : 'bg-white text-gray-900 border-gray-300 hover:border-blue-400'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Số lượng
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                            className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-xl">−</span>
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg py-2"
                          />
                          <button
                            onClick={() => setQuantity(prev => prev + 1)}
                            className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-xl">+</span>
                          </button>
                          <span className="text-sm text-gray-500">
                            {product.inventory?.quantity || 100} sản phẩm có sẵn
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={handleQuickViewAddToCart}
                          disabled={!selectedSize || !selectedColor || addingToCart}
                          className={`flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-semibold transition-all ${
                            selectedSize && selectedColor && !addingToCart
                              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingBagIcon className="w-5 h-5" />
                          {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                        </button>
                        <button
                          onClick={handleQuickViewBuyNow}
                          disabled={!selectedSize || !selectedColor}
                          className={`flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-semibold transition-all ${
                            selectedSize && selectedColor
                              ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <BoltIcon className="w-5 h-5" />
                          Mua ngay
              </button>
                      </div>

                      {/* View Full Details Link */}
                      <Link
                        href={`/products/${slug}`}
                        onClick={() => setShowQuickView(false)}
                        className="block text-center text-blue-600 hover:text-blue-700 font-medium py-2"
                      >
                        Xem chi tiết đầy đủ →
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
