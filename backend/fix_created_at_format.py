"""
Script cập nhật created_at từ string sang datetime object
Để sort đúng trong MongoDB
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv
from dateutil import parser

load_dotenv()

async def fix_created_at_format():
    mongodb_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongodb_url)
    db = client['vyronfashion']
    products_collection = db['products']
    
    print("=" * 80)
    print("🔧 FIXING CREATED_AT FORMAT")
    print("=" * 80)
    
    # Tìm các sản phẩm có created_at là string
    cursor = products_collection.find({})
    products = await cursor.to_list(length=None)
    
    updated_count = 0
    error_count = 0
    
    for product in products:
        try:
            created_at = product.get('created_at')
            updated_at = product.get('updated_at')
            
            needs_update = False
            update_data = {}
            
            # Check và convert created_at
            if created_at:
                if isinstance(created_at, str):
                    try:
                        # Parse ISO format string to datetime
                        dt = parser.isoparse(created_at)
                        update_data['created_at'] = dt
                        needs_update = True
                        print(f"🔄 Converting created_at for: {product.get('name', 'N/A')}")
                        print(f"   From: {created_at} (string)")
                        print(f"   To: {dt} (datetime)")
                    except Exception as e:
                        print(f"❌ Error parsing created_at for {product.get('name', 'N/A')}: {e}")
                        error_count += 1
            else:
                # Nếu không có created_at, tạo mới
                update_data['created_at'] = datetime.now()
                needs_update = True
                print(f"➕ Adding created_at for: {product.get('name', 'N/A')}")
            
            # Check và convert updated_at
            if updated_at:
                if isinstance(updated_at, str):
                    try:
                        dt = parser.isoparse(updated_at)
                        update_data['updated_at'] = dt
                        needs_update = True
                    except Exception as e:
                        print(f"❌ Error parsing updated_at for {product.get('name', 'N/A')}: {e}")
            else:
                update_data['updated_at'] = datetime.now()
                needs_update = True
            
            # Update nếu cần
            if needs_update:
                await products_collection.update_one(
                    {'_id': product['_id']},
                    {'$set': update_data}
                )
                updated_count += 1
        
        except Exception as e:
            print(f"❌ Error processing product {product.get('name', 'N/A')}: {e}")
            error_count += 1
    
    print("\n" + "=" * 80)
    print(f"✅ Đã cập nhật: {updated_count} sản phẩm")
    if error_count > 0:
        print(f"❌ Lỗi: {error_count} sản phẩm")
    print("=" * 80)
    
    # Verify - List top 10 newest products
    print("\n📋 TOP 10 SẢN PHẨM MỚI NHẤT SAU KHI FIX:")
    print("-" * 80)
    
    cursor = products_collection.find(
        {"status": "active"},
        {"name": 1, "created_at": 1, "slug": 1}
    ).sort("created_at", -1).limit(10)
    
    newest = await cursor.to_list(length=10)
    for idx, p in enumerate(newest, 1):
        created = p.get('created_at')
        if isinstance(created, datetime):
            created_str = created.strftime('%Y-%m-%d %H:%M:%S')
            print(f"{idx}. {p.get('name', 'N/A')}")
            print(f"   Created: {created_str} ✅ (datetime object)")
        else:
            print(f"{idx}. {p.get('name', 'N/A')}")
            print(f"   Created: {created} ⚠️  (still string)")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_created_at_format())
