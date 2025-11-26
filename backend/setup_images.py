"""
Setup script - Tạo thư mục uploads và kiểm tra môi trường
"""

import os
from pathlib import Path

def setup_directories():
    """Tạo các thư mục cần thiết"""
    
    directories = [
        "uploads",
        "uploads/products",
    ]
    
    print("📁 Tạo thư mục...")
    
    for directory in directories:
        path = Path(directory)
        if not path.exists():
            path.mkdir(parents=True, exist_ok=True)
            print(f"  ✅ Đã tạo: {directory}")
        else:
            print(f"  ℹ️  Đã tồn tại: {directory}")
    
    # Tạo .gitkeep để commit thư mục vào git
    gitkeep_file = Path("uploads/products/.gitkeep")
    if not gitkeep_file.exists():
        gitkeep_file.touch()
        print(f"  ✅ Đã tạo: uploads/products/.gitkeep")
    
    # Tạo .gitignore để không commit ảnh vào git (optional)
    gitignore_file = Path("uploads/.gitignore")
    if not gitignore_file.exists():
        with open(gitignore_file, 'w') as f:
            f.write("# Ignore all images but keep folder structure\n")
            f.write("*.jpg\n")
            f.write("*.jpeg\n")
            f.write("*.png\n")
            f.write("*.webp\n")
            f.write("*.gif\n")
            f.write("\n# Keep .gitkeep files\n")
            f.write("!.gitkeep\n")
        print(f"  ✅ Đã tạo: uploads/.gitignore")


def check_dependencies():
    """Kiểm tra các dependencies cần thiết"""
    
    print("\n📦 Kiểm tra dependencies...")
    
    required_packages = {
        "fastapi": "fastapi",
        "motor": "motor",
        "Pillow": "PIL",  # Pillow import as PIL
        "requests": "requests"
    }
    
    missing = []
    
    for display_name, import_name in required_packages.items():
        try:
            __import__(import_name)
            print(f"  ✅ {display_name}")
        except ImportError:
            print(f"  ❌ {display_name} - CHƯA CÀI")
            missing.append(display_name)
    
    if missing:
        print("\n⚠️  Các package cần cài:")
        print(f"   pip install {' '.join(missing)}")
        return False
    
    return True


def display_info():
    """Hiển thị thông tin hướng dẫn"""
    
    print("\n" + "="*60)
    print("🎉 SETUP HOÀN TẤT!")
    print("="*60)
    print()
    print("📝 CÁC API ĐÃ CÓ:")
    print()
    print("1. Upload 1 ảnh:")
    print("   POST /api/products/upload-image")
    print("   Body: form-data với file và product_id (optional)")
    print()
    print("2. Upload nhiều ảnh:")
    print("   POST /api/products/upload-images")
    print("   Body: form-data với files[] và product_id (optional)")
    print()
    print("3. Xóa 1 ảnh:")
    print("   DELETE /api/products/delete-image?image_url=/uploads/products/abc.jpg")
    print()
    print("4. Xóa sản phẩm (tự động xóa ảnh):")
    print("   DELETE /api/products/{product_id}")
    print()
    print("5. Cleanup ảnh không dùng:")
    print("   POST /api/products/cleanup-images")
    print()
    print("6. Thống kê storage:")
    print("   GET /api/products/storage-stats")
    print()
    print("="*60)
    print()
    print("🔧 MIGRATE ẢNH HIỆN CÓ:")
    print("   python migrate_images.py")
    print()
    print("="*60)


if __name__ == "__main__":
    print("="*60)
    print("🚀 SETUP IMAGE MANAGEMENT SYSTEM")
    print("="*60)
    print()
    
    setup_directories()
    
    if check_dependencies():
        display_info()
    else:
        print("\n❌ Vui lòng cài đặt các dependencies còn thiếu!")
        print("   Chạy: pip install -r requirements.txt")
