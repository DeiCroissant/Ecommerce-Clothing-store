/**
 * Mock user data for development
 * Replace with real API calls in production
 */

export const mockUser = {
  id: '1',
  firstName: 'Nguyễn',
  lastName: 'Văn A',
  email: 'user@vyronfashion.com',
  emailVerified: false,
  phone: '0901234567',
  phoneVerified: true,
  avatar: '/images/placeholders/avatar-placeholder.jpg',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  
  // Gamification
  points: 1250,
  totalOrders: 8,
  totalSpent: 12500000,
  memberSince: '2023-01-15',
  
  // Profile completeness
  profileCompleteness: 75, // 0-100
  
  // Preferences
  language: 'vi',
  currency: 'VND',
  theme: 'light',
  measurementUnit: 'cm',
}

/**
 * Calculate profile completeness
 */
export function calculateProfileCompleteness(user) {
  const fields = [
    user.firstName,
    user.lastName,
    user.email,
    user.emailVerified,
    user.phone,
    user.avatar,
    user.dateOfBirth,
  ]
  
  const completed = fields.filter(Boolean).length
  return Math.round((completed / fields.length) * 100)
}

/**
 * Mock addresses
 */
export const mockAddresses = [
  {
    id: '1',
    label: 'Nhà riêng',
    isDefault: true,
    recipientName: 'Nguyễn Văn A',
    phone: '0901234567',
    addressLine1: '123 Nguyễn Huệ',
    addressLine2: 'Phường Bến Nghé',
    ward: 'Bến Nghé',
    district: 'Quận 1',
    city: 'Hồ Chí Minh',
    postalCode: '700000',
    country: 'Vietnam',
  },
  {
    id: '2',
    label: 'Văn phòng',
    isDefault: false,
    recipientName: 'Nguyễn Văn A',
    phone: '0901234567',
    addressLine1: '456 Lê Lợi',
    addressLine2: 'Phường Phạm Ngũ Lão',
    ward: 'Phạm Ngũ Lão',
    district: 'Quận 1',
    city: 'Hồ Chí Minh',
    postalCode: '700000',
    country: 'Vietnam',
  },
]

/**
 * Mock orders
 */
export const mockOrders = [
  {
    id: 'VF2025001',
    date: '2025-10-25',
    status: 'delivered',
    total: 2500000,
    itemCount: 3,
    items: [
      {
        id: '1',
        name: 'Premium Cotton T-Shirt',
        variant: 'Size: L, Màu: Đen',
        quantity: 2,
        price: 500000,
        image: '/images/products/tshirt-black.jpg',
      },
      {
        id: '2',
        name: 'Slim Fit Jeans',
        variant: 'Size: 32, Màu: Xanh đậm',
        quantity: 1,
        price: 1500000,
        image: '/images/products/jeans-blue.jpg',
      },
    ],
    shippingAddress: mockAddresses[0],
    trackingNumber: 'VN1234567890',
    deliveredAt: '2025-10-28',
  },
  {
    id: 'VF2025002',
    date: '2025-10-28',
    status: 'processing',
    total: 1800000,
    itemCount: 2,
    items: [
      {
        id: '3',
        name: 'Oxford Shirt',
        variant: 'Size: M, Màu: Trắng',
        quantity: 2,
        price: 900000,
        image: '/images/products/shirt-white.jpg',
      },
    ],
  },
]

/**
 * Order status config
 */
export const orderStatusConfig = {
  pending: {
    label: 'Chờ xác nhận',
    color: 'gray',
    description: 'Đơn hàng đang chờ xác nhận',
  },
  processing: {
    label: 'Đang xử lý',
    color: 'blue',
    description: 'Đơn hàng đang được chuẩn bị',
  },
  shipped: {
    label: 'Đang giao',
    color: 'purple',
    description: 'Đơn hàng đang trên đường giao đến bạn',
  },
  delivered: {
    label: 'Đã giao',
    color: 'green',
    description: 'Đơn hàng đã được giao thành công',
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'red',
    description: 'Đơn hàng đã bị hủy',
  },
  returned: {
    label: 'Đã trả',
    color: 'orange',
    description: 'Đơn hàng đã được hoàn trả',
  },
}

/**
 * Mock payment methods
 */
export const mockPaymentMethods = [
  {
    id: '1',
    type: 'card',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2027,
    isDefault: true,
    holderName: 'NGUYEN VAN A',
  },
  {
    id: '2',
    type: 'ewallet',
    provider: 'momo',
    phone: '0901234567',
    isDefault: false,
  },
]

/**
 * Mock wishlist items
 */
export const mockWishlist = [
  {
    id: '1',
    productId: 'prod-1',
    name: 'Classic Polo Shirt',
    price: 650000,
    originalPrice: 850000,
    image: '/images/products/polo-navy.jpg',
    inStock: true,
    addedAt: '2025-10-20',
  },
  {
    id: '2',
    productId: 'prod-2',
    name: 'Chino Pants',
    price: 1200000,
    image: '/images/products/chino-beige.jpg',
    inStock: false,
    addedAt: '2025-10-18',
  },
]

/**
 * Mock vouchers
 */
export const mockVouchers = [
  {
    id: 'WELCOME2025',
    code: 'WELCOME2025',
    type: 'percentage',
    value: 15,
    minPurchase: 500000,
    maxDiscount: 200000,
    expiryDate: '2025-12-31',
    description: 'Giảm 15% cho đơn hàng từ 500k',
    isActive: true,
  },
  {
    id: 'FREESHIP',
    code: 'FREESHIP',
    type: 'shipping',
    value: 30000,
    minPurchase: 300000,
    expiryDate: '2025-11-30',
    description: 'Miễn phí vận chuyển cho đơn từ 300k',
    isActive: true,
  },
]

/**
 * Store credit balance
 */
export const mockStoreCredit = {
  balance: 150000,
  currency: 'VND',
  transactions: [
    {
      id: '1',
      type: 'refund',
      amount: 200000,
      description: 'Hoàn tiền đơn hàng #VF2024950',
      date: '2025-10-15',
    },
    {
      id: '2',
      type: 'used',
      amount: -50000,
      description: 'Sử dụng cho đơn hàng #VF2025001',
      date: '2025-10-25',
    },
  ],
}
