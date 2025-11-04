# 🚀 Backend API - Vyron Fashion E-commerce

## 📋 Tổng quan

Backend API được xây dựng bằng **FastAPI** - một framework web hiện đại, nhanh chóng và hiệu năng cao cho Python. Hệ thống cung cấp các API endpoints để xử lý xác thực người dùng, quản lý tài khoản và các tính năng liên quan đến e-commerce.

---

## 🛠️ Công nghệ sử dụng

### **Core Framework**
- **FastAPI** (v0.115.0+) - Framework web hiện đại, nhanh chóng, hỗ trợ async/await
- **Uvicorn** (v0.32.0+) - ASGI server hiệu năng cao để chạy FastAPI

### **Database**
- **MongoDB** - NoSQL database linh hoạt, phù hợp cho dữ liệu e-commerce
- **Motor** (v3.6.0+) - Async MongoDB driver cho Python
- **PyMongo** (v4.10.0+) - MongoDB driver đồng bộ

### **Authentication & Security**
- **bcrypt** (v4.2.0+) - Hashing mật khẩu an toàn
- **secrets** - Tạo mã xác minh ngẫu nhiên

### **Data Validation**
- **Pydantic** (v2.9.0+) - Data validation và serialization
- **Pydantic Settings** (v2.5.0+) - Quản lý cấu hình
- **email-validator** (v2.0.0+) - Xác thực định dạng email

### **Email Service**
- **fastapi-mail** (v1.4.1+) - Gửi email xác minh qua SMTP

### **CORS & Middleware**
- **CORSMiddleware** - Xử lý Cross-Origin Resource Sharing cho frontend

### **Bot Protection & Security**
- **Cloudflare Turnstile** - Giải pháp CAPTCHA thay thế cho reCAPTCHA, bảo vệ khỏi bot và spam attacks
- **Cloudflare CDN** - Content Delivery Network để tăng tốc độ và bảo mật
- **Cloudflare DNS** - DNS service với DDoS protection và caching

### **Environment Management**
- **python-dotenv** (v1.0.1+) - Quản lý biến môi trường

---

## ✨ Tính năng chính

### 1. **Xác thực người dùng (Authentication)**
- ✅ Đăng ký tài khoản mới với validation đầy đủ
- ✅ Đăng nhập bằng username hoặc email
- ✅ Xác minh email qua mã code
- ✅ Gửi lại mã xác minh email
- ✅ Bảo mật mật khẩu với bcrypt hashing

### 2. **Bảo mật mật khẩu (Password Security)**
- ✅ Yêu cầu mật khẩu tối thiểu 8 ký tự
- ✅ Bắt buộc có ít nhất 1 chữ hoa
- ✅ Bắt buộc có ít nhất 1 ký tự đặc biệt
- ✅ Không được trùng hoặc chứa username
- ✅ Không được trùng hoặc chứa tên cá nhân
- ✅ Không được chứa ngày sinh

### 3. **Email Verification**
- ✅ Tự động gửi email xác minh khi đăng ký
- ✅ Hỗ trợ SMTP (Gmail, TenTen, v.v.)
- ✅ Gửi lại mã xác minh nếu cần
- ✅ Template email HTML đẹp mắt

### 4. **API Documentation**
- ✅ Swagger UI tự động tại `/docs`
- ✅ ReDoc tại `/redoc`
- ✅ Type hints và validation tự động

### 5. **Cloudflare Integration**
- ✅ **Cloudflare Turnstile** - Bot protection cho đăng ký/đăng nhập
- ✅ Bảo vệ khỏi spam và automated attacks
- ✅ Không cần user interaction (invisible CAPTCHA)
- ✅ Tích hợp với frontend để verify token
- ✅ **Cloudflare CDN** - Tăng tốc độ response và caching
- ✅ **DDoS Protection** - Tự động chặn các cuộc tấn công DDoS

---

## 📁 Cấu trúc dự án

```
backend/
├── app/
│   ├── __init__.py           # Package initialization
│   ├── main.py               # FastAPI application chính, routes
│   ├── database.py           # Kết nối MongoDB (Motor async)
│   ├── models.py             # Database models
│   ├── schemas.py            # Pydantic schemas cho validation
│   └── email_utils.py        # Utility functions cho email
├── requirements.txt          # Python dependencies
├── README.md                 # Tài liệu này
├── TEST_COMMANDS.md          # Hướng dẫn test
└── QUICK_TEST.md             # Quick test guide
```

---

## 🔌 API Endpoints

### **Health Check**
- `GET /health` - Kiểm tra trạng thái server
- `GET /` - Thông tin API

### **Authentication**
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/verify-email` - Xác minh email
- `POST /api/auth/resend-verification` - Gửi lại mã xác minh

### **User Management**
- `GET /api/user/{user_id}` - Lấy thông tin người dùng

---

## 🔒 Tính năng bảo mật

### **1. Password Hashing**
- Sử dụng **bcrypt** với salt tự động
- Mật khẩu không bao giờ được lưu dạng plain text

### **2. Input Validation**
- Validation nghiêm ngặt với **Pydantic**
- Email format validation
- Password strength requirements
- Xử lý lỗi rõ ràng

### **3. CORS Configuration**
- Cấu hình CORS linh hoạt
- Hỗ trợ multiple origins
- Bảo mật với credentials

### **4. Email Verification**
- Bắt buộc xác minh email trước khi đăng nhập
- Mã xác minh ngẫu nhiên, an toàn
- Tự động xóa mã sau khi xác minh

### **5. Cloudflare Bot Protection**
- **Cloudflare Turnstile** tích hợp với frontend
- Verify Turnstile token từ client để đảm bảo request hợp lệ
- Bảo vệ các endpoint đăng ký/đăng nhập khỏi bot attacks
- Invisible CAPTCHA - không làm phiền user experience
- Tự động detect và block suspicious traffic

---

## 🏗️ Kiến trúc

### **Async Architecture**
- Sử dụng **async/await** cho tất cả database operations
- Non-blocking I/O với Motor (async MongoDB driver)
- Hiệu năng cao, xử lý nhiều request đồng thời

### **Layered Architecture**
```
┌─────────────────────────────────┐
│     FastAPI Application         │  (main.py)
│     - Routes & Endpoints        │
│     - Request/Response Handling │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│     Pydantic Schemas            │  (schemas.py)
│     - Data Validation           │
│     - Request/Response Models   │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│     Database Layer               │  (database.py)
│     - MongoDB Connection         │
│     - Collections               │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│     MongoDB Database             │
│     - users collection           │
└─────────────────────────────────┘
```

### **Email Service**
- Tích hợp SMTP qua `fastapi-mail`
- Hỗ trợ multiple email providers
- Fallback mechanism nếu SMTP không cấu hình

### **Cloudflare Services**
- **Turnstile Integration**: Frontend gửi Turnstile token, backend verify
- **CDN**: Cache static assets và API responses
- **DDoS Protection**: Tự động mitigate các cuộc tấn công
- **Rate Limiting**: Giới hạn số lượng requests từ một IP
- **SSL/TLS**: HTTPS encryption tự động

---

## 📦 Cài đặt và Chạy

### **1. Cài đặt dependencies**

```bash
pip install -r requirements.txt
```

### **2. Cấu hình MongoDB**

Tạo file `.env` trong thư mục `backend/`:

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=vyronfashion_db

# Email Configuration (SMTP)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com
MAIL_FROM_NAME=Vyron Fashion
MAIL_TLS=true
MAIL_SSL=false

# Cloudflare Turnstile Configuration
CLOUDFLARE_TURNSTILE_SECRET_KEY=your_secret_key
CLOUDFLARE_TURNSTILE_SITE_KEY=your_site_key
```

### **3. Chạy server**

```bash
# Cách 1: Dùng uvicorn (recommended)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Cách 2: Chạy trực tiếp
python app/main.py
```

Server sẽ chạy tại: `http://localhost:8000`

### **4. Truy cập API Documentation**

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 📝 Ví dụ sử dụng API

### **Đăng ký tài khoản**

```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123!",
  "name": "John Doe",
  "dateOfBirth": "1990-01-01"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác minh.",
  "user": {
    "id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "name": "John Doe",
    "dateOfBirth": "1990-01-01",
    "createdAt": "2024-01-01T00:00:00",
    "emailVerified": false
  },
  "verificationCode": null,
  "emailSent": true
}
```

### **Đăng nhập**

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "Password123!"
}
```

### **Xác minh email**

```bash
POST /api/auth/verify-email
Content-Type: application/json

{
  "username": "john_doe",
  "code": "AB12CD"
}
```

---

## 🎯 Điểm mạnh của Backend

1. **Hiệu năng cao**: Async architecture với FastAPI và Motor
2. **Bảo mật tốt**: Bcrypt hashing, email verification, input validation, Cloudflare Turnstile
3. **Bot Protection**: Cloudflare Turnstile chống spam và automated attacks
4. **DDoS Protection**: Cloudflare CDN tự động mitigate DDoS attacks
5. **Dễ mở rộng**: Code structure rõ ràng, dễ thêm features mới
6. **Tự động document**: Swagger UI tự động generate từ code
7. **Type safety**: Pydantic validation đảm bảo type safety
8. **Production-ready**: Error handling đầy đủ, logging chi tiết, CDN caching

---

## 🔮 Tính năng tương lai (có thể mở rộng)

- [ ] JWT Authentication cho session management
- [ ] OAuth2 integration (Google, Facebook login)
- [ ] Refresh token mechanism
- [ ] Backend verification cho Cloudflare Turnstile token
- [ ] Rate limiting với Cloudflare Rules
- [ ] Redis caching
- [ ] File upload cho avatar với Cloudflare R2
- [ ] Admin panel APIs
- [ ] Product management APIs
- [ ] Order management APIs
- [ ] Payment integration
- [ ] Cloudflare Workers cho edge computing

---

## 📚 Tài liệu tham khảo

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Motor Documentation](https://motor.readthedocs.io/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Cloudflare CDN Documentation](https://developers.cloudflare.com/cache/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

---

## 👨‍💻 Tác giả

**Vyron Fashion Development Team**

---

## 📄 License

MIT License
