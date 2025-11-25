"""
Script để test update order thủ công (giả lập webhook)
Sử dụng khi webhook không hoạt động
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "vyronfashion_db")

async def manual_update_order(order_id_str, transaction_id="MANUAL_TEST"):
    """Cập nhật thủ công order thành công (để test)"""
    
    print("=" * 60)
    print("🔧 CẬP NHẬT THỦ CÔNG TRẠNG THÁI ĐƠN HÀNG")
    print("=" * 60)
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    orders_collection = db.orders
    
    try:
        order_id = ObjectId(order_id_str)
        
        # Kiểm tra order tồn tại
        order = await orders_collection.find_one({"_id": order_id})
        if not order:
            print(f"❌ Không tìm thấy order: {order_id_str}")
            return
        
        print(f"\n📦 Order tìm thấy:")
        print(f"   ID: {order_id_str}")
        print(f"   Order Number: {order.get('order_number')}")
        print(f"   Total: {order.get('total_amount'):,}đ")
        print(f"   Current Status: {order.get('status')}")
        print(f"   Payment Status: {order.get('payment', {}).get('status', 'not_initiated')}")
        
        # Cập nhật
        result = await orders_collection.update_one(
            {"_id": order_id},
            {"$set": {
                "payment.status": "completed",
                "payment.transaction_id": transaction_id,
                "payment.completed_at": datetime.now().isoformat(),
                "payment.manual_update": True,
                "status": "processing",
                "updated_at": datetime.now().isoformat()
            }}
        )
        
        if result.modified_count > 0:
            print(f"\n✅ Đã cập nhật order thành công!")
            print(f"   Payment Status: completed")
            print(f"   Order Status: processing")
            print(f"   Transaction ID: {transaction_id}")
        else:
            print(f"\n⚠️  Không có thay đổi nào")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()

async def list_pending_orders():
    """Liệt kê các order đang pending để chọn"""
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    orders_collection = db.orders
    
    try:
        cursor = orders_collection.find({
            "payment_method": "bank_transfer",
            "payment.status": {"$ne": "completed"}
        }).sort("created_at", -1).limit(5)
        
        orders = await cursor.to_list(length=5)
        
        if not orders:
            print("✅ Không có đơn hàng nào đang chờ thanh toán")
            return
        
        print("\n📋 CÁC ĐƠN HÀNG ĐANG CHỜ THANH TOÁN:\n")
        for idx, order in enumerate(orders, 1):
            print(f"{idx}. Order: {order.get('order_number')}")
            print(f"   ID: {str(order['_id'])}")
            print(f"   Số tiền: {order.get('total_amount'):,}đ")
            print(f"   Ngày: {order.get('created_at')}")
            print()
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    import sys
    
    print("🚀 CÔNG CỤ CẬP NHẬT ĐƠN HÀNG THỦ CÔNG\n")
    
    asyncio.run(list_pending_orders())
    
    print("=" * 60)
    print("💡 CÁCH SỬ DỤNG:")
    print("=" * 60)
    print()
    print("Để cập nhật đơn hàng thủ công (test):")
    print("python manual_update_order.py <ORDER_ID>")
    print()
    print("VD:")
    print("python manual_update_order.py 6925d237b65ee7357b82d848")
    print()
    print("⚠️  CHÚ Ý:")
    print("   - Chỉ dùng để TEST, không dùng cho production")
    print("   - Trong production, phải chờ webhook từ Casso")
    print("   - Cần cấu hình Casso đúng để tự động nhận webhook")
    print()
    print("=" * 60)
    
    # Nếu có tham số order_id, thực hiện update
    if len(sys.argv) > 1:
        order_id = sys.argv[1]
        print(f"\n🔄 Đang cập nhật order: {order_id}...\n")
        asyncio.run(manual_update_order(order_id))
