"""
Script để khôi phục ảnh sản phẩm từ Cloudinary vào MongoDB
Dựa trên cấu trúc folder: vyron-fashion/products/{product-slug}/...
"""
import asyncio
import os
import cloudinary
import cloudinary.api
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from urllib.parse import unquote

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


def remove_vietnamese_accents(text):
    """Loại bỏ dấu tiếng Việt"""
    if not text:
        return ""
    
    vietnamese_map = {
        'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
        'đ': 'd',
        'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
        'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
        'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
        'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
        'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
        'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
        'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
        'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
        'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
        'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
        'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
        'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
        'Đ': 'D'
    }
    
    result = ""
    for char in text:
        result += vietnamese_map.get(char, char)
    return result


def normalize_slug(text):
    """Chuẩn hóa slug để so sánh"""
    if not text:
        return ""
    # Decode URL encoding
    text = unquote(text)
    # Loại bỏ dấu tiếng Việt
    text = remove_vietnamese_accents(text)
    # Lowercase và loại bỏ ký tự đặc biệt
    return text.lower().strip().replace(" ", "-")


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
                    prefix="vyron-fashion/products",
                    max_results=500,
                    next_cursor=next_cursor
                )
            else:
                result = cloudinary.api.resources(
                    type="upload",
                    prefix="vyron-fashion/products",
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


def organize_cloudinary_images(resources):
    """
    Tổ chức ảnh theo product slug
    Return: {
        'product-slug': {
            'main': 'url',
            'colors': {
                'color-name': ['url1', 'url2', ...]
            }
        }
    }
    """
    products = {}
    
    for img in resources:
        public_id = img.get("public_id", "")
        url = img.get("secure_url", "")
        
        # Parse public_id: vyron-fashion/products/{product-slug}/...
        parts = public_id.split("/")
        
        if len(parts) < 4:
            continue
        
        # parts[0] = vyron-fashion
        # parts[1] = products
        # parts[2] = product-slug
        product_slug = parts[2]
        
        if product_slug not in products:
            products[product_slug] = {
                'main': None,
                'colors': {}
            }
        
        if len(parts) == 4 and parts[3] == "main":
            # Ảnh chính: vyron-fashion/products/{slug}/main
            products[product_slug]['main'] = url
        elif len(parts) >= 5 and parts[3] == "colors":
            # Ảnh màu: vyron-fashion/products/{slug}/colors/{color}/img-X
            color_name = parts[4]
            if color_name not in products[product_slug]['colors']:
                products[product_slug]['colors'][color_name] = []
            products[product_slug]['colors'][color_name].append({
                'url': url,
                'index': parts[5] if len(parts) > 5 else 'img-0'
            })
    
    # Sort ảnh màu theo index
    for product_slug in products:
        for color_name in products[product_slug]['colors']:
            images = products[product_slug]['colors'][color_name]
            images.sort(key=lambda x: x['index'])
            products[product_slug]['colors'][color_name] = [img['url'] for img in images]
    
    return products


async def restore_images():
    """Khôi phục ảnh từ Cloudinary vào MongoDB"""
    
    # Kiểm tra credentials
    if not CLOUDINARY_API_KEY or CLOUDINARY_API_KEY == "your_api_key_here":
        print("❌ Vui lòng điền CLOUDINARY_API_KEY vào file .env")
        return
    
    # Lấy ảnh từ Cloudinary
    cloudinary_images = get_all_cloudinary_images()
    
    if not cloudinary_images:
        print("❌ Không tìm thấy ảnh nào trên Cloudinary")
        return
    
    # Tổ chức ảnh theo product
    print("\n📂 Đang tổ chức ảnh theo sản phẩm...")
    organized = organize_cloudinary_images(cloudinary_images)
    print(f"✅ Tìm thấy {len(organized)} sản phẩm có ảnh trên Cloudinary")
    
    # Hiển thị một số sản phẩm
    print("\n📋 Một số sản phẩm trên Cloudinary:")
    for i, (slug, data) in enumerate(list(organized.items())[:5]):
        print(f"   {i+1}. {slug}")
        print(f"      - Ảnh chính: {'✅' if data['main'] else '❌'}")
        print(f"      - Màu sắc: {list(data['colors'].keys())}")
    
    # Kết nối MongoDB
    print(f"\n🔗 Đang kết nối MongoDB...")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    products_collection = db["products"]
    
    # Lấy tất cả sản phẩm từ MongoDB
    mongo_products = await products_collection.find({}).to_list(length=None)
    print(f"📦 Tìm thấy {len(mongo_products)} sản phẩm trong MongoDB")
    
    # Match và cập nhật
    updated_count = 0
    matched_count = 0
    
    for product in mongo_products:
        product_id = product.get("_id")
        product_name = product.get("name", "Unknown")
        product_slug = product.get("slug", "")
        colors = product.get("variants", {}).get("colors", [])
        
        # Tìm ảnh Cloudinary cho sản phẩm này
        cloudinary_data = None
        
        # Thử match với slug
        for cloud_slug, data in organized.items():
            # Normalize và so sánh
            cloud_slug_norm = normalize_slug(cloud_slug)
            product_slug_norm = normalize_slug(product_slug)
            product_name_norm = normalize_slug(product_name)
            
            # Match nếu slug giống hoặc tên sản phẩm chứa trong cloud_slug
            if (cloud_slug_norm == product_slug_norm or 
                product_slug_norm in cloud_slug_norm or
                cloud_slug_norm in product_slug_norm or
                product_name_norm.replace(" ", "-") in cloud_slug_norm):
                cloudinary_data = data
                matched_count += 1
                print(f"\n✅ Match: '{product_name}' → '{cloud_slug}'")
                break
        
        if not cloudinary_data:
            print(f"\n⚠️  Không match: '{product_name}' (slug: {product_slug})")
            continue
        
        # Cập nhật ảnh
        update_data = {}
        
        # 1. Ảnh chính
        if cloudinary_data['main']:
            update_data["image"] = cloudinary_data['main']
        
        # 2. Ảnh màu
        if colors and cloudinary_data['colors']:
            updated_colors = []
            for color in colors:
                color_name = color.get("name", "")
                color_slug = color.get("slug", "")
                
                # Tìm ảnh cho màu này
                cloud_color_images = None
                for cloud_color, images in cloudinary_data['colors'].items():
                    cloud_color_norm = normalize_slug(cloud_color)
                    color_name_norm = normalize_slug(color_name)
                    color_slug_norm = normalize_slug(color_slug)
                    
                    if (cloud_color_norm == color_name_norm or 
                        cloud_color_norm == color_slug_norm):
                        cloud_color_images = images
                        break
                
                if cloud_color_images:
                    color["images"] = cloud_color_images
                    print(f"   🎨 Màu '{color_name}': {len(cloud_color_images)} ảnh")
                
                updated_colors.append(color)
            
            update_data["variants.colors"] = updated_colors
        
        # Cập nhật MongoDB
        if update_data:
            await products_collection.update_one(
                {"_id": product_id},
                {"$set": update_data}
            )
            updated_count += 1
    
    print(f"\n" + "=" * 60)
    print(f"📊 KẾT QUẢ:")
    print(f"   📦 Tổng sản phẩm MongoDB: {len(mongo_products)}")
    print(f"   🔗 Sản phẩm đã match: {matched_count}")
    print(f"   ✅ Sản phẩm đã cập nhật: {updated_count}")
    print("=" * 60)


async def show_matching_preview():
    """Xem trước việc matching giữa MongoDB và Cloudinary"""
    
    # Lấy ảnh từ Cloudinary
    cloudinary_images = get_all_cloudinary_images()
    organized = organize_cloudinary_images(cloudinary_images)
    
    # Kết nối MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    products_collection = db["products"]
    
    mongo_products = await products_collection.find({}).to_list(length=None)
    
    print("\n" + "=" * 80)
    print("📋 DANH SÁCH SẢN PHẨM VÀ TRẠNG THÁI MATCHING")
    print("=" * 80)
    
    print("\n📂 Sản phẩm trên Cloudinary:")
    for slug in sorted(organized.keys()):
        print(f"   • {slug}")
    
    print("\n📦 Sản phẩm trong MongoDB:")
    for product in mongo_products:
        name = product.get("name", "Unknown")
        slug = product.get("slug", "N/A")
        print(f"   • {name} (slug: {slug})")


if __name__ == "__main__":
    print("=" * 60)
    print("🖼️  KHÔI PHỤC ẢNH TỪ CLOUDINARY VÀO MONGODB")
    print("=" * 60)
    
    print("\nChọn chức năng:")
    print("1. Xem trước matching (không cập nhật)")
    print("2. Khôi phục ảnh vào MongoDB")
    print("3. Thoát")
    
    choice = input("\nNhập lựa chọn (1/2/3): ").strip()
    
    if choice == "1":
        asyncio.run(show_matching_preview())
    elif choice == "2":
        confirm = input("\n⚠️  Bạn chắc chắn muốn cập nhật MongoDB? (y/n): ").strip().lower()
        if confirm == "y":
            asyncio.run(restore_images())
        else:
            print("Đã hủy.")
    else:
        print("Thoát.")
