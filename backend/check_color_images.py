"""
Quick Check: Xem ảnh màu đã được migrate chưa
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from urllib.parse import quote_plus

async def check():
    # MongoDB Atlas connection
    username = quote_plus("admin")
    password = quote_plus("Matkhau001@")
    MONGODB_URL = f"mongodb://{username}:{password}@159.223.32.252:27017/vyronfashion_db?authSource=admin"
    client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
    db = client.vyronfashion_db
    
    try:
        # Lấy 1 sản phẩm mẫu có màu
        product = await db.products.find_one({
            'variants.colors': {'$exists': True, '$ne': []}
        })
        
        if product:
            print(f"✅ Sản phẩm: {product.get('name')}")
            print(f"   Slug: {product.get('slug')}")
            
            colors = product.get('variants', {}).get('colors', [])
            print(f"\n📸 Có {len(colors)} màu:")
            
            for idx, color in enumerate(colors, 1):
                color_name = color.get('name', 'Unknown')
                images = color.get('images', [])
                print(f"   {idx}. {color_name}: {len(images)} ảnh")
                if images:
                    for img in images[:2]:  # Hiển thị 2 ảnh đầu
                        print(f"      - {img}")
        else:
            print("❌ Không tìm thấy sản phẩm nào có màu")
            
    except Exception as e:
        print(f"❌ Lỗi: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(check())
