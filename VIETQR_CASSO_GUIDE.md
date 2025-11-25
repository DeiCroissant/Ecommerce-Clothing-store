# VietQR + Casso Payment Integration Guide

## ✅ Đã hoàn thành

1. **Tạo module payment_vietqr.py** với các chức năng:
   - Tạo QR code VietQR
   - Xác thực webhook từ Casso
   - Lấy giao dịch từ Casso API

2. **Thêm dependencies**:
   - `qrcode[pil]` - Tạo QR code
   - `pillow` - Xử lý ảnh
   - `httpx` - Gọi API Casso

3. **Cập nhật schemas.py** với:
   - `VietQRInitiateRequest/Response`
   - `CassoWebhookPayload`
   - `PaymentStatusResponse`

## 🚀 Bước tiếp theo

### 1. Cài đặt dependencies mới

```bash
cd /Users/quangvinh3020/Desktop/web/Ecommerce-Clothing-store/backend
pip install -r requirements.txt
```

### 2. Đăng ký Casso

1. Truy cập: https://casso.vn/dang-ky
2. Đăng ký tài khoản (free 7 ngày)
3. Liên kết MB Bank: Cài đặt → Ngân hàng → Thêm ngân hàng
4. Lấy API key: Cài đặt → API → Lấy API Key
5. Tạo Webhook: Cài đặt → Webhook → Thêm webhook

### 3. Cấu hình backend/.env

Thêm vào file `backend/.env`:

```env
# VietQR Configuration
VIETQR_BANK_ID=970422
VIETQR_ACCOUNT_NUMBER=284280405
VIETQR_ACCOUNT_NAME=VYRON FASHION

# Casso Configuration
CASSO_API_KEY=your_casso_api_key_here
CASSO_WEBHOOK_SECRET=your_webhook_secret_here
```

### 4. API Endpoints mới

#### Tạo QR thanh toán
```bash
POST /api/payments/vietqr/initiate
Content-Type: application/json

{
  "order_id": "673e5a1b2c3d4e5f6a7b8c9d",
  "amount": 150000,
  "description": "Thanh toan don VF20251125"
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "673e5a1b2c3d4e5f6a7b8c9d",
  "qr_data_url": "data:image/png;base64,...",
  "vietqr_url": "https://img.vietqr.io/image/970422-284280405-compact2.png?...",
  "payment_info": {
    "bank_name": "MB Bank",
    "account_number": "284280405",
    "amount": 150000,
    "description": "Thanh toan don VF20251125"
  }
}
```

#### Webhook từ Casso
```bash
POST /api/payments/casso/webhook
Content-Type: application/json
X-Signature: hmac_signature_here

{
  "id": 12345,
  "tid": "FT123456",
  "description": "Thanh toan don 673e5a1b2c3d4e5f6a7b8c9d",
  "amount": 150000,
  "when": "2025-11-25 14:30:00",
  "bank_sub_acc_id": "12345"
}
```

#### Kiểm tra trạng thái
```bash
GET /api/payments/status/{order_id}
```

## 🔄 Workflow hoàn chỉnh

1. **Khách tạo đơn** → Frontend gọi `/api/payments/vietqr/initiate`
2. **Hiển thị QR** → Khách quét QR bằng app ngân hàng
3. **Khách chuyển tiền** → Tiền vào STK `284280405`
4. **Casso phát hiện** → Gửi webhook về server
5. **Server cập nhật** → Order status → `processing`
6. **Hoàn tất** → Gửi email xác nhận

## 📝 Thêm endpoints vào main.py

Thêm vào `backend/app/main.py` (sau dòng 1800):

```python
# ==================== VIETQR + CASSO PAYMENT ENDPOINTS ====================
@app.post("/api/payments/vietqr/initiate", response_model=schemas.VietQRInitiateResponse)
async def vietqr_initiate(payload: schemas.VietQRInitiateRequest):
    """Tạo QR code VietQR cho thanh toán."""
    # Kiểm tra order tồn tại
    order = await orders_collection.find_one({"_id": ObjectId(payload.order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy order")

    # Tạo QR code
    result = await payment_integration.create_vietqr_payment(
        order_id=payload.order_id,
        amount=payload.amount,
        description=payload.description or f"Thanh toan don {payload.order_id[-8:]}"
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("message"))

    # Lưu thông tin payment
    payment_record = {
        "provider": "vietqr",
        "status": "pending",
        "amount": payload.amount,
        "payment_info": result.get("payment_info"),
        "qr_url": result.get("vietqr_url"),
        "created_at": datetime.now().isoformat(),
    }

    await orders_collection.update_one(
        {"_id": ObjectId(payload.order_id)},
        {"$set": {"payment": payment_record}}
    )

    return schemas.VietQRInitiateResponse(
        success=True,
        order_id=payload.order_id,
        qr_code=result.get("qr_code"),
        qr_data_url=result.get("qr_data_url"),
        payment_info=result.get("payment_info"),
        message="QR code đã được tạo"
    )


@app.post("/api/payments/casso/webhook")
async def casso_webhook(
    request: Request,
    payload: schemas.CassoWebhookPayload
):
    """Nhận webhook từ Casso khi có giao dịch mới."""
    # Xác thực webhook (nếu có secret)
    body = await request.body()
    signature = request.headers.get("X-Signature", "")
    
    if not payment_integration.verify_casso_webhook(body.decode(), signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Tìm order_id trong description
    description = payload.description.lower()
    order_id = None
    
    # Tìm pattern: order_id (24 ký tự hex)
    import re
    match = re.search(r'[a-f0-9]{24}', description)
    if match:
        order_id = match.group(0)
    
    if not order_id:
        return {"success": False, "message": "Không tìm thấy order_id trong description"}

    # Kiểm tra order tồn tại
    order = await orders_collection.find_one({"_id": ObjectId(order_id)})
    if not order:
        return {"success": False, "message": "Order không tồn tại"}

    # Kiểm tra số tiền khớp
    expected_amount = order.get("total_amount", 0)
    if abs(payload.amount - expected_amount) > 1:  # Cho phép sai lệch 1đ
        return {"success": False, "message": "Số tiền không khớp"}

    # Cập nhật payment status
    await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {
            "payment.status": "completed",
            "payment.transaction_id": payload.tid,
            "payment.casso_id": payload.id,
            "payment.completed_at": payload.when,
            "status": "processing",
            "updated_at": datetime.now().isoformat()
        }}
    )

    return {"success": True, "message": "Đã cập nhật thanh toán"}


@app.get("/api/payments/status/{order_id}", response_model=schemas.PaymentStatusResponse)
async def get_payment_status(order_id: str = Path(...)):
    """Lấy trạng thái thanh toán của order."""
    order = await orders_collection.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    payment = order.get("payment", {})
    
    return schemas.PaymentStatusResponse(
        success=True,
        order_id=order_id,
        payment=payment,
        paid=payment.get("status") == "completed"
    )
```

## ✅ Checklist

- [ ] Cài đặt dependencies: `pip install -r requirements.txt`
- [ ] Đăng ký Casso tại https://casso.vn
- [ ] Liên kết MB Bank với Casso
- [ ] Lấy Casso API key
- [ ] Cập nhật `backend/.env` với config VietQR và Casso
- [ ] Thêm endpoints mới vào `backend/app/main.py`
- [ ] Test tạo QR code
- [ ] Test webhook từ Casso
- [ ] Deploy và verify

## 📞 Support

Gặp vấn đề? Check:
- Casso dashboard: https://casso.vn/dashboard
- VietQR docs: https://vietqr.io/
- Logs backend để debug
