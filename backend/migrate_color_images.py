"""
Migration Script: Chuyển ảnh màu từ dữ liệu cũ sang format mới
- Tìm tất cả sản phẩm có variants.colors
- Với mỗi màu, tìm ảnh tương ứng trong product.images
- Gán ảnh vào color.images[]
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "vyronfashion_db")  # Sửa tên database

async def migrate_color_images():
    """Migration ảnh màu từ product.images sang color.images"""
    
    print("🔄 Bắt đầu migration ảnh màu...")
    
    # Kết nối MongoDB với timeout
    client = AsyncIOMotorClient(
        MONGODB_URL,
        serverSelectionTimeoutMS=5000,  # 5 giây timeout
        connectTimeoutMS=5000
    )
    db = client[DB_NAME]
    products_collection = db.products
    
    try:
        # Test connection
        await client.server_info()
        print(f"✅ Kết nối thành công: {DB_NAME}")
        
        # Lấy tất cả sản phẩm
        products = await products_collection.find({}).to_list(None)
        total = len(products)
        
        print(f"📦 Tìm thấy {total} sản phẩm")
        
        updated_count = 0
        skipped_count = 0
        
        for idx, product in enumerate(products, 1):
            product_id = product.get('_id')
            product_name = product.get('name', 'Unknown')
            
            print(f"\n[{idx}/{total}] Đang xử lý: {product_name}")
            
            # Kiểm tra có variants.colors không
            variants = product.get('variants', {})
            colors = variants.get('colors', [])
            
            if not colors:
                print("  ⏭️  Không có màu, bỏ qua")
                skipped_count += 1
                continue
            
            # Lấy tất cả ảnh của sản phẩm
            product_images = product.get('images', [])
            main_image = product.get('image', '')
            
            all_images = []
            if main_image:
                all_images.append(main_image)
            all_images.extend(product_images)
            
            if not all_images:
                print("  ⚠️  Không có ảnh nào")
                skipped_count += 1
                continue
            
            print(f"  📸 Có {len(all_images)} ảnh")
            
            # Kiểm tra xem đã có màu chưa
            if not colors or len(colors) == 0:
                # Tự động tạo màu dựa trên tên sản phẩm hoặc default
                print("  ⚠️  Sản phẩm chưa có màu, tạo màu mặc định...")
                
                # Tạo màu dựa trên từ khóa trong tên
                product_name_lower = product_name.lower()
                default_colors = []
                
                # Mapping màu phổ biến
                color_keywords = {
                    'trắng': {'name': 'Trắng', 'slug': 'white', 'hex': '#FFFFFF'},
                    'white': {'name': 'Trắng', 'slug': 'white', 'hex': '#FFFFFF'},
                    'đen': {'name': 'Đen', 'slug': 'black', 'hex': '#000000'},
                    'black': {'name': 'Đen', 'slug': 'black', 'hex': '#000000'},
                    'xanh': {'name': 'Xanh', 'slug': 'blue', 'hex': '#0066CC'},
                    'blue': {'name': 'Xanh', 'slug': 'blue', 'hex': '#0066CC'},
                    'đỏ': {'name': 'Đỏ', 'slug': 'red', 'hex': '#FF0000'},
                    'red': {'name': 'Đỏ', 'slug': 'red', 'hex': '#FF0000'},
                    'hồng': {'name': 'Hồng', 'slug': 'pink', 'hex': '#FF69B4'},
                    'pink': {'name': 'Hồng', 'slug': 'pink', 'hex': '#FF69B4'},
                    'vàng': {'name': 'Vàng', 'slug': 'yellow', 'hex': '#FFD700'},
                    'yellow': {'name': 'Vàng', 'slug': 'yellow', 'hex': '#FFD700'},
                    'xám': {'name': 'Xám', 'slug': 'gray', 'hex': '#808080'},
                    'gray': {'name': 'Xám', 'slug': 'gray', 'hex': '#808080'},
                    'grey': {'name': 'Xám', 'slug': 'gray', 'hex': '#808080'},
                    'be': {'name': 'Be', 'slug': 'beige', 'hex': '#F5F5DC'},
                    'beige': {'name': 'Be', 'slug': 'beige', 'hex': '#F5F5DC'},
                    'nâu': {'name': 'Nâu', 'slug': 'brown', 'hex': '#8B4513'},
                    'brown': {'name': 'Nâu', 'slug': 'brown', 'hex': '#8B4513'},
                }
                
                # Tìm màu từ tên sản phẩm
                found_colors = []
                for keyword, color_info in color_keywords.items():
                    if keyword in product_name_lower:
                        if color_info['slug'] not in [c['slug'] for c in found_colors]:
                            found_colors.append(color_info)
                
                # Nếu không tìm thấy màu nào, tạo 3 màu cơ bản
                if not found_colors:
                    found_colors = [
                        {'name': 'Trắng', 'slug': 'white', 'hex': '#FFFFFF'},
                        {'name': 'Đen', 'slug': 'black', 'hex': '#000000'},
                        {'name': 'Xanh', 'slug': 'blue', 'hex': '#0066CC'},
                    ]
                
                # Gán ảnh cho từng màu
                for idx, color_info in enumerate(found_colors):
                    color = {
                        'name': color_info['name'],
                        'slug': color_info['slug'],
                        'hex': color_info['hex'],
                        'available': True,
                        'images': []
                    }
                    
                    # Phân ảnh cho màu
                    if idx < len(all_images):
                        color['images'] = [all_images[idx]]
                    else:
                        color['images'] = [all_images[0]]
                    
                    default_colors.append(color)
                    print(f"    ➕ Tạo màu: {color['name']} với {len(color['images'])} ảnh")
                
                colors = default_colors
                updated = True
            else:
                # Sản phẩm đã có màu - Logic phân ảnh cho màu:
                # - Nếu số ảnh >= số màu: mỗi màu 1 ảnh
                # - Nếu số ảnh < số màu: ảnh đầu cho màu đầu, ảnh còn lại chia đều
                updated = False
                
                for color_idx, color in enumerate(colors):
                    color_name = color.get('name', f'Màu {color_idx+1}')
                    
                    # Nếu màu đã có ảnh, bỏ qua
                    if color.get('images') and len(color.get('images', [])) > 0:
                        print(f"    ✓ {color_name}: Đã có {len(color['images'])} ảnh")
                        continue
                    
                    # Phân ảnh cho màu
                    if color_idx < len(all_images):
                        # Gán ảnh tương ứng với index
                        color['images'] = [all_images[color_idx]]
                        print(f"    ➕ {color_name}: Thêm 1 ảnh")
                        updated = True
                    else:
                        # Nếu hết ảnh, dùng ảnh đầu tiên
                        color['images'] = [all_images[0]]
                        print(f"    ➕ {color_name}: Dùng ảnh mặc định")
                        updated = True
            
            print(f"  📦 Tổng cộng: {len(colors)} màu")
            
            # Cập nhật database
            if updated:
                await products_collection.update_one(
                    {'_id': product_id},
                    {'$set': {'variants.colors': colors}}
                )
                updated_count += 1
                print(f"  ✅ Đã cập nhật")
            else:
                print(f"  ⏭️  Không cần cập nhật")
                skipped_count += 1
        
        print("\n" + "="*60)
        print(f"✅ Migration hoàn tất!")
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

async def verify_migration():
    """Kiểm tra kết quả migration"""
    
    print("\n🔍 Kiểm tra kết quả migration...")
    
    client = AsyncIOMotorClient(
        MONGODB_URL,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000
    )
    db = client[DB_NAME]
    products_collection = db.products
    
    try:
        # Đếm sản phẩm có màu với ảnh
        products = await products_collection.find({
            'variants.colors': {'$exists': True, '$ne': []}
        }).to_list(None)
        
        total_products = len(products)
        colors_with_images = 0
        colors_without_images = 0
        
        for product in products:
            colors = product.get('variants', {}).get('colors', [])
            for color in colors:
                if color.get('images') and len(color.get('images', [])) > 0:
                    colors_with_images += 1
                else:
                    colors_without_images += 1
        
        print(f"\n📊 Kết quả:")
        print(f"   - Sản phẩm có màu: {total_products}")
        print(f"   - Màu có ảnh: {colors_with_images}")
        print(f"   - Màu chưa có ảnh: {colors_without_images}")
        
        if colors_without_images > 0:
            print(f"\n⚠️  Còn {colors_without_images} màu chưa có ảnh")
            print("   Cần upload ảnh thủ công cho các màu này")
        else:
            print(f"\n✅ Tất cả màu đều đã có ảnh!")
        
    except Exception as e:
        print(f"\n❌ Lỗi kiểm tra: {e}")
    finally:
        client.close()

async def main():
    """Main function"""
    print("="*60)
    print("🎨 MIGRATION ẢNH MÀU SẢN PHẨM")
    print("="*60)
    print()
    
    # Chạy migration
    await migrate_color_images()
    
    # Kiểm tra kết quả
    await verify_migration()
    
    print("\n✨ Xong! Giờ refresh trang admin để thấy ảnh màu.")

if __name__ == "__main__":
    asyncio.run(main())
