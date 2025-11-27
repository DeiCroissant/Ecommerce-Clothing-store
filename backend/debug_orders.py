"""Debug script để kiểm tra orders và revenue chart"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta

async def check_orders():
    client = AsyncIOMotorClient('mongodb://159.223.32.252:27017')
    db = client['vyronfashion_db']
    orders = db['orders']
    
    print("=" * 60)
    print("DEBUG: Kiểm tra đơn hàng trong database")
    print("=" * 60)
    
    # 1. Count all orders
    total = await orders.count_documents({})
    print(f"\n📦 Tổng số đơn hàng: {total}")
    
    # 2. Count by status
    print("\n📊 Phân loại theo status:")
    pipeline = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    async for doc in orders.aggregate(pipeline):
        print(f"   - {doc['_id']}: {doc['count']} đơn")
    
    # 3. Check recent orders (30 days)
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    date_30_days_ago = (today - timedelta(days=30)).isoformat()
    
    print(f"\n📅 Đơn hàng từ {date_30_days_ago}:")
    
    recent = await orders.find({"created_at": {"$gte": date_30_days_ago}}).to_list(length=20)
    print(f"   Tìm thấy: {len(recent)} đơn")
    
    for o in recent[:10]:
        print(f"   - Order #{o.get('order_number')}: status={o.get('status')}, amount={o.get('total_amount')}, date={o.get('created_at')[:10] if o.get('created_at') else 'N/A'}")
    
    # 4. Test revenue pipeline
    print("\n💰 Test revenue pipeline (giống như API dashboard):")
    revenue_pipeline = [
        {
            "$match": {
                "created_at": {"$gte": date_30_days_ago},
                "status": {"$in": ["pending", "confirmed", "processing", "shipped", "delivered", "completed"]}
            }
        },
        {
            "$project": {
                "total_amount": 1,
                "created_at": 1,
                "status": 1,
                "day": {"$substr": ["$created_at", 0, 10]}
            }
        },
        {
            "$group": {
                "_id": "$day",
                "revenue": {"$sum": "$total_amount"},
                "orders_count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    revenue_data = await orders.aggregate(revenue_pipeline).to_list(length=None)
    print(f"   Kết quả pipeline: {len(revenue_data)} ngày có doanh thu")
    
    for item in revenue_data:
        print(f"   - {item['_id']}: {item['revenue']:,.0f}đ ({item['orders_count']} đơn)")
    
    # 5. Check created_at format
    print("\n🔍 Kiểm tra định dạng created_at:")
    sample = await orders.find_one({})
    if sample:
        created_at = sample.get('created_at')
        print(f"   Sample created_at: {created_at}")
        print(f"   Type: {type(created_at)}")
        
        # Check if it's a string or datetime
        if isinstance(created_at, str):
            print(f"   ✅ created_at là string ISO format")
        elif isinstance(created_at, datetime):
            print(f"   ⚠️ created_at là datetime object, cần convert")
    
    client.close()
    print("\n" + "=" * 60)

if __name__ == "__main__":
    asyncio.run(check_orders())
