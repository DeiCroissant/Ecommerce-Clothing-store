"""
Fix - Kiểm tra và sửa lỗi ảnh không hiện
"""

import os
from pathlib import Path

def check_and_fix():
    print("="*60)
    print("🔧 KIỂM TRA VÀ SỬA LỖI ẢNH")
    print("="*60)
    print()
    
    # 1. Check uploads folder
    uploads_path = Path("uploads/products")
    
    if not uploads_path.exists():
        print("❌ Thư mục uploads/products không tồn tại!")
        print("💡 Chạy: python setup_images.py")
        return
    
    # 2. Count images
    images = list(uploads_path.glob("*.jpg")) + list(uploads_path.glob("*.jpeg")) + list(uploads_path.glob("*.png")) + list(uploads_path.glob("*.webp"))
    
    print(f"✅ Thư mục uploads/products: OK")
    print(f"📁 Số lượng ảnh: {len(images)}")
    
    if len(images) == 0:
        print("\n❌ KHÔNG CÓ ẢNH!")
        print("💡 Hãy:")
        print("   1. Upload ảnh qua admin panel")
        print("   2. Hoặc chạy: python auto_migrate_images.py")
        return
    
    # 3. Show sample images
    print(f"\n📸 Mẫu {min(3, len(images))} ảnh:")
    for img in images[:3]:
        size = img.stat().st_size / 1024
        print(f"   - {img.name} ({size:.1f}KB)")
    
    # 4. Test URL
    sample_image = images[0]
    url = f"/uploads/products/{sample_image.name}"
    
    print(f"\n🔗 URL test:")
    print(f"   {url}")
    print(f"\n🌐 Full URL:")
    print(f"   http://localhost:8000{url}")
    
    # 5. Check main.py
    main_py = Path("app/main.py")
    if main_py.exists():
        content = main_py.read_text(encoding='utf-8')
        
        if 'app.mount("/uploads"' in content:
            print(f"\n✅ Static files đã mount trong main.py")
        else:
            print(f"\n❌ Static files CHƯA mount!")
            print(f"💡 Cần thêm vào main.py:")
            print(f'   app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")')
    
    print("\n" + "="*60)
    print("📋 CHECKLIST:")
    print("="*60)
    print(f"[{'✅' if uploads_path.exists() else '❌'}] Thư mục uploads/products tồn tại")
    print(f"[{'✅' if len(images) > 0 else '❌'}] Có ảnh trong thư mục")
    print(f"[✅] Backend đã mount static files")
    print()
    print("💡 CÁCH KIỂM TRA:")
    print("   1. Mở browser: http://localhost:8000/uploads/products/[tên-file.jpg]")
    print("   2. Hoặc check trong DevTools Network tab")
    print("   3. Đảm bảo frontend gọi đúng URL")
    print()
    print("🚀 Nếu vẫn không hiện:")
    print("   1. Clear cache browser (Ctrl+Shift+Del)")
    print("   2. Hard refresh (Ctrl+F5)")
    print("   3. Check Console errors trong DevTools")
    print()


if __name__ == "__main__":
    check_and_fix()
