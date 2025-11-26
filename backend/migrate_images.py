"""
Script migrate ảnh sản phẩm
- Download ảnh từ URL bên ngoài về local
- Hoặc di chuyển ảnh từ thư mục khác vào uploads/products/
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from app.database import products_collection
from app.image_manager import ImageManager
import requests
from urllib.parse import urlparse
import re


async def migrate_images_from_urls():
    """
    Migrate ảnh từ URL bên ngoài (nếu có)
    Download về và lưu local, sau đó cập nhật URL trong database
    """
    
    image_manager = ImageManager()
    products = await products_collection.find().to_list(length=None)
    
    print(f"\n🔍 Tìm thấy {len(products)} sản phẩm\n")
    
    stats = {
        'total_products': len(products),
        'products_updated': 0,
        'images_downloaded': 0,
        'images_failed': 0
    }
    
    for product in products:
        product_id = str(product['_id'])
        product_name = product.get('name', 'N/A')
        updated = False
        
        print(f"\n📦 Xử lý: {product_name} (ID: {product_id})")
        
        # 1. Migrate ảnh chính (image)
        if product.get('image'):
            old_url = product['image']
            
            # Check nếu là URL bên ngoài (http/https)
            if old_url.startswith('http'):
                print(f"  📥 Download ảnh chính: {old_url}")
                
                try:
                    # Download
                    response = requests.get(old_url, timeout=30)
                    response.raise_for_status()
                    
                    # Lấy extension từ URL
                    parsed = urlparse(old_url)
                    filename = Path(parsed.path).name or 'image.jpg'
                    
                    # Lưu local
                    new_url, metadata = image_manager.save_uploaded_file(
                        file_content=response.content,
                        original_filename=filename,
                        product_id=product_id
                    )
                    
                    # Cập nhật database
                    product['image'] = new_url
                    updated = True
                    stats['images_downloaded'] += 1
                    
                    print(f"  ✅ Đã lưu: {new_url}")
                    
                except Exception as e:
                    print(f"  ❌ Lỗi: {str(e)}")
                    stats['images_failed'] += 1
            else:
                print(f"  ℹ️  Ảnh chính đã local: {old_url}")
        
        # 2. Migrate gallery images
        if product.get('images') and isinstance(product['images'], list):
            new_images = []
            
            for i, old_url in enumerate(product['images']):
                if old_url.startswith('http'):
                    print(f"  📥 Download gallery [{i+1}]: {old_url}")
                    
                    try:
                        response = requests.get(old_url, timeout=30)
                        response.raise_for_status()
                        
                        parsed = urlparse(old_url)
                        filename = Path(parsed.path).name or f'gallery_{i}.jpg'
                        
                        new_url, metadata = image_manager.save_uploaded_file(
                            file_content=response.content,
                            original_filename=filename,
                            product_id=product_id
                        )
                        
                        new_images.append(new_url)
                        updated = True
                        stats['images_downloaded'] += 1
                        
                        print(f"  ✅ Đã lưu: {new_url}")
                        
                    except Exception as e:
                        print(f"  ❌ Lỗi: {str(e)}")
                        stats['images_failed'] += 1
                        new_images.append(old_url)  # Keep old URL
                else:
                    new_images.append(old_url)  # Keep local URL
            
            product['images'] = new_images
        
        # 3. Migrate ảnh trong color variants
        variants = product.get('variants', {})
        if isinstance(variants, dict) and 'colors' in variants:
            colors = variants['colors']
            if isinstance(colors, list):
                for color_idx, color in enumerate(colors):
                    if isinstance(color, dict) and 'images' in color:
                        color_images = color['images']
                        if isinstance(color_images, list):
                            new_color_images = []
                            
                            for img_idx, old_url in enumerate(color_images):
                                if old_url.startswith('http'):
                                    color_name = color.get('name', f'color_{color_idx}')
                                    print(f"  📥 Download {color_name} [{img_idx+1}]: {old_url}")
                                    
                                    try:
                                        response = requests.get(old_url, timeout=30)
                                        response.raise_for_status()
                                        
                                        parsed = urlparse(old_url)
                                        filename = Path(parsed.path).name or f'{color_name}_{img_idx}.jpg'
                                        
                                        new_url, metadata = image_manager.save_uploaded_file(
                                            file_content=response.content,
                                            original_filename=filename,
                                            product_id=product_id
                                        )
                                        
                                        new_color_images.append(new_url)
                                        updated = True
                                        stats['images_downloaded'] += 1
                                        
                                        print(f"  ✅ Đã lưu: {new_url}")
                                        
                                    except Exception as e:
                                        print(f"  ❌ Lỗi: {str(e)}")
                                        stats['images_failed'] += 1
                                        new_color_images.append(old_url)
                                else:
                                    new_color_images.append(old_url)
                            
                            color['images'] = new_color_images
        
        # Cập nhật database nếu có thay đổi
        if updated:
            await products_collection.update_one(
                {'_id': product['_id']},
                {'$set': product}
            )
            stats['products_updated'] += 1
            print(f"  💾 Đã cập nhật database")
    
    # In thống kê
    print("\n" + "="*60)
    print("📊 KẾT QUẢ MIGRATE:")
    print("="*60)
    print(f"Tổng sản phẩm:         {stats['total_products']}")
    print(f"Sản phẩm đã cập nhật:  {stats['products_updated']}")
    print(f"Ảnh downloaded:        {stats['images_downloaded']}")
    print(f"Ảnh lỗi:               {stats['images_failed']}")
    print("="*60)
    
    # Lấy thống kê storage
    storage = image_manager.get_storage_stats()
    print(f"\n💾 Storage: {storage['total_files']} files, {storage['total_size_mb']:.2f}MB")
    
    return stats


async def check_images_status():
    """
    Kiểm tra trạng thái ảnh hiện tại
    - Ảnh nào đã local
    - Ảnh nào còn URL bên ngoài
    - Ảnh nào bị thiếu
    """
    
    image_manager = ImageManager()
    products = await products_collection.find().to_list(length=None)
    
    stats = {
        'total_products': len(products),
        'products_with_images': 0,
        'total_images': 0,
        'local_images': 0,
        'external_images': 0,
        'missing_images': 0
    }
    
    print(f"\n🔍 KIỂM TRA {len(products)} SẢN PHẨM\n")
    
    for product in products:
        product_name = product.get('name', 'N/A')
        images_found = []
        
        # Check ảnh chính
        if product.get('image'):
            images_found.append(product['image'])
        
        # Check gallery
        if product.get('images') and isinstance(product['images'], list):
            images_found.extend(product['images'])
        
        # Check color variants
        variants = product.get('variants', {})
        if isinstance(variants, dict) and 'colors' in variants:
            colors = variants['colors']
            if isinstance(colors, list):
                for color in colors:
                    if isinstance(color, dict) and 'images' in color:
                        color_images = color['images']
                        if isinstance(color_images, list):
                            images_found.extend(color_images)
        
        if images_found:
            stats['products_with_images'] += 1
            stats['total_images'] += len(images_found)
            
            local_count = 0
            external_count = 0
            missing_count = 0
            
            for img_url in images_found:
                if img_url.startswith('http'):
                    external_count += 1
                    stats['external_images'] += 1
                elif img_url.startswith('/uploads/'):
                    # Check file có tồn tại không
                    filename = image_manager.extract_filename_from_url(img_url)
                    if filename and image_manager.file_exists(filename):
                        local_count += 1
                        stats['local_images'] += 1
                    else:
                        missing_count += 1
                        stats['missing_images'] += 1
            
            if external_count > 0 or missing_count > 0:
                print(f"📦 {product_name}")
                print(f"   Local: {local_count}, External: {external_count}, Missing: {missing_count}")
    
    # In thống kê
    print("\n" + "="*60)
    print("📊 THỐNG KÊ:")
    print("="*60)
    print(f"Tổng sản phẩm:             {stats['total_products']}")
    print(f"Sản phẩm có ảnh:           {stats['products_with_images']}")
    print(f"Tổng số ảnh:               {stats['total_images']}")
    print(f"  ✅ Ảnh local:            {stats['local_images']}")
    print(f"  🌐 Ảnh external:         {stats['external_images']}")
    print(f"  ❌ Ảnh missing:          {stats['missing_images']}")
    print("="*60)
    
    return stats


async def main():
    """Main function"""
    
    print("="*60)
    print("🖼️  MIGRATE IMAGES TOOL")
    print("="*60)
    print()
    print("Chọn hành động:")
    print("1. Kiểm tra trạng thái ảnh hiện tại")
    print("2. Migrate ảnh từ URL bên ngoài về local")
    print("3. Cả 2 (Check + Migrate)")
    print()
    
    choice = input("Nhập lựa chọn (1/2/3): ").strip()
    
    if choice == '1':
        await check_images_status()
    elif choice == '2':
        await migrate_images_from_urls()
    elif choice == '3':
        print("\n📍 BƯỚC 1: KIỂM TRA")
        await check_images_status()
        
        print("\n" + "="*60)
        confirm = input("\nTiếp tục migrate? (y/n): ").strip().lower()
        
        if confirm == 'y':
            print("\n📍 BƯỚC 2: MIGRATE")
            await migrate_images_from_urls()
        else:
            print("❌ Đã hủy")
    else:
        print("❌ Lựa chọn không hợp lệ")


if __name__ == "__main__":
    asyncio.run(main())
