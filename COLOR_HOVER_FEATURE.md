# Tính năng Hover Màu Sắc - Đổi Ảnh Sản Phẩm

## 🎨 Tính năng mới

Khi di chuột vào các màu sắc của sản phẩm, ảnh chính sẽ tự động đổi theo màu đó.

## 📦 Components đã cập nhật

### 1. EnhancedProductCard.js
**Location**: `src/components/category/EnhancedProductCard.js`

**Thay đổi**:
- ✅ Thêm state `hoveredColor` để track màu đang được hover
- ✅ Logic `getDisplayImage()` để ưu tiên hiển thị ảnh của màu được hover
- ✅ Event handlers `onMouseEnter` và `onMouseLeave` cho các color swatches
- ✅ Visual feedback khi hover: scale 125%, blue ring, border color

**Cách hoạt động**:
```javascript
// Khi hover vào màu
onMouseEnter={(e) => {
  e.stopPropagation();
  setHoveredColor(colorValue);
}}

// Khi rời chuột khỏi màu
onMouseLeave={(e) => {
  e.stopPropagation();
  setHoveredColor(null);
}}

// Lấy ảnh hiển thị
const getDisplayImage = () => {
  if (hoveredColor && product.variants?.colors) {
    const colorObj = product.variants.colors.find(c => (c.slug || c.name) === hoveredColor);
    if (colorObj?.images && colorObj.images.length > 0) {
      return colorObj.images[0]; // Ảnh đầu tiên của màu
    }
  }
  return product.image || product.images?.[0] || '';
};
```

### 2. ProductCard.js
**Location**: `src/components/ui/ProductCard.js`

**Thay đổi**:
- ✅ Thêm state `hoveredColor`
- ✅ Logic `getDisplayImage()` tương tự EnhancedProductCard
- ✅ Hiển thị color swatches khi hover (slide up animation)
- ✅ Color swatches nằm phía trên nút "Thêm vào giỏ"

**Visual Design**:
- Background: `bg-white/90 backdrop-blur-sm`
- Rounded pill shape: `rounded-full`
- Shadow: `shadow-lg`
- Animation: `translate-y-full` → `translate-y-0` khi hover

## 🎯 User Experience

### Trước khi hover:
- Hiển thị ảnh mặc định của sản phẩm
- Các màu sắc ẩn bên dưới (EnhancedProductCard) hoặc không hiển thị (ProductCard)

### Khi hover vào card:
- **EnhancedProductCard**: Màu sắc hiện ở bottom overlay với gradient background
- **ProductCard**: Màu sắc slide up từ dưới với background trắng mờ

### Khi hover vào màu sắc:
- ⚡ Ảnh chính đổi ngay lập tức sang ảnh của màu đó
- 🎯 Màu được hover có:
  - Scale: 125%
  - Border: blue (400/500)
  - Ring: blue với opacity 50%
  - Duration: 200ms smooth transition

### Khi rời chuột khỏi màu:
- Ảnh quay về ảnh mặc định
- Màu về trạng thái bình thường

## 📊 Data Structure Required

Sản phẩm cần có structure:
```javascript
{
  id: "...",
  name: "Áo phông Golf...",
  image: "default-image.jpg", // Ảnh mặc định
  images: [...],
  variants: {
    colors: [
      {
        name: "Đỏ",
        slug: "do",
        hex: "#FF0000",
        available: true,
        images: [
          "red-image-1.jpg",
          "red-image-2.jpg"
        ]
      },
      {
        name: "Xanh dương",
        slug: "xanh-duong", 
        hex: "#0000FF",
        available: true,
        images: [
          "blue-image-1.jpg",
          "blue-image-2.jpg"
        ]
      }
    ],
    sizes: [...]
  }
}
```

## 🔧 Technical Details

### State Management
```javascript
const [hoveredColor, setHoveredColor] = useState(null);
```

### Performance
- ✅ Không fetch image mới (đã có trong data)
- ✅ Chỉ swap src của thẻ `<img>`
- ✅ Browser cache tự động
- ✅ `stopPropagation()` để tránh trigger events không mong muốn

### Accessibility
- ✅ `title` attribute cho screen readers
- ✅ Cursor pointer để báo interactive
- ✅ Visual feedback rõ ràng
- ✅ Hover state dễ nhận biết

## 🎨 Styling Details

### EnhancedProductCard Color Swatches
```css
/* Base */
w-6 h-6 rounded-full border-2 shadow-md
cursor-pointer transition-all duration-200

/* Normal state */
border-white

/* Hovered state */
border-blue-400 scale-125 
ring-2 ring-blue-400/50
```

### ProductCard Color Swatches
```css
/* Container */
bg-white/90 backdrop-blur-sm px-3 py-2 
rounded-full shadow-lg

/* Animation */
translate-y-full → translate-y-0 (on card hover)

/* Individual swatch */
w-5 h-5 rounded-full border-2
border-white (normal)
border-blue-500 scale-125 ring-2 ring-blue-400/50 (hovered)
```

## 📱 Responsive Behavior

- Desktop: Full hover effects
- Mobile/Touch: Màu sắc vẫn hiển thị nhưng không có hover (tap để xem chi tiết)

## 🚀 Future Enhancements

Có thể mở rộng:
1. **Smooth Image Transition**: Fade in/out khi đổi ảnh
2. **Preload Images**: Preload tất cả ảnh màu khi hover vào card
3. **Thumbnail Preview**: Hiển thị nhiều ảnh của màu đó
4. **Color Name Display**: Hiển thị tên màu khi hover
5. **Analytics**: Track màu nào được hover nhiều nhất

## 🧪 Testing

### Manual Testing
1. Hover vào product card
2. Hover vào từng màu sắc
3. Verify ảnh đổi đúng
4. Check animation smooth
5. Test trên nhiều products khác nhau

### Edge Cases
- ✅ Product không có variants.colors
- ✅ Color không có images array
- ✅ Images array empty
- ✅ Fallback về ảnh mặc định

## 📝 Notes

- Feature hoạt động với cả `EnhancedProductCard` và `ProductCard`
- Compatible với existing Quick View modal
- Không ảnh hưởng đến wishlist và cart functionality
- Có thể dùng cho tất cả product listings (category, search, wishlist, etc.)
