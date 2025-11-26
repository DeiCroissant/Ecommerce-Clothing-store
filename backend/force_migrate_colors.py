"""
FORCE Migration - Gán lại ảnh cho TẤT CẢ màu sắc
Không skip bất kỳ sản phẩm nào
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path

# MongoDB configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = "vyronfashion_db"

# Thư mục chứa ảnh
UPLOAD_DIR = Path(__file__).parent / "uploads" / "products"

async def force_migrate():
    """Force gán lại ảnh cho tất cả màu"""
    
    print("\n" + "="*60)
    print("🔥 FORCE MIGRATION - GÁN LẠI ẢNH CHO TẤT CẢ MÀU")
    print("="*60)
    
    client = AsyncIOMotorClient(
        MONGODB_URL,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000
    )
    db = client[DB_NAME]
    products_collection = db.products
    
    try:
        print(f"\n🔄 Kết nối: {DB_NAME}")
        
        # Lấy tất cả file ảnh
        if not UPLOAD_DIR.exists():
            print(f"❌ Thư mục không tồn tại: {UPLOAD_DIR}")
            return
            
        all_images = [f"/uploads/products/{f.name}" for f in UPLOAD_DIR.iterdir() if f.is_file()]
        print(f"📸 Tìm thấy {len(all_images)} ảnh trong thư mục")
        
        # Lấy tất cả sản phẩm
        products = await products_collection.find({}).to_list(None)
        total = len(products)
        print(f"📦 Tìm thấy {total} sản phẩm\n")
        
        updated_count = 0
        skipped_count = 0
        
        for idx, product in enumerate(products, 1):
            product_id = product.get('_id')
            product_name = product.get('name', 'Unknown')
            
            print(f"[{idx}/{total}] {product_name}")
            
            # Lấy màu hiện tại
            colors = product.get('variants', {}).get('colors', [])
            
            if not colors:
                print(f"  ⏭️  Không có màu")
                skipped_count += 1
                continue
            
            # FORCE gán lại ảnh cho TẤT CẢ màu
            print(f"  🔥 FORCE cập nhật {len(colors)} màu:")
            
            for color_idx, color in enumerate(colors):
                color_name = color.get('name', f'Màu {color_idx+1}')
                
                # Gán ảnh cho màu
                if color_idx < len(all_images):
                    # Mỗi màu 1 ảnh khác nhau
                    color['images'] = [all_images[color_idx]]
                else:
                    # Nếu hết ảnh, dùng lại từ đầu
                    color['images'] = [all_images[color_idx % len(all_images)]]
                
                print(f"    ✅ {color_name}: Gán {len(color['images'])} ảnh - {color['images'][0][:50]}...")
            
            # Cập nhật database
            result = await products_collection.update_one(
                {'_id': product_id},
                {'$set': {'variants.colors': colors}}
            )
            
            if result.modified_count > 0:
                updated_count += 1
                print(f"  ✅ Đã cập nhật\n")
            else:
                print(f"  ⚠️  Không có thay đổi\n")
        
        print("="*60)
        print(f"✅ FORCE MIGRATION HOÀN TẤT!")
        print(f"   - Đã cập nhật: {updated_count} sản phẩm")
        print(f"   - Bỏ qua: {skipped_count} sản phẩm")
        print(f"   - Tổng: {total} sản phẩm")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(force_migrate())
