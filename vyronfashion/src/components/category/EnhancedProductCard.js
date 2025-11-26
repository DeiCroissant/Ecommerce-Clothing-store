'use client';

import { useState, useEffect, memo } from 'react';
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
import { getImageUrl, handleImageError } from '@/lib/imageHelper';

// Helper to get proper hex color value
const getHexColor = (color) => {
  if (!color) return '#808080';
  if (color.hex && color.hex.startsWith('#')) {
    return color.hex;
  }
  const colorMap = {
    'black': '#000000', 'đen': '#000000', 'den': '#000000',
    'white': '#FFFFFF', 'trắng': '#FFFFFF', 'trang': '#FFFFFF',
    'gray': '#9CA3AF', 'grey': '#9CA3AF', 'xám': '#9CA3AF', 'xam': '#9CA3AF',
    'red': '#EF4444', 'đỏ': '#EF4444', 'do': '#EF4444',
    'blue': '#3B82F6', 'xanh dương': '#3B82F6', 'xanh duong': '#3B82F6', 'xanh': '#3B82F6',
    'green': '#22C55E', 'xanh lá': '#22C55E', 'xanh la': '#22C55E',
    'yellow': '#EAB308', 'vàng': '#EAB308', 'vang': '#EAB308',
    'pink': '#EC4899', 'hồng': '#EC4899', 'hong': '#EC4899',
    'purple': '#A855F7', 'tím': '#A855F7', 'tim': '#A855F7',
    'orange': '#F97316', 'cam': '#F97316',
    'brown': '#92400E', 'nâu': '#92400E', 'nau': '#92400E',
    'beige': '#D4B896', 'be': '#D4B896', 'kem': '#D4B896',
    'navy': '#1E3A8A',
    'olive': '#6B8E23',
    'khaki': '#C3B091',
  };
  const slug = (color.slug || color.name || '').toLowerCase().trim();
  return colorMap[slug] || color.hex || '#808080';
};

/**
 * Enhanced ProductCard Component
 * Features:
 * - Badges: New, Discount, Best-seller, AI pick
 * - Quick add with size selection
 * - Lazy loading images with fixed aspect ratio (3:4)
 * - Hover: Available colors + Quick View
 * - Wishlist toggle
 * - Optimized with React.memo
 */
const EnhancedProductCard = memo(function EnhancedProductCard({ product }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [hoveredColor, setHoveredColor] = useState(null);
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
  
  // Lấy ảnh hiển thị: ưu tiên ảnh của màu được hover, sau đó là ảnh mặc định
  const getDisplayImage = () => {
    // Ưu tiên: hoveredColor (preview khi hover) > selectedColor (đã chọn) > ảnh mặc định
    const colorToDisplay = hoveredColor || selectedColor;
    
    if (colorToDisplay && product.variants?.colors) {
      const colorObj = product.variants.colors.find(c => (c.slug || c.name) === colorToDisplay);
      if (colorObj?.images && colorObj.images.length > 0) {
        return getImageUrl(colorObj.images[0]);
      }
    }
    return getImageUrl(product.image || product.images?.[0] || '');
  };
  
  const image = getDisplayImage();
  
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
  
  // Debug: Log màu sắc để kiểm tra
  if (availableColors.length > 0 && product.name?.includes('Polo')) {
    console.log(`[EnhancedProductCard] ${product.name}:`, availableColors.map(c => ({
      name: c.name,
      slug: c.slug, 
      hex: c.hex,
      computed: getHexColor(c)
    })));
  }
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
      otherImages.push(getImageUrl(image));
    }
    
    // Add gallery images
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (!imagesMap.has(img)) {
          imagesMap.set(img, true);
          otherImages.push(getImageUrl(img));
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

  const handleQuickAdd = async () => {
    if (!selectedSize) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Vui lòng chọn kích cỡ', type: 'warning', duration: 3000 } 
        }));
      }
      return;
    }
    
    if (!selectedColor) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Vui lòng chọn màu sắc', type: 'warning', duration: 3000 } 
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
      await cartAPI.addToCart(userId, product.id, selectedColor, selectedSize, 1);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Đã thêm vào giỏ hàng!', type: 'success', duration: 3000 } 
        }));
        window.dispatchEvent(new Event('cartChanged'));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Có lỗi xảy ra khi thêm vào giỏ hàng', type: 'error', duration: 3000 } 
        }));
      }
    }
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
          {image ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
              No Image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && (
              <span className="bg-zinc-900 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg uppercase tracking-wide">
                NEW
              </span>
            )}
            {discount > 0 && (
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
                  {availableColors.slice(0, 5).map((color, index) => {
                    const colorValue = color.slug || color.name;
                    const isHovered = hoveredColor === colorValue;
                    const isSelected = selectedColor === colorValue;
                    return (
                      <div
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedColor(colorValue);
                        }}
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                          setHoveredColor(colorValue);
                        }}
                        onMouseLeave={(e) => {
                          e.stopPropagation();
                          setHoveredColor(null);
                        }}
                        className={`w-6 h-6 rounded-full border-2 shadow-md cursor-pointer hover:scale-125 transition-all duration-200 ${
                          isSelected ? 'border-blue-500 scale-125 ring-2 ring-blue-500' : isHovered ? 'border-blue-400 scale-125 ring-2 ring-blue-400/50' : 'border-white'
                        }`}
                        style={{ backgroundColor: getHexColor(color) }}
                        title={color.name}
                      />
                    );
                  })}
                  {availableColors.length > 5 && (
                    <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs">+{availableColors.length - 5}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
        <div className="p-4 flex flex-col h-[250px]">
          {/* Product Name */}
          <h3 className="font-semibold text-zinc-900 mb-2 line-clamp-2 group-hover:text-zinc-600 transition-colors min-h-[48px]">
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
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-zinc-500 line-through">
                {originalPrice.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          {/* Size Selection + Quick Add */}
          {inStock && (
            <div className="space-y-2 mt-auto">
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
      </AnimatePresence>
    </motion.div>
  );
});

export default EnhancedProductCard;
