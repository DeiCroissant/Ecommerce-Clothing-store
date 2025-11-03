# Backend FastAPI - Vyron Fashion

## Cài đặt

### 1. Cài đặt Python dependencies

```bash
pip install -r requirements.txt
```

### 2. Cài đặt MongoDB

Đảm bảo MongoDB đã được cài đặt và chạy trên máy của bạn:
- MongoDB chạy trên `localhost:27017` (mặc định)
- Hoặc cấu hình `MONGODB_URL` trong file `.env`

### 3. Tạo file .env

Tạo file `.env` trong thư mục `backend/`:

**Cách 1: Dùng MongoDB Local (không có authentication)**
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=vyronfashion_db
```

**Cách 2: Dùng MongoDB Local (có authentication)**
```env
MONGODB_URL=mongodb://username:password@localhost:27017/admin?authSource=admin
DATABASE_NAME=vyronfashion_db
```

**Cách 3: Dùng MongoDB Atlas (Cloud)**
```env
MONGODB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=vyronfashion_db
```

**Cách 4: Cấu hình riêng từng phần**
```env
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_USERNAME=your_username
MONGODB_PASSWORD=your_password
MONGODB_AUTH_DB=admin
DATABASE_NAME=vyronfashion_db
```

**Cấu hình SMTP để gửi email xác minh**

**TenTen Email (recommended):**
```env
MAIL_SERVER=smtp.wuangvinh.id.vn
MAIL_PORT=443
MAIL_USERNAME=quangvinh3020@wuangvinh.id.vn
MAIL_PASSWORD=your_email_password
MAIL_FROM=quangvinh3020@wuangvinh.id.vn
MAIL_FROM_NAME=Vyron Fashion
MAIL_TLS=false
MAIL_SSL=true
```

**Gmail:**
```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com
MAIL_FROM_NAME=Vyron Fashion
MAIL_TLS=true
MAIL_SSL=false
```

> **Lưu ý:**
> - Với Gmail, bạn cần tạo App Password (không dùng mật khẩu thường).
> - Nếu TenTen port 443 không hoạt động, thử port 465.
> - Kiểm tra log server sau khi đăng ký để xem email có gửi thành công không.

**Lưu ý:**
- Nếu dùng MongoDB Atlas, lấy connection string từ MongoDB Atlas Dashboard.
- Thay `username`, `password`, URL, thông tin SMTP bằng thông tin thực của bạn.
- Đảm bảo IP whitelist đã được cấu hình đúng trong MongoDB Atlas (nếu dùng).

### 4. Chạy server

```bash
# Chạy với uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Hoặc chạy trực tiếp
python app/main.py
```

Server sẽ chạy tại: `http://localhost:8000`

## API Documentation

Truy cập Swagger UI tại: `http://localhost:8000/docs`
Truy cập ReDoc tại: `http://localhost:8000/redoc`

## API Endpoints

### POST /api/auth/register
Đăng ký người dùng mới. Sau khi đăng ký, hệ thống tạo mã xác minh email và gửi đến địa chỉ người dùng.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123!",
  "name": "John Doe",
  "dateOfBirth": "1990-01-01"
}
```

**Response (email gửi thành công):**
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

Nếu cấu hình SMTP thiếu hoặc gửi email thất bại, `emailSent=false` và trường `verificationCode` sẽ chứa mã để bạn có thể dùng thử trong môi trường dev.

### POST /api/auth/login
Đăng nhập người dùng (yêu cầu email đã xác minh).

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "user": {
    "id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "name": "John Doe",
    "dateOfBirth": "1990-01-01",
    "createdAt": "2024-01-01T00:00:00",
    "emailVerified": true
  }
}
```

Nếu email chưa được xác minh, API trả về mã lỗi 403 với thông điệp `"Email chưa được xác minh"`.

### POST /api/auth/verify-email
Xác minh email bằng mã đã gửi.

**Request Body:**
```json
{
  "username": "john_doe",
  "code": "AB12CD"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Xác minh email thành công"
}
```

Sau khi xác minh, người dùng có thể đăng nhập bình thường.

### GET /api/user/{user_id}
Lấy thông tin chi tiết người dùng (gồm trạng thái `emailVerified`).

## Cấu trúc thư mục

```
backend/
├── app/
│   ├── main.py           # FastAPI app chính
│   ├── database.py       # Kết nối MongoDB
│   ├── email_utils.py    # Gửi email xác minh qua SMTP
│   ├── models.py         # Models (nếu cần)
│   └── schemas.py        # Pydantic schemas
├── requirements.txt      # Python dependencies
└── README.md             # File này
```

