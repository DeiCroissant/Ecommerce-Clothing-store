// Image Helper - Xử lý URL ảnh từ backend
import { API_BASE_URL } from './config';

/**
 * Chuyển đổi image path thành full URL
 * @param {string} imagePath - Path từ API (vd: /uploads/products/abc.jpg)
 * @returns {string} - Full URL hoặc placeholder
 */
export const getImageUrl = (imagePath) => {
  // Nếu không có path, return placeholder
  if (!imagePath) {
    return '/images/placeholders/product-placeholder.jpg';
  }

  // Nếu đã là full URL (http/https), return trực tiếp
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Nếu là data URI (base64), return trực tiếp
  if (imagePath.startsWith('data:image/')) {
    return imagePath;
  }

  // Nếu là placeholder local, return trực tiếp
  if (imagePath.startsWith('/images/placeholders/')) {
    return imagePath;
  }

  // Nếu là relative path từ backend (/uploads/...), thêm API_BASE_URL
  if (imagePath.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imagePath}`;
  }

  // Nếu không có slash đầu, thêm slash và API_BASE_URL
  if (!imagePath.startsWith('/')) {
    return `${API_BASE_URL}/uploads/products/${imagePath}`;
  }

  // Default: thêm API_BASE_URL vào đầu
  return `${API_BASE_URL}${imagePath}`;
};

/**
 * Lấy URL ảnh từ product object
 * @param {object} product - Product object
 * @param {string} colorSlug - Slug của màu (optional)
 * @returns {string} - Image URL
 */
export const getProductImage = (product, colorSlug = null) => {
  if (!product) {
    return '/images/placeholders/product-placeholder.jpg';
  }

  // Nếu có colorSlug, tìm ảnh của màu đó
  if (colorSlug && product.variants?.colors) {
    const color = product.variants.colors.find(
      c => (c.slug || c.name) === colorSlug
    );
    if (color?.images && color.images.length > 0) {
      return getImageUrl(color.images[0]);
    }
  }

  // Fallback: ảnh chính hoặc ảnh đầu tiên trong gallery
  const imagePath = product.image || product.images?.[0];
  return getImageUrl(imagePath);
};

/**
 * Lấy tất cả ảnh của product (bao gồm gallery và color variants)
 * @param {object} product - Product object
 * @returns {array} - Array of image URLs
 */
export const getAllProductImages = (product) => {
  if (!product) return [];

  const images = [];

  // Main image
  if (product.image) {
    images.push(getImageUrl(product.image));
  }

  // Gallery images
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach(img => {
      const url = getImageUrl(img);
      if (!images.includes(url)) {
        images.push(url);
      }
    });
  }

  // Color variant images
  if (product.variants?.colors) {
    product.variants.colors.forEach(color => {
      if (color.images && Array.isArray(color.images)) {
        color.images.forEach(img => {
          const url = getImageUrl(img);
          if (!images.includes(url)) {
            images.push(url);
          }
        });
      }
    });
  }

  return images.length > 0 ? images : ['/images/placeholders/product-placeholder.jpg'];
};

/**
 * Preload ảnh để tăng performance
 * @param {string|array} imageUrls - URL hoặc array URLs
 */
export const preloadImages = (imageUrls) => {
  const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
  
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Error handler cho img tag
 * @param {Event} e - Error event
 */
export const handleImageError = (e) => {
  console.warn('Image load failed:', e.target.src);
  e.target.src = '/images/placeholders/product-placeholder.jpg';
  e.target.onerror = null; // Prevent infinite loop
};
