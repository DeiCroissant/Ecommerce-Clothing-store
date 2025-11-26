"""
Script để dọn dẹp ảnh trùng lặp trong database
Chạy sau khi restart backend
"""
import requests
import json

API_URL = "http://localhost:8000"

def cleanup_duplicates():
    """Gọi API cleanup duplicates"""
    try:
        print("=" * 60)
        print("🧹 Bắt đầu dọn dẹp ảnh trùng lặp...")
        print("=" * 60)
        
        response = requests.post(
            f"{API_URL}/api/admin/products/cleanup-duplicates",
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ Dọn dẹp thành công!")
            print(f"📊 Tổng số sản phẩm: {result.get('total_products', 0)}")
            print(f"🔧 Số sản phẩm được sửa: {result.get('cleaned_products', 0)}")
            
            details = result.get('details', [])
            if details:
                print("\n📝 Chi tiết:")
                for item in details:
                    print(f"   - {item['product_name']}:")
                    if item.get('main_images_removed', 0) > 0:
                        print(f"     • Xóa {item['main_images_removed']} ảnh gallery trùng")
                    for color in item.get('colors_cleaned', []):
                        print(f"     • Màu '{color['color']}': xóa {color['removed']} ảnh trùng")
            else:
                print("\n✨ Không có ảnh trùng lặp nào cần dọn!")
        else:
            print(f"\n❌ Lỗi: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Không thể kết nối đến backend!")
        print("   Hãy đảm bảo backend đang chạy tại http://localhost:8000")
        print("\n   Chạy lệnh sau để khởi động backend:")
        print("   cd backend")
        print("   START_BACKEND.bat")
        
    except Exception as e:
        print(f"\n❌ Lỗi: {str(e)}")

def check_product(product_slug):
    """Kiểm tra một sản phẩm cụ thể"""
    try:
        response = requests.get(f"{API_URL}/api/products/slug/{product_slug}")
        if response.status_code == 200:
            product = response.json()
            print(f"\n📦 Sản phẩm: {product.get('name')}")
            print(f"   ID: {product.get('id')}")
            
            # Main images
            images = product.get('images', [])
            print(f"   Ảnh gallery: {len(images)}")
            unique_images = list(set(images))
            if len(images) != len(unique_images):
                print(f"   ⚠️ Có {len(images) - len(unique_images)} ảnh trùng!")
            
            # Color images
            colors = product.get('variants', {}).get('colors', [])
            for color in colors:
                color_images = color.get('images', [])
                unique_color_images = list(set(color_images))
                print(f"   Màu '{color.get('name')}': {len(color_images)} ảnh")
                if len(color_images) != len(unique_color_images):
                    print(f"      ⚠️ Có {len(color_images) - len(unique_color_images)} ảnh trùng!")
                    
        else:
            print(f"❌ Không tìm thấy sản phẩm: {product_slug}")
            
    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "check":
        if len(sys.argv) > 2:
            check_product(sys.argv[2])
        else:
            print("Usage: python cleanup_duplicates.py check <product-slug>")
    else:
        cleanup_duplicates()
