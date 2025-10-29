/**
 * Mock Returns Data
 * Vietnamese E-commerce format
 */

import { mockOrders, getOrderById } from './mockOrdersData';

// Return statuses
export const RETURN_STATUSES = {
  ALL: { value: 'all', label: 'Tất cả', color: '#71717a' },
  PENDING: { value: 'pending', label: 'Chờ duyệt', color: '#f59e0b' },
  APPROVED: { value: 'approved', label: 'Đã duyệt', color: '#3b82f6' },
  IN_TRANSIT: { value: 'in_transit', label: 'Đang vận chuyển', color: '#6366f1' },
  RECEIVED: { value: 'received', label: 'Đã nhận hàng', color: '#8b5cf6' },
  REFUNDED: { value: 'refunded', label: 'Đã hoàn tiền', color: '#10b981' },
  REJECTED: { value: 'rejected', label: 'Đã từ chối', color: '#ef4444' }
};

// Return reasons
export const RETURN_REASONS = [
  { value: 'size_not_fit', label: 'Size không phù hợp' },
  { value: 'defective', label: 'Sản phẩm bị lỗi/hỏng' },
  { value: 'not_as_described', label: 'Khác với mô tả' },
  { value: 'wrong_product', label: 'Không đúng sản phẩm đặt' },
  { value: 'changed_mind', label: 'Thay đổi ý định' },
  { value: 'other', label: 'Khác (ghi rõ lý do)' }
];

// Refund methods
export const REFUND_METHODS = {
  ORIGINAL: { value: 'original_payment', label: 'Hoàn về phương thức thanh toán gốc', bonus: 0 },
  STORE_CREDIT: { value: 'store_credit', label: 'Store credit (nhận thêm 5% bonus)', bonus: 0.05 }
};

// Mock returns data
export const mockReturns = [
  {
    id: 'RTN-2024-001',
    orderId: 'ORD-2024-001234',
    orderDate: '2024-10-25T10:30:00',
    requestDate: '2024-10-27T14:20:00',
    status: 'pending',
    reason: 'size_not_fit',
    reasonLabel: 'Size không phù hợp',
    description: 'Áo size L quá rộng, muốn đổi sang size M hoặc hoàn tiền',
    products: [
      {
        id: 'prod-1',
        name: 'Áo Sơ Mi Trắng Classic',
        slug: 'ao-so-mi-trang-classic',
        image: '/images/products/shirt-white.jpg',
        variant: { size: 'L', color: 'Trắng' },
        quantity: 1,
        price: 450000
      }
    ],
    photos: [
      '/uploads/returns/RTN-2024-001-1.jpg',
      '/uploads/returns/RTN-2024-001-2.jpg'
    ],
    refundAmount: 450000,
    refundMethod: 'original_payment',
    trackingNumber: null,
    estimatedRefundDate: '2024-11-05',
    rejectionReason: null
  },
  {
    id: 'RTN-2024-002',
    orderId: 'ORD-2024-001233',
    orderDate: '2024-10-22T15:45:00',
    requestDate: '2024-10-26T10:00:00',
    status: 'approved',
    reason: 'defective',
    reasonLabel: 'Sản phẩm bị lỗi/hỏng',
    description: 'Áo có vết bẩn và đường may bị lỗi ở vai',
    products: [
      {
        id: 'prod-3',
        name: 'Áo Thun Basic Xám',
        slug: 'ao-thun-basic-xam',
        image: '/images/products/tshirt-grey.jpg',
        variant: { size: 'M', color: 'Xám' },
        quantity: 2,
        price: 250000
      }
    ],
    photos: [
      '/uploads/returns/RTN-2024-002-1.jpg',
      '/uploads/returns/RTN-2024-002-2.jpg',
      '/uploads/returns/RTN-2024-002-3.jpg'
    ],
    refundAmount: 500000,
    refundMethod: 'store_credit',
    trackingNumber: null,
    estimatedRefundDate: '2024-11-03',
    rejectionReason: null,
    approvedAt: '2024-10-27T09:15:00'
  },
  {
    id: 'RTN-2024-003',
    orderId: 'ORD-2024-001228',
    orderDate: '2024-10-10T08:50:00',
    requestDate: '2024-10-16T11:00:00',
    status: 'refunded',
    reason: 'not_as_described',
    reasonLabel: 'Khác với mô tả',
    description: 'Màu sắc khác với hình ảnh trên website, không phải xanh/trắng',
    products: [
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
    photos: [
      '/uploads/returns/RTN-2024-003-1.jpg'
    ],
    refundAmount: 480000,
    refundMethod: 'original_payment',
    trackingNumber: 'RTN-VN789456',
    estimatedRefundDate: '2024-10-23',
    rejectionReason: null,
    approvedAt: '2024-10-17T10:00:00',
    shippedAt: '2024-10-18T14:30:00',
    receivedAt: '2024-10-20T09:45:00',
    refundedAt: '2024-10-22T16:20:00'
  },
  {
    id: 'RTN-2024-004',
    orderId: 'ORD-2024-001227',
    orderDate: '2024-10-08T13:25:00',
    requestDate: '2024-10-14T15:30:00',
    status: 'in_transit',
    reason: 'size_not_fit',
    reasonLabel: 'Size không phù hợp',
    description: 'Quần size 30 hơi chật, cần đổi sang 31',
    products: [
      {
        id: 'prod-10',
        name: 'Quần Short Kaki',
        slug: 'quan-short-kaki',
        image: '/images/products/shorts-khaki.jpg',
        variant: { size: '30', color: 'Be' },
        quantity: 1,
        price: 350000
      }
    ],
    photos: [],
    refundAmount: 350000,
    refundMethod: 'original_payment',
    trackingNumber: 'RTN-VN456123',
    estimatedRefundDate: '2024-10-28',
    rejectionReason: null,
    approvedAt: '2024-10-15T11:20:00',
    shippedAt: '2024-10-17T08:00:00'
  },
  {
    id: 'RTN-2024-005',
    orderId: 'ORD-2024-001226',
    orderDate: '2024-10-05T10:40:00',
    requestDate: '2024-10-11T09:15:00',
    status: 'rejected',
    reason: 'changed_mind',
    reasonLabel: 'Thay đổi ý định',
    description: 'Không thích nữa, muốn trả lại',
    products: [
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
    photos: [],
    refundAmount: 0,
    refundMethod: 'original_payment',
    trackingNumber: null,
    estimatedRefundDate: null,
    rejectionReason: 'Sản phẩm đã qua thời hạn trả hàng (7 ngày). Ngày giao: 05/10/2024',
    rejectedAt: '2024-10-12T10:00:00'
  },
  {
    id: 'RTN-2024-006',
    orderId: 'ORD-2024-001224',
    orderDate: '2024-09-28T12:30:00',
    requestDate: '2024-10-03T16:45:00',
    status: 'refunded',
    reason: 'wrong_product',
    reasonLabel: 'Không đúng sản phẩm đặt',
    description: 'Đặt quần màu đen nhưng nhận được màu xám',
    products: [
      {
        id: 'prod-14',
        name: 'Quần Jogger Nam',
        slug: 'quan-jogger-nam',
        image: '/images/products/jogger-black.jpg',
        variant: { size: 'M', color: 'Đen' },
        quantity: 1,
        price: 420000
      }
    ],
    photos: [
      '/uploads/returns/RTN-2024-006-1.jpg',
      '/uploads/returns/RTN-2024-006-2.jpg'
    ],
    refundAmount: 420000,
    refundMethod: 'original_payment',
    trackingNumber: 'RTN-VN147852',
    estimatedRefundDate: '2024-10-15',
    rejectionReason: null,
    approvedAt: '2024-10-04T09:00:00',
    shippedAt: '2024-10-05T14:20:00',
    receivedAt: '2024-10-07T10:30:00',
    refundedAt: '2024-10-08T15:10:00'
  },
  {
    id: 'RTN-2024-007',
    orderId: 'ORD-2024-001222',
    orderDate: '2024-09-20T14:45:00',
    requestDate: '2024-09-25T11:00:00',
    status: 'received',
    reason: 'defective',
    reasonLabel: 'Sản phẩm bị lỗi/hỏng',
    description: 'Khóa kéo bị hỏng, không kéo được',
    products: [
      {
        id: 'prod-16',
        name: 'Áo Khoác Nỉ Nam',
        slug: 'ao-khoac-ni-nam',
        image: '/images/products/jacket-fleece.jpg',
        variant: { size: 'XL', color: 'Xám' },
        quantity: 1,
        price: 680000
      }
    ],
    photos: [
      '/uploads/returns/RTN-2024-007-1.jpg',
      '/uploads/returns/RTN-2024-007-2.jpg',
      '/uploads/returns/RTN-2024-007-3.jpg'
    ],
    refundAmount: 680000,
    refundMethod: 'store_credit',
    trackingNumber: 'RTN-VN258963',
    estimatedRefundDate: '2024-10-02',
    rejectionReason: null,
    approvedAt: '2024-09-26T10:30:00',
    shippedAt: '2024-09-27T13:15:00',
    receivedAt: '2024-09-29T09:20:00'
  },
  {
    id: 'RTN-2024-008',
    orderId: 'ORD-2024-001220',
    orderDate: '2024-09-10T16:20:00',
    requestDate: '2024-09-15T14:10:00',
    status: 'refunded',
    reason: 'size_not_fit',
    reasonLabel: 'Size không phù hợp',
    description: 'Quần size 32 hơi lớn',
    products: [
      {
        id: 'prod-19',
        name: 'Quần Tây Nam Xám',
        slug: 'quan-tay-nam-xam',
        image: '/images/products/pants-grey.jpg',
        variant: { size: '32', color: 'Xám' },
        quantity: 1,
        price: 580000
      }
    ],
    photos: [],
    refundAmount: 580000,
    refundMethod: 'original_payment',
    trackingNumber: 'RTN-VN753159',
    estimatedRefundDate: '2024-09-25',
    rejectionReason: null,
    approvedAt: '2024-09-16T09:45:00',
    shippedAt: '2024-09-17T11:30:00',
    receivedAt: '2024-09-19T14:00:00',
    refundedAt: '2024-09-21T10:15:00'
  },
  {
    id: 'RTN-2024-009',
    orderId: 'ORD-2024-001219',
    orderDate: '2024-09-05T13:55:00',
    requestDate: '2024-09-11T10:20:00',
    status: 'refunded',
    reason: 'not_as_described',
    reasonLabel: 'Khác với mô tả',
    description: 'Chất liệu không như mô tả, không phải cotton 100%',
    products: [
      {
        id: 'prod-21',
        name: 'Áo Polo Xanh Dương',
        slug: 'ao-polo-xanh-duong',
        image: '/images/products/polo-blue.jpg',
        variant: { size: 'L', color: 'Xanh Dương' },
        quantity: 1,
        price: 360000
      }
    ],
    photos: [
      '/uploads/returns/RTN-2024-009-1.jpg'
    ],
    refundAmount: 360000,
    refundMethod: 'original_payment',
    trackingNumber: 'RTN-VN456987',
    estimatedRefundDate: '2024-09-22',
    rejectionReason: null,
    approvedAt: '2024-09-12T11:00:00',
    shippedAt: '2024-09-13T15:45:00',
    receivedAt: '2024-09-15T09:30:00',
    refundedAt: '2024-09-17T14:20:00'
  },
  {
    id: 'RTN-2024-010',
    orderId: 'ORD-2024-001218',
    orderDate: '2024-08-30T10:25:00',
    requestDate: '2024-09-04T16:30:00',
    status: 'refunded',
    reason: 'defective',
    reasonLabel: 'Sản phẩm bị lỗi/hỏng',
    description: 'Có lỗ thủng ở phần vai',
    products: [
      {
        id: 'prod-22',
        name: 'Áo Thun V-Neck Trắng',
        slug: 'ao-thun-vneck-trang',
        image: '/images/products/tshirt-vneck.jpg',
        variant: { size: 'M', color: 'Trắng' },
        quantity: 1,
        price: 230000
      }
    ],
    photos: [
      '/uploads/returns/RTN-2024-010-1.jpg',
      '/uploads/returns/RTN-2024-010-2.jpg'
    ],
    refundAmount: 230000,
    refundMethod: 'store_credit',
    trackingNumber: 'RTN-VN159357',
    estimatedRefundDate: '2024-09-15',
    rejectionReason: null,
    approvedAt: '2024-09-05T10:15:00',
    shippedAt: '2024-09-06T13:00:00',
    receivedAt: '2024-09-08T11:45:00',
    refundedAt: '2024-09-10T09:30:00'
  }
];

// Helper: Get returns by status
export function getReturnsByStatus(status) {
  if (status === 'all') return mockReturns;
  return mockReturns.filter(returnItem => returnItem.status === status);
}

// Helper: Get return by ID
export function getReturnById(returnId) {
  return mockReturns.find(returnItem => returnItem.id === returnId);
}

// Helper: Get eligible orders for return (delivered < 7 days)
export function getEligibleOrders() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return mockOrders.filter(order => {
    if (order.status !== 'delivered' || !order.deliveredAt) return false;
    
    const deliveredDate = new Date(order.deliveredAt);
    return deliveredDate >= sevenDaysAgo;
  });
}

// Helper: Generate return timeline
export function generateReturnTimeline(returnItem) {
  const timeline = [
    {
      status: 'submitted',
      timestamp: returnItem.requestDate,
      label: 'Yêu cầu đã gửi',
      description: 'Yêu cầu trả hàng đã được tiếp nhận và đang chờ xét duyệt',
      icon: 'FileText'
    }
  ];

  if (returnItem.status === 'rejected') {
    timeline.push({
      status: 'rejected',
      timestamp: returnItem.rejectedAt,
      label: 'Đã từ chối',
      description: returnItem.rejectionReason || 'Yêu cầu trả hàng bị từ chối',
      icon: 'XCircle'
    });
    return timeline;
  }

  if (['approved', 'in_transit', 'received', 'refunded'].includes(returnItem.status)) {
    timeline.push({
      status: 'approved',
      timestamp: returnItem.approvedAt,
      label: 'Đã duyệt',
      description: 'Yêu cầu đã được chấp nhận. Vui lòng gửi hàng về kho',
      icon: 'CheckCircle'
    });
  }

  if (['in_transit', 'received', 'refunded'].includes(returnItem.status)) {
    timeline.push({
      status: 'in_transit',
      timestamp: returnItem.shippedAt,
      label: 'Đang vận chuyển',
      description: returnItem.trackingNumber 
        ? `Hàng đang được vận chuyển về kho • Mã vận đơn: ${returnItem.trackingNumber}`
        : 'Hàng đang được vận chuyển về kho',
      icon: 'Truck'
    });
  }

  if (['received', 'refunded'].includes(returnItem.status)) {
    timeline.push({
      status: 'received',
      timestamp: returnItem.receivedAt,
      label: 'Đã nhận hàng',
      description: 'Kho đã nhận hàng và đang kiểm tra. Hoàn tiền sẽ được xử lý sớm',
      icon: 'Package'
    });
  }

  if (returnItem.status === 'refunded') {
    timeline.push({
      status: 'refunded',
      timestamp: returnItem.refundedAt,
      label: 'Đã hoàn tiền',
      description: `Hoàn tiền thành công ${returnItem.refundAmount.toLocaleString('vi-VN')}đ`,
      icon: 'CheckCircle2'
    });
  }

  return timeline;
}

// Helper: Check if return can be cancelled
export function canCancelReturn(returnItem) {
  return returnItem.status === 'pending';
}

// Helper: Format currency
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

// Helper: Get status info
export function getReturnStatusInfo(status) {
  return Object.values(RETURN_STATUSES).find(s => s.value === status) || RETURN_STATUSES.ALL;
}

// Constants
export const MAX_PHOTOS = 5;
export const RETURN_WINDOW_DAYS = 7;
export const RETURNS_PER_PAGE = 10;
