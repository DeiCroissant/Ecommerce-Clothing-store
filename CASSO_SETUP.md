# ✅ Đã Hoàn Thành: Tích Hợp VietQR + Casso

## 📦 Đã Cài Đặt

- ✅ Module `payment_vietqr.py` với tất cả chức năng
- ✅ 3 endpoints mới:
  - `POST /api/payments/vietqr/initiate` - Tạo QR thanh toán
  - `POST /api/payments/casso/webhook` - Nhận webhook từ Casso
  - `GET /api/payments/status/{order_id}` - Kiểm tra trạng thái
- ✅ Dependencies: qrcode, pillow, httpx
- ✅ Schemas cập nhật trong `schemas.py`

## 🔧 Cấu hình `.env`

Mở file `backend/.env` và thêm:

```env
# VietQR Configuration
VIETQR_BANK_ID=970422
VIETQR_ACCOUNT_NUMBER=284280405
VIETQR_ACCOUNT_NAME=VYRON FASHION

# Casso Configuration (Sẽ có sau khi đăng ký)
CASSO_API_KEY=
CASSO_WEBHOOK_SECRET=
```

## 📝 Hướng Dẫn Đăng Ký Casso

### Bước 1: Đăng Ký Tài Khoản

1. Truy cập: https://casso.vn/dang-ky
2. Điền thông tin:
   - Họ tên: Vyron Fashion
   - Email: your-email@gmail.com
   - Số điện thoại: 0326791337
   - Mật khẩu
3. Xác nhận email

### Bước 2: Liên Kết MB Bank

1. Đăng nhập Casso: https://casso.vn/dang-nhap
2. Vào **Cài đặt** → **Ngân hàng**
3. Click **Thêm ngân hàng**
4. Chọn **MB Bank**
5. Nhập thông tin:
   - Số tài khoản: `284280405`
   - Tên chủ tài khoản: `VYRON FASHION`
6. Click **Lưu**

### Bước 3: Lấy API Key

1. Vào **Cài đặt** → **API**
2. Click **Tạo API Key**
3. Copy API Key
4. Paste vào `backend/.env`:
   ```env
   CASSO_API_KEY=AK_CS.xxxxxxxxxxxxxxx
   ```

### Bước 4: Cấu Hình Webhook

1. Vào **Cài đặt** → **Webhook**
2. Click **Thêm webhook**
3. Nhập thông tin:
   - URL: `https://your-domain.com/api/payments/casso/webhook`
   - Secret: (tự tạo, ví dụ: `VyronFashion2025Secret`)
4. Click **Lưu**
5. Copy Secret và paste vào `.env`:
   ```env
   CASSO_WEBHOOK_SECRET=VyronFashion2025Secret
   ```

### Bước 5: Test Webhook (Localhost)

Nếu đang develop ở localhost, dùng **ngrok** để expose:

```bash
# Cài ngrok
brew install ngrok

# Chạy backend
cd backend
python -m uvicorn app.main:app --reload

# Ở terminal khác, expose port
ngrok http 8000
```

Lấy URL từ ngrok (ví dụ: `https://abc123.ngrok.io`) và cập nhật webhook URL trong Casso:
```
https://abc123.ngrok.io/api/payments/casso/webhook
```

## 🧪 Test Thanh Toán

### 1. Tạo QR Code

```bash
curl -X POST http://localhost:8000/api/payments/vietqr/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "673e5a1b2c3d4e5f6a7b8c9d",
    "amount": 150000,
    "description": "Thanh toan don VF20251125"
  }'
```

**Response:**
```json
{
  "success": true,
  "order_id": "673e5a1b2c3d4e5f6a7b8c9d",
  "qr_data_url": "data:image/png;base64,iVBOR...",
  "vietqr_url": "https://img.vietqr.io/image/970422-284280405-compact2.png?amount=150000&addInfo=Thanh%20toan%20don%20673e5a1b2c3d4e5f6a7b8c9d",
  "payment_info": {
    "bank_name": "MB Bank",
    "account_number": "284280405",
    "amount": 150000,
    "description": "Thanh toan don 673e5a1b2c3d4e5f6a7b8c9d"
  }
}
```

### 2. Mở QR Code

- **Dùng data URL**: Copy `qr_data_url` vào browser
- **Dùng VietQR URL**: Mở `vietqr_url` trực tiếp

### 3. Quét Bằng App Ngân Hàng

1. Mở app MB Bank
2. Chọn **Quét QR**
3. Quét QR code
4. Kiểm tra thông tin:
   - Số tài khoản: 284280405
   - Số tiền: 150,000đ
   - Nội dung: Thanh toan don 673e5a1b2c3d4e5f6a7b8c9d
5. Xác nhận chuyển tiền

### 4. Kiểm Tra Webhook

Sau khi chuyển tiền, Casso sẽ gửi webhook về server. Check logs:

```bash
cd backend
tail -f nohup.out
# hoặc
python -m uvicorn app.main:app --reload
```

Sẽ thấy:
```
POST /api/payments/casso/webhook
{"success": true, "message": "Đã cập nhật thanh toán"}
```

### 5. Kiểm Tra Order Status

```bash
curl http://localhost:8000/api/payments/status/673e5a1b2c3d4e5f6a7b8c9d
```

**Response:**
```json
{
  "success": true,
  "order_id": "673e5a1b2c3d4e5f6a7b8c9d",
  "payment": {
    "provider": "vietqr",
    "status": "completed",
    "amount": 150000,
    "transaction_id": "FT123456789",
    "casso_id": 12345,
    "completed_at": "2025-11-25 14:30:00"
  },
  "paid": true
}
```

## 🚀 Tích Hợp Frontend

### 1. Tạo QR Code Page

```jsx
// src/app/payment/[orderId]/page.js
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function PaymentPage({ params }) {
  const [qrCode, setQrCode] = useState(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    // Tạo QR code
    fetch(`http://localhost:8000/api/payments/vietqr/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: params.orderId,
        amount: 150000,
        description: `Thanh toan don ${params.orderId}`
      })
    })
      .then(res => res.json())
      .then(data => setQrCode(data));

    // Poll status mỗi 5s
    const interval = setInterval(() => {
      fetch(`http://localhost:8000/api/payments/status/${params.orderId}`)
        .then(res => res.json())
        .then(data => {
          if (data.paid) {
            setPaid(true);
            clearInterval(interval);
          }
        });
    }, 5000);

    return () => clearInterval(interval);
  }, [params.orderId]);

  if (paid) {
    return <div className="text-green-600">✅ Thanh toán thành công!</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Thanh Toán</h1>
      
      {qrCode && (
        <div className="text-center">
          <img 
            src={qrCode.qr_data_url || qrCode.vietqr_url}
            alt="QR Code" 
            className="mx-auto mb-4"
          />
          
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Ngân hàng:</strong> MB Bank</p>
            <p><strong>Số TK:</strong> {qrCode.payment_info.account_number}</p>
            <p><strong>Số tiền:</strong> {qrCode.payment_info.amount.toLocaleString()}đ</p>
            <p><strong>Nội dung:</strong> {qrCode.payment_info.description}</p>
          </div>
          
          <p className="text-sm text-gray-600 mt-4">
            Quét mã QR bằng app ngân hàng để thanh toán
          </p>
        </div>
      )}
    </div>
  );
}
```

### 2. Redirect Sau Checkout

```jsx
// src/app/checkout/page.js
const handleCheckout = async () => {
  const response = await fetch('/api/orders/create', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
  
  const data = await response.json();
  
  // Redirect đến trang thanh toán
  router.push(`/payment/${data.order_id}`);
};
```

## 📊 Dashboard Casso

Theo dõi giao dịch tại: https://casso.vn/dashboard

- Xem tất cả giao dịch
- Export báo cáo
- Xem webhook logs
- Quản lý API keys

## ❓ Troubleshooting

### Webhook không hoạt động

1. **Check URL**: Đảm bảo webhook URL đúng và accessible
2. **Check Secret**: Verify `CASSO_WEBHOOK_SECRET` trong `.env`
3. **Check Logs**: Xem logs backend để debug
4. **Test Manually**: Dùng Postman gửi test webhook

### QR Code không hiển thị

1. **Check Dependencies**: `pip list | grep qrcode`
2. **Check API**: Test `https://img.vietqr.io/image/970422-284280405-compact2.png`
3. **Check Logs**: Xem logs backend

### Số tiền không khớp

1. **Check Format**: Casso gửi amount as integer (VND)
2. **Check Calculation**: Verify total_amount trong order
3. **Allow Tolerance**: Code cho phép sai lệch ±1đ

## 📞 Support

- Casso Docs: https://docs.casso.vn
- VietQR Docs: https://vietqr.io
- Email: support@casso.vn

---

**Chúc mừng! 🎉 Hệ thống thanh toán VietQR + Casso đã sẵn sàng!**
