"""Kiểm tra chi tiết ảnh màu"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

async def check():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db = client["vyronfashion_db"]
    
    # Lấy sản phẩm Áo Thun Tay Dài
    product = await db.products.find_one({"slug": "ao-thun-tay-dai-line-art"})
    
    if product:
        print("=" * 60)
        print("Sản phẩm:", product.get("name"))
        print("Image chính:", product.get("image", "N/A")[:80] if product.get("image") else "N/A")
        
        colors = product.get("variants", {}).get("colors", [])
        print(f"\nSố màu: {len(colors)}")
        
        for color in colors:
            print(f"\n🎨 Màu: {color.get('name')}")
            print(f"   Slug: {color.get('slug')}")
            print(f"   Hex: {color.get('hex')}")
            images = color.get("images", [])
            print(f"   Số ảnh: {len(images)}")
            for i, img in enumerate(images):
                short_url = img[:70] + "..." if len(img) > 70 else img
                print(f"   [{i}]: {short_url}")

asyncio.run(check())
