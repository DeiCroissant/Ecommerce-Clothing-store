# Tối ưu hóa Performance cho Products API

## Vấn đề
Load sản phẩm từ database rất chậm do:
1. Không có indexes trên các field thường xuyên query
2. Query lấy toàn bộ document thay vì chỉ các field cần thiết
3. Thiếu compound indexes cho các query phức tạp

## Giải pháp đã áp dụng

### 1. Tạo Database Indexes

Đã thêm startup event trong `backend/app/main.py` để tự động tạo indexes:

```python
@app.on_event("startup")
async def startup_event():
    # Tạo indexes cho products
    await products_collection.create_index("slug", unique=True)
    await products_collection.create_index("category.slug")
    await products_collection.create_index("status")
    await products_collection.create_index([("created_at", -1)])
    await products_collection.create_index([("wishlist_count", -1)])
    await products_collection.create_index([("pricing.sale", 1)])
    await products_collection.create_index([("pricing.sale", -1)])
```

**Lợi ích**: Tăng tốc query từ O(n) xuống O(log n)

### 2. Query Projection

Thay đổi query để chỉ lấy các field cần thiết:

```python
projection = {
    "_id": 1,
    "name": 1,
    "slug": 1,
    "sku": 1,
    "brand": 1,
    "category": 1,
    "pricing": 1,
    "short_description": 1,
    "image": 1,
    "images": 1,
    "variants": 1,
    "inventory": 1,
    "status": 1,
    "rating": 1,
    "wishlist_count": 1,
    "sold_count": 1,
    "created_at": 1,
    "updated_at": 1
}

cursor = products_collection.find(query, projection)
```

**Lợi ích**: Giảm data transfer từ database, tăng tốc độ response

### 3. Compound Indexes

Tạo compound indexes cho các query phổ biến:

```python
# Index cho query: category + status + sort by date
db.products.create_index([
    ("category.slug", 1),
    ("status", 1),
    ("created_at", -1)
])
```

**Lợi ích**: Tối ưu cho các query có nhiều điều kiện

## Cách sử dụng

### 1. Chạy script tạo indexes (một lần):

```bash
cd backend
python create_indexes.py
```

Script này sẽ:
- Tạo tất cả indexes cần thiết
- Hiển thị danh sách indexes hiện có
- Test performance của các queries

### 2. Khởi động server:

```bash
cd backend
uvicorn app.main:app --reload
```

Indexes sẽ tự động được tạo khi server khởi động.

## Kết quả mong đợi

- ⚡ **Query tất cả products**: Từ ~500ms xuống ~50ms (cải thiện 10x)
- ⚡ **Query by category**: Từ ~300ms xuống ~30ms (cải thiện 10x)
- ⚡ **Query by slug**: Từ ~200ms xuống ~5ms (cải thiện 40x)
- ⚡ **Sort by wishlist/price**: Từ ~400ms xuống ~40ms (cải thiện 10x)

## Monitoring

Để kiểm tra performance thực tế:

```bash
# 1. Xem execution plan của query
db.products.find({category.slug: "ao-thun"}).explain("executionStats")

# 2. Xem indexes đang được sử dụng
db.products.getIndexes()

# 3. Xem index usage statistics
db.products.aggregate([{$indexStats: {}}])
```

## Các tối ưu tiếp theo (Optional)

1. **Caching Layer**: Redis cache cho hot products
2. **Pagination Cursor**: Thay vì skip() dùng cursor-based pagination
3. **Search Indexing**: MongoDB Atlas Search cho full-text search
4. **Connection Pooling**: Tăng pool size nếu có nhiều concurrent requests
5. **CDN**: Cache images và static assets

## Notes

- Indexes tốn thêm storage (~10-20% tổng data size)
- Indexes làm chậm INSERT/UPDATE operations (~5-10%)
- Trade-off này xứng đáng vì READ operations chiếm 90%+ traffic
