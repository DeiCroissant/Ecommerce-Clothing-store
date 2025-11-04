/**
 * Mock Products Data for Admin Dashboard
 * Dựa trên cấu trúc mock data từ project
 */

export const mockProducts = [
  {
    id: '1',
    slug: 'ao-thun-basic-cotton-nam',
    name: 'Áo Thun Basic Cotton Nam Cao Cấp',
    sku: 'VRN-AT-001',
    brand: {
      name: 'VYRON',
      slug: 'vyron'
    },
    category: {
      name: 'Áo Nam',
      slug: 'ao-nam'
    },
    pricing: {
      original: 499000,
      sale: 349000,
      discount_percent: 30,
      currency: 'VND'
    },
    rating: {
      average: 4.5,
      count: 128
    },
    short_description: 'Áo thun nam basic với chất liệu cotton 100% thoáng mát, form dáng regular fit thoải mái.',
    image: '/images/products/tshirt-1.jpg',
    images: [
      '/images/products/tshirt-1.jpg',
      '/images/products/tshirt-2.jpg',
      '/images/products/tshirt-3.jpg'
    ],
    variants: {
      colors: [
        { name: 'Đen', slug: 'black', hex: '#000000', available: true },
        { name: 'Trắng', slug: 'white', hex: '#FFFFFF', available: true },
        { name: 'Xám', slug: 'gray', hex: '#6B7280', available: true }
      ],
      sizes: [
        { name: 'S', available: true, stock: 15 },
        { name: 'M', available: true, stock: 28 },
        { name: 'L', available: true, stock: 32 },
        { name: 'XL', available: true, stock: 4 }
      ]
    },
    inventory: {
      in_stock: true,
      quantity: 79,
      low_stock_threshold: 10
    },
    wishlist_count: 156, // Số lượng người yêu thích
    sold_count: 234,
    status: 'active',
    created_at: '2024-10-15',
    updated_at: '2024-11-04'
  },
  {
    id: '2',
    slug: 'ao-so-mi-oxford',
    name: 'Áo Sơ Mi Trắng Oxford',
    sku: 'VRN-ASM-002',
    brand: {
      name: 'VYRON',
      slug: 'vyron'
    },
    category: {
      name: 'Áo Nam',
      slug: 'ao-nam'
    },
    pricing: {
      original: 599000,
      sale: 449000,
      discount_percent: 25,
      currency: 'VND'
    },
    rating: {
      average: 4.8,
      count: 95
    },
    short_description: 'Áo sơ mi Oxford cổ điển, chất liệu cao cấp, form slim fit.',
    image: '/images/products/shirt-1.jpg',
    images: [
      '/images/products/shirt-1.jpg',
      '/images/products/shirt-2.jpg'
    ],
    variants: {
      colors: [
        { name: 'Trắng', slug: 'white', hex: '#FFFFFF', available: true },
        { name: 'Xanh Dương', slug: 'blue', hex: '#1E3A8A', available: true }
      ],
      sizes: [
        { name: 'S', available: true, stock: 12 },
        { name: 'M', available: true, stock: 25 },
        { name: 'L', available: true, stock: 18 },
        { name: 'XL', available: true, stock: 8 }
      ]
    },
    inventory: {
      in_stock: true,
      quantity: 63,
      low_stock_threshold: 10
    },
    wishlist_count: 203, // Sản phẩm được yêu thích nhất
    sold_count: 156,
    status: 'active',
    created_at: '2024-09-20',
    updated_at: '2024-11-03'
  },
  {
    id: '3',
    slug: 'quan-jean-slim-fit',
    name: 'Quần Jean Slim Fit',
    sku: 'VRN-QJ-003',
    brand: {
      name: 'VYRON',
      slug: 'vyron'
    },
    category: {
      name: 'Quần Nam',
      slug: 'quan-nam'
    },
    pricing: {
      original: 799000,
      sale: 599000,
      discount_percent: 25,
      currency: 'VND'
    },
    rating: {
      average: 4.7,
      count: 112
    },
    short_description: 'Quần jean slim fit chất lượng cao, co giãn tốt, bền đẹp.',
    image: '/images/products/jeans-1.jpg',
    images: [
      '/images/products/jeans-1.jpg',
      '/images/products/jeans-2.jpg'
    ],
    variants: {
      colors: [
        { name: 'Xanh Đậm', slug: 'dark-blue', hex: '#1E3A5F', available: true },
        { name: 'Xanh Nhạt', slug: 'light-blue', hex: '#4A90E2', available: true },
        { name: 'Đen', slug: 'black', hex: '#000000', available: true }
      ],
      sizes: [
        { name: '28', available: true, stock: 5 },
        { name: '30', available: true, stock: 15 },
        { name: '32', available: true, stock: 22 },
        { name: '34', available: true, stock: 18 },
        { name: '36', available: true, stock: 10 }
      ]
    },
    inventory: {
      in_stock: true,
      quantity: 70,
      low_stock_threshold: 10
    },
    wishlist_count: 178,
    sold_count: 134,
    status: 'active',
    created_at: '2024-09-15',
    updated_at: '2024-11-02'
  },
  {
    id: '4',
    slug: 'ao-polo-classic-navy',
    name: 'Áo Polo Classic Navy',
    sku: 'VRN-AP-004',
    brand: {
      name: 'VYRON',
      slug: 'vyron'
    },
    category: {
      name: 'Áo Nam',
      slug: 'ao-nam'
    },
    pricing: {
      original: 429000,
      sale: 329000,
      discount_percent: 23,
      currency: 'VND'
    },
    rating: {
      average: 4.6,
      count: 94
    },
    short_description: 'Áo polo classic thiết kế thanh lịch, phù hợp mọi dịp.',
    image: '/images/products/polo-1.jpg',
    images: [
      '/images/products/polo-1.jpg'
    ],
    variants: {
      colors: [
        { name: 'Navy', slug: 'navy', hex: '#1E3A8A', available: true },
        { name: 'Trắng', slug: 'white', hex: '#FFFFFF', available: true },
        { name: 'Đen', slug: 'black', hex: '#000000', available: true }
      ],
      sizes: [
        { name: 'S', available: true, stock: 20 },
        { name: 'M', available: true, stock: 35 },
        { name: 'L', available: true, stock: 28 },
        { name: 'XL', available: true, stock: 12 }
      ]
    },
    inventory: {
      in_stock: true,
      quantity: 95,
      low_stock_threshold: 15
    },
    wishlist_count: 167,
    sold_count: 98,
    status: 'active',
    created_at: '2024-10-01',
    updated_at: '2024-11-01'
  },
  {
    id: '5',
    slug: 'vay-dam-hoa-nhe-nhang',
    name: 'Váy Đầm Hoa Nhẹ Nhàng',
    sku: 'VRN-VD-005',
    brand: {
      name: 'VYRON',
      slug: 'vyron'
    },
    category: {
      name: 'Váy Nữ',
      slug: 'vay-nu'
    },
    pricing: {
      original: 549000,
      sale: 449000,
      discount_percent: 18,
      currency: 'VND'
    },
    rating: {
      average: 4.6,
      count: 73
    },
    short_description: 'Váy đầm hoa nhẹ nhàng, chất liệu mềm mại, thiết kế nữ tính.',
    image: '/images/products/dress-1.jpg',
    images: [
      '/images/products/dress-1.jpg',
      '/images/products/dress-2.jpg'
    ],
    variants: {
      colors: [
        { name: 'Hoa Nhỏ', slug: 'small-flower', hex: '#FFE5E5', available: true },
        { name: 'Hoa Lớn', slug: 'large-flower', hex: '#FFD1D1', available: true }
      ],
      sizes: [
        { name: 'S', available: true, stock: 8 },
        { name: 'M', available: true, stock: 15 },
        { name: 'L', available: true, stock: 12 },
        { name: 'XL', available: true, stock: 5 }
      ]
    },
    inventory: {
      in_stock: true,
      quantity: 40,
      low_stock_threshold: 10
    },
    wishlist_count: 142,
    sold_count: 67,
    status: 'active',
    created_at: '2024-10-10',
    updated_at: '2024-10-30'
  },
  {
    id: '6',
    slug: 'ao-khoac-denim',
    name: 'Áo Khoác Denim',
    sku: 'VRN-AK-006',
    brand: {
      name: 'VYRON',
      slug: 'vyron'
    },
    category: {
      name: 'Áo Khoác',
      slug: 'ao-khoac'
    },
    pricing: {
      original: 899000,
      sale: 699000,
      discount_percent: 22,
      currency: 'VND'
    },
    rating: {
      average: 4.9,
      count: 142
    },
    short_description: 'Áo khoác denim classic, chất lượng cao, bền đẹp.',
    image: '/images/products/jacket-1.jpg',
    images: [
      '/images/products/jacket-1.jpg'
    ],
    variants: {
      colors: [
        { name: 'Xanh Đậm', slug: 'dark-blue', hex: '#1E3A5F', available: true },
        { name: 'Xanh Nhạt', slug: 'light-blue', hex: '#4A90E2', available: true }
      ],
      sizes: [
        { name: 'S', available: true, stock: 6 },
        { name: 'M', available: true, stock: 12 },
        { name: 'L', available: true, stock: 8 },
        { name: 'XL', available: true, stock: 4 }
      ]
    },
    inventory: {
      in_stock: true,
      quantity: 30,
      low_stock_threshold: 5
    },
    wishlist_count: 189,
    sold_count: 87,
    status: 'active',
    created_at: '2024-09-25',
    updated_at: '2024-10-29'
  },
  {
    id: '7',
    slug: 'quan-short-kaki',
    name: 'Quần Short Kaki',
    sku: 'VRN-QS-007',
    brand: {
      name: 'VYRON',
      slug: 'vyron'
    },
    category: {
      name: 'Quần Nam',
      slug: 'quan-nam'
    },
    pricing: {
      original: 399000,
      sale: 349000,
      discount_percent: 12,
      currency: 'VND'
    },
    rating: {
      average: 4.4,
      count: 86
    },
    short_description: 'Quần short kaki thoáng mát, phù hợp mùa hè.',
    image: '/images/products/shorts-1.jpg',
    images: [
      '/images/products/shorts-1.jpg'
    ],
    variants: {
      colors: [
        { name: 'Be', slug: 'beige', hex: '#D4B896', available: true },
        { name: 'Xám', slug: 'gray', hex: '#6B7280', available: true },
        { name: 'Navy', slug: 'navy', hex: '#1E3A8A', available: true }
      ],
      sizes: [
        { name: 'S', available: true, stock: 18 },
        { name: 'M', available: true, stock: 25 },
        { name: 'L', available: true, stock: 20 },
        { name: 'XL', available: true, stock: 10 }
      ]
    },
    inventory: {
      in_stock: true,
      quantity: 73,
      low_stock_threshold: 10
    },
    wishlist_count: 98,
    sold_count: 45,
    status: 'active',
    created_at: '2024-10-05',
    updated_at: '2024-10-28'
  },
  {
    id: '8',
    slug: 'vay-maxi-bohemian',
    name: 'Váy Maxi Bohemian',
    sku: 'VRN-VM-008',
    brand: {
      name: 'VYRON',
      slug: 'vyron'
    },
    category: {
      name: 'Váy Nữ',
      slug: 'vay-nu'
    },
    pricing: {
      original: 649000,
      sale: 549000,
      discount_percent: 15,
      currency: 'VND'
    },
    rating: {
      average: 4.5,
      count: 67
    },
    short_description: 'Váy maxi bohemian dài, phong cách tự do, nữ tính.',
    image: '/images/products/dress-2.jpg',
    images: [
      '/images/products/dress-2.jpg'
    ],
    variants: {
      colors: [
        { name: 'Hoa Vàng', slug: 'yellow-flower', hex: '#FFE5B4', available: true },
        { name: 'Hoa Hồng', slug: 'pink-flower', hex: '#FFB6C1', available: true }
      ],
      sizes: [
        { name: 'S', available: true, stock: 5 },
        { name: 'M', available: true, stock: 10 },
        { name: 'L', available: true, stock: 8 },
        { name: 'XL', available: true, stock: 3 }
      ]
    },
    inventory: {
      in_stock: true,
      quantity: 26,
      low_stock_threshold: 5
    },
    wishlist_count: 134,
    sold_count: 52,
    status: 'active',
    created_at: '2024-10-08',
    updated_at: '2024-10-27'
  }
]

/**
 * Lấy danh sách sản phẩm được yêu thích nhất (sắp xếp theo wishlist_count)
 */
export function getMostLikedProducts(limit = 5) {
  return [...mockProducts]
    .sort((a, b) => b.wishlist_count - a.wishlist_count)
    .slice(0, limit)
}

/**
 * Tìm kiếm sản phẩm
 */
export function searchProducts(query) {
  if (!query || query.trim() === '') {
    return mockProducts
  }
  
  const lowerQuery = query.toLowerCase()
  return mockProducts.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.sku.toLowerCase().includes(lowerQuery) ||
    product.category.name.toLowerCase().includes(lowerQuery) ||
    product.brand.name.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Lấy sản phẩm theo ID
 */
export function getProductById(id) {
  return mockProducts.find(p => p.id === id)
}

/**
 * Lấy sản phẩm theo slug
 */
export function getProductBySlug(slug) {
  return mockProducts.find(p => p.slug === slug)
}

