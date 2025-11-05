'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon, 
  ShoppingBagIcon,
  HeartIcon,
  EyeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import * as wishlistAPI from '@/lib/api/wishlist';

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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(product.wishlist_count || 0);
  
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

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    
    const userId = getCurrentUserId()
    if (!userId) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích')
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
      alert('Có lỗi xảy ra khi cập nhật yêu thích')
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
              className="w-full flex items-center justify-center gap-2 bg-white text-zinc-900 py-2 rounded-lg font-semibold hover:bg-zinc-100 transition-colors"
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

      {/* Quick View Modal (Placeholder) */}
      <AnimatePresence>
        {showQuickView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuickView(false)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-4">Quick View: {name}</h2>
              <p className="text-gray-600">
                Quick view modal content here...
              </p>
              <button
                onClick={() => setShowQuickView(false)}
                className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Đóng
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
