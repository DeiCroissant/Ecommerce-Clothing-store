"""Kiểm tra sản phẩm đã được cập nhật"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

async def check():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db = client["vyronfashion_db"]
    
    # Lấy 2 sản phẩm để kiểm tra
    products = await db.products.find({}).limit(3).to_list(length=3)
    
    for product in products:
        print("=" * 60)
        name = product.get("name", "Unknown")
        print(f"Sản phẩm: {name}")
        
        image = product.get("image", "N/A")
        if image and "cloudinary" in image:
            print(f"✅ Ảnh chính: {image[:70]}...")
        else:
            print(f"⚠️ Ảnh chính: {image[:70] if image else 'Không có'}...")
        
        colors = product.get("variants", {}).get("colors", [])
        for color in colors:
            color_name = color.get("name", "Unknown")
            images = color.get("images", [])
            if images and "cloudinary" in images[0]:
                print(f"✅ Màu {color_name}: {len(images)} ảnh Cloudinary")
            else:
                print(f"⚠️ Màu {color_name}: {len(images)} ảnh")

asyncio.run(check())
