# BÁO CÁO: ADMIN PAGE LOAD CHẬM

**Ngày:** 26/11/2025  
**Vấn đề:** Admin Dashboard load siêu chậm

---

## 🔍 PHÂN TÍCH VẤN ĐỀ

### API `/api/admin/dashboard` hiện tại:

#### ❌ Vấn đề nghiêm trọng:

1. **14+ queries MongoDB riêng lẻ:**
   ```python
   # Revenue chart: 14 queries (1 cho mỗi ngày)
   for i in range(13, -1, -1):
       day_orders = await orders_collection.find({...}).to_list()  # ❌ CHẬM
   
   # Orders hôm nay
   today_orders = await orders_collection.find({...}).to_list()    # ❌
   
   # Orders hôm qua  
   yesterday_orders = await orders_collection.find({...}).to_list() # ❌
   
   # Users hôm nay
   today_users = await users_collection.find({...}).to_list()      # ❌
   
   # Users hôm qua
   yesterday_users = await users_collection.find({...}).to_list()  # ❌
   
   # Pending orders
   pending = await orders_collection.find({...}).to_list()         # ❌
   
   # Lấy user info cho mỗi pending order (5 queries)
   for order in pending_orders:
       user = await users_collection.find_one(...)                 # ❌ x5
   
   # TẤT CẢ products để check low stock
   all_products = await products_collection.find({...}).to_list()  # ❌ SIÊU CHẬM
   ```

2. **Không có caching** → Mỗi lần refresh page = query lại hết

3. **N+1 query problem** → Query user cho từng order riêng lẻ

4. **Load toàn bộ products** → Chậm khi có nhiều sản phẩm

---

## ⚡ GIẢI PHÁP TỐI ƯU

### 1. Dùng Aggregation Pipeline

**Thay vì:** 14+ queries riêng lẻ  
**Dùng:** 4 aggregation pipelines chạy song song

```python
# 1 query cho revenue + orders (tất cả 14 ngày)
revenue_pipeline = [
    {"$match": {"created_at": {"$gte": 14_days_ago}}},
    {"$group": {"_id": "$day", "revenue": {"$sum": "$total_amount"}}}
]

# 1 query cho customers (hôm nay + hôm qua)
customers_pipeline = [...]

# 1 query cho pending orders + customer info (dùng $lookup)
pending_orders_pipeline = [
    {"$lookup": {"from": "users", ...}}  # JOIN ngay trong query
]

# 1 query cho low stock (lọc sẵn trong query)
low_stock_pipeline = [
    {"$match": {"$expr": {"$lte": ["$inventory.quantity", "$inventory.low_stock_threshold"]}}}
]

# Chạy TẤT CẢ song song
results = await asyncio.gather(
    orders_collection.aggregate(revenue_pipeline),
    users_collection.aggregate(customers_pipeline),
    orders_collection.aggregate(pending_orders_pipeline),
    products_collection.aggregate(low_stock_pipeline)
)
```

### 2. Thêm Caching

```python
# Cache 2 phút
dashboard_cache = {"data": None, "timestamp": None}
CACHE_DURATION = 120  # seconds

# Check cache trước khi query
if cache_valid:
    return cached_data  # ✅ NHANH
```

### 3. Giới hạn data

- Pending orders: Chỉ 5 đơn mới nhất
- Low stock: Chỉ 10 sản phẩm
- Revenue chart: Chỉ 14 ngày

---

## 📊 SO SÁNH PERFORMANCE

| Metric | Trước | Sau | Cải thiện |
|--------|-------|-----|-----------|
| Số queries | **20+** | **4** | **80%** ↓ |
| Query products | **TẤT CẢ** | **Top 10** | **95%** ↓ |
| Thời gian (ước tính) | **3-5s** | **< 500ms** | **90%** ↓ |
| Với cache | N/A | **< 50ms** | **99%** ↓ |

---

## 🚀 CÁCH TRIỂN KHAI

### Bước 1: Backup endpoint cũ

```python
# Đổi tên endpoint cũ (để backup)
@app.get("/api/admin/dashboard-old")  # ← Thêm -old
async def get_dashboard_stats():
    ...
```

### Bước 2: Thêm code tối ưu vào `backend/app/main.py`

Copy toàn bộ code từ file `backend/dashboard_optimization.py` vào `main.py`

### Bước 3: Cập nhật frontend

Nếu muốn dùng endpoint mới:
```javascript
// vyronfashion/src/lib/api/adminDashboard.js
export async function getDashboardStats() {
  const response = await fetch(`${API_BASE_URL}/api/admin/dashboard-optimized`)
  // hoặc giữ nguyên URL cũ sau khi đã thay thế code
}
```

### Bước 4: Test

```bash
# 1. Restart backend
cd backend
python app/main.py

# 2. Test API
curl http://localhost:8000/api/admin/dashboard-optimized

# 3. Mở admin page
# F12 → Network → Xem response time
```

---

## 💡 TỐI ƯU THÊM (NẾU VẪN CHẬM)

### 1. Thêm indexes MongoDB

```bash
python backend/create_indexes.py
```

Đảm bảo có indexes:
- `orders.created_at` (descending)
- `orders.status`
- `products.inventory.quantity`
- `users.createdAt`

### 2. Tăng cache time

Nếu data không cần realtime:
```python
CACHE_DURATION = 300  # 5 phút thay vì 2 phút
```

### 3. Lazy loading frontend

```javascript
// Load categories riêng, không chờ dashboard
useEffect(() => {
  loadDashboard()  // Async
}, [])

useEffect(() => {
  loadCategories()  // Async riêng
}, [])
```

### 4. Skeleton loading

Hiển thị skeleton thay vì màn hình trắng:
```jsx
{loadingDashboard ? (
  <SkeletonLoader />
) : (
  <DashboardContent />
)}
```

---

## 📝 CHECKLIST

- [ ] Backup endpoint cũ (`/api/admin/dashboard-old`)
- [ ] Thêm code tối ưu vào `main.py`
- [ ] Test API với curl/Postman
- [ ] Test trên browser, check DevTools Network
- [ ] Deploy lên VPS
- [ ] Monitor logs xem có lỗi không
- [ ] Verify response time < 500ms (lần đầu) hoặc < 50ms (cached)

---

## 🎯 KẾT LUẬN

**Nguyên nhân chính:** API dashboard có **20+ queries MongoDB** không tối ưu

**Giải pháp:**
1. ✅ Dùng aggregation pipeline (giảm từ 20+ queries → 4 queries)
2. ✅ Thêm caching (2 phút)
3. ✅ Chạy queries song song với `asyncio.gather()`
4. ✅ Giới hạn data trả về

**Kết quả mong đợi:**
- **Lần đầu load:** < 500ms (thay vì 3-5s)
- **Load tiếp theo (cached):** < 50ms

---

**Files tham khảo:**
- `backend/dashboard_optimization.py` - Code tối ưu mẫu
- `backend/app/main.py` - Nơi cần thêm code
- `vyronfashion/src/app/admin/page.js` - Admin dashboard frontend
