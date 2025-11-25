# Hướng dẫn tích hợp thanh toán MB Bank

## Tổng quan

Hệ thống thanh toán MB Bank bao gồm 2 phần:

1. **MB Bank Service** (Node.js) - Microservice xử lý API MB Bank
2. **Backend Python** (FastAPI) - API chính của Vyron Fashion

## Kiến trúc

```
Frontend (Next.js)
    ↓
Backend Python (FastAPI)
    ↓
MB Bank Service (Node.js)
    ↓
MB Bank API (Official)
```

## Workflow thanh toán

1. **Khách hàng tạo đơn hàng** → Chọn thanh toán MB Bank
2. **Frontend gọi** `POST /api/payments/mbbank/initiate`
3. **Backend Python** forward request tới MB Service
4. **MB Service** trả về thông tin chuyển khoản (STK, số tiền, nội dung)
5. **Khách hàng chuyển khoản** qua MB Bank app với nội dung đúng
6. **Frontend polling** `POST /api/payments/mbbank/check/{order_id}` mỗi 30s
7. **MB Service** kiểm tra lịch sử giao dịch, tìm transaction khớp
8. **Backend cập nhật** order status → `processing` → `completed`

## Cài đặt

### 1. Cấu hình MB Bank Service

```bash
cd backend/mb-service
npm install
cp .env.example .env
```

Chỉnh sửa `.env`:
```env
MB_USERNAME=0987654321              # Số điện thoại MB Bank
MB_PASSWORD=YourStrongPassword!     # Mật khẩu MB Bank
MBBANK_SERVICE_SECRET=random_secret_key_123
PORT=4000
```

Chạy service:
```bash
# Development
npm run dev

# Production
npm start
```

### 2. Cấu hình Backend Python

Thêm vào `backend/.env`:
```env
MBBANK_SERVICE_URL=http://localhost:4000
MBBANK_SERVICE_SECRET=random_secret_key_123
MBBANK_ACCOUNT_NUMBER=1234567890    # STK nhận tiền
```

Cài đặt dependencies (đã có httpx):
```bash
cd backend
pip install -r requirements.txt
```

## API Endpoints

### Backend Python

#### 1. Khởi tạo thanh toán
```bash
POST /api/payments/mbbank/initiate
Content-Type: application/json

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
  "message": "Yêu cầu thanh toán đã được tạo",
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

#### 2. Kiểm tra thanh toán (Polling)
```bash
POST /api/payments/mbbank/check/{order_id}
```

**Response (chưa thanh toán):**
```json
{
  "success": true,
  "paid": false,
  "message": "Chưa tìm thấy giao dịch thanh toán"
}
```

**Response (đã thanh toán):**
```json
{
  "success": true,
  "paid": true,
  "message": "Thanh toán thành công",
  "transaction": {
    "transaction_id": "REF123456",
    "amount": 150000,
    "description": "Thanh toan don hang VF20251125",
    "date": "25/11/2025 14:30:00",
    "status": "completed"
  }
}
```

#### 3. Lấy trạng thái thanh toán
```bash
GET /api/payments/mbbank/status/{order_id}
```

## Frontend Integration (Next.js)

### 1. Tạo payment request
```javascript
// src/lib/api/payment.js
export async function initiateMBBankPayment(orderId, amount) {
  const response = await fetch(`${API_URL}/api/payments/mbbank/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: orderId,
      amount: amount,
      to_account: process.env.NEXT_PUBLIC_MBBANK_ACCOUNT,
      to_name: 'CONG TY VYRON FASHION',
      description: `Thanh toan don hang ${orderId}`
    })
  });
  return response.json();
}

export async function checkMBBankPayment(orderId) {
  const response = await fetch(`${API_URL}/api/payments/mbbank/check/${orderId}`, {
    method: 'POST'
  });
  return response.json();
}
```

### 2. Payment component với polling
```javascript
// src/components/MBBankPayment.js
import { useState, useEffect } from 'react';

export default function MBBankPayment({ orderId, amount }) {
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [checking, setChecking] = useState(false);

  // Khởi tạo payment khi mount
  useEffect(() => {
    initiateMBBankPayment(orderId, amount).then(data => {
      if (data.success) {
        setPaymentInfo(data);
      }
    });
  }, [orderId, amount]);

  // Polling để check payment (mỗi 30s)
  useEffect(() => {
    if (isPaid) return;

    const interval = setInterval(async () => {
      setChecking(true);
      const result = await checkMBBankPayment(orderId);
      setChecking(false);

      if (result.paid) {
        setIsPaid(true);
        clearInterval(interval);
        // Redirect hoặc show success message
        window.location.href = `/orders/${orderId}?payment=success`;
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [orderId, isPaid]);

  return (
    <div className="mb-payment">
      {paymentInfo && (
        <>
          <h3>Thông tin chuyển khoản</h3>
          <div className="payment-info">
            <p><strong>Ngân hàng:</strong> {paymentInfo.payment_info.bank}</p>
            <p><strong>Số tài khoản:</strong> {paymentInfo.payment_info.account_number}</p>
            <p><strong>Chủ tài khoản:</strong> {paymentInfo.payment_info.account_name}</p>
            <p><strong>Số tiền:</strong> {paymentInfo.payment_info.amount.toLocaleString('vi-VN')} VND</p>
            <p><strong>Nội dung:</strong> {paymentInfo.payment_info.description}</p>
          </div>

          <div className="instructions">
            <h4>Hướng dẫn:</h4>
            {paymentInfo.instructions.map((step, i) => (
              <p key={i}>{step}</p>
            ))}
          </div>

          {checking && <p>Đang kiểm tra thanh toán...</p>}
          {isPaid && <p className="success">✅ Thanh toán thành công!</p>}
        </>
      )}
    </div>
  );
}
```

## Lưu ý quan trọng

### ⚠️ Giới hạn của MB Bank API

MB Bank API **KHÔNG hỗ trợ**:
- ❌ Chuyển tiền tự động
- ❌ Tạo QR code thanh toán
- ❌ Webhook/callback trực tiếp

MB Bank API **chỉ hỗ trợ**:
- ✅ Đăng nhập
- ✅ Xem số dư
- ✅ Xem lịch sử giao dịch

→ **Khách hàng phải tự chuyển khoản** qua MB Bank app/web banking
→ **Hệ thống polling** (kiểm tra định kỳ) lịch sử giao dịch để xác nhận

### 🔒 Bảo mật

1. **Secret key**: Đặt `MBBANK_SERVICE_SECRET` giống nhau ở cả 2 service
2. **HTTPS**: Luôn dùng HTTPS trong production
3. **Credentials**: Không commit `.env` vào Git
4. **Rate limiting**: Giới hạn số lần gọi API để tránh spam
5. **IP Whitelist**: Chỉ cho backend Python gọi MB service

### 📝 Nội dung chuyển khoản

Để dễ tìm giao dịch, nội dung chuyển khoản nên:
- Chứa `order_id` hoặc `order_number`
- Ngắn gọn, rõ ràng
- Không dấu tiếng Việt (tùy chọn)

Ví dụ: `Thanh toan don hang VF20251125`

### 🔄 Polling interval

- **Development**: 30 giây (tránh spam API)
- **Production**: 30-60 giây
- **Timeout**: Dừng polling sau 30 phút nếu chưa có giao dịch

### 💾 Lưu trữ

Order collection sẽ có thêm field:
```json
{
  "payment": {
    "provider": "mbbank",
    "transaction_id": "MBPAY-...",
    "status": "pending|completed|failed",
    "payment_info": {...},
    "created_at": "2025-11-25T...",
    "completed_at": "2025-11-25T..."
  }
}
```

## Testing

### 1. Test MB Service
```bash
# Health check
curl http://localhost:4000/health

# Get balance
curl -H "x-mbbank-secret: your_secret" http://localhost:4000/balance
```

### 2. Test Backend
```bash
# Initiate payment
curl -X POST http://localhost:8000/api/payments/mbbank/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "test123",
    "amount": 100000,
    "to_account": "1234567890"
  }'

# Check payment
curl -X POST http://localhost:8000/api/payments/mbbank/check/test123
```

### 3. Test full flow
1. Tạo đơn hàng test
2. Gọi initiate để lấy thông tin chuyển khoản
3. Chuyển khoản thật qua MB Bank app với nội dung chính xác
4. Gọi check payment để xác nhận
5. Kiểm tra order status đã chuyển sang `processing`

## Deployment

### Production checklist
- [ ] Đổi `MBBANK_SERVICE_URL` thành URL production
- [ ] Đặt `MBBANK_SERVICE_SECRET` mạnh (>= 32 ký tự)
- [ ] Cấu hình HTTPS cho cả 2 services
- [ ] Setup firewall: chỉ backend Python được gọi MB service
- [ ] Enable rate limiting
- [ ] Setup monitoring & logging
- [ ] Backup database thường xuyên
- [ ] Test kỹ trước khi launch

### Docker deployment (optional)
```dockerfile
# backend/mb-service/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 4000
CMD ["node", "index.js"]
```

```bash
docker build -t mbbank-service ./backend/mb-service
docker run -d --env-file ./backend/mb-service/.env -p 4000:4000 mbbank-service
```

## Troubleshooting

### MB Service không kết nối được
- Kiểm tra `MB_USERNAME` và `MB_PASSWORD`
- Thử đăng nhập MB Bank app để test credentials
- Kiểm tra network/firewall

### Polling không tìm thấy giao dịch
- Đảm bảo nội dung chuyển khoản chứa `order_id`
- Kiểm tra `MBBANK_ACCOUNT_NUMBER` đúng chưa
- Tăng `days_back` trong check_payment (mặc định 1 ngày)

### Backend lỗi timeout
- Tăng timeout httpx trong `mbbank.py`
- Kiểm tra MB service có đang chạy không

## Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs của cả 2 services
2. Test từng endpoint riêng lẻ
3. Xem README trong `backend/mb-service/`
4. Check GitHub issues của repo `CookieGMVN/MBBank`
