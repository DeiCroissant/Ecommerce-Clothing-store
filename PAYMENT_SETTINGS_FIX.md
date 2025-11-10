# Fix Lỗi Payment Settings - Bật/Tắt Phương Thức Thanh Toán

## Vấn Đề
Khi bật/tắt phương thức thanh toán trong trang admin/settings/payments, các thay đổi không được phản ánh ở trang checkout của user. Nguyên nhân là:
- Trang admin chỉ lưu settings ở local state, không lưu vào database
- Trang checkout sử dụng dữ liệu hardcode thay vì lấy từ API

## Giải Pháp Đã Thực Hiện

### 1. Backend Changes

#### 1.1. Database (backend/app/database.py)
- Thêm `settings_collection` để lưu trữ cài đặt thanh toán và vận chuyển

```python
settings_collection = database.settings
```

#### 1.2. Schemas (backend/app/schemas.py)
Tạo các schema mới cho payment settings:

```python
class PaymentMethodSetting(BaseModel):
    id: str  # cod, bank_transfer, momo, zalopay, vnpay
    name: str
    description: Optional[str]
    enabled: bool

class ShippingMethodSetting(BaseModel):
    id: str  # standard, express, free
    name: str
    description: Optional[str]
    price: float
    estimated_days: str
    min_order: Optional[float]
    enabled: bool

class PaymentSettingsUpdate(BaseModel):
    payment_methods: list[PaymentMethodSetting]
    shipping_methods: list[ShippingMethodSetting]

class PaymentSettingsResponse(BaseModel):
    success: bool
    payment_methods: list[PaymentMethodSetting]
    shipping_methods: list[ShippingMethodSetting]
```

#### 1.3. API Endpoints (backend/app/main.py)
Tạo 2 endpoints mới:

**GET /api/settings/payments**
- Lấy cài đặt phương thức thanh toán và vận chuyển
- Tự động tạo settings mặc định nếu chưa có trong database
- Trả về danh sách payment_methods và shipping_methods

**POST /api/settings/payments**
- Cập nhật cài đặt phương thức thanh toán và vận chuyển
- Sử dụng upsert để tạo mới hoặc cập nhật
- Lưu vào MongoDB collection `settings`

### 2. Frontend Changes

#### 2.1. Admin Settings Page (vyronfashion/src/app/admin/settings/payments/page.js)

**Thay đổi state structure:**
- Từ: Object-based `{ cod: {...}, bankTransfer: {...} }`
- Sang: Array-based `[{ id: 'cod', ... }, { id: 'bank_transfer', ... }]`

**Thêm API integration:**
- `useEffect` để load settings từ API khi component mount
- `handleSubmit` gọi POST API để lưu settings vào database
- Hiển thị loading state khi đang tải dữ liệu

**Cập nhật functions:**
```javascript
// Từ object-based
const togglePaymentMethod = (key) => {
  setPaymentMethods(prev => ({
    ...prev,
    [key]: { ...prev[key], enabled: !prev[key].enabled }
  }))
}

// Sang array-based
const togglePaymentMethod = (id) => {
  setPaymentMethods(prev => prev.map(method => 
    method.id === id ? { ...method, enabled: !method.enabled } : method
  ))
}
```

#### 2.2. Checkout Page (vyronfashion/src/app/checkout/page.js)

**Thêm UI cho Shipping Methods:**
- Thêm section mới "Phương thức vận chuyển" giữa "Địa chỉ giao hàng" và "Phương thức thanh toán"
- Hiển thị danh sách shipping methods với radio buttons
- Hiển thị giá, mô tả và điều kiện đơn tối thiểu (nếu có)
- Auto-select shipping method đầu tiên khi load

**Thay đổi data loading:**
- Từ: Hardcoded mock data
- Sang: Fetch từ API `http://localhost:8000/api/settings/payments`
- Thêm fallback data nếu API call thất bại

```javascript
useEffect(() => {
  async function loadOptions() {
    try {
      const response = await fetch('http://localhost:8000/api/settings/payments');
      const data = await response.json();

      if (data.success) {
        const enabledPayments = data.payment_methods.filter(p => p.enabled);
        const enabledShipping = data.shipping_methods.filter(s => s.enabled);
        
        setPaymentOptions(enabledPayments);
        setShippingOptions(enabledShipping);
        // ... set default selections
      }
    } catch (e) {
      // Fallback to default options
    }
  }
  loadOptions();
}, []);
```

## Cách Sử Dụng

### 1. Admin - Cấu hình phương thức thanh toán
1. Đăng nhập vào admin panel
2. Vào **Settings > Thanh toán & Vận chuyển**
3. Bật/tắt các phương thức thanh toán:
   - Thanh toán khi nhận hàng (COD)
   - Chuyển khoản ngân hàng
   - Ví điện tử MoMo
   - Ví điện tử ZaloPay
   - VNPay
4. Cấu hình phương thức vận chuyển:
   - Giao hàng tiêu chuẩn (3-5 ngày)
   - Giao hàng nhanh (1-2 ngày)
   - Miễn phí vận chuyển (đơn tối thiểu 500k)
5. Click **Lưu cài đặt**

### 2. User - Checkout
1. Thêm sản phẩm vào giỏ hàng
2. Vào trang checkout
3. Chỉ thấy các phương thức thanh toán đã được admin bật
4. Chỉ thấy các phương thức vận chuyển đã được admin bật

## Database Structure

Collection: `settings`

```json
{
  "_id": ObjectId("..."),
  "type": "payment_shipping",
  "payment_methods": [
    {
      "id": "cod",
      "name": "Thanh toán khi nhận hàng (COD)",
      "description": "Thanh toán bằng tiền mặt khi nhận hàng",
      "enabled": true
    },
    {
      "id": "bank_transfer",
      "name": "Chuyển khoản ngân hàng",
      "description": "Chuyển khoản qua tài khoản ngân hàng",
      "enabled": true
    },
    {
      "id": "momo",
      "name": "Ví điện tử MoMo",
      "description": "Thanh toán qua ứng dụng MoMo",
      "enabled": false
    }
  ],
  "shipping_methods": [
    {
      "id": "standard",
      "name": "Giao hàng tiêu chuẩn",
      "description": "3-5 ngày",
      "price": 30000,
      "estimated_days": "3-5",
      "enabled": true
    },
    {
      "id": "express",
      "name": "Giao hàng nhanh",
      "description": "1-2 ngày",
      "price": 50000,
      "estimated_days": "1-2",
      "enabled": true
    }
  ],
  "created_at": ISODate("2025-11-07T..."),
  "updated_at": ISODate("2025-11-07T...")
}
```

## Testing

### 1. Test Backend API
```bash
# Get payment settings
curl http://localhost:8000/api/settings/payments

# Update payment settings
curl -X POST http://localhost:8000/api/settings/payments \
  -H "Content-Type: application/json" \
  -d '{
    "payment_methods": [...],
    "shipping_methods": [...]
  }'
```

### 2. Test Frontend
1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Start frontend: `cd vyronfashion && npm run dev`
3. Test admin settings page: http://localhost:3000/admin/settings/payments
4. Test checkout page: http://localhost:3000/checkout

### 3. Test Flow
1. Tắt tất cả phương thức thanh toán trừ COD trong admin
2. Lưu settings
3. Vào trang checkout
4. Verify chỉ thấy COD trong danh sách phương thức thanh toán
5. Quay lại admin, bật thêm MoMo
6. Refresh trang checkout
7. Verify thấy cả COD và MoMo

## Files Changed

### Backend
- `backend/app/database.py` - Thêm settings_collection
- `backend/app/schemas.py` - Thêm PaymentMethodSetting, ShippingMethodSetting, PaymentSettingsUpdate, PaymentSettingsResponse
- `backend/app/main.py` - Thêm GET/POST /api/settings/payments endpoints

### Frontend
- `vyronfashion/src/app/admin/settings/payments/page.js` - Refactor để sử dụng API
- `vyronfashion/src/app/checkout/page.js` - Load payment options từ API

## Benefits

1. **Centralized Configuration**: Admin có thể quản lý phương thức thanh toán từ một nơi duy nhất
2. **Real-time Updates**: Thay đổi trong admin được phản ánh ngay lập tức ở trang checkout
3. **Persistent Storage**: Settings được lưu trong database, không bị mất khi reload page
4. **Flexible**: Dễ dàng thêm/xóa phương thức thanh toán mới
5. **User Experience**: User chỉ thấy các phương thức thanh toán đang hoạt động

## Next Steps (Optional Improvements)

1. **Caching**: Implement caching cho settings API để giảm database queries
2. **Validation**: Thêm validation để đảm bảo ít nhất 1 phương thức thanh toán được bật
3. **Audit Log**: Log lại các thay đổi settings để tracking
4. **Multi-currency**: Hỗ trợ nhiều loại tiền tệ cho shipping fees
5. **Conditional Shipping**: Shipping methods dựa trên địa chỉ giao hàng
6. **Payment Gateway Integration**: Tích hợp thật với MoMo, ZaloPay, VNPay APIs

