"""
Script để khôi phục ảnh sản phẩm từ Cloudinary vào MongoDB
Chạy: python restore_cloudinary_images.py

Bước 1: Điền CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET vào .env
Bước 2: Chạy script này
"""
import asyncio
import os
import cloudinary
import cloudinary.api
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "dipo4aj7a")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

# MongoDB configuration
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "vyronfashion_db")

# Configure Cloudinary
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True
)


def get_cloudinary_url(public_id, format="jpg"):
    """Tạo URL Cloudinary từ public_id"""
    return f"https://res.cloudinary.com/{CLOUDINARY_CLOUD_NAME}/image/upload/{public_id}.{format}"


def get_all_cloudinary_images():
    """Lấy tất cả ảnh từ Cloudinary"""
    print("📥 Đang lấy danh sách ảnh từ Cloudinary...")
    
    all_resources = []
    next_cursor = None
    
    while True:
        try:
            if next_cursor:
                result = cloudinary.api.resources(
                    type="upload",
                    max_results=500,
                    next_cursor=next_cursor
                )
            else:
                result = cloudinary.api.resources(
                    type="upload",
                    max_results=500
                )
            
            resources = result.get("resources", [])
            all_resources.extend(resources)
            
            print(f"   Đã lấy {len(all_resources)} ảnh...")
            
            next_cursor = result.get("next_cursor")
            if not next_cursor:
                break
                
        except Exception as e:
            print(f"❌ Lỗi khi lấy ảnh từ Cloudinary: {e}")
            break
    
    print(f"✅ Tổng cộng: {len(all_resources)} ảnh trên Cloudinary")
    return all_resources


async def restore_images():
    """Khôi phục ảnh từ Cloudinary vào MongoDB"""
    
    # Kiểm tra credentials
    if not CLOUDINARY_API_KEY or CLOUDINARY_API_KEY == "your_api_key_here":
        print("❌ Vui lòng điền CLOUDINARY_API_KEY vào file .env")
        print("   Lấy từ: https://console.cloudinary.com/settings/api-keys")
        return
    
    if not CLOUDINARY_API_SECRET or CLOUDINARY_API_SECRET == "your_api_secret_here":
        print("❌ Vui lòng điền CLOUDINARY_API_SECRET vào file .env")
        return
    
    # Lấy ảnh từ Cloudinary
    cloudinary_images = get_all_cloudinary_images()
    
    if not cloudinary_images:
        print("❌ Không tìm thấy ảnh nào trên Cloudinary")
        return
    
    # Tạo dictionary để tra cứu nhanh
    # Key: tên file (không có extension), Value: URL đầy đủ
    image_map = {}
    for img in cloudinary_images:
        public_id = img.get("public_id", "")
        format = img.get("format", "jpg")
        url = img.get("secure_url") or get_cloudinary_url(public_id, format)
        
        # Lấy tên file từ public_id (bỏ folder path)
        filename = public_id.split("/")[-1].lower()
        image_map[filename] = url
        
        # Cũng lưu với full public_id
        image_map[public_id.lower()] = url
    
    print(f"\n📊 Đã tạo map với {len(image_map)} entries")
    
    # Kết nối MongoDB
    print(f"\n🔗 Đang kết nối MongoDB...")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    products = db["products"]
    
    # Lấy tất cả sản phẩm
    total = await products.count_documents({})
    print(f"📦 Tìm thấy {total} sản phẩm trong database")
    
    updated_count = 0
    cursor = products.find({})
    
    async for product in cursor:
        product_id = product.get("_id")
        product_name = product.get("name", "Unknown")
        current_image = product.get("image", "")
        colors = product.get("variants", {}).get("colors", [])
        
        needs_update = False
        update_data = {}
        
        # 1. Cập nhật ảnh chính
        if current_image and not current_image.startswith("http"):
            # Tìm ảnh tương ứng trên Cloudinary
            filename = current_image.split("/")[-1].lower()
            filename_no_ext = filename.rsplit(".", 1)[0] if "." in filename else filename
            
            # Thử tìm với nhiều cách
            cloudinary_url = (
                image_map.get(filename) or 
                image_map.get(filename_no_ext) or
                None
            )
            
            if cloudinary_url:
                update_data["image"] = cloudinary_url
                needs_update = True
                print(f"✅ {product_name}: Tìm thấy ảnh chính")
            else:
                print(f"⚠️  {product_name}: Không tìm thấy ảnh chính ({filename})")
        
        # 2. Cập nhật ảnh trong colors
        if colors:
            updated_colors = []
            for color in colors:
                color_images = color.get("images", [])
                updated_images = []
                
                for img in color_images:
                    if img and not img.startswith("http"):
                        filename = img.split("/")[-1].lower()
                        filename_no_ext = filename.rsplit(".", 1)[0] if "." in filename else filename
                        
                        cloudinary_url = (
                            image_map.get(filename) or 
                            image_map.get(filename_no_ext) or
                            None
                        )
                        
                        if cloudinary_url:
                            updated_images.append(cloudinary_url)
                            needs_update = True
                        else:
                            # Giữ nguyên nếu không tìm thấy
                            updated_images.append(img)
                    else:
                        updated_images.append(img)
                
                color["images"] = updated_images
                updated_colors.append(color)
            
            if needs_update:
                update_data["variants.colors"] = updated_colors
        
        # Cập nhật database
        if needs_update and update_data:
            await products.update_one(
                {"_id": product_id},
                {"$set": update_data}
            )
            updated_count += 1
    
    print(f"\n📊 Kết quả:")
    print(f"   ✅ Đã cập nhật: {updated_count} sản phẩm")
    print(f"   📦 Tổng sản phẩm: {total}")


async def list_cloudinary_images():
    """Chỉ liệt kê ảnh trên Cloudinary (không cần API key để xem URL)"""
    print("📋 Đang kiểm tra ảnh trên Cloudinary...")
    
    # Kiểm tra credentials
    if not CLOUDINARY_API_KEY or CLOUDINARY_API_KEY == "your_api_key_here":
        print("\n⚠️  Chưa có API credentials!")
        print("   Để script hoạt động, bạn cần:")
        print("   1. Vào https://console.cloudinary.com/settings/api-keys")
        print("   2. Copy API Key và API Secret")
        print("   3. Điền vào file .env:")
        print(f"      CLOUDINARY_CLOUD_NAME={CLOUDINARY_CLOUD_NAME}")
        print("      CLOUDINARY_API_KEY=your_key")
        print("      CLOUDINARY_API_SECRET=your_secret")
        return
    
    images = get_all_cloudinary_images()
    
    print("\n📸 10 ảnh đầu tiên:")
    for i, img in enumerate(images[:10], 1):
        public_id = img.get("public_id", "")
        url = img.get("secure_url", "")
        print(f"   {i}. {public_id}")
        print(f"      URL: {url}")


if __name__ == "__main__":
    print("=" * 60)
    print("🖼️  KHÔI PHỤC ẢNH TỪ CLOUDINARY VÀO MONGODB")
    print("=" * 60)
    
    print("\nChọn chức năng:")
    print("1. Liệt kê ảnh trên Cloudinary")
    print("2. Khôi phục ảnh vào MongoDB")
    print("3. Thoát")
    
    choice = input("\nNhập lựa chọn (1/2/3): ").strip()
    
    if choice == "1":
        asyncio.run(list_cloudinary_images())
    elif choice == "2":
        asyncio.run(restore_images())
    else:
        print("Thoát.")
