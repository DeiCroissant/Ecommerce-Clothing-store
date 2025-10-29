/**
 * Mock Orders Data
 * Vietnamese E-commerce format
 */

// Order statuses with Vietnamese labels
export const ORDER_STATUSES = {
  ALL: { value: 'all', label: 'Tất cả', color: '#71717a' },
  PENDING: { value: 'pending', label: 'Chờ xác nhận', color: '#f59e0b' },
  PROCESSING: { value: 'processing', label: 'Đang xử lý', color: '#3b82f6' },
  SHIPPED: { value: 'shipped', label: 'Đang giao', color: '#6366f1' },
  DELIVERED: { value: 'delivered', label: 'Đã giao', color: '#10b981' },
  CANCELLED: { value: 'cancelled', label: 'Đã hủy', color: '#ef4444' },
  RETURNED: { value: 'returned', label: 'Đã trả hàng', color: '#ec4899' }
};

// Date range filters
export const DATE_RANGES = [
  { value: 30, label: '30 ngày qua' },
  { value: 90, label: '3 tháng qua' },
  { value: 180, label: '6 tháng qua' },
  { value: 365, label: '1 năm qua' },
  { value: 'all', label: 'Tất cả' }
];

// Payment methods
export const PAYMENT_METHODS = {
  cod: 'Thanh toán khi nhận hàng',
  credit_card: 'Thẻ tín dụng/ghi nợ',
  momo: 'Ví MoMo',
  zalopay: 'ZaloPay'
};

// Mock orders (20 orders for testing pagination)
export const mockOrders = [
  {
    id: 'ORD-2024-001234',
    orderDate: '2024-10-25T10:30:00',
    status: 'delivered',
    items: [
      {
        id: 'prod-1',
        name: 'Áo Sơ Mi Trắng Classic',
        slug: 'ao-so-mi-trang-classic',
        image: '/images/products/shirt-white.jpg',
        variant: { size: 'L', color: 'Trắng' },
        quantity: 2,
        price: 450000
      },
      {
        id: 'prod-2',
        name: 'Quần Âu Đen Slim Fit',
        slug: 'quan-au-den-slim-fit',
        image: '/images/products/pants-black.jpg',
        variant: { size: '32', color: 'Đen' },
        quantity: 1,
        price: 650000
      }
    ],
    itemsCount: 3,
    subtotal: 1550000,
    shipping: 30000,
    discount: 0,
    total: 1580000,
    shippingAddress: {
      recipientName: 'Nguyễn Văn A',
      phone: '0901234567',
      fullAddress: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
    },
    paymentMethod: 'cod',
    trackingNumber: 'VN123456789',
    estimatedDelivery: '2024-10-28',
    deliveredAt: '2024-10-27T14:20:00'
  },
  {
    id: 'ORD-2024-001233',
    orderDate: '2024-10-22T15:45:00',
    status: 'shipped',
    items: [
      {
        id: 'prod-3',
        name: 'Áo Thun Basic Xám',
        slug: 'ao-thun-basic-xam',
        image: '/images/products/tshirt-grey.jpg',
        variant: { size: 'M', color: 'Xám' },
        quantity: 3,
        price: 250000
      }
    ],
    itemsCount: 3,
    subtotal: 750000,
    shipping: 25000,
    discount: 75000,
    total: 700000,
    shippingAddress: {
      recipientName: 'Trần Thị B',
      phone: '0912345678',
      fullAddress: '456 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh'
    },
    paymentMethod: 'momo',
    trackingNumber: 'VN987654321',
    estimatedDelivery: '2024-10-29'
  },
  {
    id: 'ORD-2024-001232',
    orderDate: '2024-10-20T09:15:00',
    status: 'processing',
    items: [
      {
        id: 'prod-4',
        name: 'Áo Khoác Jean Nam',
        slug: 'ao-khoac-jean-nam',
        image: '/images/products/jacket-denim.jpg',
        variant: { size: 'L', color: 'Xanh' },
        quantity: 1,
        price: 850000
      },
      {
        id: 'prod-5',
        name: 'Giày Sneaker Trắng',
        slug: 'giay-sneaker-trang',
        image: '/images/products/shoes-white.jpg',
        variant: { size: '42', color: 'Trắng' },
        quantity: 1,
        price: 1200000
      }
    ],
    itemsCount: 2,
    subtotal: 2050000,
    shipping: 0,
    discount: 205000,
    total: 1845000,
    shippingAddress: {
      recipientName: 'Lê Văn C',
      phone: '0923456789',
      fullAddress: '789 Võ Văn Tần, Phường 5, Quận 3, TP. Hồ Chí Minh'
    },
    paymentMethod: 'credit_card',
    estimatedDelivery: '2024-10-25'
  },
  {
    id: 'ORD-2024-001231',
    orderDate: '2024-10-18T11:20:00',
    status: 'pending',
    items: [
      {
        id: 'prod-6',
        name: 'Áo Polo Nam Classic',
        slug: 'ao-polo-nam-classic',
        image: '/images/products/polo-navy.jpg',
        variant: { size: 'M', color: 'Xanh Navy' },
        quantity: 2,
        price: 380000
      }
    ],
    itemsCount: 2,
    subtotal: 760000,
    shipping: 30000,
    discount: 0,
    total: 790000,
    shippingAddress: {
      recipientName: 'Phạm Thị D',
      phone: '0934567890',
      fullAddress: '321 Pasteur, Phường 6, Quận 3, TP. Hồ Chí Minh'
    },
    paymentMethod: 'cod',
    estimatedDelivery: '2024-10-23'
  },
  {
    id: 'ORD-2024-001230',
    orderDate: '2024-10-15T16:30:00',
    status: 'delivered',
    items: [
      {
        id: 'prod-7',
        name: 'Quần Jean Nam Xanh',
        slug: 'quan-jean-nam-xanh',
        image: '/images/products/jeans-blue.jpg',
        variant: { size: '31', color: 'Xanh' },
        quantity: 1,
        price: 550000
      }
    ],
    itemsCount: 1,
    subtotal: 550000,
    shipping: 25000,
    discount: 0,
    total: 575000,
    shippingAddress: {
      recipientName: 'Hoàng Văn E',
      phone: '0945678901',
      fullAddress: '654 Hai Bà Trưng, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh'
    },
    paymentMethod: 'zalopay',
    trackingNumber: 'VN456789123',
    estimatedDelivery: '2024-10-20',
    deliveredAt: '2024-10-19T10:45:00'
  },
  {
    id: 'ORD-2024-001229',
    orderDate: '2024-10-12T14:10:00',
    status: 'cancelled',
    items: [
      {
        id: 'prod-8',
        name: 'Áo Hoodie Đen Premium',
        slug: 'ao-hoodie-den-premium',
        image: '/images/products/hoodie-black.jpg',
        variant: { size: 'XL', color: 'Đen' },
        quantity: 1,
        price: 750000
      }
    ],
    itemsCount: 1,
    subtotal: 750000,
    shipping: 30000,
    discount: 0,
    total: 780000,
    shippingAddress: {
      recipientName: 'Vũ Thị F',
      phone: '0956789012',
      fullAddress: '987 Cách Mạng Tháng 8, Phường 7, Quận Tân Bình, TP. Hồ Chí Minh'
    },
    paymentMethod: 'cod',
    cancelledAt: '2024-10-13T09:30:00',
    cancelReason: 'Khách hàng yêu cầu hủy'
  },
  {
    id: 'ORD-2024-001228',
    orderDate: '2024-10-10T08:50:00',
    status: 'returned',
    items: [
      {
        id: 'prod-9',
        name: 'Áo Sơ Mi Kẻ Sọc',
        slug: 'ao-so-mi-ke-soc',
        image: '/images/products/shirt-striped.jpg',
        variant: { size: 'L', color: 'Xanh/Trắng' },
        quantity: 1,
        price: 480000
      }
    ],
    itemsCount: 1,
    subtotal: 480000,
    shipping: 25000,
    discount: 48000,
    total: 457000,
    shippingAddress: {
      recipientName: 'Đặng Văn G',
      phone: '0967890123',
      fullAddress: '147 Nguyễn Thị Minh Khai, Phường 6, Quận 3, TP. Hồ Chí Minh'
    },
    paymentMethod: 'momo',
    trackingNumber: 'VN789123456',
    deliveredAt: '2024-10-14T16:20:00',
    returnedAt: '2024-10-16T11:00:00',
    returnReason: 'Sản phẩm không đúng size'
  },
  {
    id: 'ORD-2024-001227',
    orderDate: '2024-10-08T13:25:00',
    status: 'delivered',
    items: [
      {
        id: 'prod-10',
        name: 'Quần Short Kaki',
        slug: 'quan-short-kaki',
        image: '/images/products/shorts-khaki.jpg',
        variant: { size: '30', color: 'Be' },
        quantity: 2,
        price: 350000
      },
      {
        id: 'prod-11',
        name: 'Áo Thun Polo Trắng',
        slug: 'ao-thun-polo-trang',
        image: '/images/products/polo-white.jpg',
        variant: { size: 'M', color: 'Trắng' },
        quantity: 1,
        price: 320000
      }
    ],
    itemsCount: 3,
    subtotal: 1020000,
    shipping: 30000,
    discount: 102000,
    total: 948000,
    shippingAddress: {
      recipientName: 'Bùi Thị H',
      phone: '0978901234',
      fullAddress: '258 Điện Biên Phủ, Phường 17, Quận Bình Thạnh, TP. Hồ Chí Minh'
    },
    paymentMethod: 'credit_card',
    trackingNumber: 'VN321654987',
    estimatedDelivery: '2024-10-13',
    deliveredAt: '2024-10-12T15:30:00'
  },
  {
    id: 'ORD-2024-001226',
    orderDate: '2024-10-05T10:40:00',
    status: 'shipped',
    items: [
      {
        id: 'prod-12',
        name: 'Áo Blazer Nam Xám',
        slug: 'ao-blazer-nam-xam',
        image: '/images/products/blazer-grey.jpg',
        variant: { size: 'L', color: 'Xám' },
        quantity: 1,
        price: 1200000
      }
    ],
    itemsCount: 1,
    subtotal: 1200000,
    shipping: 0,
    discount: 0,
    total: 1200000,
    shippingAddress: {
      recipientName: 'Ngô Văn I',
      phone: '0989012345',
      fullAddress: '369 Trần Hưng Đạo, Phường Cô Giang, Quận 1, TP. Hồ Chí Minh'
    },
    paymentMethod: 'zalopay',
    trackingNumber: 'VN654987321',
    estimatedDelivery: '2024-10-30'
  },
  {
    id: 'ORD-2024-001225',
    orderDate: '2024-10-03T17:15:00',
    status: 'processing',
    items: [
      {
        id: 'prod-13',
        name: 'Áo Thun Trơn Đen',
        slug: 'ao-thun-tron-den',
        image: '/images/products/tshirt-black.jpg',
        variant: { size: 'L', color: 'Đen' },
        quantity: 3,
        price: 200000
      }
    ],
    itemsCount: 3,
    subtotal: 600000,
    shipping: 25000,
    discount: 60000,
    total: 565000,
    shippingAddress: {
      recipientName: 'Lý Thị K',
      phone: '0990123456',
      fullAddress: '741 Võ Thị Sáu, Phường 7, Quận 3, TP. Hồ Chí Minh'
    },
    paymentMethod: 'cod',
    estimatedDelivery: '2024-10-08'
  },
  {
    id: 'ORD-2024-001224',
    orderDate: '2024-09-28T12:30:00',
    status: 'delivered',
    items: [
      {
        id: 'prod-14',
        name: 'Quần Jogger Nam',
        slug: 'quan-jogger-nam',
        image: '/images/products/jogger-black.jpg',
        variant: { size: 'M', color: 'Đen' },
        quantity: 2,
        price: 420000
      }
    ],
    itemsCount: 2,
    subtotal: 840000,
    shipping: 30000,
    discount: 0,
    total: 870000,
    shippingAddress: {
      recipientName: 'Phan Văn L',
      phone: '0901234560',
      fullAddress: '852 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh'
    },
    paymentMethod: 'momo',
    trackingNumber: 'VN147258369',
    estimatedDelivery: '2024-10-03',
    deliveredAt: '2024-10-02T11:15:00'
  },
  {
    id: 'ORD-2024-001223',
    orderDate: '2024-09-25T09:00:00',
    status: 'cancelled',
    items: [
      {
        id: 'prod-15',
        name: 'Áo Vest Nam Đen',
        slug: 'ao-vest-nam-den',
        image: '/images/products/vest-black.jpg',
        variant: { size: 'L', color: 'Đen' },
        quantity: 1,
        price: 1500000
      }
    ],
    itemsCount: 1,
    subtotal: 1500000,
    shipping: 0,
    discount: 0,
    total: 1500000,
    shippingAddress: {
      recipientName: 'Trương Thị M',
      phone: '0912345601',
      fullAddress: '963 Nguyễn Đình Chiểu, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh'
    },
    paymentMethod: 'credit_card',
    cancelledAt: '2024-09-26T10:00:00',
    cancelReason: 'Hết hàng'
  },
  {
    id: 'ORD-2024-001222',
    orderDate: '2024-09-20T14:45:00',
    status: 'delivered',
    items: [
      {
        id: 'prod-16',
        name: 'Áo Khoác Nỉ Nam',
        slug: 'ao-khoac-ni-nam',
        image: '/images/products/jacket-fleece.jpg',
        variant: { size: 'XL', color: 'Xám' },
        quantity: 1,
        price: 680000
      },
      {
        id: 'prod-17',
        name: 'Mũ Lưỡi Trai Đen',
        slug: 'mu-luoi-trai-den',
        image: '/images/products/cap-black.jpg',
        variant: { size: 'Free', color: 'Đen' },
        quantity: 1,
        price: 150000
      }
    ],
    itemsCount: 2,
    subtotal: 830000,
    shipping: 30000,
    discount: 83000,
    total: 777000,
    shippingAddress: {
      recipientName: 'Dương Văn N',
      phone: '0923456012',
      fullAddress: '159 Trần Quốc Toản, Phường 8, Quận 3, TP. Hồ Chí Minh'
    },
    paymentMethod: 'zalopay',
    trackingNumber: 'VN258369147',
    estimatedDelivery: '2024-09-25',
    deliveredAt: '2024-09-24T13:20:00'
  },
  {
    id: 'ORD-2024-001221',
    orderDate: '2024-09-15T11:10:00',
    status: 'returned',
    items: [
      {
        id: 'prod-18',
        name: 'Áo Sơ Mi Xanh Navy',
        slug: 'ao-so-mi-xanh-navy',
        image: '/images/products/shirt-navy.jpg',
        variant: { size: 'M', color: 'Xanh Navy' },
        quantity: 1,
        price: 490000
      }
    ],
    itemsCount: 1,
    subtotal: 490000,
    shipping: 25000,
    discount: 0,
    total: 515000,
    shippingAddress: {
      recipientName: 'Cao Thị O',
      phone: '0934567123',
      fullAddress: '357 Nam Kỳ Khởi Nghĩa, Phường 7, Quận 3, TP. Hồ Chí Minh'
    },
    paymentMethod: 'cod',
    trackingNumber: 'VN369147258',
    deliveredAt: '2024-09-19T15:50:00',
    returnedAt: '2024-09-21T09:30:00',
    returnReason: 'Sản phẩm bị lỗi'
  },
  {
    id: 'ORD-2024-001220',
    orderDate: '2024-09-10T16:20:00',
    status: 'delivered',
    items: [
      {
        id: 'prod-19',
        name: 'Quần Tây Nam Xám',
        slug: 'quan-tay-nam-xam',
        image: '/images/products/pants-grey.jpg',
        variant: { size: '32', color: 'Xám' },
        quantity: 1,
        price: 580000
      },
      {
        id: 'prod-20',
        name: 'Thắt Lưng Da Nam',
        slug: 'that-lung-da-nam',
        image: '/images/products/belt-leather.jpg',
        variant: { size: 'Free', color: 'Nâu' },
        quantity: 1,
        price: 280000
      }
    ],
    itemsCount: 2,
    subtotal: 860000,
    shipping: 30000,
    discount: 86000,
    total: 804000,
    shippingAddress: {
      recipientName: 'Hồ Văn P',
      phone: '0945678234',
      fullAddress: '753 Lê Văn Sỹ, Phường 1, Quận Tân Bình, TP. Hồ Chí Minh'
    },
    paymentMethod: 'momo',
    trackingNumber: 'VN753951456',
    estimatedDelivery: '2024-09-15',
    deliveredAt: '2024-09-14T10:30:00'
  },
  {
    id: 'ORD-2024-001219',
    orderDate: '2024-09-05T13:55:00',
    status: 'delivered',
    items: [
      {
        id: 'prod-21',
        name: 'Áo Polo Xanh Dương',
        slug: 'ao-polo-xanh-duong',
        image: '/images/products/polo-blue.jpg',
        variant: { size: 'L', color: 'Xanh Dương' },
        quantity: 2,
        price: 360000
      }
    ],
    itemsCount: 2,
    subtotal: 720000,
    shipping: 25000,
    discount: 72000,
    total: 673000,
    shippingAddress: {
      recipientName: 'Mai Thị Q',
      phone: '0956789345',
      fullAddress: '951 Hoàng Văn Thụ, Phường 2, Quận Tân Bình, TP. Hồ Chí Minh'
    },
    paymentMethod: 'credit_card',
    trackingNumber: 'VN456852741',
    estimatedDelivery: '2024-09-10',
    deliveredAt: '2024-09-09T14:15:00'
  },
  {
    id: 'ORD-2024-001218',
    orderDate: '2024-08-30T10:25:00',
    status: 'delivered',
    items: [
      {
        id: 'prod-22',
        name: 'Áo Thun V-Neck Trắng',
        slug: 'ao-thun-vneck-trang',
        image: '/images/products/tshirt-vneck.jpg',
        variant: { size: 'M', color: 'Trắng' },
        quantity: 3,
        price: 230000
      }
    ],
    itemsCount: 3,
    subtotal: 690000,
    shipping: 30000,
    discount: 0,
    total: 720000,
    shippingAddress: {
      recipientName: 'Võ Văn R',
      phone: '0967890456',
      fullAddress: '147 Bà Huyện Thanh Quan, Phường 6, Quận 3, TP. Hồ Chí Minh'
    },
    paymentMethod: 'zalopay',
    trackingNumber: 'VN159753486',
    estimatedDelivery: '2024-09-04',
    deliveredAt: '2024-09-03T11:40:00'
  },
  {
    id: 'ORD-2024-001217',
    orderDate: '2024-08-25T15:30:00',
    status: 'delivered',
    items: [
      {
        id: 'prod-23',
        name: 'Quần Jean Đen Rách',
        slug: 'quan-jean-den-rach',
        image: '/images/products/jeans-black-ripped.jpg',
        variant: { size: '30', color: 'Đen' },
        quantity: 1,
        price: 620000
      }
    ],
    itemsCount: 1,
    subtotal: 620000,
    shipping: 25000,
    discount: 62000,
    total: 583000,
    shippingAddress: {
      recipientName: 'Đinh Thị S',
      phone: '0978901567',
      fullAddress: '258 Nguyễn Chí Thanh, Phường 9, Quận 5, TP. Hồ Chí Minh'
    },
    paymentMethod: 'momo',
    trackingNumber: 'VN357159753',
    estimatedDelivery: '2024-08-30',
    deliveredAt: '2024-08-29T16:20:00'
  },
  {
    id: 'ORD-2024-001216',
    orderDate: '2024-08-20T09:45:00',
    status: 'delivered',
    items: [
      {
        id: 'prod-24',
        name: 'Áo Sơ Mi Họa Tiết',
        slug: 'ao-so-mi-hoa-tiet',
        image: '/images/products/shirt-pattern.jpg',
        variant: { size: 'L', color: 'Nhiều màu' },
        quantity: 1,
        price: 520000
      },
      {
        id: 'prod-25',
        name: 'Kính Mát Nam',
        slug: 'kinh-mat-nam',
        image: '/images/products/sunglasses.jpg',
        variant: { size: 'Free', color: 'Đen' },
        quantity: 1,
        price: 350000
      }
    ],
    itemsCount: 2,
    subtotal: 870000,
    shipping: 30000,
    discount: 87000,
    total: 813000,
    shippingAddress: {
      recipientName: 'Lâm Văn T',
      phone: '0989012678',
      fullAddress: '369 Trường Chinh, Phường 13, Quận Tân Bình, TP. Hồ Chí Minh'
    },
    paymentMethod: 'cod',
    trackingNumber: 'VN951357852',
    estimatedDelivery: '2024-08-25',
    deliveredAt: '2024-08-24T12:10:00'
  },
  {
    id: 'ORD-2024-001215',
    orderDate: '2024-08-15T12:00:00',
    status: 'delivered',
    items: [
      {
        id: 'prod-26',
        name: 'Áo Khoác Dù Nam',
        slug: 'ao-khoac-du-nam',
        image: '/images/products/windbreaker.jpg',
        variant: { size: 'XL', color: 'Đen' },
        quantity: 1,
        price: 780000
      }
    ],
    itemsCount: 1,
    subtotal: 780000,
    shipping: 0,
    discount: 0,
    total: 780000,
    shippingAddress: {
      recipientName: 'Tô Thị U',
      phone: '0990123789',
      fullAddress: '741 Phan Đăng Lưu, Phường 3, Quận Phú Nhuận, TP. Hồ Chí Minh'
    },
    paymentMethod: 'credit_card',
    trackingNumber: 'VN852456753',
    estimatedDelivery: '2024-08-20',
    deliveredAt: '2024-08-19T14:30:00'
  }
];

// Helper: Get orders by status
export function getOrdersByStatus(status) {
  if (status === 'all') return mockOrders;
  return mockOrders.filter(order => order.status === status);
}

// Helper: Search orders by ID or product name
export function searchOrders(query) {
  if (!query) return mockOrders;
  const lowerQuery = query.toLowerCase();
  return mockOrders.filter(order => 
    order.id.toLowerCase().includes(lowerQuery) ||
    order.items.some(item => item.name.toLowerCase().includes(lowerQuery))
  );
}

// Helper: Filter orders by date range (days)
export function filterByDateRange(days) {
  if (days === 'all') return mockOrders;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return mockOrders.filter(order => {
    const orderDate = new Date(order.orderDate);
    return orderDate >= cutoffDate;
  });
}

// Helper: Get paginated orders
export function paginateOrders(orders, page = 1, perPage = 10) {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  
  return {
    orders: orders.slice(startIndex, endIndex),
    totalPages: Math.ceil(orders.length / perPage),
    currentPage: page,
    totalOrders: orders.length,
    hasNext: endIndex < orders.length,
    hasPrev: page > 1
  };
}

// Helper: Format currency (VND)
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

// Helper: Format date
export function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

// Helper: Get status info
export function getStatusInfo(status) {
  return Object.values(ORDER_STATUSES).find(s => s.value === status) || ORDER_STATUSES.ALL;
}

// Helper: Generate timeline based on order status
export function generateTimeline(order) {
  const timeline = [
    {
      status: 'placed',
      timestamp: order.orderDate,
      label: 'Đặt hàng',
      description: 'Đơn hàng đã được đặt thành công',
      icon: 'ShoppingCart'
    }
  ];

  // Add timeline steps based on status
  if (['processing', 'shipped', 'delivered'].includes(order.status)) {
    const confirmedTime = new Date(order.orderDate);
    confirmedTime.setMinutes(confirmedTime.getMinutes() + 30);
    timeline.push({
      status: 'confirmed',
      timestamp: confirmedTime.toISOString(),
      label: 'Xác nhận thanh toán',
      description: 'Thanh toán đã được xác nhận',
      icon: 'CheckCircle'
    });
  }

  if (['processing', 'shipped', 'delivered'].includes(order.status)) {
    const processingTime = new Date(order.orderDate);
    processingTime.setHours(processingTime.getHours() + 6);
    timeline.push({
      status: 'processing',
      timestamp: processingTime.toISOString(),
      label: 'Đang xử lý',
      description: 'Đang chuẩn bị hàng',
      icon: 'Package'
    });
  }

  if (['shipped', 'delivered'].includes(order.status)) {
    const shippedTime = new Date(order.orderDate);
    shippedTime.setDate(shippedTime.getDate() + 1);
    timeline.push({
      status: 'shipped',
      timestamp: shippedTime.toISOString(),
      label: 'Đã giao vận',
      description: order.trackingNumber 
        ? `Đơn hàng đang trên đường giao • Mã vận đơn: ${order.trackingNumber}`
        : 'Đơn hàng đang trên đường giao',
      icon: 'Truck'
    });
  }

  if (order.status === 'delivered' && order.deliveredAt) {
    timeline.push({
      status: 'delivered',
      timestamp: order.deliveredAt,
      label: 'Đã giao hàng',
      description: 'Đã giao hàng thành công',
      icon: 'CheckCircle2'
    });
  }

  if (order.status === 'cancelled' && order.cancelledAt) {
    timeline.push({
      status: 'cancelled',
      timestamp: order.cancelledAt,
      label: 'Đã hủy',
      description: order.cancelReason || 'Đơn hàng đã bị hủy',
      icon: 'XCircle'
    });
  }

  if (order.status === 'returned' && order.returnedAt) {
    timeline.push({
      status: 'returned',
      timestamp: order.returnedAt,
      label: 'Đã trả hàng',
      description: order.returnReason || 'Đơn hàng đã được trả lại',
      icon: 'RotateCcw'
    });
  }

  return timeline;
}

// Helper: Check if order can be returned (within 7 days of delivery)
export function canReturnOrder(order) {
  if (order.status !== 'delivered' || !order.deliveredAt) return false;
  
  const deliveredDate = new Date(order.deliveredAt);
  const now = new Date();
  const daysSinceDelivery = Math.floor((now - deliveredDate) / (1000 * 60 * 60 * 24));
  
  return daysSinceDelivery <= 7;
}

// Helper: Check if order can be cancelled
export function canCancelOrder(order) {
  return ['pending', 'processing'].includes(order.status);
}

// Helper: Get order by ID
export function getOrderById(orderId) {
  return mockOrders.find(order => order.id === orderId);
}

// Helper: Format datetime with time
export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Constants
export const ORDERS_PER_PAGE = 10;
export const RETURN_WINDOW_DAYS = 7;
