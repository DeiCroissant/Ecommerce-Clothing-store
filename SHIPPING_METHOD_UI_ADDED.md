# Thêm UI Phương Thức Vận Chuyển vào Checkout

## Vấn Đề
Trang checkout chỉ hiển thị:
- ✅ Địa chỉ giao hàng
- ✅ Phương thức thanh toán
- ✅ Ghi chú đơn hàng

Nhưng **THIẾU** phần chọn phương thức vận chuyển (Shipping Method), mặc dù:
- Backend đã có API `/api/settings/payments` trả về `shipping_methods`
- Frontend đã load `shippingOptions` từ API
- Đã tính `finalShippingFee` trong tổng tiền

➡️ User không thể chọn phương thức vận chuyển (standard, express, free shipping)

## Giải Pháp

### 1. Thêm UI Section "Phương thức vận chuyển"

**Vị trí:** Giữa "Địa chỉ giao hàng" và "Phương thức thanh toán"

**Tính năng:**
- ✅ Hiển thị danh sách shipping methods từ API
- ✅ Radio buttons để chọn 1 phương thức
- ✅ Hiển thị tên, mô tả, giá của mỗi phương thức
- ✅ Hiển thị "Miễn phí" nếu price = 0
- ✅ Hiển thị điều kiện đơn tối thiểu (min_order) nếu có
- ✅ Highlight phương thức đã chọn (border xanh + background xanh nhạt)
- ✅ Auto-select phương thức đầu tiên khi load

**UI Code:**
```jsx
{/* Shipping Method */}
<div className="bg-white rounded-lg shadow-sm p-6">
  <div className="flex items-center gap-2 mb-4">
    <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
    <h2 className="text-xl font-semibold text-gray-900">Phương thức vận chuyển</h2>
  </div>
  
  <div className="space-y-3">
    {shippingOptions.map(option => (
      <label key={option.id} className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
        selectedShipping?.id === option.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}>
        <input
          type="radio"
          name="shipping"
          value={option.id}
          checked={selectedShipping?.id === option.id}
          onChange={() => setSelectedShipping(option)}
          className="w-5 h-5"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-gray-900">{option.name}</p>
            <p className="font-semibold text-blue-600">
              {option.price === 0 ? 'Miễn phí' : `${option.price.toLocaleString('vi-VN')}₫`}
            </p>
          </div>
          <p className="text-sm text-gray-600">{option.description}</p>
          {option.min_order && (
            <p className="text-xs text-gray-500 mt-1">
              Đơn tối thiểu: {option.min_order.toLocaleString('vi-VN')}₫
            </p>
          )}
        </div>
      </label>
    ))}
  </div>
  
  {errors.shipping && (
    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
      <ExclamationCircleIcon className="w-4 h-4" />
      {errors.shipping}
    </p>
  )}
</div>
```

### 2. Thêm Validation

**Kiểm tra shipping method đã chọn:**
```javascript
if (!selectedShipping) {
  setErrors({ shipping: 'Vui lòng chọn phương thức vận chuyển' });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('showToast', { 
      detail: { message: 'Vui lòng chọn phương thức vận chuyển', type: 'warning', duration: 3000 } 
    }));
  }
  return;
}
```

**Disable submit button nếu chưa chọn:**
```javascript
<button
  type="submit"
  disabled={submitting || !selectedAddress || !selectedShipping || cartItems.length === 0}
  // ...
>
```

### 3. Hiển thị Error Message

Thêm error message bên dưới danh sách shipping methods:
```jsx
{errors.shipping && (
  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
    <ExclamationCircleIcon className="w-4 h-4" />
    {errors.shipping}
  </p>
)}
```

## Kết Quả

### Trước khi fix:
```
┌─────────────────────────────┐
│ 📍 Địa chỉ giao hàng        │
└─────────────────────────────┘
┌─────────────────────────────┐
│ 💳 Phương thức thanh toán   │  ← Thiếu shipping method
└─────────────────────────────┘
┌─────────────────────────────┐
│ 📝 Ghi chú đơn hàng         │
└─────────────────────────────┘
```

### Sau khi fix:
```
┌─────────────────────────────┐
│ 📍 Địa chỉ giao hàng        │
└─────────────────────────────┘
┌─────────────────────────────┐
│ 🚚 Phương thức vận chuyển   │  ← ✅ THÊM MỚI
│   ○ Giao hàng tiêu chuẩn    │
│     3-5 ngày - 30,000₫      │
│   ● Giao hàng nhanh         │
│     1-2 ngày - 50,000₫      │
│   ○ Miễn phí vận chuyển     │
│     5-7 ngày - Miễn phí     │
│     Đơn tối thiểu: 500,000₫ │
└─────────────────────────────┘
┌─────────────────────────────┐
│ 💳 Phương thức thanh toán   │
└─────────────────────────────┘
┌─────────────────────────────┐
│ 📝 Ghi chú đơn hàng         │
└─────────────────────────────┘
```

## Luồng Hoạt Động

### 1. Admin cấu hình shipping methods
```
Admin Panel → Settings → Thanh toán & Vận chuyển
├── Giao hàng tiêu chuẩn: BẬT (30,000₫, 3-5 ngày)
├── Giao hàng nhanh: BẬT (50,000₫, 1-2 ngày)
└── Miễn phí vận chuyển: TẮT (0₫, 5-7 ngày, đơn tối thiểu 500k)
```

### 2. User checkout
```
Checkout Page
├── Load shipping methods từ API
├── Filter chỉ lấy methods đã BẬT
├── Auto-select method đầu tiên
├── User chọn method khác (optional)
├── Tính shipping fee vào tổng tiền
└── Submit order với shipping method đã chọn
```

### 3. Tính toán giá
```
Tạm tính:        500,000₫
Phí vận chuyển:   50,000₫  ← Từ shipping method đã chọn
─────────────────────────
Tổng cộng:       550,000₫
```

## Testing

### Test Case 1: Hiển thị shipping methods
1. ✅ Admin bật 2 methods: Standard (30k) và Express (50k)
2. ✅ User vào checkout
3. ✅ Thấy section "Phương thức vận chuyển"
4. ✅ Thấy 2 options: Standard và Express
5. ✅ Standard được chọn mặc định (method đầu tiên)

### Test Case 2: Chọn shipping method
1. ✅ Click chọn "Giao hàng nhanh" (50k)
2. ✅ Radio button chuyển sang Express
3. ✅ Border và background chuyển sang xanh
4. ✅ Phí vận chuyển cập nhật: 30k → 50k
5. ✅ Tổng tiền cập nhật: +20k

### Test Case 3: Validation
1. ✅ Không chọn shipping method
2. ✅ Click "Đặt hàng"
3. ✅ Button bị disable
4. ✅ Hiển thị error: "Vui lòng chọn phương thức vận chuyển"
5. ✅ Toast notification xuất hiện

### Test Case 4: Free shipping với điều kiện
1. ✅ Admin bật "Miễn phí vận chuyển" (đơn tối thiểu 500k)
2. ✅ User có đơn 600k
3. ✅ Thấy option "Miễn phí vận chuyển"
4. ✅ Hiển thị: "Đơn tối thiểu: 500,000₫"
5. ✅ Chọn option này → Phí vận chuyển = 0₫

### Test Case 5: Admin tắt tất cả shipping methods
1. ✅ Admin tắt tất cả shipping methods
2. ✅ User vào checkout
3. ✅ Thấy message: "Không có phương thức vận chuyển khả dụng"
4. ✅ Button "Đặt hàng" bị disable

## Files Changed

- `vyronfashion/src/app/checkout/page.js`
  - Thêm UI section "Phương thức vận chuyển"
  - Thêm validation cho selectedShipping
  - Thêm error message display
  - Update submit button disabled condition

## Benefits

1. **User Experience**: User có thể chọn phương thức vận chuyển phù hợp với nhu cầu
2. **Flexibility**: Admin có thể bật/tắt và cấu hình shipping methods
3. **Transparency**: User thấy rõ phí vận chuyển trước khi đặt hàng
4. **Validation**: Đảm bảo user phải chọn shipping method trước khi checkout
5. **Dynamic Pricing**: Tổng tiền tự động cập nhật khi đổi shipping method

## Next Steps (Optional)

1. **Conditional Shipping**: Hiển thị shipping methods dựa trên địa chỉ giao hàng
2. **Estimated Delivery**: Hiển thị ngày giao hàng dự kiến
3. **Shipping Calculator**: Tính phí vận chuyển dựa trên trọng lượng/khoảng cách
4. **Express Shipping Cutoff**: Hiển thị deadline để được giao hàng trong ngày
5. **Free Shipping Progress**: Hiển thị còn thiếu bao nhiêu để được free shipping

