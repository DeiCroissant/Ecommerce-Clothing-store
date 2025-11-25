# 🏦 MB Bank Payment Integration - Quick Start

## Tích hợp thanh toán MB Bank THẬT (không dùng mock)

Hệ thống bao gồm:
- ✅ MB Bank Service (Node.js) - Kết nối trực tiếp MB Bank API
- ✅ Backend Python (FastAPI) - API chính
- ✅ Polling system - Tự động kiểm tra thanh toán

---

## 🚀 Bước 1: Cấu hình MB Bank Service

```bash
cd backend/mb-service
cp .env.example .env
```

Chỉnh sửa `backend/mb-service/.env`:
```env
MB_USERNAME=0987654321              # ← Số điện thoại MB Bank của bạn
MB_PASSWORD=YourPassword123!        # ← Mật khẩu MB Bank
MBBANK_SERVICE_SECRET=my_secret_123 # ← Tạo secret key bất kỳ
PORT=4000
```

**⚠️ LƯU Ý:**
- Đây là tài khoản MB Bank THẬT của bạn
- Service sẽ đăng nhập vào tài khoản này để xem lịch sử giao dịch
- KHÔNG share credentials này với ai

---

## 🔧 Bước 2: Cấu hình Backend Python

```bash
cd backend
cp .env.example .env
```

Chỉnh sửa `backend/.env` - Thêm các dòng sau:
```env
# MB Bank Settings
MBBANK_SERVICE_URL=http://localhost:4000
MBBANK_SERVICE_SECRET=my_secret_123      # ← Giống với mb-service
MBBANK_ACCOUNT_NUMBER=1234567890         # ← STK nhận tiền
```

**⚠️ STK nhận tiền:**
- Đây là STK của shop/công ty bạn
- Khách hàng sẽ chuyển tiền VÀO STK này
- Thường là STK khác với `MB_USERNAME` (STK dùng để login)

---

## 📦 Bước 3: Cài đặt dependencies

### MB Service (Node.js)
```bash
cd backend/mb-service
npm install
```

### Backend Python
```bash
cd backend
pip install -r requirements.txt
```

---

## 🎯 Bước 4: Chạy hệ thống

### Cách 1: Chạy từng service riêng

**Terminal 1 - MB Service:**
```bash
cd backend/mb-service
npm start
```

**Terminal 2 - Backend API:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 3 - Frontend:**
```bash
cd vyronfashion
npm run dev
```

### Cách 2: Chạy tất cả cùng lúc (macOS/Linux)
```bash
./START_WITH_MBBANK.sh
```

---

## ✅ Kiểm tra hoạt động

### 1. Test MB Service
```bash
curl http://localhost:4000/health
```
Kết quả mong muốn:
```json
{
  "success": true,
  "status": "running",
  "mb_connected": true
}
```

### 2. Test Backend API
Mở trình duyệt: http://localhost:8000/docs

### 3. Test full flow
1. Tạo đơn hàng test
2. Chọn thanh toán MB Bank
3. Hệ thống hiển thị thông tin chuyển khoản
4. Chuyển khoản THẬT qua MB Bank app
5. Chờ 30s, hệ thống tự động xác nhận thanh toán

---

## 🔄 Workflow thanh toán

```
Khách hàng tạo đơn
    ↓
Chọn "MB Bank"
    ↓
Hiển thị: STK, Số tiền, Nội dung
    ↓
Khách chuyển khoản qua MB app
    ↓
Hệ thống polling (30s/lần)
    ↓
Tìm thấy giao dịch → ✅ Thành công
```

---

## 📝 Ví dụ API

### Khởi tạo thanh toán
```bash
curl -X POST http://localhost:8000/api/payments/mbbank/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "673e5a1b2c3d4e5f6a7b8c9d",
    "amount": 150000,
    "to_account": "1234567890",
    "description": "Thanh toan don VF20251125"
  }'
```

### Kiểm tra thanh toán
```bash
curl -X POST http://localhost:8000/api/payments/mbbank/check/673e5a1b2c3d4e5f6a7b8c9d
```

---

## ⚠️ Lưu ý quan trọng

### MB Bank API Limitations
- ❌ **KHÔNG** tự động chuyển tiền
- ❌ **KHÔNG** tạo QR code thanh toán
- ✅ **CHỈ** xem lịch sử giao dịch

→ **Khách hàng phải TỰ chuyển khoản** qua MB app/web banking

### Nội dung chuyển khoản
Khách hàng phải ghi đúng nội dung, ví dụ:
```
Thanh toan don VF20251125
```

Hệ thống sẽ tìm order_id trong description để xác nhận.

### Polling interval
- Mỗi 30 giây kiểm tra 1 lần
- Timeout sau 30 phút nếu chưa có giao dịch
- Frontend tự động polling khi khách chọn MB Bank

---

## 🔒 Bảo mật

- ✅ Đặt `MBBANK_SERVICE_SECRET` mạnh (>= 32 ký tự)
- ✅ Không commit file `.env` vào Git
- ✅ Dùng HTTPS trong production
- ✅ Whitelist IP backend Python → MB Service
- ✅ Enable rate limiting

---

## 📚 Tài liệu chi tiết

Xem hướng dẫn đầy đủ tại: [MBBANK_INTEGRATION_GUIDE.md](./MBBANK_INTEGRATION_GUIDE.md)

---

## 🆘 Troubleshooting

### MB Service báo lỗi đăng nhập
- Kiểm tra `MB_USERNAME` và `MB_PASSWORD`
- Thử đăng nhập MB app để test
- Tài khoản có bị khóa không?

### Không tìm thấy giao dịch
- Kiểm tra `MBBANK_ACCOUNT_NUMBER` đúng chưa
- Nội dung chuyển khoản có chứa order_id không?
- Thử tăng `days_back` lên 7 ngày

### Backend timeout
- MB Service có đang chạy không?
- Check `MBBANK_SERVICE_URL` đúng không?

---

## 📞 Support

Gặp vấn đề? Check:
1. Logs của MB Service: `backend/mb-service/`
2. Logs của Backend: terminal chạy uvicorn
3. GitHub issues: [CookieGMVN/MBBank](https://github.com/CookieGMVN/MBBank/issues)

---

**Chúc bạn tích hợp thành công! 🎉**
