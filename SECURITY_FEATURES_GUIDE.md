# Hướng Dẫn Tính Năng Bảo Mật

## Tổng Quan

Hệ thống đã được tích hợp các tính năng bảo mật nâng cao bao gồm:
1. **Xác thực hai yếu tố (2FA) qua Email**
2. **Đổi mật khẩu**

## 1. Xác Thực Hai Yếu Tố (2FA)

### Mô Tả
Xác thực hai yếu tố (2FA) tăng cường bảo mật tài khoản bằng cách yêu cầu mã xác thực được gửi qua email mỗi khi đăng nhập.

### Cách Hoạt Động

#### Bật 2FA
1. Đăng nhập vào tài khoản
2. Vào **Tài khoản > Bảo mật**
3. Trong phần "Xác thực hai yếu tố (2FA)", click nút **"Bật xác thực 2FA"**
4. Hệ thống sẽ lưu cài đặt và thông báo thành công

#### Đăng Nhập Với 2FA
1. Nhập username/email và mật khẩu như bình thường
2. Nếu 2FA đã được bật, hệ thống sẽ:
   - Tạo mã 2FA gồm 6 số ngẫu nhiên
   - Gửi mã qua email (mã có hiệu lực 10 phút)
   - Hiển thị form nhập mã 2FA
3. Kiểm tra email và nhập mã 6 số
4. Click **"Xác thực 2FA"** để hoàn tất đăng nhập

#### Tắt 2FA
1. Vào **Tài khoản > Bảo mật**
2. Click nút **"Tắt xác thực 2FA"**
3. Nhập mật khẩu hiện tại để xác nhận
4. Click **"Xác nhận tắt"**

### API Endpoints

#### Lấy Trạng Thái 2FA
```
GET /api/security/2fa/status/{user_id}
```

**Response:**
```json
{
  "success": true,
  "two_factor_enabled": true,
  "user_email": "user@example.com"
}
```

#### Bật 2FA
```
POST /api/security/2fa/enable
```

**Request Body:**
```json
{
  "user_id": "user_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã bật xác thực 2FA thành công",
  "two_factor_enabled": true
}
```

#### Tắt 2FA
```
POST /api/security/2fa/disable
```

**Request Body:**
```json
{
  "user_id": "user_id_here",
  "password": "current_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã tắt xác thực 2FA thành công",
  "two_factor_enabled": false
}
```

#### Xác Thực Mã 2FA
```
POST /api/security/2fa/verify
```

**Request Body:**
```json
{
  "username": "username_here",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Xác minh 2FA thành công",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "user@example.com",
    ...
  }
}
```

### Email Template 2FA

Email gửi mã 2FA có format như sau:

```
Tiêu đề: Mã xác thực 2FA - Vyron Fashion

Nội dung:
Xin chào [Tên người dùng],

Chúng tôi nhận được yêu cầu đăng nhập vào tài khoản [username] tại Vyron Fashion.

Để hoàn tất việc đăng nhập, vui lòng nhập mã xác thực 2FA dưới đây:

┌──────────────┐
│   123456     │  (Mã 6 số)
└──────────────┘

⚠️ Lưu ý: Mã này sẽ hết hạn sau 10 phút.

Nếu bạn không thực hiện yêu cầu đăng nhập này, vui lòng bỏ qua email này 
và kiểm tra bảo mật tài khoản của bạn.
```

## 2. Đổi Mật Khẩu

### Mô Tả
Cho phép người dùng thay đổi mật khẩu tài khoản một cách an toàn.

### Cách Sử Dụng

1. Đăng nhập vào tài khoản
2. Vào **Tài khoản > Bảo mật**
3. Trong phần "Đổi mật khẩu", điền thông tin:
   - **Mật khẩu hiện tại**: Nhập mật khẩu đang dùng
   - **Mật khẩu mới**: Nhập mật khẩu mới (phải đáp ứng yêu cầu)
   - **Xác nhận mật khẩu mới**: Nhập lại mật khẩu mới
4. Click **"Đổi mật khẩu"**
5. Sau khi đổi thành công, hệ thống sẽ tự động đăng xuất sau 3 giây

### Yêu Cầu Mật Khẩu

Mật khẩu mới phải đáp ứng các điều kiện sau:
- ✓ Ít nhất 8 ký tự
- ✓ Ít nhất 1 chữ hoa (A-Z)
- ✓ Ít nhất 1 ký tự đặc biệt (!@#$%^&*...)

### Chỉ Báo Độ Mạnh Mật Khẩu

Hệ thống hiển thị thanh chỉ báo độ mạnh của mật khẩu:
- 🔴 **Yếu**: Chưa đáp ứng đủ yêu cầu
- 🟡 **Trung bình**: Đáp ứng một số yêu cầu
-[object Object]ạnh**: Đáp ứng đầy đủ yêu cầu

### API Endpoint

#### Đổi Mật Khẩu
```
POST /api/security/change-password
```

**Request Body:**
```json
{
  "user_id": "user_id_here",
  "current_password": "old_password",
  "new_password": "new_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

**Error Response:**
```json
{
  "success": false,
  "detail": "Mật khẩu hiện tại không chính xác"
}
```

## Cấu Trúc File

### Frontend

```
vyronfashion/src/
├── app/
│   └── account/
│       └── security/
│           └── page.js                    # Trang bảo mật chính
└── components/
    └── account/
        └── security/
            ├── TwoFactorAuth.js           # Component bật/tắt 2FA
            ├── ChangePassword.js          # Component đổi mật khẩu
            └── index.js                   # Export components
```

### Backend

```
backend/app/
├── main.py                                # API endpoints
├── schemas.py                             # Pydantic schemas
└── email_utils.py                         # Email utilities (send_2fa_code_email)
```

## Database Schema

### User Collection

Các trường liên quan đến bảo mật:

```javascript
{
  "_id": ObjectId,
  "username": String,
  "email": String,
  "password": String (hashed),
  "two_factor_enabled": Boolean,          // Trạng thái 2FA
  "two_factor_code": String,              // Mã 2FA tạm thời
  "two_factor_expires": String (ISO),     // Thời gian hết hạn mã 2FA
  ...
}
```

## Luồng Xử Lý

### Luồng Đăng Nhập Với 2FA

```
1. User nhập username + password
   ↓
2. Backend kiểm tra credentials
   ↓
3. Nếu two_factor_enabled = true:
   ├─ Tạo mã 6 số ngẫu nhiên
   ├─ Lưu vào DB với thời gian hết hạn (10 phút)
   ├─ Gửi mã qua email
   └─ Trả về response với needs_2fa = true
   ↓
4. Frontend hiển thị form nhập mã 2FA
   ↓
5. User nhập mã 2FA
   ↓
6. Backend xác thực mã:
   ├─ Kiểm tra mã có đúng không
   ├─ Kiểm tra mã có hết hạn không
   └─ Nếu hợp lệ: Xóa mã và trả về user info
   ↓
7. Frontend lưu user vào localStorage và đăng nhập thành công
```

### Luồng Đổi Mật Khẩu

```
1. User nhập:
   - Mật khẩu hiện tại
   - Mật khẩu mới
   - Xác nhận mật khẩu mới
   ↓
2. Frontend validate:
   - Mật khẩu mới đáp ứng yêu cầu
   - Mật khẩu xác nhận khớp
   ↓
3. Gửi request đến backend
   ↓
4. Backend:
   ├─ Xác minh mật khẩu hiện tại
   ├─ Kiểm tra mật khẩu mới không trùng mật khẩu cũ
   ├─ Hash mật khẩu mới
   └─ Cập nhật vào database
   ↓
5. Frontend:
   ├─ Hiển thị thông báo thành công
   ├─ Đợi 3 giây
   └─ Đăng xuất và chuyển về trang chủ
```

## Bảo Mật

### Các Biện Pháp Bảo Mật

1. **Mã hóa mật khẩu**: Sử dụng bcrypt để hash mật khẩu
2. **Mã 2FA có thời hạn**: Mã 2FA chỉ có hiệu lực 10 phút
3. **Xác thực mật khẩu**: Yêu cầu mật khẩu hiện tại khi tắt 2FA hoặc đổi mật khẩu
4. **Validation**: Kiểm tra độ mạnh mật khẩu ở cả frontend và backend
5. **Xóa mã sau khi sử dụng**: Mã 2FA được xóa ngay sau khi xác thực thành công

### Best Practices

1. **Luôn bật 2FA** cho các tài khoản quan trọng
2. **Sử dụng mật khẩu mạnh** với ít nhất 12 ký tự
3. **Không chia sẻ mã 2FA** với bất kỳ ai
4. **Đổi mật khẩu định kỳ** (khuyến nghị 3-6 tháng/lần)
5. **Kiểm tra email thường xuyên** để phát hiện hoạt động đáng ngờ

## Testing

### Test 2FA

1. **Test bật 2FA**:
   ```bash
   curl -X POST http://localhost:8000/api/security/2fa/enable \
     -H "Content-Type: application/json" \
     -d '{"user_id": "USER_ID"}'
   ```

2. **Test đăng nhập với 2FA**:
   - Đăng nhập với tài khoản đã bật 2FA
   - Kiểm tra email nhận được mã
   - Nhập mã và xác thực

3. **Test tắt 2FA**:
   ```bash
   curl -X POST http://localhost:8000/api/security/2fa/disable \
     -H "Content-Type: application/json" \
     -d '{"user_id": "USER_ID", "password": "PASSWORD"}'
   ```

### Test Đổi Mật Khẩu

1. **Test đổi mật khẩu thành công**:
   ```bash
   curl -X POST http://localhost:8000/api/security/change-password \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "USER_ID",
       "current_password": "OldPassword123!",
       "new_password": "NewPassword456!"
     }'
   ```

2. **Test validation**:
   - Mật khẩu hiện tại sai
   - Mật khẩu mới không đủ mạnh
   - Mật khẩu mới trùng mật khẩu cũ

## Troubleshooting

### Vấn Đề Thường Gặp

#### 1. Không nhận được email mã 2FA

**Nguyên nhân:**
- SMTP chưa được cấu hình đúng
- Email bị vào spam

**Giải pháp:**
- Kiểm tra cấu hình SMTP trong `.env`
- Kiểm tra thư mục spam
- Xem log backend để kiểm tra lỗi gửi email

#### 2. Mã 2FA không hợp lệ

**Nguyên nhân:**
- Mã đã hết hạn (>10 phút)
- Nhập sai mã

**Giải pháp:**
- Đăng nhập lại để nhận mã mới
- Kiểm tra kỹ mã trong email

#### 3. Không thể đổi mật khẩu

**Nguyên nhân:**
- Mật khẩu hiện tại không đúng
- Mật khẩu mới không đáp ứng yêu cầu

**Giải pháp:**
- Kiểm tra lại mật khẩu hiện tại
- Đảm bảo mật khẩu mới có ít nhất 8 ký tự, 1 chữ hoa, 1 ký tự đặc biệt

## Changelog

### Version 1.0.0 (2025-11-07)

**Tính năng mới:**
- ✅ Xác thực hai yếu tố (2FA) qua email
- ✅ Đổi mật khẩu với validation
- ✅ Chỉ báo độ mạnh mật khẩu
- ✅ Email template cho mã 2FA
- ✅ Tích hợp 2FA vào flow đăng nhập

**API Endpoints:**
- `GET /api/security/2fa/status/{user_id}`
- `POST /api/security/2fa/enable`
- `POST /api/security/2fa/disable`
- `POST /api/security/2fa/verify`
- `POST /api/security/change-password`

**Components:**
- `TwoFactorAuth.js`: Quản lý bật/tắt 2FA
- `ChangePassword.js`: Form đổi mật khẩu
- `SecurityPage`: Trang bảo mật tổng hợp

## Liên Hệ & Hỗ Trợ

Nếu bạn gặp vấn đề hoặc cần hỗ trợ, vui lòng:
1. Kiểm tra phần Troubleshooting ở trên
2. Xem log backend để tìm lỗi chi tiết
3. Liên hệ team phát triển

---

**Lưu ý**: Tài liệu này được cập nhật lần cuối vào ngày 07/11/2025.

