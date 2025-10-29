/**
 * WISHLIST MOCK DATA & HELPERS (OPTIMIZED)
 * 
 * Performance principles:
 * - No array cloning
 * - Single-pass calculations
 * - Memoization-ready structure
 * - Minimal memory footprint
 */

// ============================================
// CONSTANTS
// ============================================

export const WISHLIST_STORAGE_KEY = 'vyron_wishlist';
export const MAX_WISHLIST_ITEMS = 100;

// ============================================
// MOCK DATA
// ============================================

export const mockWishlistItems = [
  {
    id: 'wish-001',
    productId: 'prod-mens-tshirt-001',
    product: {
      id: 'prod-mens-tshirt-001',
      name: 'Classic White Cotton T-Shirt',
      slug: 'classic-white-tshirt',
      price: 29.99,
      originalPrice: 39.99,
      discount: 25,
      image: '/images/products/mens-tshirt-white.jpg',
      category: 'T-Shirts',
      inStock: true,
      stockCount: 15,
      rating: 4.5,
      reviews: 128,
      variants: {
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['White', 'Black', 'Navy']
      }
    },
    addedAt: '2024-10-15T10:30:00Z',
    priceAtAdd: 29.99,
    priceChanged: false,
    notifyOnSale: true,
    notifyOnStock: false
  },
  {
    id: 'wish-002',
    productId: 'prod-womens-dress-001',
    product: {
      id: 'prod-womens-dress-001',
      name: 'Elegant Summer Floral Dress',
      slug: 'elegant-summer-floral-dress',
      price: 79.99,
      originalPrice: 99.99,
      discount: 20,
      image: '/images/products/womens-dress-floral.jpg',
      category: 'Dresses',
      inStock: true,
      stockCount: 8,
      rating: 4.8,
      reviews: 256,
      variants: {
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Floral Blue', 'Floral Pink']
      }
    },
    addedAt: '2024-10-14T15:20:00Z',
    priceAtAdd: 89.99,
    priceChanged: true, // Price dropped!
    notifyOnSale: true,
    notifyOnStock: false
  },
  {
    id: 'wish-003',
    productId: 'prod-mens-jeans-001',
    product: {
      id: 'prod-mens-jeans-001',
      name: 'Slim Fit Dark Blue Jeans',
      slug: 'slim-fit-dark-blue-jeans',
      price: 89.99,
      originalPrice: 89.99,
      discount: 0,
      image: '/images/products/mens-jeans-darkblue.jpg',
      category: 'Jeans',
      inStock: false, // Out of stock!
      stockCount: 0,
      rating: 4.6,
      reviews: 189,
      variants: {
        sizes: ['28', '30', '32', '34', '36'],
        colors: ['Dark Blue', 'Light Blue', 'Black']
      }
    },
    addedAt: '2024-10-13T09:15:00Z',
    priceAtAdd: 89.99,
    priceChanged: false,
    notifyOnSale: false,
    notifyOnStock: true // Notify when back in stock
  },
  {
    id: 'wish-004',
    productId: 'prod-womens-blazer-001',
    product: {
      id: 'prod-womens-blazer-001',
      name: 'Professional Black Blazer',
      slug: 'professional-black-blazer',
      price: 129.99,
      originalPrice: 159.99,
      discount: 19,
      image: '/images/products/womens-blazer-black.jpg',
      category: 'Blazers',
      inStock: true,
      stockCount: 12,
      rating: 4.7,
      reviews: 94,
      variants: {
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Black', 'Navy', 'Gray']
      }
    },
    addedAt: '2024-10-12T14:45:00Z',
    priceAtAdd: 129.99,
    priceChanged: false,
    notifyOnSale: true,
    notifyOnStock: false
  },
  {
    id: 'wish-005',
    productId: 'prod-mens-sneakers-001',
    product: {
      id: 'prod-mens-sneakers-001',
      name: 'Urban Style White Sneakers',
      slug: 'urban-style-white-sneakers',
      price: 109.99,
      originalPrice: 139.99,
      discount: 21,
      image: '/images/products/mens-sneakers-white.jpg',
      category: 'Shoes',
      inStock: true,
      stockCount: 25,
      rating: 4.4,
      reviews: 312,
      variants: {
        sizes: ['7', '8', '9', '10', '11', '12'],
        colors: ['White', 'Black', 'Gray']
      }
    },
    addedAt: '2024-10-11T11:20:00Z',
    priceAtAdd: 119.99,
    priceChanged: true, // Price dropped!
    notifyOnSale: true,
    notifyOnStock: false
  },
  {
    id: 'wish-006',
    productId: 'prod-womens-handbag-001',
    product: {
      id: 'prod-womens-handbag-001',
      name: 'Luxury Leather Handbag',
      slug: 'luxury-leather-handbag',
      price: 199.99,
      originalPrice: 249.99,
      discount: 20,
      image: '/images/products/womens-handbag-brown.jpg',
      category: 'Accessories',
      inStock: true,
      stockCount: 6,
      rating: 4.9,
      reviews: 87,
      variants: {
        colors: ['Brown', 'Black', 'Beige']
      }
    },
    addedAt: '2024-10-10T16:30:00Z',
    priceAtAdd: 199.99,
    priceChanged: false,
    notifyOnSale: true,
    notifyOnStock: false
  },
  {
    id: 'wish-007',
    productId: 'prod-mens-hoodie-001',
    product: {
      id: 'prod-mens-hoodie-001',
      name: 'Cozy Gray Pullover Hoodie',
      slug: 'cozy-gray-pullover-hoodie',
      price: 59.99,
      originalPrice: 79.99,
      discount: 25,
      image: '/images/products/mens-hoodie-gray.jpg',
      category: 'Hoodies',
      inStock: true,
      stockCount: 20,
      rating: 4.6,
      reviews: 145,
      variants: {
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Gray', 'Black', 'Navy']
      }
    },
    addedAt: '2024-10-09T08:15:00Z',
    priceAtAdd: 59.99,
    priceChanged: false,
    notifyOnSale: false,
    notifyOnStock: false
  },
  {
    id: 'wish-008',
    productId: 'prod-womens-cardigan-001',
    product: {
      id: 'prod-womens-cardigan-001',
      name: 'Soft Knit Beige Cardigan',
      slug: 'soft-knit-beige-cardigan',
      price: 69.99,
      originalPrice: 69.99,
      discount: 0,
      image: '/images/products/womens-cardigan-beige.jpg',
      category: 'Sweaters',
      inStock: false,
      stockCount: 0,
      rating: 4.5,
      reviews: 76,
      variants: {
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Beige', 'Cream', 'Light Pink']
      }
    },
    addedAt: '2024-10-08T13:40:00Z',
    priceAtAdd: 69.99,
    priceChanged: false,
    notifyOnSale: false,
    notifyOnStock: true
  },
  {
    id: 'wish-009',
    productId: 'prod-mens-shorts-001',
    product: {
      id: 'prod-mens-shorts-001',
      name: 'Athletic Gym Shorts',
      slug: 'athletic-gym-shorts',
      price: 34.99,
      originalPrice: 44.99,
      discount: 22,
      image: '/images/products/mens-shorts-black.jpg',
      category: 'Shorts',
      inStock: true,
      stockCount: 30,
      rating: 4.3,
      reviews: 203,
      variants: {
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'Navy', 'Gray']
      }
    },
    addedAt: '2024-10-07T10:25:00Z',
    priceAtAdd: 34.99,
    priceChanged: false,
    notifyOnSale: false,
    notifyOnStock: false
  },
  {
    id: 'wish-010',
    productId: 'prod-womens-skirt-001',
    product: {
      id: 'prod-womens-skirt-001',
      name: 'Pleated Midi Skirt',
      slug: 'pleated-midi-skirt',
      price: 54.99,
      originalPrice: 69.99,
      discount: 21,
      image: '/images/products/womens-skirt-pleated.jpg',
      category: 'Skirts',
      inStock: true,
      stockCount: 14,
      rating: 4.7,
      reviews: 112,
      variants: {
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Black', 'Navy', 'Burgundy']
      }
    },
    addedAt: '2024-10-06T15:50:00Z',
    priceAtAdd: 59.99,
    priceChanged: true, // Price dropped!
    notifyOnSale: true,
    notifyOnStock: false
  },
  {
    id: 'wish-011',
    productId: 'prod-mens-jacket-001',
    product: {
      id: 'prod-mens-jacket-001',
      name: 'Waterproof Winter Jacket',
      slug: 'waterproof-winter-jacket',
      price: 159.99,
      originalPrice: 199.99,
      discount: 20,
      image: '/images/products/mens-jacket-winter.jpg',
      category: 'Jackets',
      inStock: true,
      stockCount: 9,
      rating: 4.8,
      reviews: 167,
      variants: {
        sizes: ['M', 'L', 'XL', 'XXL'],
        colors: ['Black', 'Navy', 'Olive']
      }
    },
    addedAt: '2024-10-05T09:30:00Z',
    priceAtAdd: 159.99,
    priceChanged: false,
    notifyOnSale: true,
    notifyOnStock: false
  },
  {
    id: 'wish-012',
    productId: 'prod-womens-boots-001',
    product: {
      id: 'prod-womens-boots-001',
      name: 'Ankle Leather Boots',
      slug: 'ankle-leather-boots',
      price: 139.99,
      originalPrice: 179.99,
      discount: 22,
      image: '/images/products/womens-boots-leather.jpg',
      category: 'Shoes',
      inStock: true,
      stockCount: 11,
      rating: 4.6,
      reviews: 98,
      variants: {
        sizes: ['6', '7', '8', '9', '10'],
        colors: ['Brown', 'Black']
      }
    },
    addedAt: '2024-10-04T14:15:00Z',
    priceAtAdd: 139.99,
    priceChanged: false,
    notifyOnSale: false,
    notifyOnStock: false
  },
  {
    id: 'wish-013',
    productId: 'prod-mens-polo-001',
    product: {
      id: 'prod-mens-polo-001',
      name: 'Classic Navy Polo Shirt',
      slug: 'classic-navy-polo-shirt',
      price: 44.99,
      originalPrice: 54.99,
      discount: 18,
      image: '/images/products/mens-polo-navy.jpg',
      category: 'Polo Shirts',
      inStock: true,
      stockCount: 22,
      rating: 4.4,
      reviews: 134,
      variants: {
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Navy', 'White', 'Black', 'Red']
      }
    },
    addedAt: '2024-10-03T11:45:00Z',
    priceAtAdd: 44.99,
    priceChanged: false,
    notifyOnSale: false,
    notifyOnStock: false
  },
  {
    id: 'wish-014',
    productId: 'prod-womens-scarf-001',
    product: {
      id: 'prod-womens-scarf-001',
      name: 'Silk Pattern Scarf',
      slug: 'silk-pattern-scarf',
      price: 39.99,
      originalPrice: 49.99,
      discount: 20,
      image: '/images/products/womens-scarf-silk.jpg',
      category: 'Accessories',
      inStock: true,
      stockCount: 18,
      rating: 4.7,
      reviews: 67,
      variants: {
        colors: ['Blue Pattern', 'Red Pattern', 'Green Pattern']
      }
    },
    addedAt: '2024-10-02T16:20:00Z',
    priceAtAdd: 39.99,
    priceChanged: false,
    notifyOnSale: true,
    notifyOnStock: false
  },
  {
    id: 'wish-015',
    productId: 'prod-mens-belt-001',
    product: {
      id: 'prod-mens-belt-001',
      name: 'Genuine Leather Belt',
      slug: 'genuine-leather-belt',
      price: 49.99,
      originalPrice: 49.99,
      discount: 0,
      image: '/images/products/mens-belt-leather.jpg',
      category: 'Accessories',
      inStock: true,
      stockCount: 27,
      rating: 4.5,
      reviews: 156,
      variants: {
        sizes: ['32', '34', '36', '38', '40'],
        colors: ['Brown', 'Black']
      }
    },
    addedAt: '2024-10-01T10:00:00Z',
    priceAtAdd: 49.99,
    priceChanged: false,
    notifyOnSale: false,
    notifyOnStock: false
  }
];

// ============================================
// OPTIMIZED HELPER FUNCTIONS
// ============================================

/**
 * Calculate wishlist statistics in single pass (O(n))
 * ✅ No array cloning
 * ✅ Single iteration
 * ✅ Memoization-ready
 */
export function getWishlistStats(items) {
  return items.reduce((stats, item) => {
    const isPriceDrop = item.priceChanged && item.product.price < item.priceAtAdd;
    return {
      totalItems: stats.totalItems + 1,
      totalValue: stats.totalValue + item.product.price,
      totalSavings: stats.totalSavings + (item.product.originalPrice - item.product.price),
      inStockItems: stats.inStockItems + (item.product.inStock ? 1 : 0),
      outOfStockItems: stats.outOfStockItems + (!item.product.inStock ? 1 : 0),
      priceDrops: stats.priceDrops + (isPriceDrop ? 1 : 0),
      onSaleItems: stats.onSaleItems + (item.product.discount > 0 ? 1 : 0)
    };
  }, {
    totalItems: 0,
    totalValue: 0,
    totalSavings: 0,
    inStockItems: 0,
    outOfStockItems: 0,
    priceDrops: 0,
    onSaleItems: 0
  });
}

/**
 * Filter wishlist items (O(n))
 * ✅ No cloning, returns reference or new filtered array
 */
export function filterWishlistItems(items, filters) {
  let result = items;

  if (filters.inStockOnly) {
    result = result.filter(item => item.product.inStock);
  }

  if (filters.priceDropsOnly) {
    result = result.filter(item => 
      item.priceChanged && item.product.price < item.priceAtAdd
    );
  }

  if (filters.onSaleOnly) {
    result = result.filter(item => item.product.discount > 0);
  }

  if (filters.category && filters.category !== 'all') {
    result = result.filter(item => item.product.category === filters.category);
  }

  return result;
}

/**
 * Sort wishlist items (O(n log n))
 * ✅ Returns new array (required for sort)
 */
export function sortWishlistItems(items, sortBy) {
  const sorted = [...items]; // Must clone for sort

  switch (sortBy) {
    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    case 'date-asc':
      return sorted.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));
    case 'price-desc':
      return sorted.sort((a, b) => b.product.price - a.product.price);
    case 'price-asc':
      return sorted.sort((a, b) => a.product.price - b.product.price);
    case 'name-asc':
      return sorted.sort((a, b) => a.product.name.localeCompare(b.product.name));
    case 'discount-desc':
      return sorted.sort((a, b) => b.product.discount - a.product.discount);
    default:
      return sorted;
  }
}

/**
 * Get unique categories from wishlist (O(n))
 * ✅ Returns Set for O(1) lookups
 */
export function getWishlistCategories(items) {
  return Array.from(new Set(items.map(item => item.product.category))).sort();
}

/**
 * Check if product is in wishlist (O(1) with Set)
 * ✅ Use Set for fast lookups
 */
export function isInWishlist(productId, wishlistIds) {
  return wishlistIds.has(productId);
}

/**
 * Format currency (memoization-ready)
 * ✅ Pure function
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Format date relative (memoization-ready)
 * ✅ Pure function
 */
export function formatDateRelative(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Calculate price change (memoization-ready)
 * ✅ Pure function
 */
export function getPriceChange(item) {
  if (!item.priceChanged) return null;
  
  const change = item.product.price - item.priceAtAdd;
  const percentChange = ((change / item.priceAtAdd) * 100).toFixed(0);
  
  return {
    amount: Math.abs(change),
    percent: Math.abs(percentChange),
    isIncrease: change > 0,
    isDecrease: change < 0
  };
}

// ============================================
// LOCALSTORAGE HELPERS
// ============================================

/**
 * Load wishlist from localStorage
 * ✅ Returns parsed data or empty array
 */
export function loadWishlistFromStorage() {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load wishlist:', error);
    return [];
  }
}

/**
 * Save wishlist to localStorage
 * ✅ Error handling
 */
export function saveWishlistToStorage(items) {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Failed to save wishlist:', error);
    return false;
  }
}

/**
 * Clear wishlist from localStorage
 */
export function clearWishlistStorage() {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear wishlist:', error);
    return false;
  }
}
