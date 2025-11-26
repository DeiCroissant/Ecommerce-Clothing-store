"""
Test Cloudinary Upload
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.cloudinary_uploader import is_cloudinary_configured, upload_image

def test_cloudinary():
    print("=" * 60)
    print("🧪 TEST CLOUDINARY UPLOAD")
    print("=" * 60)
    
    # Check configuration
    print("\n1. Kiểm tra cấu hình Cloudinary...")
    if is_cloudinary_configured():
        print("   ✅ Cloudinary đã được cấu hình")
    else:
        print("   ❌ Cloudinary CHƯA được cấu hình!")
        print("   Vui lòng kiểm tra các biến sau trong .env:")
        print("   - CLOUDINARY_CLOUD_NAME")
        print("   - CLOUDINARY_API_KEY")
        print("   - CLOUDINARY_API_SECRET")
        return
    
    # Test upload with a simple image
    print("\n2. Test upload ảnh mẫu...")
    
    # Tạo ảnh test đơn giản (1x1 pixel PNG)
    import io
    from PIL import Image
    
    img = Image.new('RGB', (100, 100), color='blue')
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    test_image_bytes = buffer.getvalue()
    
    try:
        url, metadata = upload_image(
            file_content=test_image_bytes,
            product_slug="test-product",
            color_name=None,
            image_index=0,
            is_main=True
        )
        
        print(f"\n   ✅ Upload thành công!")
        print(f"   📍 URL: {url}")
        print(f"   📊 Metadata: {metadata}")
        
    except Exception as e:
        print(f"\n   ❌ Upload thất bại: {str(e)}")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    test_cloudinary()
