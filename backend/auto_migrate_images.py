"""
Auto migrate images - Tự động kiểm tra và migrate ảnh
"""

import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database import products_collection
from app.image_manager import ImageManager
import requests
from urllib.parse import urlparse


async def auto_migrate():
    """Tự động check và migrate"""
    
    image_manager = ImageManager()
    products = await products_collection.find().to_list(length=None)
    
    print("="*60)
    print("🔍 KIỂM TRA ẢNH SẢN PHẨM")
    print("="*60)
    print(f"\nTổng số sản phẩm: {len(products)}\n")
    
    stats = {
        'total_products': len(products),
        'products_with_images': 0,
        'total_images': 0,
        'local_images': 0,
        'external_images': 0,
        'missing_images': 0,
        'downloaded': 0,
        'download_failed': 0
    }
    
    # Bước 1: Kiểm tra trạng thái
    print("📊 BƯỚC 1: PHÂN TÍCH TRẠNG THÁI\n")
    
    products_need_migration = []
    
    for product in products:
        product_name = product.get('name', 'N/A')
        images_found = []
        external_images = []
        
        # Check ảnh chính
        if product.get('image'):
            images_found.append(('main', product['image']))
            if product['image'].startswith('http'):
                external_images.append(('main', product['image']))
        
        # Check gallery
        if product.get('images') and isinstance(product['images'], list):
            for idx, img in enumerate(product['images']):
                images_found.append(('gallery', img))
                if img.startswith('http'):
                    external_images.append(('gallery', img))
        
        # Check color variants
        variants = product.get('variants', {})
        if isinstance(variants, dict) and 'colors' in variants:
            colors = variants['colors']
            if isinstance(colors, list):
                for color_idx, color in enumerate(colors):
                    if isinstance(color, dict) and 'images' in color:
                        color_images = color['images']
                        if isinstance(color_images, list):
                            for img in color_images:
                                images_found.append(('color', img))
                                if img.startswith('http'):
                                    external_images.append(('color', img))
        
        if images_found:
            stats['products_with_images'] += 1
            stats['total_images'] += len(images_found)
            
            local_count = len([img for type, img in images_found if img.startswith('/uploads/')])
            external_count = len(external_images)
            
            stats['local_images'] += local_count
            stats['external_images'] += external_count
            
            if external_count > 0:
                products_need_migration.append({
                    'product': product,
                    'name': product_name,
                    'external_images': external_images
                })
                print(f"🌐 {product_name}")
                print(f"   {external_count} ảnh cần migrate")
    
    print("\n" + "="*60)
    print("📊 THỐNG KÊ:")
    print("="*60)
    print(f"Tổng sản phẩm:             {stats['total_products']}")
    print(f"Sản phẩm có ảnh:           {stats['products_with_images']}")
    print(f"Tổng số ảnh:               {stats['total_images']}")
    print(f"  ✅ Ảnh đã local:         {stats['local_images']}")
    print(f"  🌐 Ảnh cần migrate:      {stats['external_images']}")
    print("="*60)
    
    # Bước 2: Migrate nếu có
    if stats['external_images'] > 0:
        print(f"\n📥 BƯỚC 2: MIGRATE {stats['external_images']} ẢNH\n")
        
        for item in products_need_migration:
            product = item['product']
            product_id = str(product['_id'])
            product_name = item['name']
            
            print(f"\n📦 Xử lý: {product_name}")
            
            updated = False
            
            # Migrate từng ảnh
            for img_type, old_url in item['external_images']:
                print(f"  📥 Download: {old_url[:80]}...")
                
                try:
                    # Download
                    response = requests.get(old_url, timeout=30)
                    response.raise_for_status()
                    
                    # Lấy extension
                    parsed = urlparse(old_url)
                    filename = Path(parsed.path).name or 'image.jpg'
                    
                    # Lưu local
                    new_url, metadata = image_manager.save_uploaded_file(
                        file_content=response.content,
                        original_filename=filename,
                        product_id=product_id
                    )
                    
                    # Cập nhật trong product dict
                    if img_type == 'main':
                        product['image'] = new_url
                    elif img_type == 'gallery':
                        if 'images' in product and isinstance(product['images'], list):
                            # Replace old URL with new URL
                            product['images'] = [new_url if img == old_url else img for img in product['images']]
                    elif img_type == 'color':
                        variants = product.get('variants', {})
                        if isinstance(variants, dict) and 'colors' in variants:
                            colors = variants['colors']
                            if isinstance(colors, list):
                                for color in colors:
                                    if isinstance(color, dict) and 'images' in color:
                                        color['images'] = [new_url if img == old_url else img for img in color['images']]
                    
                    updated = True
                    stats['downloaded'] += 1
                    print(f"  ✅ Lưu: {new_url}")
                    
                except Exception as e:
                    print(f"  ❌ Lỗi: {str(e)}")
                    stats['download_failed'] += 1
            
            # Update database
            if updated:
                await products_collection.update_one(
                    {'_id': product['_id']},
                    {'$set': product}
                )
                print(f"  💾 Đã cập nhật database")
        
        print("\n" + "="*60)
        print("✅ KẾT QUẢ MIGRATE:")
        print("="*60)
        print(f"Ảnh đã download:           {stats['downloaded']}")
        print(f"Ảnh lỗi:                   {stats['download_failed']}")
        print("="*60)
    
    else:
        print("\n✅ Tất cả ảnh đã ở local, không cần migrate!")
    
    # Lấy thống kê storage
    storage = image_manager.get_storage_stats()
    print(f"\n💾 STORAGE: {storage['total_files']} files, {storage['total_size_mb']:.2f}MB\n")


if __name__ == "__main__":
    asyncio.run(auto_migrate())
