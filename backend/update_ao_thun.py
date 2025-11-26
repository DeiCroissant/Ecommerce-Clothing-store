"""Cập nhật Áo Thun thành subcategory của Áo Nam"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

async def update_ao_nam():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db = client["vyronfashion_db"]
    
    # Tìm Áo Nam và Áo Thun
    ao_nam = await db.categories.find_one({"slug": "ao-nam"})
    ao_thun = await db.categories.find_one({"slug": "ao-thun"})
    
    if ao_nam and ao_thun:
        # Cập nhật Áo Thun có parent_id là Áo Nam
        await db.categories.update_one(
            {"_id": ao_thun["_id"]},
            {"$set": {"parent_id": str(ao_nam["_id"])}}
        )
        print("✅ Đã cập nhật 'Áo Thun' thành subcategory của 'Áo Nam'")
    else:
        print("❌ Không tìm thấy category")
    
asyncio.run(update_ao_nam())
