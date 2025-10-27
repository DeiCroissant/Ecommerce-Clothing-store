# 🧪 Product Detail Page - Testing & Review Checklist

## 📍 Access Points

### Homepage
1. Mở: `http://localhost:3000`
2. Click nút **"👉 Xem trang chi tiết sản phẩm →"** (banner purple ở trên cùng)

### Direct URL
- `http://localhost:3000/products/ao-thun-basic-cotton-nam`
- Hoặc bất kỳ slug nào (hiện dùng mock data)

---

## ✅ Desktop Testing Checklist (≥ 1024px)

### 🖼️ Layout & Structure
- [ ] Layout 2 cột (58% gallery / 42% info)
- [ ] Gallery thumbnail dọc bên trái
- [ ] Spacing đều và hợp lý
- [ ] Right column sticky khi scroll xuống
- [ ] Content không bị tràn ra ngoài

### 📸 Product Gallery
- [ ] Main image hiển thị rõ nét
- [ ] Thumbnail column hiển thị 4 ảnh
- [ ] Click thumbnail → đổi main image
- [ ] Hover thumbnail → border highlight
- [ ] Selected thumbnail có border xanh + scale lớn
- [ ] Click nút ← → để navigate ảnh
- [ ] Counter "1 / 4" hiển thị đúng
- [ ] Click icon zoom (góc trên phải) → mở lightbox
- [ ] Lightbox: ảnh lớn, nền đen, click X hoặc click ngoài để đóng
- [ ] Navigation arrows chỉ hiện khi hover vào gallery

### ℹ️ Product Info
- [ ] Breadcrumbs: Trang chủ / Áo Nam / Tên sản phẩm
- [ ] Breadcrumbs links hoạt động
- [ ] Brand link có màu xanh, hover underline
- [ ] Title lớn, dễ đọc (3xl/4xl)
- [ ] SKU hiển thị dạng monospace
- [ ] Rating: 5 stars (4.5/5 màu vàng)
- [ ] "(128 đánh giá)" link màu xanh
- [ ] Click reviews link → scroll xuống section reviews

### 💰 Price Block
- [ ] Giá sale: 349.000₫ (lớn, màu đỏ)
- [ ] Giá gốc: 499.000₫ (gạch ngang, xám)
- [ ] Badge giảm giá: -30% (nền đỏ)
- [ ] "Tiết kiệm: 150.000₫" hiển thị
- [ ] Border top & bottom ngăn cách sections

### 🎨 Badges
- [ ] 3 badges: 🚚 Miễn phí vận chuyển, 🌿 Cotton 100%, ⭐ Best Seller
- [ ] Badges có icon và text rõ ràng
- [ ] Background xanh nhạt, text xanh đậm

### 🎨 Color Selection
- [ ] Label: "Màu sắc: [Tên màu]"
- [ ] 5 swatches tròn (Đen, Trắng, Xám, Navy, Olive)
- [ ] Hover → hiện tooltip tên màu
- [ ] Click → border xanh + scale lớn + checkmark
- [ ] Olive có dấu gạch chéo (out of stock)
- [ ] Click Olive → không đổi selection

### 📏 Size Selection
- [ ] Label: "Kích cỡ: [Size đã chọn]"
- [ ] Button "Hướng dẫn chọn size" bên phải
- [ ] Grid 5 sizes: S, M, L, XL, 2XL
- [ ] Click size → border xanh + background xanh nhạt
- [ ] XL có chấm cam (sắp hết hàng)
- [ ] 2XL có gạch chéo (out of stock)
- [ ] Click 2XL → không đổi selection
- [ ] Warning "⚠️ Chỉ còn 4 sản phẩm" xuất hiện khi chọn XL

### 🔢 Quantity Stepper
- [ ] Default: 1
- [ ] Click - → giảm (min 1, disable khi = 1)
- [ ] Click + → tăng (max 79, disable khi = max)
- [ ] Nhập số trực tiếp → validate min/max
- [ ] Text "79 sản phẩm có sẵn" bên cạnh

### 🛒 Action Buttons
- [ ] "Thêm vào giỏ hàng" (xanh, icon cart)
- [ ] "Mua ngay" (cam, icon bolt)
- [ ] Favorite button (heart outline, hover → border đỏ)
- [ ] Click favorite → đổi sang heart solid màu đỏ
- [ ] Click Add to Cart không chọn variant → alert
- [ ] Chọn đủ color + size → click Add to Cart:
  - [ ] Toast "✓ Đã thêm vào giỏ hàng!" xuất hiện góc dưới phải
  - [ ] Toast tự động biến mất sau 3 giây
  - [ ] Animation slide up
- [ ] Click Buy Now → alert "Chuyển đến trang thanh toán..."

### 🛡️ Trust Cues
- [ ] Grid 2x2 hiển thị 4 cards
- [ ] Icons với background màu (xanh, xanh lá, tím, cam)
- [ ] Text rõ ràng: Đổi trả 30 ngày, Giao nhanh, COD, Bảo hành

### 📋 Product Details Accordion
- [ ] 4 sections: Chất liệu, Bảo quản, Chính sách, Bảng size
- [ ] Default: section "Chất liệu" mở
- [ ] Click header → expand/collapse với animation
- [ ] Icon chevron rotate 180° khi mở
- [ ] Content có formatting đẹp (bullets, spacing)
- [ ] Bảng size: table với 5 columns responsive
- [ ] Warning/info boxes có màu background

### 📊 Below-the-fold Sections
- [ ] "Thông tin chi tiết" section max-width, centered
- [ ] "Đánh giá sản phẩm" section background xám
- [ ] "Sản phẩm tương tự" section placeholder
- [ ] Sections có spacing đều (py-12)

### 🔄 Interactions & Animations
- [ ] Hover effects smooth (buttons, links, thumbnails)
- [ ] Click feedback rõ ràng
- [ ] Transitions không bị giật
- [ ] Scroll smooth

---

## 📱 Mobile Testing Checklist (< 768px)

### 📐 Layout
- [ ] Single column layout
- [ ] Gallery full-width
- [ ] Info stack dưới gallery
- [ ] No horizontal scroll

### 📸 Gallery Mobile
- [ ] Main image full-width
- [ ] Thumbnails nằm ngang dưới main image
- [ ] Thumbnails scroll horizontal smooth
- [ ] Hidden scrollbar (scrollbar-hide)
- [ ] Counter hiển thị
- [ ] Zoom button có thể click
- [ ] Navigation arrows hoạt động

### 🎨 Variant Selection Mobile
- [ ] Color swatches không bị tràn
- [ ] Size grid 4 columns
- [ ] Touch targets đủ lớn (≥ 44px)
- [ ] Không có items bị cắt

### 🔢 Actions Mobile
- [ ] Quantity stepper dễ tap
- [ ] Buttons stack vertical
- [ ] Buttons đủ cao (py-4)
- [ ] Favorite button không bị nhỏ

### 📌 Sticky Bottom Bar
- [ ] Bar xuất hiện ở bottom màn hình
- [ ] Background trắng + shadow-up
- [ ] Giá hiển thị bên trái
- [ ] Button "Thêm vào giỏ" bên phải
- [ ] Z-index cao hơn content
- [ ] Không che mất content quan trọng

### 📋 Accordion Mobile
- [ ] Tap areas đủ lớn
- [ ] Expand/collapse smooth
- [ ] Table scroll horizontal nếu cần
- [ ] Content không bị cắt

---

## 🎨 Visual Design Review

### Typography
- [ ] Hierarchy rõ ràng (h1 > h2 > body)
- [ ] Font sizes hợp lý
- [ ] Line height thoải mái
- [ ] Text không bị quá dài (max-width)

### Colors
- [ ] Primary: Blue (#2563EB)
- [ ] Secondary: Orange (#F97316)
- [ ] Success: Green
- [ ] Error/Sale: Red
- [ ] Neutral grays hài hòa

### Spacing
- [ ] Consistent padding/margin
- [ ] Sections có "breathing room"
- [ ] Elements không bị dính nhau
- [ ] Grid gaps đều

### Borders & Shadows
- [ ] Border radius consistent (rounded-lg)
- [ ] Shadows subtle, not overwhelming
- [ ] Focus states visible

### Icons
- [ ] Size consistent
- [ ] Aligned với text
- [ ] Color hợp lý với context

---

## 🚨 Error States & Edge Cases

### Stock Warnings
- [ ] Low stock badge trên size XL
- [ ] Warning message xuất hiện
- [ ] Urgency banner (khi < 10 items)

### Out of Stock
- [ ] Olive color disabled
- [ ] 2XL size disabled
- [ ] Visual indicators rõ ràng
- [ ] Cannot select disabled options

### Validation
- [ ] Alert khi chưa chọn variant
- [ ] Quantity min/max enforcement
- [ ] Input validation hoạt động

### Loading & Images
- [ ] Images load properly
- [ ] No broken images
- [ ] Alt text có sẵn
- [ ] Placeholder khi loading (nếu có)

---

## ⚡ Performance Check

### Speed
- [ ] Page load < 2s
- [ ] Interactions responsive (< 100ms)
- [ ] Smooth 60fps animations
- [ ] No layout shifts

### Images
- [ ] Images optimized
- [ ] Lazy loading (below-fold)
- [ ] Proper sizes/formats
- [ ] No pixelation

---

## ♿ Accessibility Quick Check

- [ ] Keyboard navigation works
- [ ] Tab order logical
- [ ] Focus visible
- [ ] Alt text on images
- [ ] Semantic HTML
- [ ] Color contrast adequate
- [ ] Buttons vs links used correctly

---

## 🐛 Known Issues to Check

- [ ] Console có errors không?
- [ ] Network requests failed?
- [ ] React warnings?
- [ ] CSS conflicts?

---

## 💬 Feedback Template

Sau khi test, ghi nhận:

### ✅ Điểm tốt:
- 
- 
- 

### ❌ Điểm cần cải thiện:
- 
- 
- 

### 🎨 Đề xuất design:
- 
- 
- 

### 🔧 Bugs phát hiện:
- 
- 
- 

### 💡 Features mới muốn thêm:
- 
- 
- 

---

## 📸 Screenshots to Take

1. Desktop - Above the fold
2. Desktop - Product details section
3. Mobile - Gallery
4. Mobile - Sticky bottom bar
5. Variant selection states
6. Toast notification
7. Lightbox modal
8. Accordion expanded

---

## 🎯 Priority Review Points

**Quan trọng nhất:**
1. ✅ Layout responsive đúng
2. ✅ Variant selection hoạt động
3. ✅ Add to cart flow smooth
4. ✅ Visual hierarchy rõ ràng
5. ✅ Mobile experience tốt

**Có thể cải thiện sau:**
- Animation details
- Micro-interactions
- Advanced features
- Performance optimization
