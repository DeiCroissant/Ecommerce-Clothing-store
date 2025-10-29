# Phase 3.3: Order Detail

## 📋 Overview
Build a comprehensive order detail page showing complete order information, product list, delivery tracking timeline, invoice download, and order actions.

## 🎯 Features

### Core Features
- [x] **Order Information**
  - Order ID, date, status with timeline
  - Recipient details (name, phone, address)
  - Payment method
  - Tracking number (if available)

- [x] **Products List**
  - Product images, names, variants
  - Quantity and individual prices
  - Subtotal calculation

- [x] **Price Breakdown**
  - Subtotal (sum of items)
  - Shipping fee
  - Discount/Voucher (if applied)
  - Final total

- [x] **Delivery Timeline**
  - Order placed
  - Payment confirmed
  - Processing
  - Shipped (with tracking)
  - Delivered (with timestamp)
  - Visual timeline with icons and status

- [x] **Order Actions**
  - Download Invoice (PDF simulation)
  - Cancel Order (if pending/processing)
  - Request Return (if delivered < 7 days)
  - Contact Support
  - Track Shipment (external link)

- [x] **Return Eligibility**
  - Check if order can be returned
  - Display return window (7 days)
  - Show return conditions

### Status-Based Features
- **Pending**: Show cancel button
- **Processing**: Show cancel button (with confirmation)
- **Shipped**: Show tracking timeline + track button
- **Delivered**: Show return button (if < 7 days)
- **Cancelled**: Show cancellation reason
- **Returned**: Show return reason and refund status

## 🏗️ Architecture

### Components Structure
```
src/
├── lib/
│   └── mockOrdersData.js          # Already created (reuse)
├── features/
│   └── orders/
│       └── components/
│           ├── OrderDetailHeader.js    # Order ID, status, date
│           ├── OrderTimeline.js        # Delivery tracking timeline
│           ├── OrderProducts.js        # Products list with images
│           ├── OrderPriceSummary.js    # Price breakdown
│           ├── OrderShipping.js        # Recipient & tracking info
│           ├── OrderActions.js         # Action buttons
│           └── CancelOrderModal.js     # Cancel confirmation
├── app/
│   └── account/
│       └── orders/
│           └── [orderId]/
│               └── page.js             # Dynamic order detail
└── styles/
    └── account-order-detail.css        # Order detail styling
```

### Data Model (Extended from Phase 3.2)
```javascript
{
  id: 'ORD-2024-001234',
  orderDate: '2024-10-15T10:30:00',
  status: 'delivered',
  timeline: [
    { 
      status: 'placed', 
      timestamp: '2024-10-15T10:30:00', 
      label: 'Đặt hàng',
      description: 'Đơn hàng đã được đặt thành công'
    },
    { 
      status: 'confirmed', 
      timestamp: '2024-10-15T11:00:00', 
      label: 'Xác nhận thanh toán',
      description: 'Thanh toán đã được xác nhận'
    },
    { 
      status: 'processing', 
      timestamp: '2024-10-16T09:00:00', 
      label: 'Đang xử lý',
      description: 'Đang chuẩn bị hàng'
    },
    { 
      status: 'shipped', 
      timestamp: '2024-10-17T14:00:00', 
      label: 'Đã giao vận',
      description: 'Đơn hàng đang trên đường giao',
      trackingNumber: 'VN123456789'
    },
    { 
      status: 'delivered', 
      timestamp: '2024-10-18T14:20:00', 
      label: 'Đã giao hàng',
      description: 'Đã giao hàng thành công'
    }
  ],
  // ... existing fields from Phase 3.2
}
```

## 🎨 UI Design

### Desktop Layout (>1024px)
```
┌───────────────────────────────────────────────────────────────┐
│ ← Quay lại                                                    │
├───────────────────────────────────────────────────────────────┤
│ Chi Tiết Đơn Hàng                                             │
│ ORD-2024-001234 • [Delivered] • 15/10/2024                   │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────────────────────┐  ┌──────────────────────────┐    │
│ │ Delivery Timeline       │  │ Order Actions            │    │
│ │                         │  │                          │    │
│ │ ● Placed (15/10 10:30) │  │ [Download Invoice]       │    │
│ │ ● Confirmed (15/10 11) │  │ [Track Shipment]         │    │
│ │ ● Processing (16/10)   │  │ [Request Return]         │    │
│ │ ● Shipped (17/10)      │  │ [Contact Support]        │    │
│ │ ● Delivered (18/10)    │  │                          │    │
│ └─────────────────────────┘  └──────────────────────────┘    │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ Sản Phẩm (3 items)                                      │  │
│ │ ─────────────────────────────────────────────────────── │  │
│ │ [IMG] Áo Sơ Mi Trắng Classic                            │  │
│ │       Size: L • Color: Trắng                            │  │
│ │       x2                                    ₫900,000    │  │
│ │ ─────────────────────────────────────────────────────── │  │
│ │ [IMG] Quần Âu Đen Slim Fit                              │  │
│ │       Size: 32 • Color: Đen                             │  │
│ │       x1                                    ₫650,000    │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌──────────────────┐  ┌──────────────────────────────────┐   │
│ │ Shipping Info    │  │ Price Summary                    │   │
│ │                  │  │                                  │   │
│ │ Recipient:       │  │ Subtotal:         ₫1,550,000    │   │
│ │ Nguyễn Văn A     │  │ Shipping:            ₫30,000    │   │
│ │                  │  │ Discount:                 ₫0    │   │
│ │ Phone:           │  │ ────────────────────────────     │   │
│ │ 0901234567       │  │ Total:            ₫1,580,000    │   │
│ │                  │  │                                  │   │
│ │ Address:         │  │ Payment: COD                     │   │
│ │ 123 Nguyễn Huệ   │  │ Tracking: VN123456789            │   │
│ └──────────────────┘  └──────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)
```
┌─────────────────────┐
│ ← Back              │
├─────────────────────┤
│ ORD-2024-001234     │
│ [Delivered]         │
│ 15/10/2024          │
├─────────────────────┤
│ Timeline            │
│ ● Placed            │
│ ● Confirmed         │
│ ● Processing        │
│ ● Shipped           │
│ ● Delivered ✓       │
├─────────────────────┤
│ Products (3)        │
│ ─────────────────── │
│ [IMG] Áo Sơ Mi...   │
│ Size: L • Trắng     │
│ x2      ₫900,000    │
├─────────────────────┤
│ Shipping Info       │
│ Nguyễn Văn A        │
│ 0901234567          │
│ 123 Nguyễn Huệ...   │
├─────────────────────┤
│ Price Summary       │
│ Subtotal: ₫1,550k   │
│ Shipping: ₫30k      │
│ Total: ₫1,580k      │
├─────────────────────┤
│ [Download Invoice]  │
│ [Track Shipment]    │
│ [Request Return]    │
│ [Contact Support]   │
└─────────────────────┘
```

## 📝 Implementation Steps

### Step 1: Update Mock Data (15 min)
- [x] Add timeline array to mockOrders
- [x] Create helper function to generate timeline based on status
- [x] Add return eligibility check function

### Step 2: Order Detail Header (30 min)
- [x] Create OrderDetailHeader.js
- [x] Display order ID, status pill, date
- [x] Add back button to orders list

### Step 3: Order Timeline (45 min)
- [x] Create OrderTimeline.js
- [x] Visual timeline with icons and lines
- [x] Show timestamps for each step
- [x] Highlight current status

### Step 4: Products List (30 min)
- [x] Create OrderProducts.js
- [x] Display product cards with images
- [x] Show variants, quantity, prices

### Step 5: Shipping & Price (30 min)
- [x] Create OrderShipping.js for recipient info
- [x] Create OrderPriceSummary.js for breakdown
- [x] Display tracking number

### Step 6: Order Actions (45 min)
- [x] Create OrderActions.js
- [x] Create CancelOrderModal.js
- [x] Implement conditional action buttons
- [x] Handle invoice download, cancel, return

### Step 7: Main Page (45 min)
- [x] Create [orderId]/page.js dynamic route
- [x] Fetch order by ID from mock data
- [x] Handle 404 if order not found
- [x] Integrate all components

### Step 8: CSS Styling (45 min)
- [x] Create account-order-detail.css
- [x] Style timeline with vertical line
- [x] Style product cards, summary
- [x] Implement responsive breakpoints

### Step 9: Testing (30 min)
- [ ] Test all order statuses
- [ ] Test timeline display
- [ ] Test cancel/return actions
- [ ] Test invoice download
- [ ] Test responsive layouts
- [ ] Test back navigation

**Total Time: ~5 hours**

## 🎨 Timeline Status Colors

```css
.timeline-placed { color: #71717a; }      /* Grey */
.timeline-confirmed { color: #3b82f6; }  /* Blue */
.timeline-processing { color: #f59e0b; } /* Yellow */
.timeline-shipped { color: #6366f1; }    /* Indigo */
.timeline-delivered { color: #10b981; }  /* Green */
.timeline-cancelled { color: #ef4444; }  /* Red */
.timeline-returned { color: #ec4899; }   /* Pink */
```

## 🔗 Integration Points
- Back to orders list: `/account/orders`
- Link to product page: `/products/[slug]`
- Track shipment: External tracking URL
- Contact support: `/support` or WhatsApp
- Download invoice: Generate PDF (mock)

## ✅ Acceptance Criteria
- [ ] Display full order information (ID, date, status, timeline)
- [ ] Show all products with images, variants, quantities, prices
- [ ] Display recipient info and tracking number
- [ ] Show price breakdown (subtotal, shipping, discount, total)
- [ ] Visual timeline with icons and timestamps
- [ ] Conditional action buttons based on status
- [ ] Cancel order with confirmation modal (pending/processing)
- [ ] Request return if delivered < 7 days
- [ ] Download invoice simulation
- [ ] Track shipment external link
- [ ] 404 page if order not found
- [ ] Responsive design for all devices

## 📱 Responsive Breakpoints
- **Desktop (>1024px)**: 2-column layout (content + sidebar)
- **Tablet (768-1023px)**: 1-column, stacked sections
- **Mobile (<768px)**: Full-width, compact cards

## ♿ Accessibility
- [ ] Semantic HTML (article, section, time)
- [ ] ARIA labels for timeline status
- [ ] Keyboard navigation for action buttons
- [ ] Focus-visible states
- [ ] Screen reader friendly timeline
