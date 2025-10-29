# User Profile / Account - Master Plan

## 🎯 Tổng quan dự án

Xây dựng hệ thống quản lý tài khoản người dùng hoàn chỉnh với 13 modules chức năng, tối ưu cho cả desktop và mobile, đáp ứng đầy đủ tiêu chuẩn A11y.

---

## 📋 Phân chia giai đoạn (Phases)

### **PHASE 1: Foundation & Layout** ⚡ (Ưu tiên cao)
**Mục tiêu:** Xây dựng nền tảng UI/UX và routing cơ bản

#### 1.1. Layout System
- **Desktop Layout**
  - 2-column layout (Sidebar 240-280px + Main content)
  - Sticky sidebar (top: 24px)
  - Navigation menu với icon + label
  
- **Mobile Layout**
  - Header "Tài khoản"
  - Bottom tabs/segmented control
  - Sheet modal cho forms
  
- **A11y Foundation**
  - Skip-to-content link
  - focus-visible styles
  - role="navigation"
  - Breadcrumbs nhẹ

#### 1.2. Routing Structure
```
/account
  /overview (dashboard)
  /profile
  /addresses
  /orders
    /[orderId]
  /returns
  /wishlist
  /payments
  /security
  /notifications
  /preferences
  /credits
  /fit-profile
  /privacy
```

#### 1.3. Shared Components
- `AccountLayout.js` - Main layout wrapper
- `AccountSidebar.js` - Desktop navigation
- `MobileAccountTabs.js` - Mobile navigation
- `AccountCard.js` - Reusable card container
- `EmptyState.js` - Empty state illustration
- `PageHeader.js` - Page title + actions
- `SkeletonLoader.js` - Loading states

**Deliverables:**
- ✅ Folder structure `/app/account/`
- ✅ Layout components
- ✅ Navigation menu
- ✅ Responsive breakpoints
- ✅ A11y foundation

---

### **PHASE 2: Core User Info** ⚡ (Ưu tiên cao)

#### 2.1. Overview (Dashboard)
**UI Components:**
- Avatar + name display
- Email verification status badge
- Profile completeness progress bar
- 4 Quick cards:
  - Recent orders
  - Vouchers
  - Wishlist count
  - Default address

**Acceptance Criteria:**
- ✅ Hiển thị đơn hàng gần nhất (status, total, CTA)
- ✅ Email chưa xác thực → banner "Gửi lại email"
- ✅ Quick links: tap targets ≥ 44px (mobile)
- ✅ Profile completeness: 0-100%

#### 2.2. Profile (Thông tin cá nhân)
**UI Components:**
- Avatar upload + crop modal
- Form fields:
  - First/Last name
  - Email (with verification badge)
  - Phone
  - Date of Birth
  - Gender (optional select)

**Acceptance Criteria:**
- ✅ Form validation (email/phone format)
- ✅ Optimistic update + toast
- ✅ Undo within 5s
- ✅ Email change → pending verification state
- ✅ Avatar crop (react-easy-crop)

**Components:**
- `OverviewDashboard.js`
- `QuickActionCard.js`
- `ProfileCompletenessBar.js`
- `ProfileForm.js`
- `AvatarUpload.js`
- `EmailVerificationBanner.js`

**Mock Data:**
```js
// src/lib/mockUserData.js
export const mockUser = {
  id: '1',
  firstName: 'Nguyễn',
  lastName: 'Văn A',
  email: 'user@example.com',
  emailVerified: false,
  phone: '0901234567',
  avatar: '/images/avatars/default.jpg',
  dob: '1990-01-01',
  gender: 'male',
  points: 1250,
  totalOrders: 8,
  profileCompleteness: 75
}
```

---

### **PHASE 3: Addresses & Orders** ⚡ (Ưu tiên cao)

#### 3.1. Addresses Management
**UI Components:**
- Address cards (Label: Home/Work/Office)
- Default badge
- Edit/Delete actions
- Add address form (modal/sheet)
- Auto-complete địa chỉ (mock provinces)

**Acceptance Criteria:**
- ✅ Chỉ 1 địa chỉ default
- ✅ Không xóa được địa chỉ default (require chọn default khác)
- ✅ Validator: postal code, phone format
- ✅ Empty state → CTA "Thêm địa chỉ"
- ✅ Province/District/Ward dropdowns

#### 3.2. Orders List
**UI Components:**
- Order table/stack (responsive)
- Columns: Order #, Date, Total, Status, Actions
- Filters: Date range, Status
- Search by order number
- Pagination/infinite scroll

**Acceptance Criteria:**
- ✅ Status pills: Processing/Shipped/Delivered/Cancelled
- ✅ Search by order ID
- ✅ Keep previous data on pagination
- ✅ Mobile: card layout

#### 3.3. Order Detail
**UI Components:**
- Progress timeline
- Shipping address
- Payment summary
- Item list (image, name, attributes)
- Total breakdown
- Download invoice (mock PDF)
- Return/Exchange button (conditional)

**Acceptance Criteria:**
- ✅ Tracking link (mock)
- ✅ Invoice download (mock PDF)
- ✅ Return policy display (7/30 days based on status)
- ✅ Order timeline animation

**Components:**
- `AddressList.js`
- `AddressCard.js`
- `AddressForm.js`
- `ProvinceSelector.js`
- `OrderList.js`
- `OrderCard.js`
- `OrderFilters.js`
- `OrderDetail.js`
- `OrderTimeline.js`
- `InvoiceButton.js`

---

### **PHASE 4: Returns & Wishlist** 🔄

#### 4.1. Returns/Exchanges
**UI Components:**
- Wizard stepper (3 steps)
  1. Select items
  2. Select reason + upload photos
  3. Refund method / Exchange size
  4. Summary + RMA code

**Acceptance Criteria:**
- ✅ Chỉ hiển thị đơn đủ điều kiện (trong 7-30 ngày)
- ✅ Reason required
- ✅ Photo upload (optional, mock)
- ✅ Generate RMA code (mock)
- ✅ Print label instructions

#### 4.2. Wishlist
**UI Components:**
- Product grid (smaller cards)
- "Add to cart" button
- "Remove from wishlist" button
- Empty state

**Acceptance Criteria:**
- ✅ Hide out-of-stock items (or badge "Hết hàng")
- ✅ Add to cart → toast + optional remove
- ✅ Sync with product pages

**Components:**
- `ReturnWizard.js`
- `ReturnItemSelector.js`
- `ReturnReasonForm.js`
- `ReturnSummary.js`
- `WishlistGrid.js`
- `WishlistCard.js`

---

### **PHASE 5: Payments & Security** 🔒

#### 5.1. Payment Methods
**UI Components:**
- Card list (masked **** 1234)
- E-wallet badges (MoMo, VNPay - mock)
- Add card button → sheet/modal
- Default payment badge
- Delete confirmation

**Acceptance Criteria:**
- ✅ Show last4 + brand + expiry only
- ✅ Set default payment
- ✅ Cannot delete default (require select another first)
- ✅ Security warning & PCI compliance text
- ✅ Mock card entry (không lưu thật)

#### 5.2. Security
**UI Components:**
- Change password form
- 2FA toggle (TOTP/Email OTP - mock)
- Active sessions list (devices + last seen)
- Logout all devices button

**Acceptance Criteria:**
- ✅ Password strength meter
- ✅ Rules: ≥8 chars, 1 number, 1 special char
- ✅ 2FA: mock QR + recovery codes
- ✅ Re-auth before sensitive operations
- ✅ Session management (mock device info)

**Components:**
- `PaymentMethodList.js`
- `PaymentCard.js`
- `AddPaymentSheet.js`
- `ChangePasswordForm.js`
- `TwoFactorSetup.js`
- `ActiveSessions.js`
- `PasswordStrengthMeter.js`

---

### **PHASE 6: Notifications & Preferences** 🔔

#### 6.1. Notifications Settings
**UI Components:**
- Toggle groups:
  - Order updates (Email/SMS/Push)
  - Promotions
  - Back-in-stock alerts
  - Review reminders

**Acceptance Criteria:**
- ✅ Opt-in defaults (privacy-compliant)
- ✅ Back-in-stock requires size/color selection
- ✅ Save preferences (mock)

#### 6.2. Preferences
**UI Components:**
- Language selector
- Currency selector
- Region/Country
- Measurement units (cm/inch)
- Theme toggle (light/dark/system)

**Acceptance Criteria:**
- ✅ Save to localStorage + server (mock)
- ✅ Reflect changes immediately
- ✅ Currency change → update prices site-wide
- ✅ i18n support (prepare structure)

**Components:**
- `NotificationSettings.js`
- `NotificationToggleGroup.js`
- `PreferencesForm.js`
- `LanguageSelector.js`
- `ThemeToggle.js`

---

### **PHASE 7: Credits & Fit Profile** 💳

#### 7.1. Credits / Gift Cards / Vouchers
**UI Components:**
- Store credit balance
- Gift card input
- Voucher list (available + expired tabs)
- Apply to cart button

**Acceptance Criteria:**
- ✅ Enter code → show rules/expiry
- ✅ Hide expired vouchers
- ✅ Quick apply → deep link to cart/checkout
- ✅ Credit transaction history (mock)

#### 7.2. Fit Profile (AI-ready)
**UI Components:**
- Height/Weight inputs
- Body measurements
- Fit preference slider (slim/regular/relaxed)
- Privacy opt-in toggle

**Acceptance Criteria:**
- ✅ Privacy guard (opt-in required)
- ✅ Delete/hide anytime
- ✅ Use for size recommendation on PDP (mock)
- ✅ Measurement unit conversion (cm ↔ inch)

**Components:**
- `CreditsBalance.js`
- `GiftCardInput.js`
- `VoucherList.js`
- `VoucherCard.js`
- `FitProfileForm.js`
- `MeasurementInputs.js`
- `FitPreferenceSlider.js`

---

### **PHASE 8: Privacy & Polish** 🎨

#### 8.1. Privacy & Data
**UI Components:**
- Download data button (mock JSON)
- Delete account button (2-step confirmation)
- Privacy policy link
- Data usage explanation

**Acceptance Criteria:**
- ✅ Modal confirmation + re-auth
- ✅ Warning: cannot recover
- ✅ Download personal data (mock JSON file)
- ✅ GDPR-compliant language

#### 8.2. UI Polish & Animations
**Enhancements:**
- Slide-in sheets (mobile edit)
- Success tick animations
- Counter animations (smooth increment)
- Skeleton loaders
- Empty states illustrations
- Error boundaries
- Toast notifications
- Undo functionality

**A11y Final Pass:**
- Form labels
- Focus rings
- aria-live regions
- Keyboard navigation
- Screen reader testing
- Reduced motion support

**Components:**
- `DeleteAccountModal.js`
- `DownloadDataButton.js`
- `AnimatedCounter.js`
- `SuccessTick.js`
- `UndoToast.js`
- `LoadingSkeletons.js`

---

## 🎨 Design Tokens

```js
// src/styles/accountTheme.js
export const accountTheme = {
  sidebar: {
    width: { desktop: '280px', tablet: '240px' },
    stickyTop: '24px',
  },
  spacing: {
    cardGap: '24px',
    sectionGap: '32px',
  },
  colors: {
    verified: '#10b981',
    pending: '#f59e0b',
    error: '#ef4444',
    success: '#10b981',
  },
  animation: {
    slideIn: 'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: '300ms',
  },
  a11y: {
    minTapTarget: '44px',
    focusRingColor: '#3b82f6',
    focusRingWidth: '2px',
  },
}
```

---

## 📦 Dependencies (Đề xuất)

```json
{
  "dependencies": {
    "react-hook-form": "^7.x", // Form management
    "zod": "^3.x", // Validation schema
    "date-fns": "^3.x", // Date formatting
    "react-easy-crop": "^5.x", // Avatar crop
    "framer-motion": "^11.x", // Animations
    "lucide-react": "^0.x" // Icons
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests
- Form validation logic
- Utility functions (formatters, validators)
- Mock data generators

### Integration Tests
- Form submissions
- Navigation flows
- State management

### E2E Tests (Priority scenarios)
1. Update profile → save → verify toast
2. Add address → set default → delete old default
3. View order → download invoice
4. Add payment method → set default
5. Change password → re-auth

### A11y Tests
- axe-core automated scan
- Keyboard navigation
- Screen reader (NVDA/JAWS spot check)

---

## 📊 Success Metrics

- Profile completeness rate > 70%
- Address add success rate > 90%
- Order tracking engagement > 60%
- Mobile form completion rate > 80%
- A11y audit score > 95/100

---

## 🚀 Timeline Estimate

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1 | 3-4 days | ⚡ Critical |
| Phase 2 | 3-4 days | ⚡ Critical |
| Phase 3 | 4-5 days | ⚡ Critical |
| Phase 4 | 3-4 days | 🔄 High |
| Phase 5 | 4-5 days | 🔒 High |
| Phase 6 | 2-3 days | 🔔 Medium |
| Phase 7 | 3-4 days | 💳 Medium |
| Phase 8 | 2-3 days | 🎨 Polish |

**Total: ~25-32 days** (1 developer, sequential)

---

## 📝 Notes

- Tất cả API calls đều mock trong giai đoạn này
- Focus vào UX flow và visual polish
- Prepare structure cho real API integration sau
- Tối ưu bundle size (lazy load các modules ít dùng)
- Responsive first, mobile optimized

---

## 🔗 Related Documents

- `CART_FEATURES_GUIDE.md`
- `PRODUCT_PAGE_PHASE2.md`
- `TESTING_CHECKLIST.md`

---

**Document version:** 1.0  
**Last updated:** October 29, 2025  
**Status:** 📋 Planning → Ready for Phase 1
