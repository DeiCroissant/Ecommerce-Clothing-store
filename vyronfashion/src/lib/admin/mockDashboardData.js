/**
 * Mock Dashboard Data
 * Sample data for admin dashboard widgets
 */

export const mockDashboardMetrics = {
  todayRevenue: {
    value: 12450000,
    change: +12.5,
    trend: 'up'
  },
  todayOrders: {
    value: 24,
    change: +8.3,
    trend: 'up'
  },
  newCustomers: {
    value: 8,
    change: -2.1,
    trend: 'down'
  },
  websiteVisits: {
    value: 1284,
    change: +15.2,
    trend: 'up'
  }
}

export const mockRevenueData = [
  { date: '01/11', revenue: 8500000 },
  { date: '02/11', revenue: 9200000 },
  { date: '03/11', revenue: 7800000 },
  { date: '04/11', revenue: 11400000 },
  { date: '05/11', revenue: 10100000 },
  { date: '06/11', revenue: 9800000 },
  { date: '07/11', revenue: 13200000 },
  { date: '08/11', revenue: 12100000 },
  { date: '09/11', revenue: 10900000 },
  { date: '10/11', revenue: 11800000 },
  { date: '11/11', revenue: 15600000 },
  { date: '12/11', revenue: 14200000 },
  { date: '13/11', revenue: 13100000 },
  { date: '14/11', revenue: 12900000 },
  { date: '15/11', revenue: 11500000 },
  { date: '16/11', revenue: 10800000 },
  { date: '17/11', revenue: 12300000 },
  { date: '18/11', revenue: 13900000 },
  { date: '19/11', revenue: 14800000 },
  { date: '20/11', revenue: 13400000 },
  { date: '21/11', revenue: 12700000 },
  { date: '22/11', revenue: 11900000 },
  { date: '23/11', revenue: 13600000 },
  { date: '24/11', revenue: 15100000 },
  { date: '25/11', revenue: 14500000 },
  { date: '26/11', revenue: 13800000 },
  { date: '27/11', revenue: 12900000 },
  { date: '28/11', revenue: 14200000 },
  { date: '29/11', revenue: 13500000 },
  { date: '30/11', revenue: 12800000 }
]

export const mockLatestOrders = [
  {
    id: '#ORD-20241104-001',
    customerName: 'Nguyễn Văn A',
    date: '2024-11-04 14:32',
    total: 1890000,
    paymentStatus: 'paid',
    shippingStatus: 'pending'
  },
  {
    id: '#ORD-20241104-002',
    customerName: 'Trần Thị B',
    date: '2024-11-04 13:15',
    total: 2450000,
    paymentStatus: 'paid',
    shippingStatus: 'processing'
  },
  {
    id: '#ORD-20241104-003',
    customerName: 'Lê Văn C',
    date: '2024-11-04 12:08',
    total: 980000,
    paymentStatus: 'pending',
    shippingStatus: 'pending'
  },
  {
    id: '#ORD-20241104-004',
    customerName: 'Phạm Thị D',
    date: '2024-11-04 11:42',
    total: 3200000,
    paymentStatus: 'paid',
    shippingStatus: 'completed'
  },
  {
    id: '#ORD-20241104-005',
    customerName: 'Hoàng Văn E',
    date: '2024-11-04 10:23',
    total: 1650000,
    paymentStatus: 'paid',
    shippingStatus: 'processing'
  }
]

export const mockTopProducts = [
  {
    id: 1,
    name: 'Áo Sơ Mi Trắng Oxford',
    sold: 156,
    revenue: 23400000
  },
  {
    id: 2,
    name: 'Quần Jean Slim Fit',
    sold: 134,
    revenue: 20100000
  },
  {
    id: 3,
    name: 'Áo Polo Classic Navy',
    sold: 98,
    revenue: 14700000
  },
  {
    id: 4,
    name: 'Áo Khoác Dạ Cashmere',
    sold: 45,
    revenue: 22500000
  },
  {
    id: 5,
    name: 'Váy Dạ Hội Maxi',
    sold: 67,
    revenue: 20100000
  }
]
