# 🛍️ VYRON FASHION - Hệ Thống Thương Mại Điện Tử Thời Trang

## 📋 Tổng Quan Dự Án

**Vyron Fashion** là một nền tảng thương mại điện tử chuyên về thời trang, được xây dựng với kiến trúc **Full-Stack hiện đại**, tích hợp các công nghệ tiên tiến như **Machine Learning** cho hệ thống gợi ý sản phẩm, **WebSocket** cho cập nhật realtime, và **Cloud Storage** cho quản lý hình ảnh.

### 🎯 Mục Tiêu Dự Án
- Xây dựng website thương mại điện tử hoàn chỉnh với đầy đủ chức năng mua sắm
- Áp dụng Machine Learning (Content-Based Filtering) để gợi ý sản phẩm thông minh
- Tích hợp thanh toán trực tuyến qua VietQR
- Xây dựng hệ thống quản trị (Admin Dashboard) realtime với WebSocket
- Đảm bảo bảo mật với xác thực 2 lớp (2FA)

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           Next.js 15 Frontend (React 19)                   │  │
│  │  • Server Components    • Client Components                │  │
│  │  • App Router           • Turbopack Build                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              FastAPI Backend (Python)                      │  │
│  │  • RESTful API          • WebSocket                        │  │
│  │  • Pydantic Validation  • Async/Await                      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    MongoDB      │ │   Cloudinary    │ │   External      │
│   (Database)    │ │ (Image Storage) │ │   Services      │
│                 │ │                 │ │  • VietQR       │
│ • Users         │ │ • Product imgs  │ │  • Casso        │
│ • Products      │ │ • Auto optimize │ │  • SMTP Email   │
│ • Orders        │ │ • CDN delivery  │ │                 │
│ • Reviews       │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 🔧 Công Nghệ Sử Dụng

### 🖥️ Frontend

| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **Next.js** | 15.5.4 | React Framework với App Router, Server Components |
| **React** | 19.1.0 | UI Library mới nhất |
| **Tailwind CSS** | 4.x | Utility-first CSS Framework |
| **Framer Motion** | 12.x | Animation Library |
| **GSAP** | 3.13.0 | Professional Animation Library |
| **React Hook Form** | 7.x | Form handling với Zod validation |
| **Lucide React** | 0.548.0 | Icon Library |
| **Swiper** | 12.x | Touch Slider/Carousel |

### ⚙️ Backend

| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **FastAPI** | 0.115.0 | Modern Python Web Framework |
| **Uvicorn** | 0.32.0 | ASGI Server |
| **Motor** | 3.6.0 | Async MongoDB Driver |
| **Pydantic** | 2.9.0 | Data Validation |
| **Bcrypt** | 4.2.0 | Password Hashing |
| **FastAPI-Mail** | 1.4.1 | Email Integration |
| **Cloudinary** | 1.36.0 | Image Upload & CDN |

### 🤖 Machine Learning

| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **Scikit-learn** | 1.3.0 | ML Library cho Recommendation System |
| **NumPy** | 1.24.0 | Numerical Computing |
| **TF-IDF Vectorizer** | - | Text Vectorization cho Content-Based Filtering |
| **Cosine Similarity** | - | Similarity Measurement |

### 🗄️ Database & Storage

| Công nghệ | Mô tả |
|-----------|-------|
| **MongoDB** | NoSQL Database |
| **Cloudinary** | Cloud Image Storage với CDN |
| **Docker** | Containerization |

### 🔗 Third-party Services

| Dịch vụ | Mục đích |
|---------|----------|
| **VietQR** | Tạo mã QR thanh toán |
| **Casso** | Webhook nhận giao dịch ngân hàng |
| **SMTP (Gmail)** | Gửi email xác thực |
| **Cloudflare Turnstile** | CAPTCHA bảo mật |

---

## 📦 Chức Năng Hệ Thống

### 👤 Quản Lý Người Dùng

#### 1. Xác Thực & Phân Quyền
- **Đăng ký tài khoản** với xác minh email (OTP 6 số)
- **Đăng nhập** với session management
- **Quên mật khẩu** - Reset qua email token
- **Xác thực 2 lớp (2FA)** - OTP qua email
- **Phân quyền**: Customer, Admin

#### 2. Quản Lý Hồ Sơ
- Cập nhật thông tin cá nhân (tên, số điện thoại, avatar)
- Quản lý địa chỉ giao hàng (CRUD)
- Đặt địa chỉ mặc định
- Thay đổi mật khẩu

### 🛒 Chức Năng Mua Sắm

#### 1. Xem Sản Phẩm
- **Trang chủ** với banner, sản phẩm mới, bán chạy
- **Trang danh mục** với filter và phân trang
- **Trang chi tiết sản phẩm**:
  - Gallery ảnh với zoom
  - Chọn màu sắc và kích cỡ
  - Thông tin chi tiết, mô tả
  - Đánh giá từ khách hàng
  - **Sản phẩm tương tự** (ML Recommendation)

#### 2. Giỏ Hàng
- Thêm/xóa sản phẩm
- Cập nhật số lượng
- Hiển thị tổng tiền realtime
- Animation "Fly to Cart"

#### 3. Wishlist (Danh Sách Yêu Thích)
- Thêm/xóa sản phẩm yêu thích
- Xem danh sách wishlist

#### 4. Thanh Toán
- **Checkout** với thông tin giao hàng
- **Phương thức thanh toán**:
  - COD (Thanh toán khi nhận hàng)
  - VietQR (Quét mã QR chuyển khoản)
- **Mã giảm giá** (Coupon)
- **Phí vận chuyển** theo phương thức

#### 5. Quản Lý Đơn Hàng
- Xem lịch sử đơn hàng
- Chi tiết đơn hàng
- Theo dõi trạng thái: Pending → Processing → Shipped → Delivered
- Yêu cầu trả hàng/hoàn tiền

### ⭐ Đánh Giá Sản Phẩm
- Chỉ cho phép đánh giá sau khi mua
- Rating 1-5 sao
- Viết review với nội dung
- Hiển thị điểm trung bình

---

## 🤖 Hệ Thống Gợi Ý Sản Phẩm (Machine Learning)

### Content-Based Filtering

Hệ thống sử dụng **TF-IDF (Term Frequency-Inverse Document Frequency)** và **Cosine Similarity** để gợi ý sản phẩm tương tự.

#### Quy Trình Hoạt Động:

```
1. Thu thập dữ liệu sản phẩm
         │
         ▼
2. Xây dựng "Content Profile" cho mỗi sản phẩm
   • Tên sản phẩm (weight x3)
   • Mô tả ngắn
   • Danh mục (weight x2)
   • Thương hiệu
   • Màu sắc
         │
         ▼
3. Vectorization với TF-IDF
   • ngram_range=(1, 2) - Unigram + Bigram
   • Hỗ trợ tiếng Việt Unicode
         │
         ▼
4. Tính toán Cosine Similarity Matrix
         │
         ▼
5. Khi user xem sản phẩm A:
   → Tìm top N sản phẩm có similarity cao nhất với A
   → Loại bỏ sản phẩm đã xem/mua
   → Trả về danh sách gợi ý
```

#### Công Thức TF-IDF:

$$TF(t,d) = \frac{\text{Số lần xuất hiện của term } t \text{ trong document } d}{\text{Tổng số terms trong document } d}$$

$$IDF(t) = \log\frac{\text{Tổng số documents}}{\text{Số documents chứa term } t}$$

$$TF\text{-}IDF(t,d) = TF(t,d) \times IDF(t)$$

#### Cosine Similarity:

$$\text{similarity}(A, B) = \frac{A \cdot B}{\|A\| \times \|B\|} = \frac{\sum_{i=1}^{n} A_i \times B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \times \sqrt{\sum_{i=1}^{n} B_i^2}}$$

---

## 🔐 Bảo Mật

### Các Biện Pháp Bảo Mật Đã Triển Khai:

| Tính năng | Mô tả |
|-----------|-------|
| **Password Hashing** | Bcrypt với salt rounds |
| **2FA (Two-Factor Authentication)** | OTP 6 số qua email, hết hạn sau 5 phút |
| **Email Verification** | Xác minh email khi đăng ký |
| **CORS Protection** | Chỉ cho phép origin được cấu hình |
| **Input Validation** | Pydantic schemas validation |
| **Webhook Verification** | HMAC signature cho Casso webhook |
| **CAPTCHA** | Cloudflare Turnstile |

---

## 📊 Admin Dashboard

### Chức Năng Quản Trị

#### 1. Dashboard Tổng Quan (Realtime với WebSocket)
- **KPI Cards**: Doanh thu, đơn hàng, khách hàng mới, sản phẩm đã bán
- **Biểu đồ doanh thu** theo thời gian
- **Đơn hàng mới** cần xử lý
- **Sản phẩm sắp hết hàng**
- **Cập nhật realtime** khi có đơn hàng mới

#### 2. Quản Lý Sản Phẩm
- CRUD sản phẩm với form modal
- Upload nhiều ảnh cùng lúc (Cloudinary)
- Quản lý biến thể (màu sắc, kích cỡ)
- Ảnh riêng cho từng màu
- Quản lý tồn kho
- Phân trang và tìm kiếm

#### 3. Quản Lý Danh Mục
- CRUD danh mục sản phẩm
- Danh mục cha-con (nested)
- Upload ảnh đại diện

#### 4. Quản Lý Đơn Hàng
- Xem danh sách đơn hàng với filter theo trạng thái
- Cập nhật trạng thái đơn hàng
- Xem chi tiết đơn hàng
- Thông báo realtime đơn hàng mới

#### 5. Quản Lý Khách Hàng
- Xem danh sách khách hàng
- Thống kê: tổng đơn, tổng chi tiêu
- Ban/Unban tài khoản
- Thay đổi role (Customer/Admin)
- Gửi email marketing

#### 6. Quản Lý Mã Giảm Giá (Coupon)
- Tạo mã giảm giá (% hoặc số tiền cố định)
- Điều kiện: giá trị đơn tối thiểu, số lần sử dụng
- Thời hạn hiệu lực
- Bật/tắt coupon

#### 7. Quản Lý Đổi Trả
- Xem yêu cầu đổi trả
- Duyệt/từ chối yêu cầu
- Cập nhật trạng thái

#### 8. Cài Đặt
- Cấu hình phương thức thanh toán
- Cấu hình phương thức vận chuyển
- Bật/tắt các tính năng

---

## 🌐 WebSocket Realtime

### Kiến Trúc WebSocket:

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│  Admin Browser  │◄──────────────────►│  FastAPI Server │
│    Dashboard    │     ws://...       │ WebSocket Mgr   │
└─────────────────┘                    └─────────────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │   Event Types   │
                                    │ • new_order     │
                                    │ • order_update  │
                                    │ • dashboard_    │
                                    │   refresh       │
                                    └─────────────────┘
```

### Các Sự Kiện Realtime:
- `new_order`: Thông báo khi có đơn hàng mới
- `order_update`: Cập nhật trạng thái đơn hàng
- `dashboard_refresh`: Refresh dữ liệu dashboard

---

## 💳 Tích Hợp Thanh Toán VietQR

### Luồng Thanh Toán:

```
1. Khách hàng chọn thanh toán VietQR
         │
         ▼
2. Backend tạo mã QR qua VietQR API
   • Số tài khoản
   • Số tiền
   • Nội dung: "Thanh toan don {order_id}"
         │
         ▼
3. Khách hàng quét mã và chuyển khoản
         │
         ▼
4. Ngân hàng gửi webhook đến Casso
         │
         ▼
5. Casso forward webhook đến Backend
   • Xác thực HMAC signature
   • Parse nội dung giao dịch
         │
         ▼
6. Backend cập nhật trạng thái đơn hàng
   • payment_status: "paid"
   • Notify qua WebSocket
```

---

## 📁 Cấu Trúc Thư Mục

```
Ecommerce-Clothing-store/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # Entry point, API routes
│   │   ├── database.py        # MongoDB connection
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── recommendation.py  # ML Recommendation Engine
│   │   ├── websocket_manager.py # WebSocket handler
│   │   ├── payment_vietqr.py  # VietQR integration
│   │   ├── cloudinary_uploader.py # Image upload
│   │   ├── email_utils.py     # Email sending
│   │   └── logger_config.py   # Logging configuration
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile
│
├── vyronfashion/              # Next.js Frontend
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── page.js        # Homepage
│   │   │   ├── products/      # Product pages
│   │   │   ├── category/      # Category pages
│   │   │   ├── cart/          # Cart page
│   │   │   ├── checkout/      # Checkout page
│   │   │   ├── account/       # User account pages
│   │   │   ├── admin/         # Admin dashboard
│   │   │   └── api/           # API routes
│   │   │
│   │   ├── components/        # React components
│   │   │   ├── layout/        # Header, Footer
│   │   │   ├── product/       # Product components
│   │   │   ├── admin/         # Admin components
│   │   │   ├── account/       # Account components
│   │   │   └── ui/            # UI components
│   │   │
│   │   └── lib/               # Utilities
│   │       ├── api/           # API client functions
│   │       └── imageHelper.js # Image utilities
│   │
│   ├── public/                # Static assets
│   └── package.json           # Node dependencies
│
└── docker-compose.yml         # Docker orchestration
```

---

## 🚀 API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/verify-email` | Xác minh email |
| POST | `/api/auth/forgot-password` | Quên mật khẩu |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu |

### Products
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Danh sách sản phẩm |
| GET | `/api/products/{id}` | Chi tiết sản phẩm |
| GET | `/api/products/{id}/recommendations` | Sản phẩm gợi ý (ML) |
| POST | `/api/products` | Tạo sản phẩm (Admin) |
| PUT | `/api/products/{id}` | Cập nhật sản phẩm |
| DELETE | `/api/products/{id}` | Xóa sản phẩm |

### Categories
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/categories` | Danh sách danh mục |
| POST | `/api/categories` | Tạo danh mục |
| PUT | `/api/categories/{id}` | Cập nhật danh mục |
| DELETE | `/api/categories/{id}` | Xóa danh mục |

### Cart
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/cart/{user_id}` | Xem giỏ hàng |
| POST | `/api/cart/add` | Thêm vào giỏ |
| PUT | `/api/cart/{user_id}/{item_index}` | Cập nhật số lượng |
| DELETE | `/api/cart/{user_id}/item` | Xóa sản phẩm |

### Orders
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/orders` | Tạo đơn hàng |
| GET | `/api/orders/user/{user_id}` | Đơn hàng của user |
| GET | `/api/orders/{order_id}` | Chi tiết đơn hàng |
| PUT | `/api/admin/orders/{id}/status` | Cập nhật trạng thái |

### Payment
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/payments/vietqr/initiate` | Tạo mã QR thanh toán |
| POST | `/api/payments/casso/webhook` | Webhook nhận giao dịch |
| GET | `/api/payments/status/{order_id}` | Kiểm tra trạng thái |

### Reviews & Wishlist
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/reviews` | Tạo đánh giá |
| GET | `/api/reviews/product/{id}` | Đánh giá sản phẩm |
| POST | `/api/wishlist/toggle` | Toggle wishlist |
| GET | `/api/wishlist/{user_id}` | Danh sách yêu thích |

### Admin Dashboard
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/dashboard` | Dữ liệu dashboard |
| GET | `/api/admin/orders` | Quản lý đơn hàng |
| GET | `/api/admin/customers` | Quản lý khách hàng |
| GET | `/api/admin/coupons` | Quản lý mã giảm giá |
| GET | `/api/admin/returns` | Quản lý đổi trả |

### Security
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/security/2fa/enable` | Bật 2FA |
| POST | `/api/security/2fa/disable` | Tắt 2FA |
| POST | `/api/security/2fa/verify` | Xác thực OTP |
| POST | `/api/security/change-password` | Đổi mật khẩu |

### WebSocket
| Endpoint | Mô tả |
|----------|-------|
| `ws://host/ws/admin/dashboard` | Realtime dashboard updates |

---

## ⚙️ Cài Đặt & Chạy

### Yêu Cầu Hệ Thống
- **Node.js** >= 18.x
- **Python** >= 3.10
- **MongoDB** >= 6.0
- **Docker** (optional)

### 1. Clone Repository
```bash
git clone https://github.com/DeiCroissant/Ecommerce-Clothing-store.git
cd Ecommerce-Clothing-store
```

### 2. Cài Đặt Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 3. Cấu Hình Environment
Tạo file `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=vyron_fashion

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

MAIL_SERVER=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com

VIETQR_BANK_ID=970422
VIETQR_ACCOUNT_NUMBER=your_account
VIETQR_ACCOUNT_NAME=VYRON FASHION
CASSO_API_KEY=your_casso_key
CASSO_WEBHOOK_SECRET=your_webhook_secret

FRONTEND_URL=http://localhost:3000
```

### 4. Chạy Backend
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 5. Cài Đặt Frontend
```bash
cd vyronfashion
npm install
```

### 6. Cấu Hình Frontend
Tạo file `vyronfashion/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 7. Chạy Frontend
```bash
npm run dev
```

### 8. Truy Cập
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

---

## 📈 Hiệu Năng & Tối Ưu

### Các Biện Pháp Tối Ưu:

| Kỹ thuật | Mô tả |
|----------|-------|
| **Database Indexing** | Index trên các trường thường query |
| **Pagination** | Phân trang kết quả với limit/skip |
| **Image Optimization** | Auto-optimize ảnh trên Cloudinary |
| **Caching** | Frontend caching với React Query pattern |
| **Lazy Loading** | Load ảnh khi cần |
| **Debounce Search** | Giảm request khi search |
| **WebSocket** | Realtime thay vì polling |
| **Async Operations** | Non-blocking I/O với async/await |

---

## 👨‍💻 Tác Giả

**[Tên Sinh Viên]**
- Trường: [Tên Trường]
- Email: [Email]
- GitHub: [Link GitHub]

---

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 🙏 Lời Cảm Ơn

Cảm ơn các thư viện và dịch vụ open-source đã giúp hoàn thành dự án này:
- Next.js Team
- FastAPI
- MongoDB
- Cloudinary
- VietQR
- Scikit-learn

---

*Cập nhật lần cuối: Tháng 11, 2025*
