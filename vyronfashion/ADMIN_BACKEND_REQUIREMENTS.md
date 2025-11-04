# 🔐 ADMIN BACKEND - Requirements & Implementation Guide

> **Lưu ý:** Đây là tài liệu hướng dẫn thiết kế và triển khai backend cho Admin Panel.  
> Frontend UI đã hoàn thành ở Phase 0.  
> Document này sẽ giúp bạn implement backend một cách có hệ thống.

---

## 📋 **Table of Contents**

1. [Authentication & Authorization System](#1-authentication--authorization-system)
2. [Database Schema Design](#2-database-schema-design)
3. [API Endpoints Specification](#3-api-endpoints-specification)
4. [Permissions Matrix](#4-permissions-matrix)
5. [Implementation Roadmap](#5-implementation-roadmap)

---

## 1️⃣ **Authentication & Authorization System**

### **Current Problems:**

❌ **Client-side only authorization:**
```javascript
// src/app/admin/layout.js - UNSAFE!
const user = JSON.parse(localStorage.getItem('user'))
if (user?.role !== 'admin') router.replace('/')
```

**Vấn đề:**
- Dễ bị bypass (user có thể modify localStorage)
- Không bảo vệ API endpoints
- Không có session management
- Không có refresh token

---

### **Solution: JWT-Based Authentication**

#### **Architecture:**

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │         │   Backend   │         │   Database  │
└─────────────┘         └─────────────┘         └─────────────┘
      │                        │                        │
      │  1. Login              │                        │
      ├───────────────────────>│                        │
      │    (username/password) │                        │
      │                        │  2. Verify credentials │
      │                        ├───────────────────────>│
      │                        │                        │
      │                        │  3. Return user + role │
      │                        │<───────────────────────┤
      │                        │                        │
      │  4. JWT Tokens         │                        │
      │<───────────────────────┤                        │
      │    - Access Token      │                        │
      │    - Refresh Token     │                        │
      │                        │                        │
      │  5. API Request        │                        │
      │    + Bearer Token      │                        │
      ├───────────────────────>│                        │
      │                        │  6. Verify JWT         │
      │                        │  7. Check Permissions  │
      │                        │                        │
      │  8. Response           │                        │
      │<───────────────────────┤                        │
```

---

#### **JWT Token Structure:**

**Access Token (Short-lived: 15 minutes)**
```python
{
  "user_id": "507f1f77bcf86cd799439011",
  "username": "admin",
  "role": "admin",
  "permissions": ["products:read", "products:write", "orders:read", ...],
  "exp": 1699112400,  # Expiration timestamp
  "iat": 1699111500   # Issued at timestamp
}
```

**Refresh Token (Long-lived: 7 days)**
```python
{
  "user_id": "507f1f77bcf86cd799439011",
  "token_id": "unique-refresh-token-id",
  "exp": 1699716900,
  "iat": 1699111500
}
```

---

#### **Backend Implementation Steps:**

**Step 1: Install Dependencies**
```bash
pip install python-jose[cryptography] passlib python-multipart
```

**Step 2: Create JWT Utilities** (`backend/app/auth.py`)

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

**Step 3: Create Permission Middleware** (`backend/app/middleware.py`)

```python
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Get user from database
    user = await users_collection.find_one({"_id": ObjectId(payload["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

def require_permissions(required_permissions: list):
    async def permission_checker(user = Depends(get_current_user)):
        user_permissions = user.get("permissions", [])
        
        # Super admin bypasses all checks
        if user.get("role") == "super_admin":
            return user
        
        # Check if user has required permissions
        missing = [p for p in required_permissions if p not in user_permissions]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permissions: {', '.join(missing)}"
            )
        
        return user
    
    return permission_checker
```

**Step 4: Update Login Endpoint** (`backend/app/main.py`)

```python
from app.auth import create_access_token, create_refresh_token

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    # ... existing validation ...
    
    # Generate tokens
    access_token = create_access_token({
        "user_id": str(user["_id"]),
        "username": user["username"],
        "role": user["role"],
        "permissions": user.get("permissions", [])
    })
    
    refresh_token = create_refresh_token({
        "user_id": str(user["_id"]),
        "token_id": str(uuid.uuid4())
    })
    
    # Store refresh token in database (for revocation)
    await refresh_tokens_collection.insert_one({
        "user_id": user["_id"],
        "token": refresh_token,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=7)
    })
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": UserResponse(**user)
    }
```

**Step 5: Protected Admin Endpoints**

```python
from app.middleware import require_permissions

@app.get("/api/admin/products")
async def get_products(
    user = Depends(require_permissions(["products:read"]))
):
    # User is authenticated and has permission
    products = await products_collection.find().to_list(100)
    return products

@app.post("/api/admin/products")
async def create_product(
    product: ProductCreate,
    user = Depends(require_permissions(["products:write"]))
):
    # Only users with products:write can create
    new_product = await products_collection.insert_one(product.dict())
    return {"id": str(new_product.inserted_id)}
```

---

#### **Frontend Changes Required:**

**Update API Client** (`src/lib/api/client.js`)

```javascript
// Store tokens in httpOnly cookies (safer than localStorage)
export async function login(username, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  
  const data = await response.json()
  
  if (data.access_token) {
    // Store in httpOnly cookie (backend sets)
    // Or store in memory (more secure)
    sessionStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
  }
  
  return data
}

// API interceptor with auto-refresh
export async function apiRequest(url, options = {}) {
  const token = sessionStorage.getItem('access_token')
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  })
  
  // Handle 401: refresh token
  if (response.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      // Retry request with new token
      return apiRequest(url, options)
    }
  }
  
  return response
}
```

---

## 2️⃣ **Database Schema Design**

### **Collections cần tạo:**

#### **1. `products` Collection**

```javascript
{
  _id: ObjectId("..."),
  sku: "VYR-TS-001",              // Unique product code
  name: "Áo Thun Basic White",
  slug: "ao-thun-basic-white",    // URL-friendly
  description: "Áo thun...",
  shortDescription: "Brief...",
  
  // Pricing
  price: 299000,                  // Regular price
  salePrice: 249000,              // Sale price (optional)
  costPrice: 150000,              // Cost (for profit calculation)
  
  // Categorization
  categoryIds: [
    ObjectId("..."),              // Many-to-many
    ObjectId("...")
  ],
  tags: ["basic", "summer"],
  
  // Attributes
  attributes: {
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "White", hex: "#FFFFFF", image: "..." },
      { name: "Black", hex: "#000000", image: "..." }
    ],
    material: "100% Cotton"
  },
  
  // Inventory
  stock: 150,                     // Total stock
  lowStockThreshold: 10,
  trackInventory: true,
  
  // Variants (if using variants)
  variants: [
    {
      sku: "VYR-TS-001-S-WHITE",
      size: "S",
      color: "White",
      stock: 20,
      price: 299000
    }
  ],
  
  // Media
  images: [
    {
      url: "https://cdn.../1.jpg",
      alt: "Front view",
      order: 0,
      isThumbnail: true
    }
  ],
  
  // SEO
  seoTitle: "Áo Thun Basic...",
  seoDescription: "...",
  seoKeywords: ["áo thun", "basic"],
  
  // Status
  status: "active",               // active, draft, archived
  featured: false,
  
  // Metadata
  createdBy: ObjectId("..."),     // Admin user ID
  createdAt: ISODate("2024-11-04T10:00:00Z"),
  updatedAt: ISODate("2024-11-04T14:30:00Z"),
  publishedAt: ISODate("2024-11-04T12:00:00Z")
}
```

**Indexes:**
```python
products_collection.create_index("sku", unique=True)
products_collection.create_index("slug", unique=True)
products_collection.create_index("categoryIds")
products_collection.create_index("status")
products_collection.create_index([("name", "text"), ("description", "text")])
```

---

#### **2. `categories` Collection**

```javascript
{
  _id: ObjectId("..."),
  name: "Áo Nam",
  slug: "ao-nam",
  description: "Các loại áo dành cho nam giới",
  
  // Hierarchy
  parentId: null,                 // null = top-level
  level: 0,                       // 0 = root, 1 = child, etc.
  path: "/ao-nam",                // Full path for querying
  
  // Display
  imageUrl: "https://cdn.../category.jpg",
  icon: "shirt",                  // Icon name
  order: 1,                       // Display order
  
  // Status
  isActive: true,
  showInMenu: true,
  
  // SEO
  seoTitle: "Áo Nam - ...",
  seoDescription: "...",
  
  // Metadata
  productsCount: 156,             // Cached count
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

**Indexes:**
```python
categories_collection.create_index("slug", unique=True)
categories_collection.create_index("parentId")
categories_collection.create_index("order")
```

---

#### **3. `orders` Collection**

```javascript
{
  _id: ObjectId("..."),
  orderNumber: "ORD-20241104-001", // Human-readable
  
  // Customer
  userId: ObjectId("..."),
  customerName: "Nguyễn Văn A",
  customerEmail: "a@example.com",
  customerPhone: "0901234567",
  
  // Items
  items: [
    {
      productId: ObjectId("..."),
      productName: "Áo Thun Basic",
      sku: "VYR-TS-001",
      variant: { size: "M", color: "White" },
      quantity: 2,
      price: 249000,              // Price at time of order
      subtotal: 498000
    }
  ],
  
  // Pricing
  subtotal: 498000,
  shippingFee: 30000,
  taxAmount: 0,
  discountAmount: 50000,          // From coupon
  total: 478000,
  
  // Addresses
  shippingAddress: {
    fullName: "Nguyễn Văn A",
    phone: "0901234567",
    address: "123 Đường ABC",
    ward: "Phường 1",
    district: "Quận 1",
    city: "TP.HCM",
    postalCode: "700000"
  },
  billingAddress: { /* same structure */ },
  
  // Status
  paymentStatus: "paid",          // pending, paid, failed, refunded
  shippingStatus: "pending",      // pending, processing, shipped, completed, cancelled
  
  // Payment
  paymentMethod: "vnpay",
  paymentDetails: {
    transactionId: "...",
    paidAt: ISODate("...")
  },
  
  // Shipping
  shippingMethod: "express",
  trackingNumber: "TN123456",
  shippedAt: ISODate("..."),
  deliveredAt: ISODate("..."),
  
  // Coupon
  couponCode: "SUMMER20",
  couponDiscount: 50000,
  
  // Notes
  customerNote: "Giao buổi sáng",
  adminNote: "Internal note",
  
  // Metadata
  createdAt: ISODate("2024-11-04T10:30:00Z"),
  updatedAt: ISODate("2024-11-04T14:20:00Z"),
  
  // Audit
  statusHistory: [
    {
      status: "pending",
      timestamp: ISODate("..."),
      updatedBy: ObjectId("...")  // Admin ID
    }
  ]
}
```

**Indexes:**
```python
orders_collection.create_index("orderNumber", unique=True)
orders_collection.create_index("userId")
orders_collection.create_index("paymentStatus")
orders_collection.create_index("shippingStatus")
orders_collection.create_index("createdAt")
```

---

#### **4. `roles` & `permissions` Collections**

**Roles:**
```javascript
{
  _id: ObjectId("..."),
  name: "content_manager",
  displayName: "Content Manager",
  description: "Quản lý nội dung và sản phẩm",
  permissions: [
    "products:read",
    "products:write",
    "categories:read",
    "categories:write",
    "banners:read",
    "banners:write"
  ],
  isSystem: false,                // true = cannot delete
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

**Permissions (Optional - can be hardcoded):**
```javascript
{
  _id: ObjectId("..."),
  resource: "products",           // Resource name
  action: "read",                 // read, write, delete
  code: "products:read",          // Full permission code
  description: "View products",
  category: "Products"            // For grouping in UI
}
```

**User with Roles:**
```javascript
// Update users collection
{
  _id: ObjectId("..."),
  username: "admin",
  // ... existing fields ...
  role: "admin",                  // Legacy: keep for backward compatibility
  roles: [                        // New: multiple roles
    ObjectId("role_id_1"),
    ObjectId("role_id_2")
  ],
  permissions: [                  // Computed from roles
    "products:read",
    "products:write",
    // ... all permissions from assigned roles
  ],
  updatedAt: ISODate("...")
}
```

---

## 3️⃣ **API Endpoints Specification**

### **Products Management**

```
GET    /api/admin/products
       ?page=1&limit=20&status=active&category=abc&search=áo&sort=-createdAt
       
       Response: {
         items: [...products],
         total: 156,
         page: 1,
         pages: 8,
         limit: 20
       }

POST   /api/admin/products
       Body: { name, sku, price, ... }
       Permissions: ["products:write"]

GET    /api/admin/products/:id
       Permissions: ["products:read"]

PUT    /api/admin/products/:id
       Body: { name, price, ... }
       Permissions: ["products:write"]

DELETE /api/admin/products/:id
       Permissions: ["products:delete"]
       Note: Soft delete (set status=archived)

PATCH  /api/admin/products/bulk-update
       Body: { ids: [...], updates: { status: 'active' } }
       Permissions: ["products:write"]
```

### **Categories Management**

```
GET    /api/admin/categories
       ?parent=null (get top-level)

POST   /api/admin/categories
       Body: { name, slug, parentId }

PUT    /api/admin/categories/:id
DELETE /api/admin/categories/:id
PATCH  /api/admin/categories/reorder
       Body: { orders: [{ id, order }, ...] }
```

### **Orders Management**

```
GET    /api/admin/orders
       ?page=1&status=pending&dateFrom=2024-11-01

GET    /api/admin/orders/:id
PATCH  /api/admin/orders/:id/status
       Body: { shippingStatus: 'shipped', note: '...' }
       
POST   /api/admin/orders/:id/refund
       Body: { amount, reason }
```

### **Dashboard/Analytics**

```
GET    /api/admin/dashboard/metrics
       ?date=2024-11-04
       
       Response: {
         todayRevenue: { value, change, trend },
         todayOrders: { value, change, trend },
         // ...
       }

GET    /api/admin/dashboard/revenue-chart
       ?days=30
       
       Response: [
         { date: '2024-11-01', revenue: 10000000 },
         // ...
       ]

GET    /api/admin/dashboard/latest-orders
       ?limit=5
```

### **Settings & Roles**

```
GET    /api/admin/roles
POST   /api/admin/roles
PUT    /api/admin/roles/:id
DELETE /api/admin/roles/:id

GET    /api/admin/permissions (list all available)

PATCH  /api/admin/users/:id/roles
       Body: { roleIds: [...] }
```

---

## 4️⃣ **Permissions Matrix**

### **Permission Codes:**

```
Format: <resource>:<action>

Products:
- products:read          View products
- products:write         Create/Update products
- products:delete        Delete products

Orders:
- orders:read            View orders
- orders:update          Update order status
- orders:refund          Process refunds
- orders:delete          Cancel orders

Customers:
- customers:read         View customer data
- customers:write        Update customer info
- customers:delete       Delete customers

Marketing:
- coupons:read
- coupons:write
- coupons:delete
- campaigns:read
- campaigns:write

Content:
- banners:read
- banners:write
- pages:read
- pages:write

Analytics:
- analytics:read         View reports

Settings:
- settings:read
- settings:write
- roles:read
- roles:write            Manage roles & permissions
```

### **Predefined Roles:**

**1. Super Admin**
```
- ALL permissions (bypass checks)
- Cannot be deleted
- Full system access
```

**2. Content Manager**
```
- products:read, products:write
- categories:read, categories:write
- banners:read, banners:write
- pages:read, pages:write
```

**3. Order Processor**
```
- orders:read, orders:update
- customers:read
- analytics:read
```

**4. Customer Support**
```
- orders:read
- customers:read, customers:write
- products:read
```

**5. Marketing Manager**
```
- coupons:read, coupons:write
- campaigns:read, campaigns:write
- analytics:read
- customers:read
```

---

## 5️⃣ **Implementation Roadmap**

### **Phase 0: Foundation** ✅ (Completed)
- ✅ Admin UI Layout
- ✅ Dashboard with mock data
- ✅ Design system

### **Phase 1: Authentication & Core API** (Week 1-2)

**Backend:**
```
Week 1:
☐ Install JWT dependencies
☐ Create auth.py (JWT utilities)
☐ Create middleware.py (permission checks)
☐ Update login endpoint (return tokens)
☐ Create refresh token endpoint
☐ Test JWT flow with Postman

Week 2:
☐ Create products collection schema
☐ Implement GET /api/admin/products (pagination)
☐ Implement POST /api/admin/products
☐ Implement PUT /api/admin/products/:id
☐ Implement DELETE /api/admin/products/:id
☐ Add unit tests
```

**Frontend:**
```
Week 2:
☐ Create API client with JWT interceptor
☐ Update login flow (store tokens)
☐ Implement auto-refresh logic
☐ Add Authorization header to all requests
☐ Handle 401/403 errors globally
```

---

### **Phase 2: Product Management** (Week 3-4)

**Backend:**
```
☐ Categories CRUD endpoints
☐ Image upload endpoint (S3/local storage)
☐ Bulk operations endpoint
☐ Product search (full-text)
☐ Stock management logic
```

**Frontend:**
```
☐ Product List page (DataTable)
☐ Product Create/Edit form
☐ Image uploader component
☐ Category selector
☐ Attributes manager
☐ Rich text editor integration
```

---

### **Phase 3: Order Management** (Week 5-6)

**Backend:**
```
☐ Orders collection schema
☐ Orders CRUD endpoints
☐ Status update workflow
☐ Email notifications
```

**Frontend:**
```
☐ Orders list with filters
☐ Order detail page
☐ Status update UI
☐ Print invoice
```

---

### **Phase 4: Roles & Permissions** (Week 7-8)

**Backend:**
```
☐ Roles & permissions collections
☐ Role assignment logic
☐ Permission computation
☐ Middleware updates
```

**Frontend:**
```
☐ Roles list page
☐ Permission matrix UI
☐ Role assignment modal
☐ User roles management
```

---

## 📝 **Testing Checklist**

### **Authentication:**
```
☐ Login with valid credentials → returns tokens
☐ Login with invalid credentials → 401 error
☐ Access protected endpoint without token → 401
☐ Access protected endpoint with expired token → 401
☐ Refresh token flow works
☐ Logout invalidates tokens
☐ User without permission → 403 error
```

### **Products API:**
```
☐ GET /products with pagination
☐ GET /products with filters (status, category)
☐ GET /products with search
☐ POST /products creates new product
☐ POST /products validates required fields
☐ PUT /products updates existing
☐ DELETE /products soft deletes
☐ Bulk operations work
```

### **Authorization:**
```
☐ Super admin can access everything
☐ Content manager can manage products
☐ Content manager CANNOT manage roles
☐ Order processor can view orders
☐ Order processor CANNOT create products
```

---

## 🔒 **Security Best Practices**

```
✅ Use HTTPS in production
✅ JWT secret key in environment variable (never commit)
✅ HttpOnly cookies for tokens (if possible)
✅ CORS properly configured (whitelist domains)
✅ Rate limiting on login endpoint
✅ Input validation & sanitization
✅ SQL/NoSQL injection protection
✅ XSS protection (escape output)
✅ CSRF tokens for state-changing operations
✅ Password hashing (bcrypt, already done ✅)
✅ Audit logs for sensitive operations
✅ Regularly rotate JWT secret keys
```

---

## 🚀 **Ready to Implement!**

**Next action:** Chọn 1 trong 3:

1. **Option A:** Bắt đầu với **Authentication** (JWT + Middleware)
2. **Option B:** Bắt đầu với **Product API** (CRUD endpoints)
3. **Option C:** Design **Database Schema** chi tiết hơn

**Hãy cho tôi biết bạn muốn bắt đầu từ đâu!** 🎯
