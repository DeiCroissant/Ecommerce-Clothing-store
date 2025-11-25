"""
Script để tối ưu MongoDB và test performance
Chạy: python backend/create_indexes.py
"""

from pymongo import MongoClient, ASCENDING, DESCENDING
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

print(f"🔗 Connecting to MongoDB: {DATABASE_NAME}")
client = MongoClient(MONGODB_URL)
db = client[DATABASE_NAME]

def create_indexes():
    """Tạo indexes cho tất cả collections"""
    print("\n🚀 Creating indexes for better performance...\n")
    
    # Products collection
    print("📦 Products Collection:")
    products = db.products
    
    try:
        products.create_index("slug", unique=True, name="idx_slug")
        print("  ✅ Created unique index on 'slug'")
    except Exception as e:
        print(f"  ⚠️  Index 'slug' already exists or error: {e}")
    
    products.create_index("category.slug", name="idx_category_slug")
    print("  ✅ Created index on 'category.slug'")
    
    products.create_index("status", name="idx_status")
    print("  ✅ Created index on 'status'")
    
    products.create_index([("created_at", DESCENDING)], name="idx_created_at_desc")
    print("  ✅ Created index on 'created_at' (descending)")
    
    products.create_index([("wishlist_count", DESCENDING)], name="idx_wishlist_count_desc")
    print("  ✅ Created index on 'wishlist_count' (descending)")
    
    products.create_index([("pricing.sale", ASCENDING)], name="idx_pricing_sale_asc")
    print("  ✅ Created index on 'pricing.sale' (ascending)")
    
    products.create_index([("pricing.sale", DESCENDING)], name="idx_pricing_sale_desc")
    print("  ✅ Created index on 'pricing.sale' (descending)")
    
    # Compound indexes for common queries
    products.create_index([("category.slug", ASCENDING), ("status", ASCENDING), ("created_at", DESCENDING)], 
                         name="idx_category_status_created")
    print("  ✅ Created compound index on 'category.slug + status + created_at'")
    
    # Categories collection
    print("\n📁 Categories Collection:")
    categories = db.categories
    try:
        categories.create_index("slug", unique=True, name="idx_slug")
        print("  ✅ Created unique index on 'slug'")
    except Exception as e:
        print(f"  ⚠️  Index 'slug' already exists or error: {e}")
    
    # Orders collection
    print("\n🛒 Orders Collection:")
    orders = db.orders
    orders.create_index("user_id", name="idx_user_id")
    print("  ✅ Created index on 'user_id'")
    
    orders.create_index([("created_at", DESCENDING)], name="idx_created_at_desc")
    print("  ✅ Created index on 'created_at' (descending)")
    
    orders.create_index("status", name="idx_status")
    print("  ✅ Created index on 'status'")
    
    # Reviews collection
    print("\n⭐ Reviews Collection:")
    reviews = db.reviews
    reviews.create_index("product_id", name="idx_product_id")
    print("  ✅ Created index on 'product_id'")
    
    reviews.create_index("user_id", name="idx_user_id")
    print("  ✅ Created index on 'user_id'")
    
    # Users collection
    print("\n👤 Users Collection:")
    users = db.users
    try:
        users.create_index("email", unique=True, name="idx_email")
        print("  ✅ Created unique index on 'email'")
    except Exception as e:
        print(f"  ⚠️  Index 'email' already exists or error: {e}")
    
    try:
        users.create_index("username", unique=True, name="idx_username")
        print("  ✅ Created unique index on 'username'")
    except Exception as e:
        print(f"  ⚠️  Index 'username' already exists or error: {e}")
    
    print("\n✅ All indexes created successfully!")

def list_indexes():
    """Liệt kê tất cả indexes"""
    print("\n📊 Current Indexes:\n")
    
    collections = ['products', 'categories', 'orders', 'reviews', 'users']
    
    for coll_name in collections:
        collection = db[coll_name]
        indexes = collection.list_indexes()
        print(f"📦 {coll_name}:")
        for idx in indexes:
            print(f"  - {idx['name']}: {idx.get('key', {})}")
        print()

def test_query_performance():
    """Test performance của queries"""
    print("\n⚡ Testing Query Performance:\n")
    
    products = db.products
    
    # Test 1: Query all products (newest first)
    print("1️⃣ Query all products (newest first):")
    start = time.time()
    result = list(products.find({}).sort("created_at", DESCENDING).limit(24))
    end = time.time()
    print(f"   Found {len(result)} products in {(end-start)*1000:.2f}ms")
    
    # Test 2: Query by category
    print("\n2️⃣ Query products by category:")
    start = time.time()
    result = list(products.find({"category.slug": "ao-thun"}).limit(24))
    end = time.time()
    print(f"   Found {len(result)} products in {(end-start)*1000:.2f}ms")
    
    # Test 3: Query by slug
    print("\n3️⃣ Query product by slug:")
    start = time.time()
    result = products.find_one({"slug": "ao-thun-basic"})
    end = time.time()
    print(f"   Found product in {(end-start)*1000:.2f}ms")
    
    # Test 4: Sort by wishlist count
    print("\n4️⃣ Query most wishlisted products:")
    start = time.time()
    result = list(products.find({}).sort("wishlist_count", DESCENDING).limit(24))
    end = time.time()
    print(f"   Found {len(result)} products in {(end-start)*1000:.2f}ms")
    
    # Test 5: Sort by price
    print("\n5️⃣ Query products sorted by price:")
    start = time.time()
    result = list(products.find({}).sort("pricing.sale", ASCENDING).limit(24))
    end = time.time()
    print(f"   Found {len(result)} products in {(end-start)*1000:.2f}ms")
    
    print("\n✅ Performance tests completed!")

if __name__ == "__main__":
    print("=" * 60)
    print("🛠️  MongoDB Optimization Tool")
    print("=" * 60)
    
    create_indexes()
    list_indexes()
    test_query_performance()
    
    print("\n" + "=" * 60)
    print("✅ All operations completed!")
    print("=" * 60)
    
    client.close()
