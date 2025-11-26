"""
Script fix indexes và tạo collections thiếu
Chạy: python backend/fix_indexes.py
"""

from pymongo import MongoClient, ASCENDING, DESCENDING
import os
from dotenv import load_dotenv

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

print(f"🔗 Kết nối MongoDB: {DATABASE_NAME}\n")
client = MongoClient(MONGODB_URL)
db = client[DATABASE_NAME]

print("="*80)
print("🔧 FIX INDEXES VÀ TẠO COLLECTIONS THIẾU")
print("="*80 + "\n")

# 1. Tạo collections thiếu
print("📦 Tạo collections thiếu:")
collections_needed = ['wishlists', 'carts']

for coll_name in collections_needed:
    if coll_name not in db.list_collection_names():
        db.create_collection(coll_name)
        print(f"   ✅ Đã tạo collection: {coll_name}")
    else:
        print(f"   ℹ️  Collection {coll_name} đã tồn tại")

# 2. Tạo indexes cho wishlists
print("\n❤️  Tạo indexes cho WISHLISTS:")
wishlists = db.wishlists
try:
    wishlists.create_index("user_id", name="idx_user_id")
    print("   ✅ Đã tạo index: user_id")
except Exception as e:
    print(f"   ℹ️  Index user_id: {e}")

try:
    wishlists.create_index([("updated_at", DESCENDING)], name="idx_updated_at_desc")
    print("   ✅ Đã tạo index: updated_at")
except Exception as e:
    print(f"   ℹ️  Index updated_at: {e}")

# 3. Tạo indexes cho carts
print("\n🛒 Tạo indexes cho CARTS:")
carts = db.carts
try:
    carts.create_index("user_id", name="idx_user_id")
    print("   ✅ Đã tạo index: user_id")
except Exception as e:
    print(f"   ℹ️  Index user_id: {e}")

try:
    carts.create_index([("updated_at", DESCENDING)], name="idx_updated_at_desc")
    print("   ✅ Đã tạo index: updated_at")
except Exception as e:
    print(f"   ℹ️  Index updated_at: {e}")

# 4. Kiểm tra và tạo indexes còn thiếu cho products
print("\n📦 Kiểm tra indexes cho PRODUCTS:")
products = db.products

# Lấy danh sách indexes hiện tại
existing_indexes = {idx['name']: idx.get('key', {}) for idx in products.list_indexes()}

# Các indexes cần thiết
needed_indexes = [
    ('slug', 'slug_1'),
    ('category.slug', 'category.slug_1'),
    ('status', 'status_1'),
    ('created_at', 'created_at_-1'),
    ('wishlist_count', 'wishlist_count_-1'),
    ('pricing.sale', 'pricing.sale_1'),
]

for field, index_name in needed_indexes:
    if index_name in existing_indexes or any(field in str(key) for key in existing_indexes.values()):
        print(f"   ✅ Index {field} đã tồn tại")
    else:
        print(f"   ⚠️  Index {field} chưa có")

# 5. Tạo compound indexes nếu chưa có
print("\n📦 Tạo compound indexes cho PRODUCTS:")
try:
    products.create_index(
        [("status", ASCENDING), ("created_at", DESCENDING)],
        name="idx_status_created_at"
    )
    print("   ✅ Đã tạo compound index: status + created_at")
except Exception as e:
    if 'already exists' in str(e):
        print("   ℹ️  Compound index status + created_at đã tồn tại")
    else:
        print(f"   ⚠️  Lỗi tạo compound index: {e}")

# 6. Tạo indexes cho orders
print("\n🛒 Tạo indexes cho ORDERS:")
orders = db.orders
try:
    orders.create_index("user_id", name="idx_user_id")
    print("   ✅ Đã tạo index: user_id")
except Exception as e:
    print(f"   ℹ️  Index user_id: {e}")

try:
    orders.create_index([("created_at", DESCENDING)], name="idx_created_at_desc")
    print("   ✅ Đã tạo index: created_at")
except Exception as e:
    print(f"   ℹ️  Index created_at: {e}")

try:
    orders.create_index("status", name="idx_status")
    print("   ✅ Đã tạo index: status")
except Exception as e:
    print(f"   ℹ️  Index status: {e}")

print("\n" + "="*80)
print("✅ HOÀN THÀNH!")
print("="*80)

print("\n💡 Bước tiếp theo:")
print("   1. Chạy lại: python backend/quick_check_db.py")
print("   2. Restart backend: python backend/app/main.py")
print("   3. Test lại trang web xem có nhanh hơn không")

client.close()
