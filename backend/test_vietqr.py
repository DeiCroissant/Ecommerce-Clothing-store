#!/usr/bin/env python
"""
Script test VietQR + Casso Payment Integration
Chạy: python test_vietqr.py
"""

import asyncio
import os
from dotenv import load_dotenv
from app import payment_vietqr

load_dotenv()


async def test_generate_qr():
    """Test tạo QR code VietQR"""
    print("\n" + "="*60)
    print("TEST 1: Tạo QR Code VietQR")
    print("="*60)
    
    result = await payment_vietqr.create_vietqr_payment(
        order_id='673e5a1b2c3d4e5f6a7b8c9d',
        amount=150000,
        description='Test thanh toan don hang Vyron Fashion'
    )
    
    if result.get('success'):
        print("\n✅ Tạo QR thành công!")
        print(f"\n📷 QR Code URL:")
        print(f"   {result.get('vietqr_url')}")
        
        print(f"\n💳 Thông tin thanh toán:")
        info = result.get('payment_info', {})
        print(f"   - Ngân hàng: {info.get('bank_name')}")
        print(f"   - Số tài khoản: {info.get('account_number')}")
        print(f"   - Chủ tài khoản: {info.get('account_name')}")
        print(f"   - Số tiền: {info.get('amount'):,}đ")
        print(f"   - Nội dung: {info.get('description')}")
        
        if result.get('qr_code'):
            print(f"\n📦 QR Base64: {result.get('qr_code')[:50]}...")
        
        return result
    else:
        print(f"\n❌ Lỗi: {result.get('message')}")
        return None


async def test_webhook_verification():
    """Test xác thực webhook từ Casso"""
    print("\n" + "="*60)
    print("TEST 2: Xác thực Casso Webhook")
    print("="*60)
    
    # Mock webhook payload
    payload = '''{"id":12345,"tid":"FT123456789","description":"Test thanh toan don 673e5a1b2c3d4e5f6a7b8c9d","amount":150000,"when":"2025-11-25 14:30:00"}'''
    
    # Mock signature (trong thực tế Casso sẽ tự generate)
    import hmac
    import hashlib
    secret = os.getenv("CASSO_WEBHOOK_SECRET", "")
    expected_signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    print(f"\n🔐 Secret: {secret}")
    print(f"📝 Payload: {payload[:80]}...")
    print(f"✍️  Signature: {expected_signature}")
    
    # Test verify
    is_valid = payment_vietqr.verify_casso_webhook(payload, expected_signature)
    
    if is_valid:
        print(f"\n✅ Webhook signature hợp lệ!")
    else:
        print(f"\n❌ Webhook signature không hợp lệ!")
    
    return is_valid


async def test_casso_api():
    """Test gọi Casso API để lấy transactions"""
    print("\n" + "="*60)
    print("TEST 3: Gọi Casso API")
    print("="*60)
    
    api_key = os.getenv("CASSO_API_KEY", "")
    print(f"\n🔑 API Key: {api_key[:30]}...")
    
    try:
        # Gọi không có params (lấy giao dịch gần nhất)
        result = await payment_vietqr.get_casso_transactions()
        
        if result.get("success"):
            transactions = result.get("records", [])
            print(f"\n✅ Lấy được {len(transactions)} giao dịch!")
            
            if transactions:
                print(f"\n📊 Giao dịch gần nhất:")
                for i, tx in enumerate(transactions[:3], 1):
                    print(f"\n   {i}. ID: {tx.get('id')}")
                    print(f"      Số tiền: {tx.get('amount', 0):,}đ")
                    print(f"      Nội dung: {tx.get('description', 'N/A')}")
                    print(f"      Thời gian: {tx.get('when', 'N/A')}")
            else:
                print(f"\n⚠️  Không có giao dịch nào")
        else:
            print(f"\n⚠️  {result.get('message')}")
            
    except Exception as e:
        print(f"\n❌ Lỗi khi gọi Casso API: {e}")
        print(f"\n💡 Kiểm tra:")
        print(f"   1. API Key đúng chưa?")
        print(f"   2. Đã liên kết MB Bank với Casso chưa?")
        print(f"   3. Internet có kết nối không?")


async def main():
    """Chạy tất cả tests"""
    print("\n" + "="*60)
    print("🧪 VietQR + Casso Payment Integration Tests")
    print("="*60)
    
    # Check config
    print("\n📋 Configuration:")
    print(f"   VIETQR_BANK_ID: {os.getenv('VIETQR_BANK_ID')}")
    print(f"   VIETQR_ACCOUNT_NUMBER: {os.getenv('VIETQR_ACCOUNT_NUMBER')}")
    print(f"   VIETQR_ACCOUNT_NAME: {os.getenv('VIETQR_ACCOUNT_NAME')}")
    print(f"   CASSO_API_KEY: {os.getenv('CASSO_API_KEY', 'NOT SET')[:30]}...")
    print(f"   CASSO_WEBHOOK_SECRET: {os.getenv('CASSO_WEBHOOK_SECRET', 'NOT SET')}")
    
    # Run tests
    await test_generate_qr()
    await test_webhook_verification()
    await test_casso_api()
    
    print("\n" + "="*60)
    print("✅ Tests hoàn tất!")
    print("="*60)
    print("\n💡 Bước tiếp theo:")
    print("   1. Mở QR code URL ở trên")
    print("   2. Quét bằng app MB Bank")
    print("   3. Chuyển tiền test (có thể chuyển ít hơn)")
    print("   4. Check Casso dashboard: https://casso.vn/dashboard")
    print("   5. Verify webhook được gọi trong backend logs")
    print("\n")


if __name__ == "__main__":
    asyncio.run(main())
