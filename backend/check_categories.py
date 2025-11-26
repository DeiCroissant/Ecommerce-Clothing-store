"""Kiểm tra category của sản phẩm"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

async def check():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db = client["vyronfashion_db"]
    
    # Lấy tất cả sản phẩm và category của chúng
    products = await db.products.find({}).to_list(length=None)
    categories = await db.categories.find({}).to_list(length=None)
    
    print("=" * 70)
    print("DANH SÁCH CATEGORIES")
    print("=" * 70)
    for cat in categories:
        print(f"📁 {cat.get('name')} (slug: {cat.get('slug')})")
        subcats = cat.get("subcategories", [])
        for sub in subcats:
            print(f"   └── {sub.get('name')} (slug: {sub.get('slug')})")
    
    print("\n" + "=" * 70)
    print("DANH SÁCH SẢN PHẨM VÀ CATEGORY")
    print("=" * 70)
    for p in products:
        name = p.get("name", "Unknown")[:40]
        cat = p.get("category", {})
        cat_name = cat.get("name", "N/A") if isinstance(cat, dict) else "N/A"
        cat_slug = cat.get("slug", "N/A") if isinstance(cat, dict) else "N/A"
        print(f"📦 {name:<40} | Category: {cat_name} (slug: {cat_slug})")

asyncio.run(check())
