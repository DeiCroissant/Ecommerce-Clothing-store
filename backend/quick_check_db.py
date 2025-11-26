"""
Script kiểm tra nhanh database
Chạy: python backend/quick_check_db.py
"""

from pymongo import MongoClient
import os
from dotenv import load_dotenv
import time

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
print("📊 THỐNG KÊ COLLECTIONS")
print("="*80 + "\n")

collections_to_check = ['products', 'categories', 'orders', 'reviews', 'users', 'wishlists', 'carts']

for coll_name in collections_to_check:
    if coll_name in db.list_collection_names():
        collection = db[coll_name]
        count = collection.count_documents({})
        indexes = list(collection.list_indexes())
        print(f"📦 {coll_name.upper():<15} | Số lượng: {count:>6} | Indexes: {len(indexes)}")
    else:
        print(f"📦 {coll_name.upper():<15} | ❌ Không tồn tại")

print("\n" + "="*80)
print("🔍 KIỂM TRA INDEXES")
print("="*80 + "\n")

# Check Products indexes
products = db.products
product_indexes = {idx['name']: idx.get('key', {}) for idx in products.list_indexes()}

print("📦 PRODUCTS:")
important_indexes = ['idx_slug', 'idx_category_slug', 'idx_status', 'idx_created_at_desc']
for idx_name in important_indexes:
    if idx_name in product_indexes:
        print(f"   ✅ {idx_name}")
    else:
        print(f"   ❌ THIẾU: {idx_name}")

# Check Carts indexes
if 'carts' in db.list_collection_names():
    carts = db.carts
    cart_indexes = {idx['name']: idx.get('key', {}) for idx in carts.list_indexes()}
    
    print("\n🛒 CARTS:")
    has_user_index = any('user_id' in str(key) for key in cart_indexes.values())
    if has_user_index:
        print(f"   ✅ user_id index")
    else:
        print(f"   ❌ THIẾU: user_id index")
        print(f"   💡 Chạy: db.carts.create_index('user_id')")

# Check Wishlists indexes
if 'wishlists' in db.list_collection_names():
    wishlists = db.wishlists
    wishlist_indexes = {idx['name']: idx.get('key', {}) for idx in wishlists.list_indexes()}
    
    print("\n❤️  WISHLISTS:")
    has_user_index = any('user_id' in str(key) for key in wishlist_indexes.values())
    if has_user_index:
        print(f"   ✅ user_id index")
    else:
        print(f"   ❌ THIẾU: user_id index")
        print(f"   💡 Chạy: db.wishlists.create_index('user_id')")

print("\n" + "="*80)
print("⚡ TEST QUERIES (mẫu nhỏ)")
print("="*80 + "\n")

# Test Products query
print("📦 PRODUCTS:")
products = db.products

# Test 1: Get all products
start = time.time()
result = list(products.find({}).limit(10))
elapsed = (end := time.time()) - start
status = "✅" if elapsed < 0.1 else "⚠️" if elapsed < 0.5 else "❌"
print(f"   {status} Lấy 10 products: {elapsed*1000:.2f}ms")

# Test 2: Get by slug (if exists)
if result and 'slug' in result[0]:
    start = time.time()
    product = products.find_one({"slug": result[0]['slug']})
    elapsed = (end := time.time()) - start
    status = "✅" if elapsed < 0.05 else "⚠️" if elapsed < 0.2 else "❌"
    print(f"   {status} Tìm theo slug: {elapsed*1000:.2f}ms")

# Test Carts
if 'carts' in db.list_collection_names():
    print("\n🛒 CARTS:")
    carts = db.carts
    cart_count = carts.count_documents({})
    
    if cart_count > 0:
        sample = carts.find_one({})
        if sample and 'user_id' in sample:
            start = time.time()
            cart = carts.find_one({"user_id": sample['user_id']})
            elapsed = (end := time.time()) - start
            status = "✅" if elapsed < 0.05 else "⚠️" if elapsed < 0.2 else "❌"
            print(f"   {status} Lấy cart theo user_id: {elapsed*1000:.2f}ms")
            
            if cart and 'items' in cart:
                print(f"   ℹ️  Cart có {len(cart['items'])} items")
    else:
        print("   ℹ️  Chưa có dữ liệu")

# Test Wishlists
if 'wishlists' in db.list_collection_names():
    print("\n❤️  WISHLISTS:")
    wishlists = db.wishlists
    wishlist_count = wishlists.count_documents({})
    
    if wishlist_count > 0:
        sample = wishlists.find_one({})
        if sample and 'user_id' in sample:
            start = time.time()
            wishlist = wishlists.find_one({"user_id": sample['user_id']})
            elapsed = (end := time.time()) - start
            status = "✅" if elapsed < 0.05 else "⚠️" if elapsed < 0.2 else "❌"
            print(f"   {status} Lấy wishlist theo user_id: {elapsed*1000:.2f}ms")
            
            if wishlist and 'wishlist' in wishlist:
                print(f"   ℹ️  Wishlist có {len(wishlist['wishlist'])} items")
    else:
        print("   ℹ️  Chưa có dữ liệu")

# Test Orders
if 'orders' in db.list_collection_names():
    print("\n🛒 ORDERS:")
    orders = db.orders
    order_count = orders.count_documents({})
    print(f"   ℹ️  Tổng: {order_count} orders")
    
    if order_count > 0:
        start = time.time()
        result = list(orders.find({}).limit(10))
        elapsed = (end := time.time()) - start
        status = "✅" if elapsed < 0.1 else "⚠️" if elapsed < 0.5 else "❌"
        print(f"   {status} Lấy 10 orders: {elapsed*1000:.2f}ms")

print("\n" + "="*80)
print("💡 KHUYẾN NGHỊ")
print("="*80)

# Tạo indexes nếu thiếu
missing_indexes = []
if 'idx_user_id' not in cart_indexes and 'carts' in db.list_collection_names():
    missing_indexes.append("carts: user_id")
if 'idx_user_id' not in wishlist_indexes and 'wishlists' in db.list_collection_names():
    missing_indexes.append("wishlists: user_id")

if missing_indexes:
    print("\n⚠️  CÓ INDEXES BỊ THIẾU:")
    for idx in missing_indexes:
        print(f"   - {idx}")
    print("\n💡 Giải pháp:")
    print("   python backend/create_indexes.py")
else:
    print("\n✅ Indexes OK!")

print("\n💡 Để kiểm tra API endpoints chậm:")
print("   1. Mở browser DevTools > Network tab")
print("   2. Lọc theo XHR/Fetch")
print("   3. Xem response time của từng API call")
print("   4. Tìm API nào > 1s là cần tối ưu")

print("\n" + "="*80)
print("✅ HOÀN THÀNH!")
print("="*80)

client.close()
