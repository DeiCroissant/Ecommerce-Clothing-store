"""
Script fix slug của sản phẩm
"""
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import re

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

def slugify(text):
    """Tạo slug từ text"""
    text = text.lower()
    # Chuyển Unicode Vietnamese về ASCII
    text = text.replace('đ', 'd')
    # Xóa dấu
    import unicodedata
    text = unicodedata.normalize('NFD', text)
    text = text.encode('ascii', 'ignore').decode('utf-8')
    # Chuyển space thành dash, xóa ký tự đặc biệt
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

print(f"🔗 Connecting to MongoDB: {DATABASE_NAME}")
client = MongoClient(MONGODB_URL)
db = client[DATABASE_NAME]
products = db.products

# Lấy tất cả sản phẩm
all_products = list(products.find())
print(f"\n📊 Tổng số sản phẩm: {len(all_products)}\n")

fixed_count = 0

for product in all_products:
    name = product.get('name', '')
    current_slug = product.get('slug', '')
    
    if not name:
        continue
    
    # Tạo slug đúng
    correct_slug = slugify(name)
    
    if current_slug != correct_slug:
        print(f"🔧 Fixing: {name}")
        print(f"   Old slug: {current_slug}")
        print(f"   New slug: {correct_slug}")
        
        # Update slug
        products.update_one(
            {"_id": product["_id"]},
            {"$set": {"slug": correct_slug}}
        )
        fixed_count += 1
        print("   ✅ Updated!\n")
    else:
        print(f"✓ OK: {name} → {current_slug}")

print(f"\n{'='*60}")
print(f"✅ Fixed {fixed_count} products")
print(f"{'='*60}\n")

# Verify
print("🔍 Verifying some products:")
test_products = products.find().limit(3)
for p in test_products:
    print(f"  • {p.get('name')} → slug: {p.get('slug')}")

client.close()
