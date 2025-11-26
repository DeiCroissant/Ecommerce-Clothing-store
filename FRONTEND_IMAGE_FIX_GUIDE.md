# 🔧 FIX ẢNH KHÔNG HIỆN - Frontend Guide

## ✅ Backend đã OK

- ✅ 245 ảnh trong `backend/uploads/products/`
- ✅ Static files đã mount
- ✅ API đang chạy: http://localhost:8000

## 🐛 Nguyên nhân ảnh không hiện

### 1. **Frontend gọi sai URL**

**❌ SAI:**
```jsx
// Frontend gọi trực tiếp /uploads/...
<img src="/uploads/products/abc.jpg" />
```

**✅ ĐÚNG:**
```jsx
// Phải thêm backend URL
<img src={`http://localhost:8000${product.image}`} />

// Hoặc dùng env variable
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
<img src={`${BACKEND_URL}${product.image}`} />
```

### 2. **Next.js Image Component cần config**

**File: `vyronfashion/next.config.mjs`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/uploads/**',
      }
    ],
  },
};

export default nextConfig;
```

Sau đó dùng:
```jsx
import Image from 'next/image';

<Image
  src={`http://localhost:8000${product.image}`}
  alt={product.name}
  width={300}
  height={300}
  loading="lazy"
/>
```

### 3. **CORS Issue**

Backend đã enable CORS nhưng nếu vẫn bị block, check Console:

**Nếu thấy lỗi CORS:**
```
Access to image at 'http://localhost:8000/uploads/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Fix:** Backend đã OK, nhưng có thể cần restart lại.

## 🔧 Code Examples - Frontend

### ProductCard.jsx
```jsx
// vyronfashion/components/ProductCard.jsx

const BACKEND_URL = 'http://localhost:8000';

export default function ProductCard({ product }) {
  // Xử lý URL ảnh
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.jpg';
    
    // Nếu đã có http, return trực tiếp
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Nếu là relative path, thêm backend URL
    return `${BACKEND_URL}${imagePath}`;
  };

  return (
    <div className="product-card">
      <img 
        src={getImageUrl(product.image)} 
        alt={product.name}
        loading="lazy"
        onError={(e) => {
          console.error('Image load error:', product.image);
          e.target.src = '/placeholder.jpg';
        }}
      />
      <h3>{product.name}</h3>
      <p>{product.pricing.sale}đ</p>
    </div>
  );
}
```

### ProductDetail.jsx
```jsx
// vyronfashion/app/products/[slug]/page.jsx

const BACKEND_URL = 'http://localhost:8000';

export default function ProductDetail({ product }) {
  const getImageUrl = (path) => {
    if (!path) return '/placeholder.jpg';
    return path.startsWith('http') ? path : `${BACKEND_URL}${path}`;
  };

  return (
    <div>
      {/* Main Image */}
      <img src={getImageUrl(product.image)} alt={product.name} />
      
      {/* Gallery */}
      <div className="gallery">
        {product.images?.map((img, idx) => (
          <img 
            key={idx} 
            src={getImageUrl(img)} 
            alt={`${product.name} ${idx + 1}`}
            loading="lazy"
          />
        ))}
      </div>
      
      {/* Color Variants */}
      {product.variants?.colors?.map((color) => (
        <div key={color.name}>
          <h4>{color.name}</h4>
          {color.images?.map((img, idx) => (
            <img 
              key={idx}
              src={getImageUrl(img)}
              alt={`${color.name} ${idx + 1}`}
              loading="lazy"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Environment Variables

**File: `vyronfashion/.env.local`**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Sử dụng:**
```jsx
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch products
const response = await fetch(`${API_URL}/api/products`);
const data = await response.json();

// Image URL
<img src={`${API_URL}${product.image}`} />
```

## 🧪 Testing

### 1. **Test Backend URL trực tiếp trong browser:**
```
http://localhost:8000/uploads/products/product_690a9dc7d20a106c06c75133_20251126_171920_f0ed463c.jpg
```

→ Phải hiện ảnh! Nếu không, backend có vấn đề.

### 2. **Test trong DevTools Console:**
```javascript
// Mở Console và chạy:
fetch('http://localhost:8000/uploads/products/product_690a9dc7d20a106c06c75133_20251126_171920_f0ed463c.jpg')
  .then(res => {
    console.log('Status:', res.status);
    console.log('Headers:', res.headers.get('content-type'));
    return res.blob();
  })
  .then(blob => {
    console.log('Size:', blob.size, 'bytes');
    const url = URL.createObjectURL(blob);
    const img = document.createElement('img');
    img.src = url;
    document.body.appendChild(img);
  });
```

→ Phải log status 200 và hiện ảnh!

### 3. **Check Network Tab:**
- Mở DevTools → Network tab
- Filter: Img
- Refresh page
- Xem các request `/uploads/products/...`
- Status phải là 200
- Nếu 404 → URL sai
- Nếu CORS error → Backend CORS chưa OK

## 🎯 Quick Fix Checklist

Frontend (`vyronfashion/`):

- [ ] Thêm `BACKEND_URL` vào image src
- [ ] Config `next.config.mjs` cho Next.js Image
- [ ] Thêm `.env.local` với `NEXT_PUBLIC_API_URL`
- [ ] Thêm error handler cho images
- [ ] Add placeholder image cho lỗi
- [ ] Test trong DevTools Network tab

Backend (`backend/`):

- [x] Static files mounted ✅
- [x] Ảnh trong uploads/products ✅
- [x] CORS enabled ✅
- [x] Server đang chạy ✅

## 🚀 Commands

```bash
# 1. Backend (Terminal 1)
cd backend
START_BACKEND.bat

# 2. Frontend (Terminal 2)
cd vyronfashion
npm run dev

# 3. Test
# Browser: http://localhost:3000
# Backend: http://localhost:8000/uploads/products/[filename]
```

## ⚠️ Common Issues

### Issue 1: "Images not loading"
**Solution:** Check if you're adding backend URL to image src

### Issue 2: "CORS policy error"
**Solution:** Backend already has CORS enabled, restart backend

### Issue 3: "404 Not Found"
**Solution:** Check image path in database vs actual file name

### Issue 4: "Next.js Image Optimization error"
**Solution:** Add remotePatterns in next.config.mjs

### Issue 5: "Mixed content warning (HTTP/HTTPS)"
**Solution:** Use relative URLs or match protocols

## 💡 Best Practice

```jsx
// utils/imageHelper.js
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.jpg';
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // Already full URL
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Relative path
  return `${API_URL}${imagePath}`;
};

// Usage
import { getImageUrl } from '@/utils/imageHelper';

<img src={getImageUrl(product.image)} alt={product.name} />
```

---

## ✅ Summary

1. **Backend sẵn sàng:** 245 ảnh đã có
2. **Cần fix Frontend:** Thêm `BACKEND_URL` vào img src
3. **Test:** Browser DevTools Network tab
4. **Done!** 🎉
