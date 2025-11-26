"""
Fix Color Images - Gán ảnh từ folder cho tất cả màu
"""
import os
from pymongo import MongoClient
from pathlib import Path
from urllib.parse import quote_plus

# MongoDB connection từ env
MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    # Fallback nếu không có env
    MONGODB_HOST = os.getenv("MONGODB_HOST", "159.223.32.252")
    MONGODB_PORT = os.getenv("MONGODB_PORT", "27017")
    MONGODB_USERNAME = quote_plus(os.getenv("MONGODB_USERNAME", "admin"))
    MONGODB_PASSWORD = quote_plus(os.getenv("MONGODB_PASSWORD", "Matkhau001@"))
    MONGODB_AUTH_DB = os.getenv("MONGODB_AUTH_DB", "admin")
    
    MONGODB_URL = f"mongodb://{MONGODB_USERNAME}:{MONGODB_PASSWORD}@{MONGODB_HOST}:{MONGODB_PORT}/{MONGODB_AUTH_DB}?authSource={MONGODB_AUTH_DB}"

DB_NAME = "vyronfashion_db"

# Thư mục chứa ảnh
UPLOAD_DIR = Path(__file__).parent / "uploads" / "products"

print("\n" + "="*60)
print("🔧 FIX COLOR IMAGES - GÁN ẢNH CHO TẤT CẢ MÀU")
print("="*60)

# Connect MongoDB
client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=10000)
db = client[DB_NAME]
products_collection = db.products

try:
    print(f"\n✅ Kết nối: {DB_NAME}")
    
    # Lấy tất cả ảnh
    if not UPLOAD_DIR.exists():
        print(f"❌ Thư mục không tồn tại: {UPLOAD_DIR}")
        exit(1)
    
    all_images = [f"/uploads/products/{f.name}" for f in UPLOAD_DIR.iterdir() 
                  if f.is_file() and not f.name.startswith('.')]
    
    print(f"📸 Tìm thấy {len(all_images)} ảnh")
    if len(all_images) > 0:
        print(f"   Ảnh đầu: {all_images[0]}")
    
    # Lấy tất cả sản phẩm
    products = list(products_collection.find({}))
    print(f"📦 Tìm thấy {len(products)} sản phẩm\n")
    
    updated_count = 0
    skipped_count = 0
    
    for idx, product in enumerate(products, 1):
        product_id = product.get('_id')
        product_name = product.get('name', 'Unknown')
        colors = product.get('variants', {}).get('colors', [])
        
        print(f"[{idx}/{len(products)}] {product_name}")
        
        if not colors:
            print(f"  ⏭️  Không có màu")
            skipped_count += 1
            continue
        
        # Kiểm tra xem màu có ảnh chưa
        needs_update = False
        for color_idx, color in enumerate(colors):
            color_name = color.get('name', f'Màu {color_idx+1}')
            current_images = color.get('images', [])
            
            # Nếu màu chưa có ảnh HOẶC có ảnh base64
            if not current_images or len(current_images) == 0 or any(img.startswith('data:image') for img in current_images):
                # Gán ảnh mới
                if color_idx < len(all_images):
                    color['images'] = [all_images[color_idx]]
                else:
                    # Nếu hết ảnh, dùng lại từ đầu
                    color['images'] = [all_images[color_idx % len(all_images)]]
                
                print(f"  ✅ {color_name}: Gán {color['images'][0][:60]}...")
                needs_update = True
            else:
                print(f"  ✓ {color_name}: Đã có {len(current_images)} ảnh")
        
        # Cập nhật database
        if needs_update:
            result = products_collection.update_one(
                {'_id': product_id},
                {'$set': {'variants.colors': colors}}
            )
            
            if result.modified_count > 0:
                updated_count += 1
                print(f"  ✅ Đã cập nhật\n")
            else:
                print(f"  ⚠️  Không có thay đổi\n")
        else:
            skipped_count += 1
            print(f"  ⏭️  Bỏ qua\n")
    
    print("="*60)
    print(f"✅ HOÀN TẤT!")
    print(f"   - Đã cập nhật: {updated_count} sản phẩm")
    print(f"   - Bỏ qua: {skipped_count} sản phẩm")
    print(f"   - Tổng: {len(products)} sản phẩm")
    print("="*60)
    
except Exception as e:
    print(f"\n❌ Lỗi: {e}")
    import traceback
    traceback.print_exc()
finally:
    client.close()
