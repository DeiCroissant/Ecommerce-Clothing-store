# Phase 4.1: Returns Management

## 📋 Overview
Build a comprehensive returns/refunds management system where users can request returns for delivered orders, track return status, and view return history.

## 🎯 Features

### Core Features
- [x] **Return Request Form**
  - Select order and products to return
  - Return reason selection (dropdown)
  - Upload photos (optional, up to 5 images)
  - Additional notes/description
  - Form validation

- [x] **Return List/History**
  - Display all return requests
  - Status filters (All, Pending, Approved, Rejected, Refunded)
  - Return cards with key info
  - Pagination (10 per page)

- [x] **Return Detail Page**
  - Full return information
  - Return timeline/status tracking
  - Products being returned
  - Refund amount breakdown
  - Upload additional photos
  - Cancel return (if pending)

- [x] **Eligibility Check**
  - Only delivered orders < 7 days
  - Product condition requirements
  - Return policy display

### Return Statuses
- **Pending**: Return request submitted, awaiting review
- **Approved**: Return approved, awaiting product shipment
- **In Transit**: Customer shipped product back
- **Received**: Warehouse received returned product
- **Refunded**: Refund processed successfully
- **Rejected**: Return request rejected

### Return Reasons
- Size không phù hợp
- Sản phẩm bị lỗi/hỏng
- Khác với mô tả
- Không đúng sản phẩm đặt
- Thay đổi ý định
- Khác (ghi rõ lý do)

## 🏗️ Architecture

### Components Structure
```
src/
├── lib/
│   └── mockReturnsData.js          # Mock returns data
├── features/
│   └── returns/
│       └── components/
│           ├── ReturnCard.js           # Individual return display
│           ├── ReturnList.js           # List container
│           ├── ReturnFilters.js        # Status filters
│           ├── ReturnRequestForm.js    # New return form
│           ├── ReturnDetailTimeline.js # Return status timeline
│           ├── ReturnProducts.js       # Products being returned
│           ├── RefundSummary.js        # Refund amount breakdown
│           ├── PhotoUpload.js          # Image upload component
│           └── EmptyReturns.js         # Empty state
├── app/
│   └── account/
│       └── returns/
│           ├── page.js                 # Returns list
│           ├── new/
│           │   └── page.js             # Create new return
│           └── [returnId]/
│               └── page.js             # Return detail
└── styles/
    └── account-returns.css             # Returns styling
```

### Data Model
```javascript
{
  id: 'RTN-2024-001',
  orderId: 'ORD-2024-001234',
  orderDate: '2024-10-25T10:30:00',
  requestDate: '2024-10-27T14:20:00',
  status: 'pending', // pending | approved | in_transit | received | refunded | rejected
  reason: 'size_not_fit',
  reasonLabel: 'Size không phù hợp',
  description: 'Áo quá rộng, muốn đổi size nhỏ hơn',
  products: [
    {
      id: 'prod-1',
      name: 'Áo Sơ Mi Trắng Classic',
      image: '/images/products/shirt-white.jpg',
      variant: { size: 'L', color: 'Trắng' },
      quantity: 1,
      price: 450000,
      returnReason: 'Size không phù hợp'
    }
  ],
  photos: [
    '/uploads/returns/RTN-2024-001-1.jpg',
    '/uploads/returns/RTN-2024-001-2.jpg'
  ],
  refundAmount: 450000,
  refundMethod: 'original_payment', // original_payment | store_credit
  timeline: [
    {
      status: 'submitted',
      timestamp: '2024-10-27T14:20:00',
      label: 'Yêu cầu đã gửi',
      description: 'Yêu cầu trả hàng đã được tiếp nhận'
    },
    // ... more timeline steps
  ],
  rejectionReason: null, // if rejected
  trackingNumber: null, // return shipment tracking
  estimatedRefundDate: '2024-11-05'
}
```

## 🎨 UI Design

### Returns List (Desktop)
```
┌─────────────────────────────────────────────────────────────┐
│ Trả Hàng & Hoàn Tiền                      [+ Yêu cầu trả hàng]│
├─────────────────────────────────────────────────────────────┤
│ [All] [Pending] [Approved] [In Transit] [Received] [Refunded]│
│ [Rejected]                                                  │
├─────────────────────────────────────────────────────────────┤
│ Showing 1-10 of 15 returns                                  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ RTN-2024-001 • ORD-2024-001234    [Pending] 27/10/2024 │ │
│ │ ─────────────────────────────────────────────────────── │ │
│ │ [IMG] Áo Sơ Mi Trắng Classic                            │ │
│ │ Lý do: Size không phù hợp                               │ │
│ │ Hoàn tiền: ₫450,000                                     │ │
│ │                                                         │ │
│ │ [View Details] [Cancel Request]                         │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                [← Prev] 1 2 [Next →]                        │
└─────────────────────────────────────────────────────────────┘
```

### New Return Request Form
```
┌─────────────────────────────────────────────────────────────┐
│ Yêu cầu Trả Hàng                                            │
├─────────────────────────────────────────────────────────────┤
│ Chọn đơn hàng: [Dropdown với eligible orders]              │
│                                                             │
│ Sản phẩm cần trả:                                           │
│ ☑ [IMG] Áo Sơ Mi Trắng Classic • Size: L • x2              │
│ ☐ [IMG] Quần Âu Đen • Size: 32 • x1                        │
│                                                             │
│ Lý do trả hàng: [Dropdown reasons]                          │
│                                                             │
│ Mô tả chi tiết:                                             │
│ [Textarea.................................................]  │
│                                                             │
│ Upload ảnh (tối đa 5):                                      │
│ [+ Upload] [Preview] [Preview] [Preview]                   │
│                                                             │
│ Phương thức hoàn tiền:                                      │
│ ○ Hoàn về phương thức thanh toán gốc                        │
│ ○ Store credit (nhận thêm 5% bonus)                         │
│                                                             │
│ ─────────────────────────────────────────────────────────   │
│ Tổng hoàn tiền: ₫450,000                                    │
│                                                             │
│ [Cancel] [Submit Request]                                   │
└─────────────────────────────────────────────────────────────┘
```

### Return Detail Page
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back                                                      │
├─────────────────────────────────────────────────────────────┤
│ RTN-2024-001 • [Pending] • 27/10/2024                       │
│ Đơn hàng gốc: ORD-2024-001234                               │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐  ┌──────────────────────────────┐  │
│ │ Timeline            │  │ Actions                      │  │
│ │ ● Submitted         │  │ [Upload More Photos]         │  │
│ │ ○ Approved          │  │ [Cancel Request]             │  │
│ │ ○ In Transit        │  │ [Contact Support]            │  │
│ │ ○ Received          │  │                              │  │
│ │ ○ Refunded          │  │ Refund Summary               │  │
│ └─────────────────────┘  │ Amount: ₫450,000             │  │
│                          │ Method: Original payment      │  │
│ Products Being Returned  │ Est. Date: 05/11/2024        │  │
│ [IMG] Áo Sơ Mi Trắng... │                              │  │
│ Size: L • Qty: 1        └──────────────────────────────┘  │
│ Reason: Size không fit                                      │
│                                                             │
│ Photos: [Gallery with uploaded images]                     │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Implementation Steps

### Step 1: Mock Data (30 min)
- [x] Create mockReturnsData.js with 15+ mock returns
- [x] Include various statuses and reasons
- [x] Add helper functions (getReturnsByStatus, getEligibleOrders)

### Step 2: Return Components (2 hours)
- [x] Create ReturnCard.js - return display
- [x] Create ReturnList.js - list container
- [x] Create ReturnFilters.js - status filters
- [x] Create EmptyReturns.js - empty state

### Step 3: Return Request Form (2 hours)
- [x] Create ReturnRequestForm.js with validation
- [x] Create PhotoUpload.js component
- [x] Implement order selection dropdown
- [x] Product selection checkboxes
- [x] Reason dropdown + description textarea
- [x] Refund method radio buttons

### Step 4: Return Detail (1.5 hours)
- [x] Create ReturnDetailTimeline.js
- [x] Create ReturnProducts.js
- [x] Create RefundSummary.js
- [x] Implement detail page with actions

### Step 5: Pages (1 hour)
- [x] Create returns/page.js - list page
- [x] Create returns/new/page.js - new return form
- [x] Create returns/[returnId]/page.js - detail page

### Step 6: CSS Styling (1 hour)
- [x] Create account-returns.css
- [x] Style return cards, filters, forms
- [x] Implement responsive breakpoints

### Step 7: Testing (30 min)
- [ ] Test return request flow
- [ ] Test status filters
- [ ] Test photo upload
- [ ] Test validation
- [ ] Test responsive layouts

**Total Time: ~8.5 hours**

## 🎨 Status Colors

```css
.status-pending { background: #fef3c7; color: #92400e; }     /* Yellow */
.status-approved { background: #dbeafe; color: #1e40af; }    /* Blue */
.status-in_transit { background: #e0e7ff; color: #4338ca; }  /* Indigo */
.status-received { background: #ddd6fe; color: #5b21b6; }    /* Purple */
.status-refunded { background: #d1fae5; color: #065f46; }    /* Green */
.status-rejected { background: #fee2e2; color: #991b1b; }    /* Red */
```

## 🔗 Integration Points
- Link from order detail: "Request Return" button
- Link back to order: View original order
- Email notifications: Return status updates
- Support: Contact support for return issues

## ✅ Acceptance Criteria
- [ ] Create return request for eligible orders
- [ ] Upload up to 5 photos
- [ ] Select return reason from dropdown
- [ ] Choose refund method (original payment or store credit)
- [ ] View all return requests with filters
- [ ] Track return status via timeline
- [ ] Cancel pending returns
- [ ] Display refund amount breakdown
- [ ] Show eligibility notice (7-day window)
- [ ] Responsive design for all devices

## 📱 Responsive Breakpoints
- **Desktop (>1024px)**: 2-column layout for detail page
- **Tablet (768-1023px)**: 1-column, stacked sections
- **Mobile (<768px)**: Full-width, compact cards

## ♿ Accessibility
- [ ] Semantic HTML (form, fieldset, legend)
- [ ] ARIA labels for status filters
- [ ] File upload accessibility
- [ ] Keyboard navigation
- [ ] Focus-visible states
- [ ] Error messages for validation

## 📋 Return Policy
- Orders must be delivered within 7 days
- Products must be unused and in original packaging
- Tags must be attached
- Refund processed within 5-7 business days
- Store credit receives 5% bonus
