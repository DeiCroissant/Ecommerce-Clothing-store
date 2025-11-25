"""
Script kiểm tra Casso API và lấy transactions gần đây
"""
import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

CASSO_API_KEY = os.getenv("CASSO_API_KEY")

async def check_casso_connection():
    """Kiểm tra kết nối với Casso API"""
    
    print("=" * 60)
    print("🔍 KIỂM TRA KẾT NỐI CASSO")
    print("=" * 60)
    
    if not CASSO_API_KEY:
        print("❌ Không tìm thấy CASSO_API_KEY trong .env")
        return
    
    print(f"✅ API Key: {CASSO_API_KEY[:20]}...")
    
    # API endpoint
    url = "https://oauth.casso.vn/v2/transactions"
    
    headers = {
        "Authorization": f"Apikey {CASSO_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Lấy 10 giao dịch gần nhất
    params = {
        "pageSize": 10,
        "page": 1,
        "sort": "DESC"  # Mới nhất trước
    }
    
    print(f"\n📡 Gọi API: {url}")
    print(f"📊 Params: {params}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=headers, params=params)
            
            print(f"\n✅ Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                records = data.get("data", {}).get("records", [])
                print(f"\n💰 Tìm thấy {len(records)} giao dịch gần đây:")
                print("-" * 60)
                
                if not records:
                    print("⚠️  Chưa có giao dịch nào")
                    print("\n💡 Kiểm tra:")
                    print("  1. Đã liên kết tài khoản MB Bank 284280405 chưa?")
                    print("  2. Đã có giao dịch vào tài khoản chưa?")
                else:
                    for idx, tx in enumerate(records, 1):
                        print(f"\n#{idx}")
                        print(f"  ID: {tx.get('id')}")
                        print(f"  Số tiền: {tx.get('amount'):,}đ")
                        print(f"  Nội dung: {tx.get('description')}")
                        print(f"  Thời gian: {tx.get('when')}")
                        print(f"  Transaction ID: {tx.get('tid')}")
                        
                        # Kiểm tra xem có order_id không
                        import re
                        desc = tx.get('description', '')
                        match = re.search(r'[a-f0-9]{24}', desc.lower())
                        if match:
                            print(f"  🎯 Order ID tìm thấy: {match.group(0)}")
                        else:
                            print(f"  ⚠️  Không tìm thấy Order ID trong nội dung")
                
                print("\n" + "=" * 60)
                print("✅ KẾT NỐI CASSO THÀNH CÔNG")
                print("=" * 60)
                
            elif response.status_code == 401:
                print("❌ API Key không hợp lệ!")
                print("💡 Kiểm tra lại CASSO_API_KEY trong file .env")
            else:
                print(f"❌ Lỗi: {response.status_code}")
                print(f"Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n💡 Kiểm tra kết nối internet")

async def check_webhook_settings():
    """Hướng dẫn kiểm tra webhook settings trên Casso"""
    
    print("\n" + "=" * 60)
    print("📋 CHECKLIST CẤU HÌNH WEBHOOK")
    print("=" * 60)
    print()
    print("☐ 1. Đã đăng nhập Casso.vn")
    print("☐ 2. Đã liên kết tài khoản MB Bank 284280405")
    print("☐ 3. Đã cấu hình Webhook URL:")
    print("      → http://157.66.80.32:8000/api/payments/casso/webhook")
    print("☐ 4. Đã nhập Webhook Secret: VyronFashion2025Secret")
    print("☐ 5. Đã BẬT 'Gửi webhook khi có giao dịch mới'")
    print("☐ 6. Đã test webhook trên Casso (nút Test)")
    print("☐ 7. Backend VPS đang chạy và online")
    print()
    print("=" * 60)
    print()

if __name__ == "__main__":
    print("🚀 Bắt đầu kiểm tra Casso...\n")
    asyncio.run(check_casso_connection())
    asyncio.run(check_webhook_settings())
    
    print("\n💡 CÁCH TEST WEBHOOK:")
    print("-" * 60)
    print("1. Tạo đơn hàng trên web (chọn chuyển khoản)")
    print("2. Quét QR và chuyển tiền ĐÚNG SỐ TIỀN")
    print("3. Nội dung CK: Thanh toan don [ORDER_ID]")
    print("4. Đợi vài giây, Casso sẽ gửi webhook")
    print("5. Check log backend hoặc MongoDB để xác nhận")
    print("-" * 60)
