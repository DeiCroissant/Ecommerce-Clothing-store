/**
 * Mock returns data for development
 * Replace with real API calls in production
 */

export const mockReturns = [
  {
    id: 'RET001',
    return_id: 'RET001',
    returnNumber: 'RET001',
    date: '2025-10-20',
    status: 'pending',
    amount: 500000,
    products: [
      {
        id: '1',
        name: 'Premium Cotton T-Shirt',
        quantity: 1,
        reason: 'Sản phẩm không đúng mô tả',
        image: '/images/products/tshirt-black.jpg',
      },
    ],
    orderId: 'VF2025001',
  },
  {
    id: 'RET002',
    return_id: 'RET002',
    returnNumber: 'RET002',
    date: '2025-10-15',
    status: 'approved',
    amount: 900000,
    products: [
      {
        id: '2',
        name: 'Oxford Shirt',
        quantity: 1,
        reason: 'Sản phẩm bị lỗi',
        image: '/images/products/shirt-white.jpg',
      },
    ],
    orderId: 'VF2025002',
  },
]

/**
 * Return status config
 */
export const returnStatusConfig = {
  pending: {
    label: 'Chờ xử lý',
    color: '#6b7280',
    description: 'Yêu cầu trả hàng đang chờ xử lý',
  },
  approved: {
    label: 'Đã duyệt',
    color: '#10b981',
    description: 'Yêu cầu trả hàng đã được duyệt',
  },
  processing: {
    label: 'Đang xử lý',
    color: '#3b82f6',
    description: 'Yêu cầu trả hàng đang được xử lý',
  },
  completed: {
    label: 'Hoàn thành',
    color: '#10b981',
    description: 'Yêu cầu trả hàng đã hoàn thành',
  },
  rejected: {
    label: 'Từ chối',
    color: '#ef4444',
    description: 'Yêu cầu trả hàng đã bị từ chối',
  },
}

