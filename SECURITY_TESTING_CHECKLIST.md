# Security Features Testing Checklist

## 🚀 Khởi Động Hệ Thống

### Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
[OK] SMTP config thanh cong!
INFO:     Application startup complete.
```

### Frontend
```bash
cd vyronfashion
npm run dev
```

**Expected Output:**
```
- Local:   http://localhost:3000
```

## ✅ Test Cases

### 1. Test Trang Security

- [ ] Truy cập `http://localhost:3000/account/security`
- [ ] Kiểm tra hiển thị 2 phần:
  - [ ] Xác thực hai yếu tố (2FA)
  - [ ] Đổi mật khẩu
- [ ] Kiểm tra UI đẹp, không có lỗi console

### 2. Test Bật 2FA

#### Bước 1: Bật 2FA
- [ ] Click nút "Bật xác thực 2FA"
- [ ] Kiểm tra thông báo thành công
- [ ] Kiểm tra status badge chuyển sang "Đã bật" (màu xanh)

#### Bước 2: Đăng Xuất
- [ ] Đăng xuất khỏi tài khoản

#### Bước 3: Đăng Nhập Với 2FA
- [ ] Nhập username và password
- [ ] Kiểm tra hiển thị form "Xác thực 2FA"
- [ ] Kiểm tra email nhận được mã 6 số
- [ ] Nhập mã 2FA
- [ ] Click "Xác thực 2FA"
- [ ] Kiểm tra đăng nhập thành công

**Email Template Check:**
- [ ] Email có tiêu đề "Mã xác thực 2FA - Vyron Fashion"
- [ ] Email có mã 6 số rõ ràng
- [ ] Email có thông báo "Mã có hiệu lực 10 phút"

### 3. Test Tắt 2FA

- [ ] Vào trang Security
- [ ] Click "Tắt xác thực 2FA"
- [ ] Nhập mật khẩu hiện tại
- [ ] Click "Xác nhận tắt"
- [ ] Kiểm tra thông báo thành công
- [ ] Kiểm tra status badge chuyển sang "Chưa bật" (màu đỏ)

### 4. Test Đổi Mật Khẩu

#### Test Case 1: Đổi Mật Khẩu Thành Công
- [ ] Nhập mật khẩu hiện tại đúng
- [ ] Nhập mật khẩu mới (đáp ứng yêu cầu)
- [ ] Nhập xác nhận mật khẩu mới (khớp)
- [ ] Click "Đổi mật khẩu"
- [ ] Kiểm tra thông báo thành công
- [ ] Kiểm tra tự động đăng xuất sau 3 giây
- [ ] Đăng nhập lại với mật khẩu mới

#### Test Case 2: Validation Errors
- [ ] Mật khẩu hiện tại sai → Hiển thị lỗi
- [ ] Mật khẩu mới < 8 ký tự → Hiển thị lỗi
- [ ] Mật khẩu mới không có chữ hoa → Hiển thị lỗi
- [ ] Mật khẩu mới không có ký tự đặc biệt → Hiển thị lỗi
- [ ] Mật khẩu xác nhận không khớp → Hiển thị lỗi

#### Test Case 3: Password Strength Indicator
- [ ] Nhập mật khẩu yếu → Thanh đỏ "Yếu"
- [ ] Nhập mật khẩu trung bình → Thanh vàng "Trung bình"
- [ ] Nhập mật khẩu mạnh → Thanh xanh "Mạnh"

#### Test Case 4: Password Requirements
- [ ] Kiểm tra checkmarks cập nhật real-time:
  - [ ] ✓ Ít nhất 8 ký tự
  - [ ] ✓ Ít nhất 1 chữ hoa
  - [ ] ✓ Ít nhất 1 ký tự đặc biệt

### 5. Test Toggle Password Visibility

- [ ] Click icon mắt ở mật khẩu hiện tại → Hiển thị/ẩn
- [ ] Click icon mắt ở mật khẩu mới → Hiển thị/ẩn
- [ ] Click icon mắt ở xác nhận mật khẩu → Hiển thị/ẩn

## 🔍 API Testing

### Test 2FA APIs

#### 1. Get 2FA Status
```bash
curl http://localhost:8000/api/security/2fa/status/USER_ID
```

**Expected Response:**
```json
{
  "success": true,
  "two_factor_enabled": false,
  "user_email": "user@example.com"
}
```

#### 2. Enable 2FA
```bash
curl -X POST http://localhost:8000/api/security/2fa/enable \
  -H "Content-Type: application/json" \
  -d '{"user_id": "USER_ID"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đã bật xác thực 2FA thành công",
  "two_factor_enabled": true
}
```

#### 3. Disable 2FA
```bash
curl -X POST http://localhost:8000/api/security/2fa/disable \
  -H "Content-Type: application/json" \
  -d '{"user_id": "USER_ID", "password": "PASSWORD"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đã tắt xác thực 2FA thành công",
  "two_factor_enabled": false
}
```

#### 4. Verify 2FA Code
```bash
curl -X POST http://localhost:8000/api/security/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{"username": "USERNAME", "code": "123456"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Xác minh 2FA thành công",
  "user": { ... }
}
```

### Test Change Password API

```bash
curl -X POST http://localhost:8000/api/security/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_ID",
    "current_password": "OldPassword123!",
    "new_password": "NewPassword456!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

## [object Object] Scenarios

### 1. 2FA Errors

- [ ] Mã 2FA sai → "Mã 2FA không chính xác"
- [ ] Mã 2FA hết hạn (>10 phút) → "Mã 2FA đã hết hạn"
- [ ] Tắt 2FA với mật khẩu sai → "Mật khẩu không chính xác"

### 2. Password Errors

- [ ] Mật khẩu hiện tại sai → "Mật khẩu hiện tại không chính xác"
- [ ] Mật khẩu mới trùng mật khẩu cũ → "Mật khẩu mới không được trùng với mật khẩu hiện tại"
- [ ] Mật khẩu không đủ mạnh → Hiển thị lỗi validation

## 📱 Responsive Testing

- [ ] Desktop (>1024px) - Layout 2 cột
- [ ] Tablet (768px-1024px) - Layout 1 cột
- [ ] Mobile (<768px) - Layout 1 cột, full width

## 🎨 UI/UX Testing

### Visual Check
- [ ] Icons hiển thị đúng (Shield, Lock, Eye, etc.)
- [ ] Màu sắc phù hợp:
  - [ ] Xanh cho success/enabled
  - [ ] Đỏ cho error/disabled/danger
  - [ ] Vàng cho warning
- [ ] Border radius nhất quán
- [ ] Spacing hợp lý
- [ ] Font size và weight phù hợp

### Interaction Check
- [ ] Buttons có hover effect
- [ ] Inputs có focus effect
- [ ] Loading states hiển thị đúng
- [ ] Disabled states hoạt động đúng
- [ ] Animations mượt mà

### Accessibility Check
- [ ] Labels rõ ràng
- [ ] Error messages dễ hiểu
- [ ] Keyboard navigation hoạt động
- [ ] Screen reader friendly

## 🔐 Security Check

- [ ] Mật khẩu được hash (không lưu plain text)
- [ ] Mã 2FA có thời hạn
- [ ] Mã 2FA bị xóa sau khi sử dụng
- [ ] Yêu cầu mật khẩu khi tắt 2FA
- [ ] Validation ở cả frontend và backend

## 📊 Performance Check

- [ ] Trang load nhanh (<1s)
- [ ] API response nhanh (<500ms)
- [ ] Không có memory leaks
- [ ] Không có console errors
- [ ] Network requests tối ưu

## ✨ Final Checklist

- [ ] Backend khởi động không lỗi
- [ ] Frontend khởi động không lỗi
- [ ] Tất cả test cases pass
- [ ] UI/UX đẹp và nhất quán
- [ ] Responsive trên mọi devices
- [ ] Security measures hoạt động đúng
- [ ] Performance tốt
- [ ] Documentation đầy đủ

## 📝 Notes

### Test Accounts
```
Username: testuser
Password: TestPassword123!
Email: test@example.com
```

### Common Issues

1. **Email không gửi được**
   - Kiểm tra SMTP config trong `.env`
   - Xem log backend

2. **Mã 2FA không hợp lệ**
   - Kiểm tra thời gian hệ thống
   - Đảm bảo mã chưa hết hạn

3. **Frontend không connect được backend**
   - Kiểm tra CORS settings
   - Đảm bảo backend đang chạy

---

**Testing Date:** 2025-11-07
**Tester:** _____________
**Status:** [ ] Pass / [ ] Fail
**Notes:** _____________________________________________

