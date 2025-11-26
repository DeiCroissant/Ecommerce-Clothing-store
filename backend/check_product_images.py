"""
Kiểm tra chi tiết ảnh của sản phẩm trong DB
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from urllib.parse import quote_plus
import os

async def check():
    # MongoDB Atlas connection
    username = quote_plus("admin")
    password = quote_plus("Matkhau001@")
    MONGODB_URL = f"mongodb://{username}:{password}@159.223.32.252:27017/vyronfashion_db?authSource=admin"
    
    client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=10000)
    db = client.vyronfashion_db
    
    try:
        print("\n" + "="*60)
        print("🔍 KIỂM TRA ẢNH SẢN PHẨM TRONG DATABASE")
        print("="*60)
        
        # Lấy 1 sản phẩm có nhiều màu
        product = await db.products.find_one({
            'variants.colors': {'$exists': True, '$ne': []}
        }, {'name': 1, 'slug': 1, 'variants.colors': 1})
        
        if not product:
            print("❌ Không tìm thấy sản phẩm nào")
            return
            
        print(f"\n✅ Sản phẩm: {product.get('name')}")
        print(f"   Slug: {product.get('slug')}")
        
        colors = product.get('variants', {}).get('colors', [])
        print(f"\n📦 Có {len(colors)} màu:")
        
        for idx, color in enumerate(colors, 1):
            color_name = color.get('name', 'Unknown')
            images = color.get('images', [])
            
            print(f"\n{idx}. Màu: {color_name}")
            print(f"   Slug: {color.get('slug', 'N/A')}")
            print(f"   Hex: {color.get('hex', 'N/A')}")
            print(f"   Số ảnh: {len(images)}")
            
            if images:
                for img_idx, img in enumerate(images[:3], 1):  # Hiển thị 3 ảnh đầu
                    # Kiểm tra loại ảnh
                    if img.startswith('data:image'):
                        img_type = "❌ BASE64 (cần convert)"
                        img_preview = img[:50] + "..."
                    elif img.startswith('/uploads/'):
                        img_type = "✅ URL path"
                        img_preview = img
                    elif img.startswith('http'):
                        img_type = "✅ Full URL"
                        img_preview = img
                    else:
                        img_type = "⚠️  Unknown format"
                        img_preview = img[:100]
                    
                    print(f"     [{img_idx}] {img_type}")
                    print(f"         {img_preview}")
                    
                if len(images) > 3:
                    print(f"     ... và {len(images) - 3} ảnh khác")
            else:
                print("   ⚠️  Không có ảnh")
        
        # Đếm tổng số ảnh theo loại
        print("\n" + "="*60)
        print("📊 THỐNG KÊ LOẠI ẢNH")
        print("="*60)
        
        all_products = await db.products.find({
            'variants.colors': {'$exists': True, '$ne': []}
        }).to_list(length=None)
        
        base64_count = 0
        url_count = 0
        other_count = 0
        
        for p in all_products:
            for color in p.get('variants', {}).get('colors', []):
                for img in color.get('images', []):
                    if img.startswith('data:image'):
                        base64_count += 1
                    elif img.startswith('/uploads/') or img.startswith('http'):
                        url_count += 1
                    else:
                        other_count += 1
        
        total = base64_count + url_count + other_count
        print(f"\n✅ URL/Path ảnh: {url_count}/{total} ({url_count*100/total if total > 0 else 0:.1f}%)")
        print(f"❌ Base64: {base64_count}/{total} ({base64_count*100/total if total > 0 else 0:.1f}%)")
        print(f"⚠️  Unknown: {other_count}/{total}")
        
        if base64_count > 0:
            print(f"\n⚠️  CÓ {base64_count} ẢNH BASE64 CẦN CONVERT!")
        else:
            print(f"\n✅ TẤT CẢ ẢNH ĐÃ Ở DẠNG URL/PATH")
            
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(check())
