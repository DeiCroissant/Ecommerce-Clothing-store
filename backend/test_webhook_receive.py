"""
Script để test webhook từ Casso
Kiểm tra xem backend có nhận được webhook không
"""
import asyncio
import httpx
from datetime import datetime

async def test_webhook():
    """Gửi test webhook giống format Casso thực tế"""
    
    webhook_url = "http://localhost:8000/api/payments/casso/webhook"
    
    # Giả lập webhook data từ Casso (format thực tế)
    test_webhook_data = {
        "error": 0,
        "data": [
            {
                "id": 12345678,
                "tid": "FT24325123456789",
                "description": "Thanh toan don 677c5470f8b6a1234567890a",  # Order ID 24 ký tự hex
                "amount": 500000,
                "when": datetime.now().isoformat(),
                "bank_sub_acc_id": "284280405",
                "subAccId": "284280405"
            }
        ]
    }
    
    print("=" * 60)
    print("🧪 TEST WEBHOOK CASSO")
    print("=" * 60)
    print(f"URL: {webhook_url}")
    print(f"Payload: {test_webhook_data}")
    print()
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Không gửi signature trong test - backend sẽ check
            response = await client.post(
                webhook_url,
                json=test_webhook_data,
                headers={
                    "Content-Type": "application/json",
                    # Trong production, Casso sẽ gửi X-Signature header
                }
            )
            
            print(f"✅ Response Status: {response.status_code}")
            print(f"📦 Response Body:")
            print(response.json())
            
            if response.status_code == 200:
                print("\n✅ Backend có thể nhận webhook!")
            elif response.status_code == 401:
                print("\n⚠️  Backend yêu cầu signature - đây là điều tốt!")
                print("💡 Casso sẽ gửi signature trong production")
            else:
                print(f"\n❌ Lỗi: {response.status_code}")
                
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n💡 Kiểm tra:")
        print("  1. Backend có đang chạy không? (python -m uvicorn app.main:app --reload)")
        print("  2. Port 8000 có available không?")

async def check_casso_webhook_config():
    """Kiểm tra config webhook trên Casso"""
    print("\n" + "=" * 60)
    print("📋 HƯỚNG DẪN CẤU HÌNH WEBHOOK TRÊN CASSO")
    print("=" * 60)
    print()
    print("1. Đăng nhập Casso.vn: https://casso.vn/dang-nhap")
    print()
    print("2. Liên kết tài khoản MB Bank:")
    print("   - Vào: Cài đặt → Ngân hàng → Thêm ngân hàng")
    print("   - Chọn: MB Bank")
    print("   - Số tài khoản: 284280405")
    print("   - Tên: TRAN QUANG VINH")
    print()
    print("3. Cấu hình Webhook:")
    print("   - Vào: Cài đặt → Webhook")
    print("   - Webhook URL: http://157.66.80.32:8000/api/payments/casso/webhook")
    print("   - Webhook Secret: VyronFashion2025Secret")
    print("   - Bật: Gửi webhook khi có giao dịch mới")
    print()
    print("4. Test webhook trên Casso:")
    print("   - Click nút 'Test Webhook'")
    print("   - Xem log backend để confirm nhận được")
    print()
    print("⚠️  LƯU Ý QUAN TRỌNG:")
    print("   - Webhook chỉ hoạt động khi backend ONLINE")
    print("   - Nếu chạy local (localhost), Casso KHÔNG GỬI ĐƯỢC webhook")
    print("   - Phải deploy lên VPS với IP public: 157.66.80.32")
    print("   - Port 8000 phải mở (firewall cho phép)")
    print()

if __name__ == "__main__":
    print("🚀 Bắt đầu kiểm tra webhook...\n")
    asyncio.run(test_webhook())
    asyncio.run(check_casso_webhook_config())
    
    print("\n" + "=" * 60)
    print("🔍 CÁCH KIỂM TRA LOG BACKEND:")
    print("=" * 60)
    print("1. Chạy backend với log:")
    print("   cd backend")
    print("   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")
    print()
    print("2. Khi có giao dịch thực tế, backend sẽ log:")
    print("   - 'Webhook received from Casso'")
    print("   - Transaction details")
    print("   - Order update status")
    print()
    print("3. Hoặc check MongoDB:")
    print("   - Collection: orders")
    print("   - Field: payment.status = 'completed'")
    print("   - Field: payment.transaction_id")
    print("=" * 60)
