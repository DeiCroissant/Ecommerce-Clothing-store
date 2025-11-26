import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    
    # Liệt kê tất cả databases
    dbs = await client.list_database_names()
    print(f"Databases: {dbs}")
    
    # Kiểm tra từng database có collection products không
    for db_name in dbs:
        db = client[db_name]
        collections = await db.list_collection_names()
        if 'products' in collections:
            count = await db['products'].count_documents({})
            print(f"\nDatabase '{db_name}' có {count} sản phẩm")
            
            # Lấy 2 sản phẩm đầu tiên để xem cấu trúc
            if count > 0:
                cursor = db['products'].find({}).limit(2)
                async for product in cursor:
                    print(f"  - {product.get('name')}")
                    colors = product.get('variants', {}).get('colors', [])
                    for i, color in enumerate(colors):
                        print(f"      Màu {i+1}: '{color.get('name')}' - hex: '{color.get('hex')}'")

if __name__ == "__main__":
    asyncio.run(check())
