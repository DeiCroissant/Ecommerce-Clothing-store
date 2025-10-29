# Phase 3.2: Order History

## 📋 Overview
Build a comprehensive order history page where users can view all their past and current orders with filtering, search, and pagination capabilities.

## 🎯 Features

### Core Features
- [x] **Order List Display**
  - Order cards with key information (ID, date, status, total, items count)
  - Order thumbnail showing first product image
  - Status pill with color coding
  - Quick actions (View Details, Reorder, Track)

- [x] **Filtering System**
  - Status filters: All, Pending, Processing, Shipped, Delivered, Cancelled, Returned
  - Date range filter: Last 30 days, Last 3 months, Last 6 months, Last year, All time
  - Active filter chips with remove option

- [x] **Search Functionality**
  - Search by order ID
  - Search by product name
  - Real-time search with debounce

- [x] **Pagination**
  - Show 10 orders per page
  - Page numbers with prev/next navigation
  - Total count display

- [x] **Empty States**
  - No orders yet (for new users)
  - No results found (after filtering/search)

### Status Types
- **Pending**: Order placed, awaiting payment confirmation
- **Processing**: Payment confirmed, preparing items
- **Shipped**: Order dispatched, in transit
- **Delivered**: Successfully delivered to customer
- **Cancelled**: Order cancelled by user/admin
- **Returned**: Order returned by customer

## 🏗️ Architecture

### Components Structure
```
src/
├── lib/
│   └── mockOrdersData.js          # Mock orders data
├── features/
│   └── orders/
│       └── components/
│           ├── OrderCard.js       # Individual order display
│           ├── OrderList.js       # List container
│           ├── OrderFilters.js    # Status + date filters
│           ├── OrderSearch.js     # Search input
│           ├── OrderPagination.js # Pagination controls
│           └── EmptyOrders.js     # Empty states
├── app/
│   └── account/
│       └── orders/
│           └── page.js            # Main orders page
└── styles/
    └── account-orders.css         # Orders styling
```

### Data Model
```javascript
{
  id: 'ORD-2024-001234',
  orderDate: '2024-10-15T10:30:00',
  status: 'delivered', // pending | processing | shipped | delivered | cancelled | returned
  items: [
    {
      id: 'prod-1',
      name: 'Áo Sơ Mi Trắng Classic',
      slug: 'ao-so-mi-trang-classic',
      image: '/images/products/shirt-white.jpg',
      variant: {
        size: 'L',
        color: 'Trắng'
      },
      quantity: 2,
      price: 450000
    }
  ],
  itemsCount: 3,
  subtotal: 1200000,
  shipping: 30000,
  discount: 0,
  total: 1230000,
  shippingAddress: {
    recipientName: 'Nguyễn Văn A',
    phone: '0901234567',
    fullAddress: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
  },
  paymentMethod: 'cod', // cod | credit_card | momo | zalopay
  trackingNumber: 'VN123456789',
  estimatedDelivery: '2024-10-20',
  deliveredAt: '2024-10-18T14:20:00'
}
```

## 🎨 UI Design

### Desktop Layout (>1024px)
```
┌─────────────────────────────────────────────────────────────┐
│ Đơn Hàng Của Tôi                                    [Search]│
├─────────────────────────────────────────────────────────────┤
│ [All] [Pending] [Processing] [Shipped] [Delivered]          │
│ [Cancelled] [Returned]     Date: [Last 3 months ▼]          │
├─────────────────────────────────────────────────────────────┤
│ Showing 1-10 of 45 orders                                   │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🏷️ ORD-2024-001234              [Delivered] 15/10/2024 │ │
│ │ ─────────────────────────────────────────────────────── │ │
│ │ [IMG] Áo Sơ Mi Trắng + 2 sản phẩm khác                 │ │
│ │       3 items • ₫1,230,000                             │ │
│ │                                                         │ │
│ │ [View Details] [Reorder] [Track]                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🏷️ ORD-2024-001233              [Shipped] 12/10/2024   │ │
│ │ ...                                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                [← Prev] 1 2 3 4 5 [Next →]                  │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)
```
┌───────────────────────┐
│ Đơn Hàng              │
│ [Search............] │
├───────────────────────┤
│ [All] [Pending] ...   │
│ Date: [Last 3mo ▼]    │
├───────────────────────┤
│ ┌───────────────────┐ │
│ │ ORD-001234        │ │
│ │ [Delivered]       │ │
│ │ 15/10/2024        │ │
│ │ ───────────────── │ │
│ │ [IMG] Áo Sơ Mi... │ │
│ │ 3 items           │ │
│ │ ₫1,230,000        │ │
│ │                   │ │
│ │ [View Details]    │ │
│ │ [Reorder] [Track] │ │
│ └───────────────────┘ │
└───────────────────────┘
```

## 📝 Implementation Steps

### Step 1: Mock Data (30 min)
- [x] Create mockOrdersData.js with 20+ mock orders
- [x] Include various statuses, dates, and product combinations
- [x] Add helper functions (getOrdersByStatus, searchOrders, filterByDateRange)

### Step 2: Order Card Component (45 min)
- [x] Create OrderCard.js with order header, product preview, actions
- [x] Implement status pill with color coding
- [x] Add conditional action buttons based on status

### Step 3: Filter Components (60 min)
- [x] Create OrderFilters.js with status pills
- [x] Add date range dropdown
- [x] Create OrderSearch.js with debounced search
- [x] Implement active filter chips

### Step 4: List & Pagination (45 min)
- [x] Create OrderList.js grid container
- [x] Create OrderPagination.js with page numbers
- [x] Create EmptyOrders.js for empty states

### Step 5: Main Page (60 min)
- [x] Implement orders/page.js with state management
- [x] Integrate filtering, search, pagination logic
- [x] Add URL params for shareable filters
- [x] Handle loading states

### Step 6: CSS Styling (45 min)
- [x] Create account-orders.css
- [x] Style order cards, filters, pagination
- [x] Implement responsive breakpoints
- [x] Add status pill colors

### Step 7: Testing (30 min)
- [ ] Test all status filters
- [ ] Test date range filtering
- [ ] Test search functionality
- [ ] Test pagination
- [ ] Test empty states
- [ ] Test responsive layouts

**Total Time: ~5.5 hours**

## 🎨 Status Colors

```css
.status-pending { background: #fef3c7; color: #92400e; }     /* Yellow */
.status-processing { background: #dbeafe; color: #1e40af; }  /* Blue */
.status-shipped { background: #e0e7ff; color: #4338ca; }     /* Indigo */
.status-delivered { background: #d1fae5; color: #065f46; }   /* Green */
.status-cancelled { background: #fee2e2; color: #991b1b; }   /* Red */
.status-returned { background: #fce7f3; color: #831843; }    /* Pink */
```

## 🔗 Integration Points
- Link to order detail page: `/account/orders/[orderId]`
- Link to product page: `/products/[slug]`
- Link to checkout for reorder
- Link to tracking page (external or internal)

## ✅ Acceptance Criteria
- [ ] Display 10 orders per page with pagination
- [ ] Filter by 6 status types + All
- [ ] Filter by 5 date ranges
- [ ] Search by order ID or product name
- [ ] Show order thumbnail, key details, status
- [ ] Action buttons conditional on status (e.g., no Track for Pending)
- [ ] Empty states for no orders / no results
- [ ] Responsive design for mobile/tablet/desktop
- [ ] URL params persist filters (shareable links)
- [ ] Loading states during data fetch

## 📱 Responsive Breakpoints
- **Desktop (>1024px)**: 1 column, full-width cards, horizontal filters
- **Tablet (768-1023px)**: 1 column, compact cards
- **Mobile (<768px)**: 1 column, stacked layout, vertical filters

## ♿ Accessibility
- [ ] Keyboard navigation for filters/pagination
- [ ] ARIA labels for status pills
- [ ] Focus-visible states
- [ ] Screen reader announcements for filter changes
- [ ] Semantic HTML (button, nav, article)
