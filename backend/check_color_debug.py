import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['vyron_fashion']
    products = db['products']
    
    # Đếm tổng số sản phẩm
    total = await products.count_documents({})
    print(f"Tổng số sản phẩm trong DB: {total}")
    
    # Tìm tất cả sản phẩm
    print("\n--- Tất cả sản phẩm ---")
    cursor = products.find({}).limit(10)
    async for product in cursor:
        print(f"\nSản phẩm: {product.get('name')}")
        print(f"  Status: {product.get('status')}")
        colors = product.get('variants', {}).get('colors', [])
        print(f"  Số màu: {len(colors)}")
        for i, color in enumerate(colors):
            print(f"    Màu {i+1}: '{color.get('name')}' - slug: '{color.get('slug')}' - hex: '{color.get('hex')}'")

if __name__ == "__main__":
    asyncio.run(check())
