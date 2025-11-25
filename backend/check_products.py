"""
Script kiểm tra sản phẩm trong MongoDB
"""
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import json

load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    MONGODB_HOST = os.getenv("MONGODB_HOST", "localhost")
    MONGODB_PORT = os.getenv("MONGODB_PORT", "27017")
    MONGODB_USERNAME = os.getenv("MONGODB_USERNAME")
    MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")
    MONGODB_AUTH_DB = os.getenv("MONGODB_AUTH_DB", "admin")
    
    if MONGODB_USERNAME and MONGODB_PASSWORD:
        MONGODB_URL = f"mongodb://{MONGODB_USERNAME}:{MONGODB_PASSWORD}@{MONGODB_HOST}:{MONGODB_PORT}/{MONGODB_AUTH_DB}?authSource={MONGODB_AUTH_DB}"
    else:
        MONGODB_URL = f"mongodb://{MONGODB_HOST}:{MONGODB_PORT}"

DATABASE_NAME = os.getenv("DATABASE_NAME", "vyronfashion_db")

print(f"🔗 Connecting to MongoDB: {DATABASE_NAME}")
client = MongoClient(MONGODB_URL)
db = client[DATABASE_NAME]

products = db.products

# Đếm tổng số sản phẩm
total = products.count_documents({})
print(f"\n📊 Tổng số sản phẩm: {total}")

if total == 0:
    print("\n❌ KHÔNG CÓ SẢN PHẨM NÀO TRONG DATABASE!")
    print("Cần thêm dữ liệu sản phẩm vào database.")
else:
    # Lấy 3 sản phẩm đầu tiên
    print("\n📦 3 sản phẩm đầu tiên:\n")
    for i, product in enumerate(products.find().limit(3), 1):
        print(f"{i}. {product.get('name', 'N/A')}")
        print(f"   - Slug: {product.get('slug', 'N/A')}")
        print(f"   - Image: {product.get('image', 'NO IMAGE')}")
        print(f"   - Images array: {len(product.get('images', []))} ảnh")
        
        # Kiểm tra variants
        variants = product.get('variants', {})
        colors = variants.get('colors', [])
        sizes = variants.get('sizes', [])
        
        print(f"   - Colors: {len(colors)} màu")
        if colors:
            for color in colors[:2]:  # Hiển thị 2 màu đầu
                print(f"     • {color.get('name', 'N/A')} - {len(color.get('images', []))} ảnh")
        
        print(f"   - Sizes: {len(sizes)} size")
        print()

    # Kiểm tra sản phẩm có slug cụ thể
    test_slugs = ['anh-nguye-vlu', 'ao-thun-basic', 'ao-polo']
    print("\n🔍 Kiểm tra slug cụ thể:")
    for slug in test_slugs:
        product = products.find_one({"slug": slug})
        if product:
            print(f"✅ Tìm thấy slug '{slug}': {product.get('name')}")
            print(f"   Image: {product.get('image', 'NO IMAGE')}")
        else:
            print(f"❌ KHÔNG tìm thấy slug '{slug}'")

print("\n" + "="*60)
client.close()
