# MB Bank Payment Service

Microservice Node.js để tích hợp thanh toán MB Bank thực tế cho Vyron Fashion.

## Yêu cầu

- Node.js >= 16.x
- npm hoặc yarn
- Tài khoản MB Bank có thể đăng nhập qua app/web

## Cài đặt

1. Cài đặt dependencies:
```bash
cd backend/mb-service
npm install
```

2. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

3. Cấu hình thông tin MB Bank trong `.env`:
```env
MB_USERNAME=0987654321          # Số điện thoại/username MB Bank
MB_PASSWORD=YourPassword123!    # Mật khẩu MB Bank
MBBANK_SERVICE_SECRET=secret123 # Secret key (giống với backend Python)
PORT=4000
```

## Chạy service

### Development (với auto-reload):
```bash
npm run dev
```

### Production:
```bash
npm start
```

Service sẽ chạy tại: `http://localhost:4000`

## API Endpoints

### 1. Health Check
```bash
GET /health
```
Kiểm tra trạng thái service và kết nối MB Bank.

### 2. Lấy số dư tài khoản
```bash
GET /balance
Headers: x-mbbank-secret: <SECRET>
```

### 3. Tạo yêu cầu thanh toán
```bash
POST /transfer
Headers: 
  Content-Type: application/json
  x-mbbank-secret: <SECRET>
Body:
{
  "order_id": "64f2a1b2c3d4e5f6a7b8c9d0",
  "amount": 150000,
  "to_account": "1234567890",
  "to_name": "CONG TY VYRON FASHION",
  "description": "Thanh toan don hang VF20251125"
}
```

**Response:**
```json
{
  "success": true,
  "transaction_id": "MBPAY-64f2a1b2c3d4e5f6a7b8c9d0-1732531200000",
  "status": "pending",
  "payment_info": {
    "bank": "MB Bank (Ngân hàng Quân Đội)",
    "account_number": "1234567890",
    "account_name": "CONG TY VYRON FASHION",
    "amount": 150000,
    "description": "Thanh toan don hang VF20251125"
  },
  "instructions": [...]
}
```

### 4. Kiểm tra thanh toán
```bash
POST /check-payment
Headers:
  Content-Type: application/json
  x-mbbank-secret: <SECRET>
Body:
{
  "order_id": "64f2a1b2c3d4e5f6a7b8c9d0",
  "accountNumber": "1234567890",
  "amount": 150000,
  "fromDate": "25/11/2025"
}
```

**Response (đã thanh toán):**
```json
{
  "success": true,
  "paid": true,
  "transaction": {
    "transaction_id": "REF123456",
    "amount": 150000,
    "description": "Thanh toan don hang VF20251125",
    "date": "25/11/2025 14:30:00",
    "status": "completed"
  }
}
```

### 5. Lấy lịch sử giao dịch
```bash
POST /transactions
Headers:
  Content-Type: application/json
  x-mbbank-secret: <SECRET>
Body:
{
  "accountNumber": "1234567890",
  "fromDate": "20/11/2025",
  "toDate": "25/11/2025"
}
```

## Workflow thanh toán

1. **Frontend/Backend tạo đơn hàng** → Gọi `POST /api/payments/mbbank/initiate`
2. **Backend Python** → Forward đến `POST /transfer` của service này
3. **Service trả về thông tin chuyển khoản** cho khách hàng
4. **Khách hàng chuyển khoản** qua MB Bank app với nội dung chính xác
5. **Backend polling** → Gọi `POST /check-payment` định kỳ (ví dụ mỗi 30s)
6. **Tìm thấy giao dịch** → Cập nhật order status thành "completed"

## Lưu ý quan trọng

⚠️ **MB Bank API không hỗ trợ chuyển tiền tự động**. API chỉ hỗ trợ:
- Đăng nhập
- Xem số dư
- Xem lịch sử giao dịch

→ Khách hàng phải **TỰ CHUYỂN KHOẢN** qua MB Bank app/web banking.

→ Hệ thống sẽ **POLLING** (kiểm tra định kỳ) lịch sử giao dịch để xác nhận thanh toán.

## Bảo mật

- Luôn sử dụng HTTPS trong production
- Đặt `MBBANK_SERVICE_SECRET` mạnh và giống với backend Python
- Không commit file `.env` vào Git
- Giới hạn rate limit cho các endpoint
- Chỉ cho phép backend Python gọi service (whitelist IP nếu cần)

## Troubleshooting

### Lỗi đăng nhập MB Bank
- Kiểm tra `MB_USERNAME` và `MB_PASSWORD` trong `.env`
- Đảm bảo tài khoản MB Bank không bị khóa
- Thử đăng nhập qua app MB để kiểm tra

### OCR CAPTCHA fails
- Đổi `MB_OCR_METHOD=tesseract` (yêu cầu cài tesseract-ocr)
- Hoặc để `default` và đợi model tải về lần đầu (~5-10s)

### Service không kết nối được
- Kiểm tra port 4000 có bị chiếm không: `lsof -i :4000`
- Kiểm tra firewall/network settings
