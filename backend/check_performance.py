"""
Script kiểm tra toàn bộ database và performance
Chạy: python backend/check_performance.py
"""

from pymongo import MongoClient
import os
from dotenv import load_dotenv
import time
from datetime import datetime

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

print(f"🔗 Kết nối MongoDB: {DATABASE_NAME}")
client = MongoClient(MONGODB_URL)
db = client[DATABASE_NAME]

def check_collection_stats():
    """Kiểm tra thống kê của tất cả collections"""
    print("\n" + "="*80)
    print("📊 THỐNG KÊ DATABASE")
    print("="*80)
    
    collections = ['products', 'categories', 'orders', 'reviews', 'users', 'wishlists', 'carts']
    
    for coll_name in collections:
        if coll_name in db.list_collection_names():
            collection = db[coll_name]
            count = collection.count_documents({})
            stats = db.command("collStats", coll_name)
            
            print(f"\n📦 {coll_name.upper()}")
            print(f"   Số lượng: {count:,}")
            print(f"   Kích thước: {stats.get('size', 0) / 1024 / 1024:.2f} MB")
            print(f"   Storage: {stats.get('storageSize', 0) / 1024 / 1024:.2f} MB")
            print(f"   Indexes: {stats.get('nindexes', 0)}")
            print(f"   Index Size: {stats.get('totalIndexSize', 0) / 1024 / 1024:.2f} MB")
        else:
            print(f"\n📦 {coll_name.upper()}")
            print(f"   ❌ Collection không tồn tại")

def check_indexes():
    """Kiểm tra indexes của tất cả collections"""
    print("\n" + "="*80)
    print("🔍 KIỂM TRA INDEXES")
    print("="*80)
    
    collections = ['products', 'categories', 'orders', 'reviews', 'users', 'wishlists', 'carts']
    
    for coll_name in collections:
        if coll_name in db.list_collection_names():
            collection = db[coll_name]
            indexes = list(collection.list_indexes())
            
            print(f"\n📦 {coll_name.upper()} ({len(indexes)} indexes)")
            for idx in indexes:
                print(f"   ✓ {idx['name']}: {idx.get('key', {})}")
        else:
            print(f"\n📦 {coll_name.upper()}")
            print(f"   ❌ Collection không tồn tại")

def test_slow_queries():
    """Test các queries hay dùng và đo thời gian"""
    print("\n" + "="*80)
    print("⚡ TEST PERFORMANCE CÁC QUERIES")
    print("="*80)
    
    # Test Products
    print("\n📦 PRODUCTS:")
    products = db.products
    
    queries = [
        ("Lấy tất cả sản phẩm (24 items)", {}, {"created_at": -1}, 24),
        ("Lấy sản phẩm theo category", {"category.slug": {"$exists": True}}, {"created_at": -1}, 24),
        ("Lấy sản phẩm active", {"status": "active"}, {"created_at": -1}, 24),
        ("Lấy sản phẩm mới nhất", {}, {"created_at": -1}, 12),
        ("Lấy sản phẩm yêu thích nhất", {}, {"wishlist_count": -1}, 12),
        ("Lấy sản phẩm giá thấp nhất", {}, {"pricing.sale": 1}, 12),
    ]
    
    for desc, query, sort, limit in queries:
        start = time.time()
        result = list(products.find(query).sort(list(sort.items())).limit(limit))
        end = time.time()
        elapsed = (end - start) * 1000
        
        status = "✅" if elapsed < 100 else "⚠️" if elapsed < 500 else "❌"
        print(f"   {status} {desc}: {elapsed:.2f}ms ({len(result)} items)")
    
    # Test single product lookup
    print("\n   Test tra cứu 1 sản phẩm:")
    sample = products.find_one({})
    if sample and 'slug' in sample:
        start = time.time()
        result = products.find_one({"slug": sample['slug']})
        end = time.time()
        elapsed = (end - start) * 1000
        status = "✅" if elapsed < 50 else "⚠️" if elapsed < 200 else "❌"
        print(f"   {status} Tìm theo slug: {elapsed:.2f}ms")
    
    # Test Orders
    print("\n🛒 ORDERS:")
    orders = db.orders
    order_count = orders.count_documents({})
    print(f"   Tổng số orders: {order_count}")
    
    if order_count > 0:
        start = time.time()
        result = list(orders.find({}).sort("created_at", -1).limit(10))
        end = time.time()
        elapsed = (end - start) * 1000
        status = "✅" if elapsed < 100 else "⚠️" if elapsed < 500 else "❌"
        print(f"   {status} Lấy 10 orders mới nhất: {elapsed:.2f}ms")
        
        # Test query by user
        if result and 'user_id' in result[0]:
            user_id = result[0]['user_id']
            start = time.time()
            user_orders = list(orders.find({"user_id": user_id}).limit(10))
            end = time.time()
            elapsed = (end - start) * 1000
            status = "✅" if elapsed < 100 else "⚠️" if elapsed < 500 else "❌"
            print(f"   {status} Lấy orders theo user_id: {elapsed:.2f}ms ({len(user_orders)} items)")
    
    # Test Users
    print("\n👤 USERS:")
    users = db.users
    user_count = users.count_documents({})
    print(f"   Tổng số users: {user_count}")
    
    if user_count > 0:
        sample_user = users.find_one({})
        if sample_user and 'email' in sample_user:
            start = time.time()
            result = users.find_one({"email": sample_user['email']})
            end = time.time()
            elapsed = (end - start) * 1000
            status = "✅" if elapsed < 50 else "⚠️" if elapsed < 200 else "❌"
            print(f"   {status} Tìm user theo email: {elapsed:.2f}ms")
    
    # Test Carts
    print("\n🛒 CARTS:")
    carts = db.carts
    cart_count = carts.count_documents({})
    print(f"   Tổng số carts: {cart_count}")
    
    if cart_count > 0:
        sample_cart = carts.find_one({})
        if sample_cart and 'user_id' in sample_cart:
            start = time.time()
            result = carts.find_one({"user_id": sample_cart['user_id']})
            end = time.time()
            elapsed = (end - start) * 1000
            status = "✅" if elapsed < 50 else "⚠️" if elapsed < 200 else "❌"
            print(f"   {status} Lấy cart theo user_id: {elapsed:.2f}ms")
            
            # Check cart items
            if result and 'items' in result:
                print(f"   ℹ️  Cart có {len(result['items'])} items")

    # Test Wishlists
    print("\n❤️  WISHLISTS:")
    wishlists = db.wishlists
    wishlist_count = wishlists.count_documents({})
    print(f"   Tổng số wishlists: {wishlist_count}")
    
    if wishlist_count > 0:
        sample_wishlist = wishlists.find_one({})
        if sample_wishlist and 'user_id' in sample_wishlist:
            start = time.time()
            result = wishlists.find_one({"user_id": sample_wishlist['user_id']})
            end = time.time()
            elapsed = (end - start) * 1000
            status = "✅" if elapsed < 50 else "⚠️" if elapsed < 200 else "❌"
            print(f"   {status} Lấy wishlist theo user_id: {elapsed:.2f}ms")
            
            # Check wishlist items
            if result and 'wishlist' in result:
                print(f"   ℹ️  Wishlist có {len(result['wishlist'])} items")

def check_missing_indexes():
    """Kiểm tra các indexes bị thiếu"""
    print("\n" + "="*80)
    print("🔧 KIỂM TRA INDEXES BỊ THIẾU")
    print("="*80)
    
    recommendations = []
    
    # Check Products indexes
    products = db.products
    product_indexes = [idx['name'] for idx in products.list_indexes()]
    
    print("\n📦 PRODUCTS:")
    required_indexes = {
        'idx_slug': 'slug (unique)',
        'idx_category_slug': 'category.slug',
        'idx_status': 'status',
        'idx_created_at_desc': 'created_at (desc)',
        'idx_wishlist_count_desc': 'wishlist_count (desc)',
        'idx_pricing_sale_asc': 'pricing.sale (asc)',
    }
    
    for idx_name, desc in required_indexes.items():
        if idx_name in product_indexes:
            print(f"   ✅ {desc}")
        else:
            print(f"   ❌ THIẾU: {desc}")
            recommendations.append(f"products.create_index('{desc}')")
    
    # Check Orders indexes
    orders = db.orders
    order_indexes = [idx['name'] for idx in orders.list_indexes()]
    
    print("\n🛒 ORDERS:")
    required_indexes = {
        'idx_user_id': 'user_id',
        'idx_created_at_desc': 'created_at (desc)',
        'idx_status': 'status',
    }
    
    for idx_name, desc in required_indexes.items():
        if idx_name in order_indexes:
            print(f"   ✅ {desc}")
        else:
            print(f"   ❌ THIẾU: {desc}")
            recommendations.append(f"orders.create_index('{desc}')")
    
    # Check Users indexes
    users = db.users
    user_indexes = [idx['name'] for idx in users.list_indexes()]
    
    print("\n👤 USERS:")
    required_indexes = {
        'idx_email': 'email (unique)',
        'idx_username': 'username (unique)',
    }
    
    for idx_name, desc in required_indexes.items():
        if idx_name in user_indexes:
            print(f"   ✅ {desc}")
        else:
            print(f"   ❌ THIẾU: {desc}")
            recommendations.append(f"users.create_index('{desc}')")
    
    # Check Carts indexes
    carts = db.carts
    cart_indexes = [idx['name'] for idx in carts.list_indexes()]
    
    print("\n🛒 CARTS:")
    if 'idx_user_id' in cart_indexes or 'user_id_1' in cart_indexes:
        print(f"   ✅ user_id")
    else:
        print(f"   ❌ THIẾU: user_id")
        recommendations.append("carts.create_index('user_id')")
    
    # Check Wishlists indexes
    wishlists = db.wishlists
    wishlist_indexes = [idx['name'] for idx in wishlists.list_indexes()]
    
    print("\n❤️  WISHLISTS:")
    if 'idx_user_id' in wishlist_indexes or 'user_id_1' in wishlist_indexes:
        print(f"   ✅ user_id")
    else:
        print(f"   ❌ THIẾU: user_id")
        recommendations.append("wishlists.create_index('user_id')")
    
    if recommendations:
        print("\n⚠️  KHUYẾN NGHỊ:")
        print("   Chạy lệnh sau để tạo indexes còn thiếu:")
        print("   python backend/create_indexes.py")
    else:
        print("\n✅ Tất cả indexes cần thiết đã được tạo!")

def check_data_quality():
    """Kiểm tra chất lượng dữ liệu"""
    print("\n" + "="*80)
    print("🔍 KIỂM TRA CHẤT LƯỢNG DỮ LIỆU")
    print("="*80)
    
    products = db.products
    
    print("\n📦 PRODUCTS:")
    total = products.count_documents({})
    print(f"   Tổng: {total}")
    
    # Check missing fields
    missing_image = products.count_documents({"$or": [{"image": ""}, {"image": None}, {"image": {"$exists": False}}]})
    missing_slug = products.count_documents({"$or": [{"slug": ""}, {"slug": None}, {"slug": {"$exists": False}}]})
    missing_category = products.count_documents({"$or": [{"category": None}, {"category": {"$exists": False}}]})
    
    if missing_image > 0:
        print(f"   ⚠️  {missing_image} sản phẩm thiếu ảnh")
    else:
        print(f"   ✅ Tất cả sản phẩm đều có ảnh")
    
    if missing_slug > 0:
        print(f"   ❌ {missing_slug} sản phẩm thiếu slug")
    else:
        print(f"   ✅ Tất cả sản phẩm đều có slug")
    
    if missing_category > 0:
        print(f"   ⚠️  {missing_category} sản phẩm thiếu category")
    else:
        print(f"   ✅ Tất cả sản phẩm đều có category")
    
    # Check variants
    products_with_variants = products.count_documents({"variants": {"$exists": True}})
    print(f"   ℹ️  {products_with_variants}/{total} sản phẩm có variants")

def main():
    print("="*80)
    print("🛠️  CÔNG CỤ KIỂM TRA PERFORMANCE DATABASE")
    print(f"⏰ Thời gian: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)
    
    try:
        check_collection_stats()
        check_indexes()
        check_missing_indexes()
        test_slow_queries()
        check_data_quality()
        
        print("\n" + "="*80)
        print("✅ HOÀN THÀNH KIỂM TRA!")
        print("="*80)
        
        print("\n💡 KHUYẾN NGHỊ:")
        print("   1. Nếu có indexes bị thiếu, chạy: python backend/create_indexes.py")
        print("   2. Nếu queries > 500ms, cần tối ưu queries hoặc thêm indexes")
        print("   3. Kiểm tra log backend để xem API endpoints nào chậm")
        print("   4. Sử dụng MongoDB Compass để xem explain plans của queries")
        
    except Exception as e:
        print(f"\n❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    main()
