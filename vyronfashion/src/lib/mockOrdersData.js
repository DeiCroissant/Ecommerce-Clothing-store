/**
 * Mock orders data for development
 * Replace with real API calls in production
 */

export const mockOrders = [
  {
    id: 'VF2025001',
    orderNumber: 'VF2025001',
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
    shippingAddress: {
      recipientName: 'Nguyễn Văn A',
      phone: '0901234567',
      addressLine1: '123 Nguyễn Huệ',
      addressLine2: 'Phường Bến Nghé',
      city: 'Hồ Chí Minh',
    },
    trackingNumber: 'VN1234567890',
    deliveredAt: '2025-10-28',
  },
  {
    id: 'VF2025002',
    orderNumber: 'VF2025002',
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
    color: '#6b7280',
    description: 'Đơn hàng đang chờ xác nhận',
  },
  processing: {
    label: 'Đang xử lý',
    color: '#3b82f6',
    description: 'Đơn hàng đang được chuẩn bị',
  },
  shipped: {
    label: 'Đang giao',
    color: '#a855f7',
    description: 'Đơn hàng đang trên đường giao đến bạn',
  },
  delivered: {
    label: 'Đã giao',
    color: '#10b981',
    description: 'Đơn hàng đã được giao thành công',
  },
  completed: {
    label: 'Hoàn thành',
    color: '#10b981',
    description: 'Đơn hàng đã hoàn thành',
  },
  refunded: {
    label: 'Hoàn tiền',
    color: '#ef4444',
    description: 'Đơn hàng đã được hoàn tiền',
  },
  cancelled: {
    label: 'Đã hủy',
    color: '#ef4444',
    description: 'Đơn hàng đã bị hủy',
  },
  returned: {
    label: 'Đã trả',
    color: '#f59e0b',
    description: 'Đơn hàng đã được hoàn trả',
  },
}

/**
 * Helper functions
 */
export function formatDate(date) {
  if (!date) return ''
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch (e) {
    return date
  }
}

export function getStatusInfo(status) {
  return orderStatusConfig[status] || orderStatusConfig.pending
}

