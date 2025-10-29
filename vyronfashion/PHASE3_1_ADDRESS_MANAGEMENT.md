# PHASE 3.1: ADDRESS MANAGEMENT 📍

## 🎯 MỤC TIÊU

Xây dựng hệ thống quản lý địa chỉ giao hàng với đầy đủ tính năng CRUD (Create, Read, Update, Delete) và thiết lập địa chỉ mặc định.

---

## 📋 FEATURES

### Core Features
- ✅ Hiển thị danh sách địa chỉ đã lưu
- ✅ Thêm địa chỉ mới (modal form)
- ✅ Chỉnh sửa địa chỉ (modal form)
- ✅ Xóa địa chỉ (confirmation modal)
- ✅ Đặt làm địa chỉ mặc định
- ✅ Badge "Mặc định" cho default address
- ✅ Empty state khi chưa có địa chỉ

### Validation
- ✅ Họ tên người nhận (required, 2-100 chars)
- ✅ Số điện thoại (required, Vietnamese format)
- ✅ Địa chỉ chi tiết (required, min 10 chars)
- ✅ Tỉnh/Thành phố (required)
- ✅ Quận/Huyện (required)
- ✅ Phường/Xã (required)
- ✅ Label/Loại (Nhà riêng, Văn phòng, Khác)

### UX Features
- ✅ Quick actions: Edit, Delete, Set default
- ✅ Confirmation dialog trước khi xóa
- ✅ Toast notifications
- ✅ Loading states
- ✅ Form validation real-time
- ✅ Maximum 10 địa chỉ per user

---

## 🏗️ ARCHITECTURE

### Components Structure
```
src/components/account/addresses/
├── AddressCard.js          # Card hiển thị 1 địa chỉ
├── AddressList.js          # Grid layout các address cards
├── AddressFormModal.js     # Modal form add/edit
├── DeleteConfirmModal.js   # Modal xác nhận xóa
└── EmptyAddresses.js       # Empty state
```

### Page Structure
```
src/app/account/addresses/
└── page.js                 # Main addresses page
```

### Data Flow
```
page.js (State)
    ↓
AddressList (Display)
    ↓
AddressCard (Item) → Actions (Edit/Delete/Default)
    ↓
Modals (AddressFormModal, DeleteConfirmModal)
    ↓
Callbacks to page.js → Update state → API call
```

---

## 🎨 UI DESIGN

### Address Card Layout

**Desktop:**
```
┌────────────────────────────────────────────┐
│ 🏠 Nhà riêng              [Mặc định] [⋮]  │
│                                            │
│ Nguyễn Văn A                               │
│ 0901234567                                 │
│                                            │
│ 123 Đường ABC, Phường XYZ                  │
│ Quận 1, TP. Hồ Chí Minh                    │
│                                            │
│ [📝 Chỉnh sửa]  [🗑️ Xóa]  [⭐ Đặt mặc định] │
└────────────────────────────────────────────┘
```

**Mobile:**
```
┌──────────────────────────┐
│ 🏠 Nhà riêng    [Mặc định]│
│                          │
│ Nguyễn Văn A             │
│ 0901234567               │
│                          │
│ 123 Đường ABC, Phường XYZ│
│ Quận 1, TP.HCM           │
│                          │
│ [Chỉnh sửa] [Xóa] [⋮]    │
└──────────────────────────┘
```

### Address Form Modal

```
┌─────────────────────────────────────┐
│ ✖  Thêm địa chỉ mới                 │
├─────────────────────────────────────┤
│                                     │
│ Loại địa chỉ                        │
│ ○ Nhà riêng  ○ Văn phòng  ○ Khác   │
│                                     │
│ Họ và tên *                         │
│ [________________]                  │
│                                     │
│ Số điện thoại *                     │
│ [________________]                  │
│                                     │
│ Tỉnh/Thành phố *                    │
│ [▼ Chọn tỉnh/thành phố]            │
│                                     │
│ Quận/Huyện *                        │
│ [▼ Chọn quận/huyện]                │
│                                     │
│ Phường/Xã *                         │
│ [▼ Chọn phường/xã]                 │
│                                     │
│ Địa chỉ chi tiết *                  │
│ [_____________________________]     │
│ [_____________________________]     │
│                                     │
│ ☐ Đặt làm địa chỉ mặc định          │
│                                     │
│        [Hủy]  [Lưu địa chỉ]        │
└─────────────────────────────────────┘
```

---

## 📝 IMPLEMENTATION PLAN

### Step 1: Mock Data & Types
**File:** `src/lib/account/mockAddressData.js`

```javascript
export const mockAddresses = [
  {
    id: '1',
    label: 'home', // home, office, other
    recipientName: 'Nguyễn Văn A',
    phone: '0901234567',
    province: 'Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    address: '123 Đường Nguyễn Huệ',
    isDefault: true,
    createdAt: '2024-01-15'
  },
  // ... more addresses
]

export const vietnamProvinces = [
  { code: 'HCM', name: 'Hồ Chí Minh' },
  { code: 'HN', name: 'Hà Nội' },
  // ... all provinces
]

export const addressLabels = {
  home: { icon: '🏠', text: 'Nhà riêng' },
  office: { icon: '🏢', text: 'Văn phòng' },
  other: { icon: '📍', text: 'Khác' }
}
```

---

### Step 2: AddressCard Component
**File:** `src/components/account/addresses/AddressCard.js`

**Features:**
- Hiển thị thông tin địa chỉ
- Badge "Mặc định"
- Quick actions: Edit, Delete, Set default
- Responsive layout

**Props:**
```javascript
{
  address: {
    id, label, recipientName, phone,
    province, district, ward, address,
    isDefault
  },
  onEdit: (id) => {},
  onDelete: (id) => {},
  onSetDefault: (id) => {}
}
```

---

### Step 3: AddressList Component
**File:** `src/components/account/addresses/AddressList.js`

**Layout:**
- Grid: 2 columns desktop, 1 column mobile
- Gap: 20px
- Max width: 1200px

---

### Step 4: AddressFormModal Component
**File:** `src/components/account/addresses/AddressFormModal.js`

**Features:**
- Reusable cho Add & Edit
- Form validation với Zod
- Cascading selects (Province → District → Ward)
- Checkbox "Đặt làm mặc định"
- Loading state khi submit

**Validation Schema:**
```javascript
const addressSchema = z.object({
  label: z.enum(['home', 'office', 'other']),
  recipientName: z.string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên không được quá 100 ký tự'),
  phone: z.string()
    .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ'),
  province: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  district: z.string().min(1, 'Vui lòng chọn quận/huyện'),
  ward: z.string().min(1, 'Vui lòng chọn phường/xã'),
  address: z.string()
    .min(10, 'Địa chỉ phải có ít nhất 10 ký tự')
    .max(200, 'Địa chỉ không được quá 200 ký tự'),
  isDefault: z.boolean().optional()
})
```

---

### Step 5: DeleteConfirmModal Component
**File:** `src/components/account/addresses/DeleteConfirmModal.js`

**UI:**
```
┌──────────────────────────────┐
│ ⚠️  Xác nhận xóa địa chỉ     │
├──────────────────────────────┤
│                              │
│ Bạn có chắc muốn xóa địa chỉ:│
│                              │
│ 🏠 Nhà riêng                 │
│ Nguyễn Văn A                 │
│ 123 Đường ABC...             │
│                              │
│ Hành động này không thể hoàn │
│ tác.                         │
│                              │
│     [Hủy]  [Xóa địa chỉ]    │
└──────────────────────────────┘
```

---

### Step 6: EmptyAddresses Component
**File:** `src/components/account/addresses/EmptyAddresses.js`

**UI:**
```
┌────────────────────────────┐
│                            │
│        📍                  │
│                            │
│  Chưa có địa chỉ nào       │
│                            │
│  Thêm địa chỉ giao hàng để │
│  thanh toán nhanh hơn      │
│                            │
│  [➕ Thêm địa chỉ mới]      │
│                            │
└────────────────────────────┘
```

---

### Step 7: Main Addresses Page
**File:** `src/app/account/addresses/page.js`

**State Management:**
```javascript
const [addresses, setAddresses] = useState(mockAddresses)
const [showAddModal, setShowAddModal] = useState(false)
const [showEditModal, setShowEditModal] = useState(false)
const [showDeleteModal, setShowDeleteModal] = useState(false)
const [selectedAddress, setSelectedAddress] = useState(null)
const [isLoading, setIsLoading] = useState(false)
```

**Functions:**
```javascript
handleAddAddress(data)
handleEditAddress(id, data)
handleDeleteAddress(id)
handleSetDefault(id)
```

---

### Step 8: CSS Styling
**File:** `src/styles/account-addresses.css`

**Key Classes:**
```css
.addresses-grid
.address-card
.address-card-header
.address-card-body
.address-card-actions
.default-badge
.address-form-modal
.delete-confirm-modal
.empty-addresses
```

---

## 🎨 THEME & COLORS

**Consistent với zinc theme:**
```css
--address-card-bg: white
--address-card-border: var(--border)
--address-card-hover: var(--background)
--default-badge-bg: #d1fae5
--default-badge-color: #065f46
--danger-color: #ef4444
--danger-hover: #dc2626
```

---

## 🔄 USER FLOWS

### Flow 1: Thêm địa chỉ mới
```
1. Click "Thêm địa chỉ mới"
2. Modal mở
3. Chọn loại địa chỉ (Radio buttons)
4. Điền form:
   - Họ tên *
   - Số điện thoại *
   - Chọn Tỉnh → District list updates
   - Chọn Quận → Ward list updates
   - Chọn Phường
   - Địa chỉ chi tiết *
   - ☐ Đặt làm mặc định
5. Click "Lưu địa chỉ"
6. Validation check
7. If valid:
   - API call
   - Toast success
   - Modal close
   - List refresh
8. If invalid:
   - Show errors
```

### Flow 2: Chỉnh sửa địa chỉ
```
1. Click "Chỉnh sửa" trên card
2. Modal mở với data pre-filled
3. Edit form
4. Click "Cập nhật"
5. Validation & API call
6. Toast success
7. Card updates
```

### Flow 3: Xóa địa chỉ
```
1. Click "Xóa" trên card
2. Confirmation modal mở
3. Show address details
4. Click "Xóa địa chỉ"
5. API call
6. Toast success
7. Card removed from list
8. If was default:
   - Set first address as new default
```

### Flow 4: Đặt làm mặc định
```
1. Click "Đặt làm mặc định"
2. API call
3. Previous default → normal
4. Selected → default (badge appears)
5. Toast success
6. Cards update
```

---

## 🧪 TESTING CHECKLIST

### UI Tests
- [ ] Empty state hiển thị đúng khi chưa có địa chỉ
- [ ] Address cards hiển thị đầy đủ thông tin
- [ ] Default badge chỉ hiện trên 1 địa chỉ
- [ ] Grid layout responsive (2 cols → 1 col)
- [ ] Icons hiển thị đúng theo label

### Form Tests
- [ ] Validation: Họ tên min 2 chars
- [ ] Validation: Phone Vietnamese format
- [ ] Validation: Province/District/Ward required
- [ ] Validation: Address min 10 chars
- [ ] Cascading selects work correctly
- [ ] Default checkbox toggleable
- [ ] Form reset sau khi submit

### Actions Tests
- [ ] Add address → Card appears
- [ ] Edit address → Card updates
- [ ] Delete address → Card removed
- [ ] Set default → Badge moves
- [ ] Cannot delete last address
- [ ] Cannot have > 10 addresses

### Modal Tests
- [ ] Add modal opens/closes
- [ ] Edit modal pre-fills data
- [ ] Delete modal shows correct address
- [ ] Escape key closes modals
- [ ] Click overlay closes modals
- [ ] Submit loading state

### Integration Tests
- [ ] Toast notifications hiển thị
- [ ] API calls simulate correctly
- [ ] Optimistic updates work
- [ ] Error handling graceful

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Desktop: ≥ 1024px */
.addresses-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

/* Tablet: 768px - 1023px */
@media (max-width: 1023px) {
  .addresses-grid {
    grid-template-columns: 1fr;
  }
}

/* Mobile: < 768px */
@media (max-width: 767px) {
  .address-card {
    padding: 16px;
  }
  
  .address-card-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  button {
    width: 100%;
  }
}
```

---

## 🎯 ACCEPTANCE CRITERIA

### Must Have
- ✅ CRUD operations hoạt động
- ✅ Form validation đầy đủ
- ✅ Default address system
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Loading states
- ✅ Empty state

### Nice to Have
- 🔲 Google Maps integration (future)
- 🔲 Auto-complete address (future)
- 🔲 Saved locations (future)
- 🔲 GPS location (future)

---

## 📦 DELIVERABLES

1. **Components** (6 files)
   - AddressCard.js
   - AddressList.js
   - AddressFormModal.js
   - DeleteConfirmModal.js
   - EmptyAddresses.js
   - LocationSelector.js (cascading selects)

2. **Page** (1 file)
   - addresses/page.js

3. **Styles** (1 file)
   - account-addresses.css

4. **Mock Data** (1 file)
   - mockAddressData.js

5. **Total:** 9 files

---

## ⏱️ ESTIMATED TIME

- Mock data: 30 mins
- AddressCard: 1 hour
- AddressList: 30 mins
- AddressFormModal: 2 hours
- DeleteConfirmModal: 30 mins
- EmptyAddresses: 20 mins
- Main page: 1 hour
- CSS styling: 1.5 hours
- Testing & fixes: 1 hour

**Total:** ~8 hours

---

## 🚀 NEXT STEPS

Sau khi hoàn thành Phase 3.1, tiếp tục với:
- **Phase 3.2:** Order History
- **Phase 3.3:** Order Detail Page

---

**Ready to start?** Hãy bắt đầu với Mock Data! 🎉
