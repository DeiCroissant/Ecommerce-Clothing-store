"""
Quick check - Kiểm tra nhanh database
"""

import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database import products_collection


async def quick_check():
    """Kiểm tra nhanh"""
    
    print("\n" + "="*60)
    print("🔍 KIỂM TRA DATABASE")
    print("="*60)
    
    # Count products
    total = await products_collection.count_documents({})
    print(f"\nTổng số sản phẩm: {total}")
    
    if total == 0:
        print("\n⚠️  Database trống! Chưa có sản phẩm nào.")
        print("💡 Hãy thêm sản phẩm từ admin panel trước.")
        return
    
    # Get first 3 products
    products = await products_collection.find().limit(3).to_list(length=3)
    
    print(f"\n📦 Mẫu {len(products)} sản phẩm đầu tiên:\n")
    
    for idx, product in enumerate(products, 1):
        name = product.get('name', 'N/A')
        image = product.get('image', 'N/A')
        images_count = len(product.get('images', []))
        
        print(f"{idx}. {name}")
        print(f"   Ảnh chính: {image[:80]}...")
        print(f"   Gallery: {images_count} ảnh")
        
        # Check variants
        variants = product.get('variants', {})
        if isinstance(variants, dict) and 'colors' in variants:
            colors = variants.get('colors', [])
            if colors:
                print(f"   Colors: {len(colors)} màu")
                for color in colors[:2]:  # Show first 2 colors
                    color_name = color.get('name', 'N/A')
                    color_images = len(color.get('images', []))
                    print(f"     - {color_name}: {color_images} ảnh")
        print()
    
    # Check images status
    external_count = 0
    local_count = 0
    
    all_products = await products_collection.find().to_list(length=None)
    
    for product in all_products:
        # Main image
        if product.get('image'):
            if product['image'].startswith('http'):
                external_count += 1
            else:
                local_count += 1
        
        # Gallery
        for img in product.get('images', []):
            if img.startswith('http'):
                external_count += 1
            else:
                local_count += 1
        
        # Color variants
        variants = product.get('variants', {})
        if isinstance(variants, dict) and 'colors' in variants:
            for color in variants.get('colors', []):
                for img in color.get('images', []):
                    if img.startswith('http'):
                        external_count += 1
                    else:
                        local_count += 1
    
    print("="*60)
    print("📊 TRẠNG THÁI ẢNH:")
    print("="*60)
    print(f"✅ Ảnh local:      {local_count}")
    print(f"🌐 Ảnh external:   {external_count}")
    
    if external_count > 0:
        print(f"\n💡 Cần chạy: python auto_migrate_images.py")
        print(f"   Hoặc chạy: MIGRATE_IMAGES.bat")
    else:
        print(f"\n✅ Tất cả ảnh đã local!")
    
    print("="*60 + "\n")


if __name__ == "__main__":
    asyncio.run(quick_check())
