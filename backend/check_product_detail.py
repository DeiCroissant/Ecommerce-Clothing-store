"""
Kiểm tra chi tiết ảnh của sản phẩm cụ thể
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from urllib.parse import quote_plus

async def check_product():
    username = quote_plus("admin")
    password = quote_plus("Matkhau001@")
    client = AsyncIOMotorClient(f"mongodb://{username}:{password}@159.223.32.252:27017/vyronfashion_db?authSource=admin", serverSelectionTimeoutMS=5000)
    db = client.vyronfashion_db
    
    print("\n" + "="*60)
    print("🔍 KIỂM TRA CHI TIẾT SẢN PHẨM")
    print("="*60)
    
    # Tìm sản phẩm "Áo thun tay ngắn nữ hình in .Regular"
    product = await db.products.find_one({"name": {"$regex": "Áo thun tay ngắn nữ hình in", "$options": "i"}})
    
    if not product:
        # Thử tìm theo slug
        product = await db.products.find_one({"slug": {"$regex": "ao-thun-tay-ngan-nu", "$options": "i"}})
    
    if not product:
        print("❌ Không tìm thấy sản phẩm")
        # List all products
        products = await db.products.find({}).to_list(length=10)
        print("\nCác sản phẩm hiện có:")
        for p in products:
            print(f"  - {p.get('name')} (slug: {p.get('slug')})")
        return
    
    print(f"\n✅ Sản phẩm: {product.get('name')}")
    print(f"   Slug: {product.get('slug')}")
    print(f"   ID: {product.get('_id')}")
    
    # Main image
    print(f"\n📸 Ảnh chính: {product.get('image')}")
    
    # Images array
    images = product.get("images", [])
    print(f"\n📸 Mảng images ({len(images)} ảnh):")
    for i, img in enumerate(images):
        print(f"   {i+1}. {img}")
    
    # Color images
    variants = product.get("variants", {})
    colors = variants.get("colors", [])
    print(f"\n🎨 Các màu ({len(colors)} màu):")
    for color in colors:
        color_images = color.get("images", [])
        print(f"\n   Màu: {color.get('name')} (slug: {color.get('slug')})")
        print(f"   Số ảnh: {len(color_images)}")
        for i, img in enumerate(color_images):
            print(f"      {i+1}. {img}")
    
    # Check for duplicates
    print("\n" + "="*60)
    print("🔍 KIỂM TRA TRÙNG LẶP")
    print("="*60)
    
    all_images = []
    if product.get("image"):
        all_images.append(("main", product.get("image")))
    for img in images:
        all_images.append(("gallery", img))
    for color in colors:
        for img in color.get("images", []):
            all_images.append((f"color:{color.get('name')}", img))
    
    seen = {}
    duplicates = []
    for source, img in all_images:
        if img in seen:
            duplicates.append((source, img, seen[img]))
        else:
            seen[img] = source
    
    if duplicates:
        print(f"\n⚠️  Tìm thấy {len(duplicates)} ảnh trùng lặp:")
        for source, img, original in duplicates:
            print(f"   - {img[:50]}...")
            print(f"     Xuất hiện ở: {original} và {source}")
    else:
        print("\n✅ Không có ảnh trùng lặp trong database")

if __name__ == "__main__":
    asyncio.run(check_product())
