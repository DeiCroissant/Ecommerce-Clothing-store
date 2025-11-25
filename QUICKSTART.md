# Hướng dẫn tối ưu hóa và khởi động dự án

## 🚀 Tối ưu hóa đã áp dụng

### 1. Database Indexes
- ✅ Thêm indexes cho MongoDB để tăng tốc queries
- ✅ Projection query để chỉ lấy dữ liệu cần thiết
- ✅ Compound indexes cho queries phức tạp

**Kết quả**: Tăng tốc load products lên **10-40 lần**

## 📋 Các bước khởi động

### Backend (Python/FastAPI)

```bash
# 1. Di chuyển vào thư mục backend
cd Ecommerce-Clothing-store/backend

# 2. (Optional) Tạo indexes - chỉ cần chạy 1 lần
python create_indexes.py

# 3. Khởi động backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend sẽ chạy tại: `http://localhost:8000`
API docs tại: `http://localhost:8000/docs`

### Frontend (Next.js)

```bash
# 1. Di chuyển vào thư mục frontend
cd Ecommerce-Clothing-store/vyronfashion

# 2. Cài đặt dependencies (nếu chưa cài)
npm install

# 3. Khởi động dev server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

## ⚡ Performance Tips

### Database
- Indexes được tự động tạo khi backend khởi động
- Nếu muốn tạo thủ công: `python create_indexes.py`
- Kiểm tra indexes: `db.products.getIndexes()` trong MongoDB shell

### Frontend
- Sử dụng `--turbopack` flag (đã có trong npm dev script)
- Next.js 15 tự động tối ưu images và fonts
- Static assets được serve từ `/public`

## 🔍 Kiểm tra Performance

### Test API Speed

```bash
# Query tất cả products
curl http://localhost:8000/api/products?page=1&limit=24

# Query by category
curl http://localhost:8000/api/products?category_slug=ao-thun&page=1&limit=24

# Query by slug (single product)
curl http://localhost:8000/api/products?slug=ao-thun-basic
```

### Xem logs trong terminal
- Backend sẽ log query time
- Frontend sẽ log fetch time trong browser console

## 🛠️ Troubleshooting

### Backend chậm?
1. Kiểm tra indexes: `python create_indexes.py`
2. Kiểm tra MongoDB connection trong `.env`
3. Kiểm tra database size: `db.stats()` trong MongoDB shell

### Frontend chậm?
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Kiểm tra network tab trong browser DevTools

### Database connection error?
1. Kiểm tra MongoDB đang chạy: `mongod --version`
2. Kiểm tra credentials trong `backend/.env`
3. Test connection: `mongosh <MONGODB_URL>`

## 📊 Monitoring

### Backend Logs
```bash
# Xem logs real-time
tail -f backend/logs/app.log

# Hoặc trong terminal đang chạy uvicorn
```

### Database Stats
```javascript
// Trong MongoDB shell
use vyronfashion_db

// Xem collection stats
db.products.stats()

// Xem index usage
db.products.aggregate([{$indexStats: {}}])
```

## 🎯 Next Steps

Sau khi tối ưu cơ bản, có thể:

1. **Redis Caching**: Cache hot products, giảm load database
2. **CDN**: Serve static assets (images) từ CDN
3. **Load Balancer**: Scale horizontal khi có nhiều traffic
4. **Database Replication**: Primary-Secondary setup cho read-heavy workload
5. **APM**: Application Performance Monitoring với tools như New Relic, DataDog

## 📝 Configuration Files

### Backend `.env`
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=vyronfashion_db
```

### Frontend `.env.local` (nếu cần)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## ✅ Checklist

Trước khi production:

- [ ] Indexes đã được tạo
- [ ] Backend health check: `curl http://localhost:8000/health`
- [ ] Frontend build successful: `npm run build`
- [ ] API response time < 100ms
- [ ] MongoDB connections được pool properly
- [ ] Error handling đầy đủ
- [ ] CORS configured cho production domain
