"""
Script kiểm tra sản phẩm mới nhất trong database
Sắp xếp theo created_at giảm dần (mới nhất đầu tiên)
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

async def check_newest_products():
    # Kết nối MongoDB
    mongodb_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongodb_url)
    db = client['vyronfashion']
    products_collection = db['products']
    
    print("=" * 80)
    print("🔍 KIỂM TRA SẢN PHẨM MỚI NHẤT TRONG DATABASE")
    print("=" * 80)
    
    # Đếm tổng số sản phẩm active
    total_active = await products_collection.count_documents({"status": "active"})
    print(f"\n📊 Tổng số sản phẩm active: {total_active}")
    
    # Lấy 15 sản phẩm mới nhất (sort by created_at desc)
    cursor = products_collection.find(
        {"status": "active"},
        {"name": 1, "created_at": 1, "updated_at": 1, "slug": 1, "sold_count": 1}
    ).sort("created_at", -1).limit(15)
    
    products = await cursor.to_list(length=15)
    
    print(f"\n📋 TOP 15 SẢN PHẨM MỚI NHẤT (Sắp xếp theo created_at giảm dần):")
    print("-" * 80)
    
    for idx, product in enumerate(products, 1):
        created_at = product.get('created_at')
        if isinstance(created_at, datetime):
            created_str = created_at.strftime('%Y-%m-%d %H:%M:%S')
        else:
            created_str = str(created_at)
        
        sold_count = product.get('sold_count', 0)
        
        print(f"\n{idx}. {product.get('name', 'N/A')}")
        print(f"   Slug: {product.get('slug', 'N/A')}")
        print(f"   Created: {created_str}")
        print(f"   Đã bán: {sold_count}")
    
    # Kiểm tra xem có sản phẩm nào không có created_at
    no_created_at = await products_collection.count_documents({
        "status": "active",
        "created_at": {"$exists": False}
    })
    
    if no_created_at > 0:
        print(f"\n⚠️  CẢNH BÁO: Có {no_created_at} sản phẩm không có field 'created_at'")
        print("   Cần cập nhật created_at cho các sản phẩm này!")
    else:
        print(f"\n✅ Tất cả {total_active} sản phẩm đều có field 'created_at'")
    
    print("\n" + "=" * 80)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_newest_products())
