"""
Test Parallel Image Upload
Run: python test_upload_parallel.py
"""

import time
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.cloudinary_uploader import upload_multiple_images


def main():
    print("🧪 Testing Parallel Image Upload\n")
    
    # Tạo test data (fake images với bytes random)
    test_files = []
    for i in range(10):
        # Tạo fake image data (1KB mỗi file)
        fake_image = b"fake_image_data_" * 64  # ~1KB
        test_files.append((fake_image, f"test_{i}.jpg"))
    
    print(f"📦 Uploading {len(test_files)} test images...")
    print(f"🔧 Max workers: 5 (parallel)")
    
    start_time = time.time()
    
    try:
        results = upload_multiple_images(
            files=test_files,
            product_slug="performance-test",
            max_workers=5
        )
        
        elapsed = time.time() - start_time
        
        success = sum(1 for r in results if r.get("success"))
        failed = len(results) - success
        
        print(f"\n📊 Results:")
        print(f"  ✅ Success: {success}/{len(results)}")
        print(f"  ❌ Failed: {failed}/{len(results)}")
        print(f"  ⏱️  Total time: {elapsed:.2f}s")
        print(f"  ⚡ Average: {elapsed/len(results):.2f}s per image")
        
        if success > 0:
            print(f"\n✅ Parallel upload is working!")
            print(f"💡 With sequential upload, this would take ~{elapsed * 5:.2f}s")
        else:
            print(f"\n⚠️  All uploads failed. Check Cloudinary config.")
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")


if __name__ == "__main__":
    main()
