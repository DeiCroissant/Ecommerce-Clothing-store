"""
Script cập nhật category cho sản phẩm
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

async def fix_categories():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db = client["vyronfashion_db"]
    products_collection = db["products"]
    categories_collection = db["categories"]
    
    # 1. Tạo category "Áo Thun" nếu chưa có (là subcategory của Áo Nam)
    existing_ao_thun = await categories_collection.find_one({"slug": "ao-thun"})
    if not existing_ao_thun:
        # Tìm category "Áo Nam" để lấy parent_id
        ao_nam = await categories_collection.find_one({"slug": "ao-nam"})
        if ao_nam:
            new_cat = {
                "name": "Áo Thun",
                "slug": "ao-thun",
                "description": "Bán Áo Thun",
                "parent_id": str(ao_nam["_id"]),
                "status": "active"
            }
            result = await categories_collection.insert_one(new_cat)
            print(f"✅ Đã tạo category 'Áo Thun' (ID: {result.inserted_id})")
    else:
        print("ℹ️  Category 'Áo Thun' đã tồn tại")
    
    # 2. Cập nhật sản phẩm có ao-polo-nam -> ao-polo
    update_result = await products_collection.update_many(
        {"category.slug": "ao-polo-nam"},
        {"$set": {"category": {"name": "Áo Polo", "slug": "ao-polo"}}}
    )
    print(f"✅ Đã cập nhật {update_result.modified_count} sản phẩm từ 'ao-polo-nam' → 'ao-polo'")
    
    # 3. Kiểm tra lại
    products = await products_collection.find({}).to_list(length=None)
    print("\n📊 Kết quả sau khi cập nhật:")
    for p in products:
        name = p.get("name", "Unknown")[:35]
        cat = p.get("category", {})
        cat_slug = cat.get("slug", "N/A") if isinstance(cat, dict) else "N/A"
        print(f"  📦 {name:<35} | {cat_slug}")

if __name__ == "__main__":
    asyncio.run(fix_categories())
