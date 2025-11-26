# 💳 HỆ THỐNG THANH TOÁN CHUYỂN KHOẢN - VIETQR + CASSO

## 📋 MỤC LỤC
1. [Tổng Quan](#tổng-quan)
2. [Luồng Hoạt Động](#luồng-hoạt-động)
3. [Chi Tiết Từng Bước](#chi-tiết-từng-bước)
4. [API Endpoints](#api-endpoints)
5. [Cấu Hình](#cấu-hình)
6. [Testing](#testing)
7. [Xử Lý Lỗi](#xử-lý-lỗi)

---

## 🎯 TỔNG QUAN

Hệ thống sử dụng **VietQR** để tạo mã QR chuyển khoản và **Casso** để nhận thông báo khi khách hàng chuyển tiền.

### **Công nghệ sử dụng:**
- **VietQR**: Tạo mã QR code chuẩn ngân hàng Việt Nam
- **Casso**: Dịch vụ đọc SMS ngân hàng và gửi webhook khi có giao dịch mới
- **Webhook**: Casso tự động gửi thông báo về backend khi phát hiện chuyển khoản

### **Ưu điểm:**
✅ Tự động xác nhận thanh toán  
✅ Không cần nhập tay số tiền và nội dung  
✅ Khách hàng chỉ cần quét QR và xác nhận  
✅ Webhook real-time, không cần polling  

---

## 🔄 LUỒNG HOẠT ĐỘNG

```
┌──────────────┐
│  1. KHÁCH    │ Tạo đơn hàng
│     HÀNG     │ Chọn phương thức: Chuyển khoản
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│  2. FRONTEND GỌI API                         │
│  POST /api/payments/vietqr/initiate          │
│  {                                            │
│    "order_id": "673f1234...",                │
│    "amount": 500000,                         │
│    "description": "Thanh toan don 1234"     │
│  }                                            │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│  3. BACKEND TẠO QR CODE                      │
│  - Gọi VietQR API: img.vietqr.io            │
│  - Tạo URL QR với:                           │
│    + Số tài khoản                            │
│    + Số tiền                                 │
│    + Nội dung CK (có order_id)              │
│  - Lưu payment record vào DB:               │
│    {                                         │
│      "provider": "vietqr",                  │
│      "status": "pending",                   │
│      "amount": 500000,                      │
│      "qr_url": "https://..."                │
│    }                                         │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│  4. FRONTEND HIỂN THỊ QR CODE                │
│  - Hiển thị QR code cho khách quét           │
│  - Hiển thị thông tin:                       │
│    + Số tiền: 500,000đ                      │
│    + Ngân hàng: MB Bank                     │
│    + Số TK: xxx xxx xxx                     │
│    + Nội dung: Thanh toan don xxx...        │
│  - Poll API để check status:                 │
│    GET /api/payments/status/{order_id}      │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│  5. KHÁCH HÀNG CHUYỂN KHOẢN                  │
│  - Mở app ngân hàng                          │
│  - Quét QR code                              │
│  - Xác nhận chuyển tiền                      │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│  6. NGÂN HÀNG GỬI SMS                        │
│  - SMS về SĐT đăng ký Casso                 │
│  - Nội dung: "TK xxx CK 500,000đ..."        │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│  7. CASSO ĐỌC SMS VÀ GỬI WEBHOOK             │
│  - Casso đọc SMS từ điện thoại              │
│  - Parse thông tin giao dịch                 │
│  - Gửi POST request đến:                     │
│    https://your-domain.com/api/payments/    │
│           casso/webhook                      │
│  - Body:                                     │
│    {                                         │
│      "error": 0,                            │
│      "data": [{                             │
│        "id": 123456,                        │
│        "tid": "FT123...",                   │
│        "description": "Thanh toan don 673f",│
│        "amount": 500000,                    │
│        "when": "2025-11-27 10:30:00"       │
│      }]                                     │
│    }                                         │
│  - Header: X-Signature (HMAC SHA256)       │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│  8. BACKEND XỬ LÝ WEBHOOK                    │
│  a) Xác thực signature                       │
│  b) Parse order_id từ description            │
│  c) Kiểm tra order tồn tại                   │
│  d) So sánh số tiền                          │
│  e) Cập nhật DB:                             │
│     - payment.status = "completed"          │
│     - order.status = "processing"           │
│     - Lưu transaction_id, casso_id          │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│  9. FRONTEND NHẬN THÔNG BÁO                  │
│  - Poll API nhận status: "completed"         │
│  - Hiển thị: "Thanh toán thành công!"       │
│  - Redirect đến trang success                │
└──────────────────────────────────────────────┘
```

---

## 📝 CHI TIẾT TỪNG BƯỚC

### **BƯỚC 1-2: Khách hàng tạo đơn và request QR code**

**File:** `vyronfashion/src/app/checkout/page.js` (Frontend)

```javascript
// Khi khách chọn "Chuyển khoản" và submit đơn
const handleCheckout = async () => {
  // 1. Tạo order
  const orderResponse = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      items: cartItems,
      shipping_address: address,
      payment_method: 'bank_transfer'
    })
  });
  
  const { order_id } = await orderResponse.json();
  
  // 2. Request QR code
  const qrResponse = await fetch('/api/payments/vietqr/initiate', {
    method: 'POST',
    body: JSON.stringify({
      order_id: order_id,
      amount: totalAmount,
      description: `Thanh toan don ${order_id.slice(-8)}`
    })
  });
  
  const qrData = await qrResponse.json();
  // qrData.vietqr_url = URL của QR code
};
```

---

### **BƯỚC 3: Backend tạo QR code VietQR**

**File:** `backend/app/payment_vietqr.py`

```python
def generate_vietqr(account_number, bank_id, amount, description):
    """
    Tạo URL QR code từ VietQR API
    
    Không tự generate QR code vì format phức tạp,
    thay vào đó dùng API của VietQR để generate chuẩn
    """
    # Encode các tham số
    import urllib.parse
    description_encoded = urllib.parse.quote(description)
    account_name_encoded = urllib.parse.quote(VIETQR_ACCOUNT_NAME)
    
    # Tạo URL QR từ VietQR service
    vietqr_url = (
        f"https://img.vietqr.io/image/"
        f"{bank_id}-{account_number}-compact.png?"
        f"amount={int(amount)}&"
        f"addInfo={description_encoded}&"
        f"accountName={account_name_encoded}"
    )
    
    return {
        "success": True,
        "vietqr_url": vietqr_url,
        "payment_info": {
            "bank_name": "MB Bank",
            "bank_id": bank_id,
            "account_number": account_number,
            "amount": amount,
            "description": description
        }
    }
```

**File:** `backend/app/main.py` - Endpoint

```python
@app.post("/api/payments/vietqr/initiate")
async def vietqr_initiate(payload):
    # 1. Kiểm tra order tồn tại
    order = await orders_collection.find_one({"_id": ObjectId(payload.order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # 2. Tạo QR code
    result = await payment_integration.create_vietqr_payment(
        order_id=payload.order_id,
        amount=payload.amount,
        description=payload.description
    )
    
    # 3. Lưu payment record vào database
    payment_record = {
        "provider": "vietqr",
        "status": "pending",  # Chờ thanh toán
        "amount": payload.amount,
        "payment_info": result["payment_info"],
        "qr_url": result["vietqr_url"],
        "created_at": datetime.now().isoformat(),
    }
    
    await orders_collection.update_one(
        {"_id": ObjectId(payload.order_id)},
        {"$set": {"payment": payment_record}}
    )
    
    # 4. Trả về QR code URL
    return {
        "success": True,
        "order_id": payload.order_id,
        "vietqr_url": result["vietqr_url"],
        "payment_info": result["payment_info"]
    }
```

---

### **BƯỚC 4: Frontend hiển thị QR và poll status**

**File:** `vyronfashion/src/app/payment/page.js` (giả định)

```javascript
function PaymentPage({ orderId, qrUrl }) {
  const [paymentStatus, setPaymentStatus] = useState('pending');
  
  // Poll payment status mỗi 3 giây
  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/payments/status/${orderId}`);
      const data = await response.json();
      
      if (data.paid) {
        setPaymentStatus('completed');
        clearInterval(interval);
        // Redirect to success page
        router.push('/checkout/success');
      }
    }, 3000); // Check mỗi 3 giây
    
    return () => clearInterval(interval);
  }, [orderId]);
  
  return (
    <div>
      <h2>Quét mã QR để thanh toán</h2>
      <img src={qrUrl} alt="QR Code" />
      
      {paymentStatus === 'pending' && (
        <p>⏳ Đang chờ thanh toán...</p>
      )}
      {paymentStatus === 'completed' && (
        <p>✅ Thanh toán thành công!</p>
      )}
    </div>
  );
}
```

---

### **BƯỚC 5-6: Khách hàng chuyển khoản, ngân hàng gửi SMS**

**Khách hàng:**
1. Mở app ngân hàng (MB Bank, VietinBank, v.v.)
2. Chọn "Quét QR" hoặc "Chuyển khoản"
3. Quét QR code
4. App tự động điền:
   - Số tài khoản: xxx
   - Số tiền: 500,000đ
   - Nội dung: "Thanh toan don 673f1234"
5. Xác nhận OTP và chuyển tiền

**Ngân hàng:**
- Gửi SMS về số điện thoại đăng ký Casso:
  ```
  MB Bank: TK xxx da chuyen khoan 500,000 VND.
  Noi dung: Thanh toan don 673f1234.
  Tai khoan: 9999999999
  ```

---

### **BƯỚC 7: Casso đọc SMS và gửi webhook**

**Casso hoạt động:**
1. **App Casso** chạy trên điện thoại Android (hoặc đọc qua email)
2. Đọc SMS từ ngân hàng
3. Parse thông tin:
   - Số tiền: 500,000
   - Nội dung: "Thanh toan don 673f1234"
   - Thời gian: "2025-11-27 10:30:00"
4. Gửi **POST request** đến webhook URL đã cấu hình

**Webhook request:**
```http
POST https://your-domain.com/api/payments/casso/webhook
Content-Type: application/json
X-Signature: abc123...hash...

{
  "error": 0,
  "data": [
    {
      "id": 123456,
      "tid": "FT123456789",
      "description": "Thanh toan don 673f1234",
      "amount": 500000,
      "when": "2025-11-27 10:30:00",
      "bank_sub_acc_id": "xxx",
      "subAccId": "xxx"
    }
  ]
}
```

**X-Signature:** HMAC SHA256 của body với secret key

---

### **BƯỚC 8: Backend xử lý webhook**

**File:** `backend/app/main.py`

```python
@app.post("/api/payments/casso/webhook")
async def casso_webhook(request: Request):
    print("\n🔔 WEBHOOK RECEIVED FROM CASSO")
    
    # 1. Đọc raw body
    body = await request.body()
    body_str = body.decode()
    
    # 2. Parse JSON
    webhook_data = json.loads(body_str)
    
    # 3. Xác thực signature
    signature = request.headers.get("X-Signature", "")
    if not payment_integration.verify_casso_webhook(body_str, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    # 4. Lấy danh sách transactions
    transactions = webhook_data.get("data", [])
    
    # 5. Xử lý từng transaction
    for transaction in transactions:
        description = transaction.get("description", "")
        amount = transaction.get("amount", 0)
        tid = transaction.get("tid", "")
        
        # 6. Tìm order_id trong description
        # VD: "Thanh toan don 673f1234" -> order_id = "673f1234..."
        import re
        match = re.search(r'[a-f0-9]{24}', description.lower())
        if not match:
            continue
        
        order_id = match.group(0)
        
        # 7. Kiểm tra order tồn tại
        order = await orders_collection.find_one({"_id": ObjectId(order_id)})
        if not order:
            continue
        
        # 8. Kiểm tra số tiền khớp
        expected_amount = order.get("total_amount", 0)
        if abs(amount - expected_amount) > 1:  # Cho phép sai lệch 1đ
            print(f"❌ Số tiền không khớp: {amount} != {expected_amount}")
            continue
        
        # 9. Cập nhật payment status
        await orders_collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {
                "payment.status": "completed",
                "payment.transaction_id": tid,
                "payment.completed_at": transaction.get("when"),
                "status": "processing",  # Đơn chuyển sang xử lý
                "updated_at": datetime.now().isoformat()
            }}
        )
        
        print(f"✅ Đã cập nhật thanh toán cho order {order_id}")
    
    return {"success": True, "processed": len(transactions)}
```

**Xác thực signature:**

```python
# File: backend/app/payment_vietqr.py

def verify_casso_webhook(payload: str, signature: str) -> bool:
    """Xác thực webhook từ Casso bằng HMAC SHA256"""
    if not CASSO_WEBHOOK_SECRET or not signature:
        return True  # Test mode
    
    try:
        expected_signature = hmac.new(
            CASSO_WEBHOOK_SECRET.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
    except:
        return False
```

---

## 🔌 API ENDPOINTS

### **1. Tạo QR Code**
```http
POST /api/payments/vietqr/initiate
Content-Type: application/json

Request:
{
  "order_id": "673f1234567890abcdef1234",
  "amount": 500000,
  "description": "Thanh toan don 1234"
}

Response:
{
  "success": true,
  "order_id": "673f1234567890abcdef1234",
  "qr_data_url": null,
  "vietqr_url": "https://img.vietqr.io/image/970422-9999999999-compact.png?amount=500000&addInfo=Thanh+toan+don+1234&accountName=VYRON+FASHION",
  "payment_info": {
    "bank_name": "MB Bank (Ngân hàng Quân Đội)",
    "bank_id": "970422",
    "account_number": "9999999999",
    "account_name": "VYRON FASHION",
    "amount": 500000,
    "description": "Thanh toan don 1234"
  },
  "message": "QR code đã được tạo"
}
```

### **2. Webhook từ Casso**
```http
POST /api/payments/casso/webhook
Content-Type: application/json
X-Signature: abc123...

Request:
{
  "error": 0,
  "data": [
    {
      "id": 123456,
      "tid": "FT123456789",
      "description": "Thanh toan don 673f1234567890abcdef1234",
      "amount": 500000,
      "when": "2025-11-27 10:30:00",
      "bank_sub_acc_id": "xxx"
    }
  ]
}

Response:
{
  "success": true,
  "processed": 1,
  "results": [
    {
      "success": true,
      "message": "Đã cập nhật thanh toán cho order 673f1234567890abcdef1234",
      "order_id": "673f1234567890abcdef1234"
    }
  ]
}
```

### **3. Kiểm tra trạng thái thanh toán**
```http
GET /api/payments/status/673f1234567890abcdef1234

Response:
{
  "success": true,
  "order_id": "673f1234567890abcdef1234",
  "payment": {
    "provider": "vietqr",
    "status": "completed",
    "amount": 500000,
    "transaction_id": "FT123456789",
    "casso_id": 123456,
    "completed_at": "2025-11-27 10:30:00"
  },
  "paid": true
}
```

---

## ⚙️ CẤU HÌNH

### **File `.env` (Backend)**

```env
# VietQR Configuration
VIETQR_BANK_ID=970422              # MB Bank code
VIETQR_ACCOUNT_NUMBER=9999999999   # Số tài khoản nhận tiền
VIETQR_ACCOUNT_NAME=VYRON FASHION  # Tên chủ tài khoản

# Casso Configuration
CASSO_API_KEY=your_casso_api_key_here
CASSO_WEBHOOK_SECRET=your_webhook_secret_here
```

### **Cấu hình Casso**

1. **Đăng ký Casso:** https://casso.vn
2. **Cài app** trên điện thoại Android
3. **Cho phép** đọc SMS ngân hàng
4. **Cấu hình webhook:**
   - URL: `https://your-domain.com/api/payments/casso/webhook`
   - Secret: Tạo secret key mạnh (dùng để HMAC)
5. **Test webhook** bằng chức năng "Test Webhook" trong Casso

---

## 🧪 TESTING

### **1. Test tạo QR code**

```bash
curl -X POST http://localhost:8000/api/payments/vietqr/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "673f1234567890abcdef1234",
    "amount": 50000,
    "description": "Test payment"
  }'
```

### **2. Test webhook (Mock)**

**File:** `backend/test_webhook_receive.py`

```python
import requests
import json
import hmac
import hashlib

# Webhook data
webhook_data = {
    "error": 0,
    "data": [{
        "id": 999999,
        "tid": "TEST123456",
        "description": "Thanh toan don 673f1234567890abcdef1234",
        "amount": 50000,
        "when": "2025-11-27 12:00:00"
    }]
}

# Convert to JSON string
payload = json.dumps(webhook_data)

# Generate signature
secret = "your_webhook_secret_here"
signature = hmac.new(
    secret.encode(),
    payload.encode(),
    hashlib.sha256
).hexdigest()

# Send webhook
response = requests.post(
    "http://localhost:8000/api/payments/casso/webhook",
    headers={
        "Content-Type": "application/json",
        "X-Signature": signature
    },
    data=payload
)

print(response.json())
```

---

## ⚠️ XỬ LÝ LỖI

### **Lỗi thường gặp:**

#### **1. Webhook không nhận được**
**Nguyên nhân:**
- Casso chưa cài đúng
- URL webhook sai
- Firewall chặn

**Giải pháp:**
- Check logs backend
- Test webhook từ Casso dashboard
- Ensure URL public và https

#### **2. Signature không hợp lệ**
**Nguyên nhân:**
- Secret key sai
- Body bị modify

**Giải pháp:**
```python
# Debug signature
print(f"Expected: {expected_signature}")
print(f"Received: {signature}")
print(f"Body: {body_str}")
```

#### **3. Không tìm thấy order_id**
**Nguyên nhân:**
- Description không chứa order_id
- Regex không match

**Giải pháp:**
```python
# Đảm bảo description có format:
description = f"Thanh toan don {order_id}"

# Test regex:
import re
match = re.search(r'[a-f0-9]{24}', description.lower())
print(match.group(0) if match else "Not found")
```

#### **4. Số tiền không khớp**
**Nguyên nhân:**
- Làm tròn khác nhau
- Khách chuyển sai

**Giải pháp:**
```python
# Cho phép sai lệch 1đ
if abs(amount - expected_amount) > 1:
    # Báo lỗi
```

---

## 📊 MONITORING & LOGS

### **Logs quan trọng cần theo dõi:**

```python
# Backend logs
print("🔔 WEBHOOK RECEIVED FROM CASSO")
print(f"💵 Amount: {amount:,}đ")
print(f"📝 Description: {description}")
print(f"🎯 Found Order ID: {order_id}")
print(f"✅ Payment updated successfully")
```

### **Metrics cần track:**
- Số webhook nhận được / ngày
- Số thanh toán thành công / thất bại
- Thời gian từ QR → webhook (average)
- Số lỗi signature / số lỗi số tiền

---

## 🔐 BẢO MẬT

### **Best practices:**

1. **Luôn verify signature** từ Casso
2. **Dùng HTTPS** cho webhook URL
3. **Không log** sensitive data (số TK, API key)
4. **Rate limit** webhook endpoint
5. **Validate** tất cả input từ webhook
6. **Double check** số tiền và order_id

---

## 📞 HỖ TRỢ

- **Casso:** support@casso.vn
- **VietQR:** https://vietqr.io
- **Docs:** https://docs.casso.vn

---

## 🎓 KẾT LUẬN

Hệ thống hoạt động tự động từ đầu đến cuối:
1. ✅ Tạo QR tự động
2. ✅ Khách quét và chuyển
3. ✅ Webhook tự động cập nhật
4. ✅ Frontend nhận thông báo real-time

**Không cần admin can thiệp!** 🚀
