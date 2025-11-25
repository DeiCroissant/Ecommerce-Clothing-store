"""
Script kiểm tra order và payment status trong MongoDB
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "vyronfashion_db")

async def check_recent_orders():
    """Kiểm tra các order gần đây và payment status"""
    
    print("=" * 60)
    print("🔍 KIỂM TRA ĐỚN HÀNG GẦN ĐÂY")
    print("=" * 60)
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    orders_collection = db.orders
    
    try:
        # Lấy 10 đơn hàng gần nhất
        cursor = orders_collection.find().sort("created_at", -1).limit(10)
        orders = await cursor.to_list(length=10)
        
        if not orders:
            print("⚠️  Không có đơn hàng nào trong database")
            return
        
        print(f"\n📦 Tìm thấy {len(orders)} đơn hàng gần đây:\n")
        
        for idx, order in enumerate(orders, 1):
            order_id = str(order['_id'])
            order_number = order.get('order_number', 'N/A')
            status = order.get('status', 'unknown')
            payment_method = order.get('payment_method', 'N/A')
            total = order.get('total_amount', 0)
            created_at = order.get('created_at', 'N/A')
            
            # Payment info
            payment = order.get('payment', {})
            payment_status = payment.get('status', 'not_initiated')
            transaction_id = payment.get('transaction_id', None)
            
            print(f"#{idx} Order: {order_number}")
            print(f"   ID: {order_id}")
            print(f"   📅 Ngày: {created_at}")
            print(f"   💰 Tổng tiền: {total:,}đ")
            print(f"   💳 Phương thức: {payment_method}")
            print(f"   📊 Trạng thái đơn: {status}")
            print(f"   💵 Trạng thái thanh toán: {payment_status}")
            
            if transaction_id:
                print(f"   ✅ Transaction ID: {transaction_id}")
            
            # Highlight pending bank transfers
            if payment_method == 'bank_transfer' and payment_status != 'completed':
                print(f"   ⚠️  ĐƠN NÀY ĐANG CHỜ THANH TOÁN!")
                print(f"   🔗 QR Code URL: /payment/{order_id}")
            
            if payment_status == 'completed':
                print(f"   ✅ ĐÃ THANH TOÁN THÀNH CÔNG")
            
            print()
        
        # Đếm số đơn pending bank_transfer
        pending_count = 0
        for order in orders:
            if (order.get('payment_method') == 'bank_transfer' and 
                order.get('payment', {}).get('status') != 'completed'):
                pending_count += 1
        
        if pending_count > 0:
            print("=" * 60)
            print(f"⚠️  CÓ {pending_count} ĐƠN HÀNG CHƯA THANH TOÁN")
            print("=" * 60)
            print("\n💡 Nguyên nhân có thể:")
            print("   1. Chưa chuyển khoản hoặc chuyển sai số tiền")
            print("   2. Webhook từ Casso chưa được gửi đến")
            print("   3. Backend VPS không online hoặc không nhận được webhook")
            print("   4. Nội dung chuyển khoản không chứa Order ID")
            print("   5. Casso chưa được cấu hình đúng")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()

async def check_webhook_logs():
    """Hướng dẫn kiểm tra webhook logs"""
    print("\n" + "=" * 60)
    print("🔍 CÁCH KIỂM TRA WEBHOOK")
    print("=" * 60)
    print()
    print("1. Kiểm tra Backend Log:")
    print("   - Nếu webhook đến, sẽ thấy: '🔔 WEBHOOK RECEIVED FROM CASSO'")
    print("   - Log chi tiết transaction, amount, order_id")
    print()
    print("2. Kiểm tra Casso.vn:")
    print("   - Đăng nhập: https://casso.vn")
    print("   - Vào: Lịch sử giao dịch")
    print("   - Xem có giao dịch vừa chuyển không")
    print("   - Kiểm tra Webhook đã được gửi chưa (trong Logs)")
    print()
    print("3. Test webhook thủ công:")
    print("   - Vào Casso → Settings → Webhook")
    print("   - Click 'Test Webhook'")
    print("   - Xem backend có nhận không")
    print()
    print("4. Kiểm tra nội dung chuyển khoản:")
    print("   - Phải chứa Order ID (24 ký tự hex)")
    print("   - VD: 'Thanh toan don 677c5470f8b6a1234567890a'")
    print("   - Số tiền phải CHÍNH XÁC")
    print()
    print("=" * 60)

if __name__ == "__main__":
    print("🚀 Kiểm tra trạng thái đơn hàng...\n")
    asyncio.run(check_recent_orders())
    asyncio.run(check_webhook_logs())
