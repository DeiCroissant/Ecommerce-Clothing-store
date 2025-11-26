"""
Kiểm tra và sửa ảnh trùng lặp trong sản phẩm
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from urllib.parse import quote_plus

async def check_and_fix():
    username = quote_plus("admin")
    password = quote_plus("Matkhau001@")
    client = AsyncIOMotorClient(f"mongodb://{username}:{password}@159.223.32.252:27017/vyronfashion_db?authSource=admin")
    db = client.vyronfashion_db
    
    print("\n" + "="*60)
    print("🔍 KIỂM TRA VÀ SỬA ẢNH TRÙNG LẶP")
    print("="*60)
    
    # Lấy tất cả sản phẩm
    products = await db.products.find({}).to_list(length=None)
    
    fixed_count = 0
    
    for product in products:
        product_name = product.get("name", "Unknown")
        product_id = product.get("_id")
        needs_update = False
        update_data = {}
        
        # Kiểm tra images array
        images = product.get("images", [])
        if images:
            unique_images = list(dict.fromkeys(images))  # Remove duplicates, keep order
            if len(unique_images) != len(images):
                print(f"\n⚠️  {product_name}")
                print(f"   Images: {len(images)} -> {len(unique_images)} (removed {len(images) - len(unique_images)} duplicates)")
                update_data["images"] = unique_images
                needs_update = True
        
        # Kiểm tra color images
        variants = product.get("variants", {})
        colors = variants.get("colors", [])
        if colors:
            new_colors = []
            for color in colors:
                color_images = color.get("images", [])
                if color_images:
                    unique_color_images = list(dict.fromkeys(color_images))
                    if len(unique_color_images) != len(color_images):
                        print(f"   Color '{color.get('name')}': {len(color_images)} -> {len(unique_color_images)} images")
                        color["images"] = unique_color_images
                        needs_update = True
                new_colors.append(color)
            
            if needs_update and "images" not in update_data:
                update_data["variants"] = {**variants, "colors": new_colors}
            elif needs_update:
                update_data["variants"] = {**variants, "colors": new_colors}
        
        # Cập nhật database
        if needs_update:
            await db.products.update_one(
                {"_id": product_id},
                {"$set": update_data}
            )
            fixed_count += 1
    
    print(f"\n✅ Đã sửa {fixed_count} sản phẩm")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(check_and_fix())
