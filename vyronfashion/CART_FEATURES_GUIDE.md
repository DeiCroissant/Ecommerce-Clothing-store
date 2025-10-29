# 🛒 Shopping Cart - Hướng Dẫn Sử Dụng

## 🎯 Tính Năng Chính

### 1. **Quản Lý Giỏ Hàng** 📦
- ✅ Thêm/xóa sản phẩm
- ✅ Tăng/giảm số lượng
- ✅ Hiển thị tồn kho real-time
- ✅ Cảnh báo sản phẩm sắp hết
- ✅ Tính toán tổng tiền tự động
- ✅ Undo delete trong 5 giây

### 2. **Mã Giảm Giá** 🎟️

#### Demo Codes:
| Mã Code | Loại Giảm | Điều Kiện | Giá Trị |
|---------|-----------|-----------|---------|
| `WELCOME10` | Phần trăm | ≥ 200,000₫ | Giảm 10% |
| `SUMMER2024` | Số tiền cố định | ≥ 500,000₫ | Giảm 50,000₫ |
| `FREESHIP` | Miễn phí ship | Không | Free ship |
| `VIP20` | Phần trăm | ≥ 1,000,000₫ | Giảm 20% |

#### Cách Sử Dụng:
1. Nhập mã vào ô "Mã giảm giá"
2. Click "Áp dụng" hoặc nhấn Enter
3. Xem discount hiển thị trong Order Summary
4. Click ❌ để xóa mã đã áp dụng

#### Lưu Ý:
- Mã tự động chuyển thành CHỮ HOA
- Kiểm tra đơn hàng tối thiểu
- Chỉ áp dụng được 1 mã 1 lúc
- Mã không hợp lệ sẽ hiện thông báo đỏ

### 3. **Gói Quà Tặng** 🎁

**Giá:** +15,000₫

#### Tính Năng:
- ✅ Bật/tắt bằng toggle switch
- ✅ Viết lời nhắn (tối đa 200 ký tự)
- ✅ Đếm ký tự real-time
- ✅ Giá tự động cộng vào tổng tiền

#### Cách Sử Dụng:
1. Bật toggle "Gói quà tặng"
2. (Tùy chọn) Nhập lời nhắn trong textarea
3. Xem giá +15,000₫ trong Order Summary
4. Tắt toggle để hủy

### 4. **Ước Tính Vận Chuyển** 📍

#### Bảng Giá Theo Tỉnh:
| Tỉnh/Thành phố | Phí Ship | Thời Gian |
|----------------|----------|-----------|
| Hà Nội | 30,000₫ | 1-2 ngày |
| TP. Hồ Chí Minh | 30,000₫ | 1-2 ngày |
| Đà Nẵng | 35,000₫ | 2-3 ngày |
| Hải Phòng | 32,000₫ | 2-3 ngày |
| Cần Thơ | 40,000₫ | 3-4 ngày |
| Bình Dương | 28,000₫ | 1-2 ngày |
| Tỉnh khác | 45,000₫ | 4-5 ngày |

#### Cách Sử Dụng:
1. Chọn tỉnh/thành phố trong dropdown
2. Xem phí ship và thời gian giao hàng
3. Phí ship tự động cập nhật trong Order Summary

#### Miễn Phí Ship:
- 🎉 Đơn hàng ≥ 500,000₫
- 🎉 Sử dụng mã `FREESHIP`
- 🎉 Progress bar hiển thị % để đạt free ship

### 5. **Lưu Lại Mua Sau** 💾

#### Tính Năng:
- ✅ Chuyển sản phẩm sang danh sách "Saved"
- ✅ Giữ lại thông tin (size, màu, giá)
- ✅ Không tính vào tổng tiền
- ✅ Thêm lại giỏ hàng bất cứ lúc nào
- ✅ Xóa vĩnh viễn nếu không muốn

#### Cách Sử Dụng:
**Desktop:**
1. Click "Lưu lại mua sau" dưới sản phẩm
2. Sản phẩm chuyển xuống phần "Đã lưu để mua sau"
3. Click "Thêm vào giỏ" để khôi phục
4. Click "Xóa" để xóa vĩnh viễn

**Mobile:**
1. Click "Lưu lại" cạnh nút Xóa
2. Xem trong section riêng
3. Actions tương tự desktop

---

## 💰 Cách Tính Tổng Tiền

### Công Thức:
```
Tạm tính (Subtotal)
- Giảm giá (Discount từ promo)
+ Phí vận chuyển (Shipping Fee)
+ Gói quà (Gift Wrap nếu có)
+ VAT 10%
= Tổng cộng (Total)
```

### Ví Dụ:

**Giỏ Hàng:**
- Áo thun: 349,000₫ x 2 = 698,000₫
- Quần jean: 639,000₫ x 1 = 639,000₫
- **Tạm tính:** 1,337,000₫

**Áp Dụng Mã WELCOME10:**
- Giảm 10% = -133,700₫
- **Sau giảm giá:** 1,203,300₫

**Chọn Hà Nội:**
- Phí ship: 0₫ (vì đơn ≥ 500K)

**Bật gói quà:**
- Gói quà: +15,000₫

**VAT:**
- 10% của 1,203,300₫ = +120,330₫

**Tổng Cộng:**
- **1,338,630₫**

**Tiết Kiệm:**
- 🎉 Bạn tiết kiệm được 133,700₫

---

## 🎨 Trải Nghiệm Người Dùng

### Visual Feedback:
- ✅ **Xanh lá**: Success states (mã đúng, free ship)
- ❌ **Đỏ**: Error states (mã sai, xóa item)
- 🔵 **Xanh dương**: Primary actions (thanh toán, áp dụng)
- 🟣 **Tím**: Shipping info
- 🌸 **Hồng**: Gift wrap

### Animations:
- Slide-in cho sections mới mở
- Fade cho undo notification
- Smooth transitions cho price updates
- Progress bar animation

### Responsive:
- **Desktop**: 2-column layout (65% cart + 35% summary)
- **Tablet**: Stacked layout
- **Mobile**: Full-width + sticky bottom bar

---

## 🔔 Thông Báo & Cảnh Báo

### Free Shipping Progress:
```
🚚 Mua thêm 163,000₫ để được MIỄN PHÍ VẬN CHUYỂN!
[████████░░░░░░░░] 67%
```

### Low Stock Warning:
```
⚠️ Chỉ còn 3 sản phẩm
```

### Delete Undo:
```
📦 Đã xóa "Áo Thun Basic Cotton"  [Hoàn tác]
```

### Applied Promo:
```
✅ Mã "WELCOME10" đã được áp dụng
   Giảm 10%
```

---

## 📱 Sticky Bottom Bar (Mobile)

Khi scroll trên mobile, bottom bar luôn hiển thị:
```
┌─────────────────────────────────┐
│ Tổng cộng          [Thanh toán] │
│ 1,338,630₫                      │
└─────────────────────────────────┘
```

Giúp dễ dàng checkout mọi lúc!

---

## 🎯 Tips & Tricks

### 1. Tối Ưu Giảm Giá:
- Thêm sản phẩm để đạt min order của mã VIP20
- Combine free shipping + percentage discount
- Check "Tiết kiệm" message để see total savings

### 2. Test Shipping:
- Chọn tỉnh khác nhau để compare giá ship
- Lưu ý: Free ship luôn override province pricing

### 3. Save for Later:
- Use cho items bạn chưa quyết định
- Giữ lại size/color đã chọn
- Không bị xóa khi logout (sẽ persist later)

### 4. Gift Message:
- Viết ngắn gọn, ý nghĩa
- 200 ký tự = ~3-4 câu
- Check spelling trước khi checkout

---

## 🚀 Quick Actions

### Keyboard Shortcuts (Planned):
- `Enter` trong promo input = Apply code
- `Esc` = Close promo error
- `+` / `-` = Adjust quantity

### Click Shortcuts:
- Click sample promo codes → Auto-fill
- Click undo trong 5s → Restore deleted item
- Click province → Update shipping instantly

---

## ❓ FAQs

**Q: Có thể dùng nhiều mã giảm giá cùng lúc không?**  
A: Không, chỉ được áp dụng 1 mã tại 1 thời điểm. Chọn mã có lợi nhất!

**Q: Free shipping áp dụng khi nào?**  
A: Khi đơn hàng ≥ 500,000₫ hoặc dùng mã FREESHIP.

**Q: Gói quà có bắt buộc viết lời nhắn không?**  
A: Không, lời nhắn là tùy chọn (optional).

**Q: Saved items có bị mất không?**  
A: Hiện tại chưa persist, sẽ implement localStorage sau.

**Q: Thay đổi tỉnh có ảnh hưởng đến total không?**  
A: Có, phí ship thay đổi theo tỉnh (trừ khi free ship).

**Q: VAT tính trên số tiền nào?**  
A: Tính 10% trên (Subtotal - Discount).

---

## 📞 Support

Gặp vấn đề? Contact:
- 📧 Email: support@vyronfashion.com
- 📱 Hotline: 1900-xxxx
- 💬 Live chat: Available 24/7

---

**Happy Shopping! 🛍️**
