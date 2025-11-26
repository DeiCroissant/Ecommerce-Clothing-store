"""
Script tự động khôi phục ảnh từ Cloudinary vào MongoDB (không cần input)
"""
import asyncio
import os
import cloudinary
import cloudinary.api
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from urllib.parse import unquote

load_dotenv()

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "dipo4aj7a")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "vyronfashion_db")

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True
)


def remove_vietnamese_accents(text):
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
    if not text:
        return ""
    text = unquote(text)
    text = remove_vietnamese_accents(text)
    return text.lower().strip().replace(" ", "-")


def get_all_cloudinary_images():
    print("📥 Đang lấy danh sách ảnh từ Cloudinary...")
    all_resources = []
    next_cursor = None
    
    while True:
        try:
            if next_cursor:
                result = cloudinary.api.resources(type="upload", prefix="vyron-fashion/products", max_results=500, next_cursor=next_cursor)
            else:
                result = cloudinary.api.resources(type="upload", prefix="vyron-fashion/products", max_results=500)
            
            resources = result.get("resources", [])
            all_resources.extend(resources)
            
            next_cursor = result.get("next_cursor")
            if not next_cursor:
                break
        except Exception as e:
            print(f"❌ Lỗi: {e}")
            break
    
    print(f"✅ Tổng cộng: {len(all_resources)} ảnh trên Cloudinary")
    return all_resources


def organize_cloudinary_images(resources):
    products = {}
    
    for img in resources:
        public_id = img.get("public_id", "")
        url = img.get("secure_url", "")
        parts = public_id.split("/")
        
        if len(parts) < 4:
            continue
        
        product_slug = parts[2]
        
        if product_slug not in products:
            products[product_slug] = {"main": None, "colors": {}}
        
        if len(parts) == 4 and parts[3] == "main":
            products[product_slug]["main"] = url
        elif len(parts) >= 5 and parts[3] == "colors":
            color_name = parts[4]
            if color_name not in products[product_slug]["colors"]:
                products[product_slug]["colors"][color_name] = []
            products[product_slug]["colors"][color_name].append({
                "url": url,
                "index": parts[5] if len(parts) > 5 else "img-0"
            })
    
    for product_slug in products:
        for color_name in products[product_slug]["colors"]:
            images = products[product_slug]["colors"][color_name]
            images.sort(key=lambda x: x["index"])
            products[product_slug]["colors"][color_name] = [img["url"] for img in images]
    
    return products


async def restore_images():
    print("=" * 60)
    print("🖼️  KHÔI PHỤC ẢNH TỪ CLOUDINARY VÀO MONGODB")
    print("=" * 60)
    
    cloudinary_images = get_all_cloudinary_images()
    if not cloudinary_images:
        print("❌ Không tìm thấy ảnh nào")
        return
    
    organized = organize_cloudinary_images(cloudinary_images)
    print(f"📂 Tìm thấy {len(organized)} sản phẩm trên Cloudinary")
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    products_collection = db["products"]
    
    mongo_products = await products_collection.find({}).to_list(length=None)
    print(f"📦 Tìm thấy {len(mongo_products)} sản phẩm trong MongoDB\n")
    
    updated_count = 0
    
    for product in mongo_products:
        product_id = product.get("_id")
        product_name = product.get("name", "Unknown")
        product_slug = product.get("slug", "")
        colors = product.get("variants", {}).get("colors", [])
        
        cloudinary_data = None
        matched_cloud_slug = None
        
        for cloud_slug, data in organized.items():
            cloud_slug_norm = normalize_slug(cloud_slug)
            product_slug_norm = normalize_slug(product_slug)
            
            if cloud_slug_norm == product_slug_norm or product_slug_norm in cloud_slug_norm or cloud_slug_norm in product_slug_norm:
                cloudinary_data = data
                matched_cloud_slug = cloud_slug
                break
        
        if not cloudinary_data:
            print(f"⚠️  Không match: {product_name}")
            continue
        
        print(f"✅ Match: {product_name} → {matched_cloud_slug}")
        
        update_data = {}
        
        if cloudinary_data["main"]:
            update_data["image"] = cloudinary_data["main"]
            print(f"   📷 Ảnh chính: ✅")
        
        if colors and cloudinary_data["colors"]:
            updated_colors = []
            for color in colors:
                color_name = color.get("name", "")
                
                cloud_color_images = None
                for cloud_color, images in cloudinary_data["colors"].items():
                    cloud_color_norm = normalize_slug(cloud_color)
                    color_name_norm = normalize_slug(color_name)
                    
                    if cloud_color_norm == color_name_norm:
                        cloud_color_images = images
                        break
                
                # Nếu không match, thử match với tên màu có prefix "mau-"
                if not cloud_color_images:
                    for cloud_color, images in cloudinary_data["colors"].items():
                        cloud_color_norm = normalize_slug(cloud_color)
                        color_name_norm = normalize_slug(color_name)
                        
                        # Thử match: "mau-den" vs "den", hoặc "Đen" vs "mau-den"
                        if (cloud_color_norm == f"mau-{color_name_norm}" or 
                            f"mau-{cloud_color_norm}" == color_name_norm or
                            cloud_color_norm.replace("mau-", "") == color_name_norm or
                            cloud_color_norm == color_name_norm.replace("mau-", "")):
                            cloud_color_images = images
                            break
                
                if cloud_color_images:
                    color["images"] = cloud_color_images
                    print(f"   🎨 Màu {color_name}: {len(cloud_color_images)} ảnh")
                
                updated_colors.append(color)
            
            update_data["variants.colors"] = updated_colors
        
        if update_data:
            await products_collection.update_one({"_id": product_id}, {"$set": update_data})
            updated_count += 1
    
    print("\n" + "=" * 60)
    print(f"📊 KẾT QUẢ:")
    print(f"   📦 Tổng sản phẩm MongoDB: {len(mongo_products)}")
    print(f"   ✅ Sản phẩm đã cập nhật: {updated_count}")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(restore_images())
