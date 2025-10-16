# Vyron Fashion - E-commerce Website

## 📦 Cấu Trúc Trang Chủ (Homepage)

Trang chủ được xây dựng với các section chính sau:

### 1. Header & Navbar (Fixed Top)
**File:** `src/components/layout/Header.js`

**Chức năng:**
- ✅ Logo với link về trang chủ
- ✅ Menu danh mục sản phẩm (Áo Nam, Váy Nữ, Phụ Kiện, Sale)
- ✅ Thanh tìm kiếm
- ✅ Icon người dùng (đăng nhập/đăng ký)
- ✅ Icon giỏ hàng với badge số lượng
- ✅ Responsive menu cho mobile

### 2. Hero Banner
**File:** `src/components/layout/HeroBanner.js`

**Chức năng:**
- ✅ Hình ảnh banner lớn, chất lượng cao
- ✅ Headline và tagline hấp dẫn
- ✅ Call-to-Action button (Mua Ngay)
- ✅ Overlay gradient để text nổi bật
- ✅ Responsive design

**Ảnh sử dụng:** `/public/images/banners/hero-autumn.jpg`

### 3. Featured Categories (Danh Mục Nổi Bật)
**File:** `src/components/composite/FeaturedCategories.js`

**Chức năng:**
- ✅ Hiển thị 4 danh mục chính
- ✅ Mỗi danh mục có ảnh đại diện, tên và số sản phẩm
- ✅ Hover effects (scale image, change overlay)
- ✅ Click để chuyển đến trang danh mục

**Component con:** `src/components/ui/CategoryCard.js`

**Danh mục hiện có:**
- Áo Thun (150 sản phẩm)
- Quần Jean (89 sản phẩm)
- Váy Đầm (124 sản phẩm)
- Phụ Kiện (200 sản phẩm)

### 4. New Arrivals (Sản Phẩm Mới)
**File:** `src/components/composite/NewArrivals.js`

**Chức năng:**
- ✅ Carousel/slider với 8 sản phẩm mới
- ✅ Navigation buttons (prev/next)
- ✅ Responsive (1-4 items per view tùy màn hình)
- ✅ Mobile dots navigation
- ✅ Button "Xem Tất Cả"

**Component con:** `src/components/ui/ProductCard.js`

**ProductCard features:**
- Hình ảnh sản phẩm với hover zoom
- Badge "MỚI" và discount percentage
- Tên sản phẩm (line-clamp-2)
- Rating với stars và review count
- Giá hiện tại và giá gốc (nếu có sale)
- Quick "Thêm vào giỏ" button (hiện khi hover)

### 5. Best Sellers (Sản Phẩm Bán Chạy)
**File:** `src/components/composite/BestSellers.js`

**Chức năng:**
- ✅ Grid hiển thị 8 sản phẩm bán chạy
- ✅ Fire icon animation
- ✅ Trust badges (10,000+ reviews, 4.8/5 rating)
- ✅ Gradient background đẹp mắt
- ✅ Button "Xem Tất Cả"
- ✅ Fade in up animation cho từng sản phẩm

**Dữ liệu:** Sẽ fetch từ API `GET /analytics/hot-products` (hiện tại dùng mock data)

### 6. Footer
**File:** `src/components/layout/Footer.js`

**Chức năng:**
- ✅ Thông tin công ty
- ✅ Links mạng xã hội (Facebook, Instagram, Twitter)
- ✅ Quick Links (Về chúng tôi, Sản phẩm, etc.)
- ✅ Hỗ trợ khách hàng (Chính sách giao hàng, đổi trả, etc.)
- ✅ Thông tin liên hệ (địa chỉ, email, SĐT)
- ✅ Giờ làm việc
- ✅ Copyright và legal links

## 🎨 UI/UX Features

### Animations
- Hero banner: slide-in animations cho text
- Products: hover scale, zoom in image
- Categories: hover scale, overlay transition
- Best sellers: fade-in-up staggered animation
- Buttons: hover states với smooth transitions

### Responsive Design
- **Mobile (< 640px):** 1 column layout
- **Tablet (640-1024px):** 2-3 columns
- **Desktop (> 1024px):** 4 columns
- Mobile menu hamburger
- Touch-friendly tap targets

### Colors
- Primary: Black (#000000)
- Accent: Blue (#3B82F6)
- Background: White/Gray-50
- Text: Gray-900/Gray-600

## 📁 Cấu Trúc File

```
src/
├── app/
│   ├── layout.js          # Layout chính với Header & Footer
│   ├── page.js            # Homepage
│   └── globals.css        # Global styles & animations
├── components/
│   ├── layout/
│   │   ├── Header.js      # Navigation bar
│   │   ├── HeroBanner.js  # Hero section
│   │   └── Footer.js      # Footer
│   ├── composite/
│   │   ├── FeaturedCategories.js  # Categories section
│   │   ├── NewArrivals.js         # New products carousel
│   │   └── BestSellers.js         # Best selling products
│   └── ui/
│       ├── ProductCard.js         # Product card component
│       └── CategoryCard.js        # Category card component
```

## 🖼️ Hướng Dẫn Thêm Ảnh

### 1. Hero Banner
Đặt ảnh vào: `/public/images/banners/`
- Tên file: `hero-autumn.jpg` (hoặc tên khác, nhớ cập nhật trong HeroBanner.js)
- Kích thước đề xuất: 1920x800px
- Format: JPG/PNG

### 2. Categories
Đặt ảnh vào: `/public/images/categories/`
- `tshirts.jpg` - Ảnh áo thun
- `jeans.jpg` - Ảnh quần jean
- `dresses.jpg` - Ảnh váy đầm
- `accessories.jpg` - Ảnh phụ kiện
- Kích thước đề xuất: 800x800px (square)

### 3. Products
Đặt ảnh vào: `/public/images/products/`
- Format: `product-name.jpg`
- Kích thước đề xuất: 600x800px (3:4 ratio)
- Có thể dùng placeholder tạm: `/images/placeholders/product-placeholder.svg`

## 🚀 Chạy Dự Án

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Truy cập: http://localhost:3000

## 📝 TODO - Các Tính Năng Tiếp Theo

- [ ] Tích hợp API thật cho products
- [ ] Tích hợp API /analytics/hot-products cho Best Sellers
- [ ] Xây dựng trang Product Detail
- [ ] Xây dựng trang Category/Listing
- [ ] Xây dựng Shopping Cart
- [ ] Xây dựng Checkout flow
- [ ] Authentication (đăng nhập/đăng ký)
- [ ] User profile & order history
- [ ] Search functionality
- [ ] Filter & Sort products
- [ ] Wishlist feature
- [ ] Product reviews & ratings

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4
- **Icons:** Heroicons
- **Language:** JavaScript (có thể migrate sang TypeScript)

## 📞 Liên Hệ & Hỗ Trợ

Nếu cần hỗ trợ hoặc có câu hỏi, vui lòng liên hệ team development.
