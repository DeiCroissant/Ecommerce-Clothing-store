from fastapi import FastAPI, HTTPException, status, Path, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from app.database import users_collection, categories_collection, products_collection, reviews_collection, orders_collection, cart_collection, close_db
from app.schemas import (
    UserCreate,
    UserLogin,
    RegisterResponse,
    LoginResponse,
    ErrorResponse,
    UserResponse,
    EmailVerifyRequest,
    EmailVerifyResponse,
    ResendVerificationRequest,
    ResendVerificationResponse,
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryListResponse,
    CategoryDeleteResponse,
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    ProductDeleteResponse,
    WishlistResponse,
    WishlistToggleResponse,
    ReviewCreate,
    ReviewResponse,
    ReviewListResponse,
    OrderCreate,
    OrderResponse,
    OrderListResponse,
    OrderCheckResponse,
    OrderItem,
    ProductVariants,
)
from app.email_utils import send_verification_email
from datetime import datetime
import bcrypt
from bson import ObjectId
import secrets

app = FastAPI(
    title="Vyron Fashion API",
    description="Backend API cho ứng dụng thời trang",
    version="1.0.0"
)

# CORS middleware - Phải đặt TRƯỚC tất cả các route
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả origins (dev only)
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Cho phép tất cả headers
    expose_headers=["*"],  # Expose tất cả headers
    max_age=3600,  # Cache preflight request trong 1 giờ
)

@app.on_event("shutdown")
async def shutdown_event():
    await close_db()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {"message": "Vyron Fashion API", "status": "running"}

def remove_accents(input_str):
    import unicodedata
    return ''.join((c for c in unicodedata.normalize('NFKD', input_str) if not unicodedata.combining(c)))

def normalize_variants(variants_data):
    """Normalize variants data to ensure proper structure"""
    if not variants_data:
        return {"colors": [], "sizes": []}
    
    # Ensure colors is a list
    colors = variants_data.get("colors", [])
    if not isinstance(colors, list):
        colors = []
    
    # Normalize each color to have required fields
    normalized_colors = []
    for color in colors:
        if isinstance(color, dict):
            normalized_colors.append({
                "name": color.get("name", ""),
                "slug": color.get("slug", ""),
                "hex": color.get("hex", "#000000"),
                "available": color.get("available", True)
            })
    
    # Ensure sizes is a list
    sizes = variants_data.get("sizes", [])
    if not isinstance(sizes, list):
        sizes = []
    
    # Normalize each size to have required fields
    normalized_sizes = []
    for size in sizes:
        if isinstance(size, dict):
            normalized_sizes.append({
                "name": size.get("name", ""),
                "available": size.get("available", True),
                "stock": size.get("stock", 0)
            })
        elif isinstance(size, str):
            # Handle case where size is just a string
            normalized_sizes.append({
                "name": size,
                "available": True,
                "stock": 0
            })
    
    return {
        "colors": normalized_colors,
        "sizes": normalized_sizes
    }

@app.post("/api/auth/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """
    Đăng ký người dùng mới
    
    Yêu cầu:
    - Mật khẩu dài 8 ký tự
    - Phải có 1 chữ hoa và 1 ký tự đặc biệt
    - Không được trùng tên hoặc ngày sinh
    """
    try:
        # Kiểm tra username đã tồn tại chưa
        existing_username = await users_collection.find_one({"username": user_data.username})
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tên đăng nhập đã được sử dụng"
            )
        
        # Kiểm tra email đã tồn tại chưa
        existing_email = await users_collection.find_one({"email": user_data.email})
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email đã được sử dụng"
            )
        
        # Validate password không chứa username, tên, ngày sinh
        pw_lower = user_data.password.lower()
        # Không dấu, thường hết
        name_key = remove_accents(user_data.name).replace(' ', '').lower()
        username_key = remove_accents(user_data.username).replace(' ', '').lower()
        dob_str = user_data.dateOfBirth.replace('-', '').replace('/', '')
        dob_parts = user_data.dateOfBirth.split('-') if '-' in user_data.dateOfBirth else user_data.dateOfBirth.split('/')

        # Ràng buộc mới: mật khẩu không được trùng hoặc chứa tên đăng nhập
        if username_key and (pw_lower == username_key or username_key in pw_lower):
            raise HTTPException(status_code=400, detail="Mật khẩu không được trùng hoặc chứa tên đăng nhập")

        # Thêm ràng buộc: không được trùng hoặc chứa tên cá nhân
        if name_key and (pw_lower == name_key or name_key in pw_lower):
            raise HTTPException(status_code=400, detail="Mật khẩu không được trùng hoặc chứa tên cá nhân")
        for part in dob_parts:
            if part and part in pw_lower:
                raise HTTPException(status_code=400, detail="Mật khẩu không được chứa ngày sinh (năm/tháng/ngày)")
        if dob_str and dob_str in pw_lower:
            raise HTTPException(status_code=400, detail="Mật khẩu không được chứa ngày sinh (yyyyMMdd)")
        
        # Hash password
        hashed_password = bcrypt.hashpw(
            user_data.password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        verification_code = secrets.token_hex(3).upper()

        # Tạo user mới
        new_user = {
            "username": user_data.username,
            "email": user_data.email,
            "password": hashed_password,
            "name": user_data.name,
            "dateOfBirth": user_data.dateOfBirth,
            "createdAt": datetime.now(),
            "role": "user",
            "emailVerified": False,
            "verificationCode": verification_code,
            "avatar": getattr(user_data, 'avatar', ''),
            "phone": getattr(user_data, 'phone', ''),
            "address": getattr(user_data, 'address', ''),
            "memberLevel": getattr(user_data, 'memberLevel', 'bronze'),
        }

        # Lưu vào database
        result = await users_collection.insert_one(new_user)

        # Gửi email xác minh (nếu cấu hình SMTP đầy đủ)
        email_sent = await send_verification_email(new_user["email"], new_user["username"], verification_code)

        # Trả về user (không bao gồm password)
        user_response = UserResponse(
            id=str(result.inserted_id),
            username=new_user["username"],
            email=new_user["email"],
            name=new_user["name"],
            dateOfBirth=new_user["dateOfBirth"],
            createdAt=new_user["createdAt"],
            role=new_user["role"],
            emailVerified=new_user["emailVerified"],
        )

        return RegisterResponse(
            success=True,
            message="Đăng ký thành công. Vui lòng kiểm tra email để xác minh." if email_sent else "Đăng ký thành công (chưa gửi được email xác minh).",
            user=user_response,
            verificationCode=None if email_sent else verification_code,
            emailSent=email_sent,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(credentials: UserLogin):
    """
    Đăng nhập người dùng
    
    Có thể đăng nhập bằng username hoặc email
    """
    try:
        # Tìm user theo username hoặc email
        user = await users_collection.find_one({
            "$or": [
                {"username": credentials.username},
                {"email": credentials.username}
            ]
        })
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Tên đăng nhập hoặc mật khẩu không đúng"
            )
        
        # Kiểm tra password trước
        if not bcrypt.checkpw(
            credentials.password.encode('utf-8'),
            user["password"].encode('utf-8')
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Tên đăng nhập hoặc mật khẩu không đúng"
            )

        # Nếu password đúng nhưng email chưa verify
        if not user.get("emailVerified", False):
            return LoginResponse(
                success=False,
                message="Email chưa được xác minh. Vui lòng xác minh email.",
                user=None,
                needsVerification=True,
                email=user.get("email")
            )
        
        # Trả về user (không bao gồm password)
        user_response = UserResponse(
            id=str(user["_id"]),
            username=user["username"],
            email=user["email"],
            name=user["name"],
            dateOfBirth=user["dateOfBirth"],
            createdAt=user["createdAt"],
            role=user.get("role", "user"),
            emailVerified=user.get("emailVerified", False)
        )
        
        return LoginResponse(
            success=True,
            message="Đăng nhập thành công",
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.get("/api/user/{user_id}", response_model=UserResponse)
async def get_user_detail(user_id: str = Path(...)):
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(
        id=str(user["_id"]),
        username=user["username"],
        email=user["email"],
        name=user["name"],
        dateOfBirth=user["dateOfBirth"],
        createdAt=user["createdAt"],
        role=user.get("role", "user"),
        emailVerified=user.get("emailVerified", False)
    )


@app.post("/api/auth/verify-email", response_model=EmailVerifyResponse)
async def verify_email(payload: EmailVerifyRequest):
    user = await users_collection.find_one({"username": payload.username})
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

    if user.get("emailVerified", False):
        return EmailVerifyResponse(success=True, message="Email đã được xác minh")

    stored_code = user.get("verificationCode")
    if not stored_code or stored_code.upper() != payload.code.upper():
        raise HTTPException(status_code=400, detail="Mã xác minh không hợp lệ")

    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"emailVerified": True}, "$unset": {"verificationCode": ""}}
    )

    return EmailVerifyResponse(success=True, message="Xác minh email thành công")


@app.post("/api/auth/resend-verification")
async def resend_verification(payload: dict):
    """Gửi lại mã xác minh email"""
    try:
        username = payload.get("username")
        if not username:
            return {"success": False, "error": "Thiếu username"}
        
        print(f"🔍 Tìm user: {username}")
        user = await users_collection.find_one({"username": username})
        
        if not user:
            print(f"❌ Không tìm thấy user: {username}")
            return {"success": False, "error": "Không tìm thấy người dùng"}

        if user.get("emailVerified", False):
            print(f"✅ User {username} đã verify rồi")
            return {
                "success": True,
                "message": "Email đã được xác minh",
                "emailSent": False,
                "verificationCode": None
            }

        # Tạo mã xác minh mới
        verification_code = secrets.token_hex(3).upper()
        print(f"🔑 Tạo mã mới: {verification_code}")

        # Cập nhật mã mới vào database
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"verificationCode": verification_code}}
        )
        print(f"💾 Đã lưu mã vào DB")

        # Gửi email xác minh
        email_sent = await send_verification_email(user["email"], user["username"], verification_code)
        
        return {
            "success": True,
            "message": "Mã xác minh mới đã được gửi tới email của bạn" if email_sent else "Tạo mã mới thành công",
            "verificationCode": None if email_sent else verification_code,
            "emailSent": email_sent
        }
        
    except Exception as e:
        print(f"❌ LỖI NGHIÊM TRỌNG: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": f"Lỗi server: {str(e)}"
        }

# ==================== CATEGORY API ENDPOINTS ====================

@app.get("/api/categories", response_model=CategoryListResponse)
async def get_categories(parent_id: Optional[str] = Query(None), status: Optional[str] = Query(None)):
    """
    Lấy danh sách danh mục
    - Không có parent_id: Lấy tất cả
    - parent_id=null hoặc không gửi: Lấy danh mục chính (parent_id = None)
    - parent_id=<id>: Lấy danh mục con
    - status: Lọc theo trạng thái (active/inactive)
    """
    try:
        query = {}
        # Xử lý parent_id: nếu là "null" string hoặc None, lấy danh mục chính
        if parent_id is not None:
            if parent_id == "null" or parent_id == "":
                query["parent_id"] = None
            else:
                query["parent_id"] = parent_id
        # Nếu không có parent_id parameter, lấy tất cả (không filter)
        
        if status:
            query["status"] = status
        
        print(f"🔍 Query categories with: {query}")
        cursor = categories_collection.find(query).sort("created_at", -1)
        categories = await cursor.to_list(length=None)
        
        result = []
        for cat in categories:
            # Đếm số sản phẩm trong danh mục (TODO: tính từ products collection)
            product_count = 0
            
            result.append(CategoryResponse(
                id=str(cat["_id"]),
                name=cat["name"],
                slug=cat["slug"],
                description=cat.get("description", ""),
                parent_id=cat.get("parent_id"),
                status=cat.get("status", "active"),
                product_count=product_count,
                created_at=cat.get("created_at"),
                updated_at=cat.get("updated_at")
            ))
        
        return CategoryListResponse(
            success=True,
            categories=result,
            total=len(result)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.get("/api/categories/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str = Path(...)):
    """Lấy thông tin một danh mục"""
    try:
        category = await categories_collection.find_one({"_id": ObjectId(category_id)})
        if not category:
            raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")
        
        product_count = 0  # TODO: tính từ products collection
        
        return CategoryResponse(
            id=str(category["_id"]),
            name=category["name"],
            slug=category["slug"],
            description=category.get("description", ""),
            parent_id=category.get("parent_id"),
            status=category.get("status", "active"),
            product_count=product_count,
            created_at=category.get("created_at"),
            updated_at=category.get("updated_at")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.post("/api/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(category_data: CategoryCreate):
    """Tạo danh mục mới"""
    try:
        print(f"📝 Creating category: {category_data.name}, parent_id: {category_data.parent_id}")
        
        # Kiểm tra slug đã tồn tại chưa
        existing = await categories_collection.find_one({"slug": category_data.slug})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slug đã được sử dụng"
            )
        
        # Xử lý parent_id: nếu là None hoặc "null", lưu thành None
        parent_id_value = None
        if category_data.parent_id:
            parent_id_value = category_data.parent_id
        
        new_category = {
            "name": category_data.name,
            "slug": category_data.slug,
            "description": category_data.description or "",
            "parent_id": parent_id_value,
            "status": category_data.status,
            "product_count": 0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        print(f"💾 Saving category to DB: {new_category}")
        result = await categories_collection.insert_one(new_category)
        print(f"✅ Category saved with ID: {result.inserted_id}")
        
        return CategoryResponse(
            id=str(result.inserted_id),
            name=new_category["name"],
            slug=new_category["slug"],
            description=new_category["description"],
            parent_id=new_category["parent_id"],
            status=new_category["status"],
            product_count=0,
            created_at=new_category["created_at"],
            updated_at=new_category["updated_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.put("/api/categories/{category_id}", response_model=CategoryResponse)
async def update_category(category_id: str = Path(...), category_data: CategoryUpdate = None):
    """Cập nhật danh mục"""
    try:
        category = await categories_collection.find_one({"_id": ObjectId(category_id)})
        if not category:
            raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")
        
        update_data = {}
        if category_data.name is not None:
            update_data["name"] = category_data.name
        if category_data.slug is not None:
            # Kiểm tra slug mới có trùng không
            existing = await categories_collection.find_one({
                "slug": category_data.slug,
                "_id": {"$ne": ObjectId(category_id)}
            })
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Slug đã được sử dụng"
                )
            update_data["slug"] = category_data.slug
        if category_data.description is not None:
            update_data["description"] = category_data.description
        if category_data.status is not None:
            update_data["status"] = category_data.status
        
        update_data["updated_at"] = datetime.now().isoformat()
        
        await categories_collection.update_one(
            {"_id": ObjectId(category_id)},
            {"$set": update_data}
        )
        
        updated = await categories_collection.find_one({"_id": ObjectId(category_id)})
        
        return CategoryResponse(
            id=str(updated["_id"]),
            name=updated["name"],
            slug=updated["slug"],
            description=updated.get("description", ""),
            parent_id=updated.get("parent_id"),
            status=updated.get("status", "active"),
            product_count=updated.get("product_count", 0),
            created_at=updated.get("created_at"),
            updated_at=updated.get("updated_at")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.delete("/api/categories/{category_id}", response_model=CategoryDeleteResponse)
async def delete_category(category_id: str = Path(...)):
    """Xóa danh mục và tất cả danh mục con"""
    try:
        category = await categories_collection.find_one({"_id": ObjectId(category_id)})
        if not category:
            raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")
        
        # Lấy tất cả danh mục con
        subcategories = await categories_collection.find({"parent_id": category_id}).to_list(length=None)
        
        # Xóa tất cả danh mục con
        if subcategories:
            subcategory_ids = [str(sub["_id"]) for sub in subcategories]
            await categories_collection.delete_many({"parent_id": category_id})
        else:
            subcategory_ids = []
        
        # Xóa danh mục chính
        await categories_collection.delete_one({"_id": ObjectId(category_id)})
        
        # TODO: Xóa hoặc cập nhật products trong danh mục này
        
        category_response = CategoryResponse(
            id=str(category["_id"]),
            name=category["name"],
            slug=category["slug"],
            description=category.get("description", ""),
            parent_id=category.get("parent_id"),
            status=category.get("status", "active"),
            product_count=category.get("product_count", 0),
            created_at=category.get("created_at"),
            updated_at=category.get("updated_at")
        )
        
        subcategories_response = []
        for sub in subcategories:
            subcategories_response.append(CategoryResponse(
                id=str(sub["_id"]),
                name=sub["name"],
                slug=sub["slug"],
                description=sub.get("description", ""),
                parent_id=sub.get("parent_id"),
                status=sub.get("status", "active"),
                product_count=sub.get("product_count", 0),
                created_at=sub.get("created_at"),
                updated_at=sub.get("updated_at")
            ))
        
        return CategoryDeleteResponse(
            success=True,
            message=f"Đã xóa danh mục '{category['name']}' và {len(subcategories)} danh mục con",
            deleted_category=category_response,
            deleted_subcategories=subcategories_response
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

# ==================== PRODUCT API ENDPOINTS ====================

@app.get("/api/products", response_model=ProductListResponse)
async def get_products(
    category_slug: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    slug: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100),
    sort: Optional[str] = Query('newest')
):
    """
    Lấy danh sách sản phẩm
    - category_slug: Lọc theo category slug
    - status: Lọc theo trạng thái (active/inactive)
    - slug: Tìm sản phẩm theo slug (trả về 1 sản phẩm nếu tìm thấy)
    - page: Trang hiện tại
    - limit: Số lượng mỗi trang
    - sort: Sắp xếp (newest, price_asc, price_desc)
    """
    try:
        query = {}
        
        if slug:
            # Tìm theo slug - trả về 1 sản phẩm
            query["slug"] = slug
        elif category_slug:
            query["category.slug"] = category_slug
        
        if status:
            query["status"] = status
        
        print(f"🔍 Query products with: {query}")
        
        # Tính toán skip
        skip = (page - 1) * limit
        
        # Sort
        sort_dict = {}
        if sort == 'newest':
            sort_dict = {"created_at": -1}
        elif sort == 'price_asc':
            sort_dict = {"pricing.sale": 1}
        elif sort == 'price_desc':
            sort_dict = {"pricing.sale": -1}
        else:
            sort_dict = {"created_at": -1}
        
        # Đếm tổng số
        total = await products_collection.count_documents(query)
        total_pages = (total + limit - 1) // limit
        
        # Lấy sản phẩm
        cursor = products_collection.find(query).sort(list(sort_dict.items())).skip(skip).limit(limit)
        products = await cursor.to_list(length=None)
        
        result = []
        for product in products:
            result.append(ProductResponse(
                id=str(product["_id"]),
                name=product["name"],
                slug=product["slug"],
                sku=product["sku"],
                brand=product.get("brand", {"name": "VYRON", "slug": "vyron"}),
                category=product.get("category", {"name": "", "slug": ""}),
                pricing=product.get("pricing", {
                    "original": 0,
                    "sale": 0,
                    "discount_percent": 0,
                    "currency": "VND"
                }),
                short_description=product.get("short_description", ""),
                image=product.get("image", ""),
                images=product.get("images", []),
                variants=normalize_variants(product.get("variants", {})),
                inventory=product.get("inventory", {
                    "in_stock": True,
                    "quantity": 0,
                    "low_stock_threshold": 10
                }),
                status=product.get("status", "active"),
                rating=product.get("rating", {"average": 0.0, "count": 0}),
                wishlist_count=product.get("wishlist_count", 0),
                sold_count=product.get("sold_count", 0),
                created_at=product.get("created_at"),
                updated_at=product.get("updated_at")
            ))
        
        return ProductListResponse(
            success=True,
            products=result,
            total=total,
            page=page,
            limit=limit,
            totalPages=total_pages
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.get("/api/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str = Path(...)):
    """Lấy thông tin một sản phẩm"""
    try:
        product = await products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
        
        return ProductResponse(
            id=str(product["_id"]),
            name=product["name"],
            slug=product["slug"],
            sku=product["sku"],
            brand=product.get("brand", {"name": "VYRON", "slug": "vyron"}),
            category=product.get("category", {"name": "", "slug": ""}),
            pricing=product.get("pricing", {
                "original": 0,
                "sale": 0,
                "discount_percent": 0,
                "currency": "VND"
            }),
            short_description=product.get("short_description", ""),
            image=product.get("image", ""),
            images=product.get("images", []),
            variants=normalize_variants(product.get("variants", {})),
            inventory=product.get("inventory", {
                "in_stock": True,
                "quantity": 0,
                "low_stock_threshold": 10
            }),
            status=product.get("status", "active"),
            rating=product.get("rating", {"average": 0.0, "count": 0}),
            wishlist_count=product.get("wishlist_count", 0),
            sold_count=product.get("sold_count", 0),
            created_at=product.get("created_at"),
            updated_at=product.get("updated_at")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.post("/api/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product_data: ProductCreate):
    """Tạo sản phẩm mới"""
    try:
        print(f"📝 Creating product: {product_data.name}")
        
        # Kiểm tra slug đã tồn tại chưa
        existing = await products_collection.find_one({"slug": product_data.slug})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slug đã được sử dụng"
            )
        
        # Kiểm tra SKU đã tồn tại chưa
        existing_sku = await products_collection.find_one({"sku": product_data.sku})
        if existing_sku:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SKU đã được sử dụng"
            )
        
        new_product = {
            "name": product_data.name,
            "slug": product_data.slug,
            "sku": product_data.sku,
            "brand": product_data.brand.dict(),
            "category": product_data.category.dict(),
            "pricing": product_data.pricing.dict(),
            "short_description": product_data.short_description,
            "image": product_data.image,
            "images": product_data.images,
            "variants": product_data.variants.dict(),
            "inventory": product_data.inventory.dict(),
            "status": product_data.status,
            "rating": product_data.rating.dict(),
            "wishlist_count": 0,
            "sold_count": 0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        print(f"💾 Saving product to DB: {new_product['name']}")
        result = await products_collection.insert_one(new_product)
        print(f"✅ Product saved with ID: {result.inserted_id}")
        
        return ProductResponse(
            id=str(result.inserted_id),
            name=new_product["name"],
            slug=new_product["slug"],
            sku=new_product["sku"],
            brand=product_data.brand,
            category=product_data.category,
            pricing=product_data.pricing,
            short_description=new_product["short_description"],
            image=new_product["image"],
            images=new_product["images"],
            variants=product_data.variants,
            inventory=product_data.inventory,
            status=new_product["status"],
            rating=product_data.rating,
            wishlist_count=0,
            sold_count=0,
            created_at=new_product["created_at"],
            updated_at=new_product["updated_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.put("/api/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str = Path(...), product_data: ProductUpdate = None):
    """Cập nhật sản phẩm"""
    try:
        product = await products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
        
        update_data = {}
        if product_data.name is not None:
            update_data["name"] = product_data.name
        if product_data.slug is not None:
            # Kiểm tra slug mới có trùng không
            existing = await products_collection.find_one({
                "slug": product_data.slug,
                "_id": {"$ne": ObjectId(product_id)}
            })
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Slug đã được sử dụng"
                )
            update_data["slug"] = product_data.slug
        if product_data.sku is not None:
            # Kiểm tra SKU mới có trùng không
            existing = await products_collection.find_one({
                "sku": product_data.sku,
                "_id": {"$ne": ObjectId(product_id)}
            })
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="SKU đã được sử dụng"
                )
            update_data["sku"] = product_data.sku
        if product_data.brand is not None:
            update_data["brand"] = product_data.brand.dict()
        if product_data.category is not None:
            update_data["category"] = product_data.category.dict()
        if product_data.pricing is not None:
            update_data["pricing"] = product_data.pricing.dict()
        if product_data.short_description is not None:
            update_data["short_description"] = product_data.short_description
        if product_data.image is not None:
            update_data["image"] = product_data.image
        if product_data.images is not None:
            update_data["images"] = product_data.images
        if product_data.variants is not None:
            update_data["variants"] = product_data.variants.dict()
        if product_data.inventory is not None:
            update_data["inventory"] = product_data.inventory.dict()
        if product_data.status is not None:
            update_data["status"] = product_data.status
        if product_data.rating is not None:
            update_data["rating"] = product_data.rating.dict()
        
        update_data["updated_at"] = datetime.now().isoformat()
        
        await products_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )
        
        updated = await products_collection.find_one({"_id": ObjectId(product_id)})
        
        return ProductResponse(
            id=str(updated["_id"]),
            name=updated["name"],
            slug=updated["slug"],
            sku=updated["sku"],
            brand=updated.get("brand", {"name": "VYRON", "slug": "vyron"}),
            category=updated.get("category", {"name": "", "slug": ""}),
            pricing=updated.get("pricing", {
                "original": 0,
                "sale": 0,
                "discount_percent": 0,
                "currency": "VND"
            }),
            short_description=updated.get("short_description", ""),
            image=updated.get("image", ""),
            images=updated.get("images", []),
            variants=updated.get("variants", {"colors": [], "sizes": []}),
            inventory=updated.get("inventory", {
                "in_stock": True,
                "quantity": 0,
                "low_stock_threshold": 10
            }),
            status=updated.get("status", "active"),
            rating=updated.get("rating", {"average": 0.0, "count": 0}),
            wishlist_count=updated.get("wishlist_count", 0),
            sold_count=updated.get("sold_count", 0),
            created_at=updated.get("created_at"),
            updated_at=updated.get("updated_at")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.delete("/api/products/{product_id}", response_model=ProductDeleteResponse)
async def delete_product(product_id: str = Path(...)):
    """Xóa sản phẩm"""
    try:
        product = await products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
        
        await products_collection.delete_one({"_id": ObjectId(product_id)})
        
        product_response = ProductResponse(
            id=str(product["_id"]),
            name=product["name"],
            slug=product["slug"],
            sku=product["sku"],
            brand=product.get("brand", {"name": "VYRON", "slug": "vyron"}),
            category=product.get("category", {"name": "", "slug": ""}),
            pricing=product.get("pricing", {
                "original": 0,
                "sale": 0,
                "discount_percent": 0,
                "currency": "VND"
            }),
            short_description=product.get("short_description", ""),
            image=product.get("image", ""),
            images=product.get("images", []),
            variants=normalize_variants(product.get("variants", {})),
            inventory=product.get("inventory", {
                "in_stock": True,
                "quantity": 0,
                "low_stock_threshold": 10
            }),
            status=product.get("status", "active"),
            rating=product.get("rating", {"average": 0.0, "count": 0}),
            wishlist_count=product.get("wishlist_count", 0),
            sold_count=product.get("sold_count", 0),
            created_at=product.get("created_at"),
            updated_at=product.get("updated_at")
        )
        
        return ProductDeleteResponse(
            success=True,
            message=f"Đã xóa sản phẩm '{product['name']}'",
            deleted_product=product_response
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

# ==================== WISHLIST API ENDPOINTS ====================

@app.post("/api/wishlist/toggle", response_model=WishlistToggleResponse)
async def toggle_wishlist(
    product_id: str = Query(..., description="ID sản phẩm"),
    user_id: str = Query(..., description="ID người dùng")
):
    """
    Thêm hoặc xóa sản phẩm khỏi wishlist
    - Nếu sản phẩm chưa có trong wishlist → thêm vào và tăng wishlist_count
    - Nếu đã có → xóa khỏi wishlist và giảm wishlist_count
    """
    try:
        # Kiểm tra user tồn tại
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
        # Kiểm tra product tồn tại
        product = await products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
        
        # Lấy wishlist hiện tại của user
        wishlist = user.get("wishlist", [])
        wishlist_product_ids = [item.get("product_id") if isinstance(item, dict) else item for item in wishlist]
        
        is_added = False
        if product_id in wishlist_product_ids:
            # Xóa khỏi wishlist
            wishlist = [item for item in wishlist if (item.get("product_id") if isinstance(item, dict) else item) != product_id]
            # Giảm wishlist_count
            new_count = max(0, product.get("wishlist_count", 0) - 1)
            await products_collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": {"wishlist_count": new_count}}
            )
            message = "Đã xóa khỏi danh sách yêu thích"
        else:
            # Thêm vào wishlist
            wishlist.append({
                "product_id": product_id,
                "added_at": datetime.now().isoformat()
            })
            # Tăng wishlist_count
            new_count = product.get("wishlist_count", 0) + 1
            await products_collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": {"wishlist_count": new_count}}
            )
            is_added = True
            message = "Đã thêm vào danh sách yêu thích"
        
        # Cập nhật wishlist của user
        await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"wishlist": wishlist}}
        )
        
        return WishlistToggleResponse(
            success=True,
            message=message,
            is_added=is_added,
            wishlist_count=new_count
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.get("/api/wishlist/{user_id}", response_model=WishlistResponse)
async def get_wishlist(user_id: str = Path(...)):
    """Lấy danh sách wishlist của user"""
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
        wishlist = user.get("wishlist", [])
        
        # Chuyển đổi format
        wishlist_items = []
        for item in wishlist:
            if isinstance(item, dict):
                wishlist_items.append({
                    "product_id": item.get("product_id"),
                    "added_at": item.get("added_at", datetime.now().isoformat())
                })
            else:
                # Format cũ (chỉ là string product_id)
                wishlist_items.append({
                    "product_id": item,
                    "added_at": datetime.now().isoformat()
                })
        
        return WishlistResponse(
            success=True,
            user_id=user_id,
            wishlist=wishlist_items,
            total=len(wishlist_items)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.get("/api/wishlist/{user_id}/products", response_model=ProductListResponse)
async def get_wishlist_products(user_id: str = Path(...)):
    """Lấy danh sách sản phẩm trong wishlist của user"""
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
        wishlist = user.get("wishlist", [])
        product_ids = []
        for item in wishlist:
            if isinstance(item, dict):
                product_ids.append(item.get("product_id"))
            else:
                product_ids.append(item)
        
        # Lấy products
        products = []
        for product_id in product_ids:
            try:
                product = await products_collection.find_one({"_id": ObjectId(product_id)})
                if product:
                    products.append(ProductResponse(
                        id=str(product["_id"]),
                        name=product["name"],
                        slug=product["slug"],
                        sku=product["sku"],
                        brand=product.get("brand", {"name": "VYRON", "slug": "vyron"}),
                        category=product.get("category", {"name": "", "slug": ""}),
                        pricing=product.get("pricing", {
                            "original": 0,
                            "sale": 0,
                            "discount_percent": 0,
                            "currency": "VND"
                        }),
                        short_description=product.get("short_description", ""),
                        image=product.get("image", ""),
                        images=product.get("images", []),
                        variants=normalize_variants(product.get("variants", {})),
                        inventory=product.get("inventory", {
                            "in_stock": True,
                            "quantity": 0,
                            "low_stock_threshold": 10
                        }),
                        status=product.get("status", "active"),
                        rating=product.get("rating", {"average": 0.0, "count": 0}),
                        wishlist_count=product.get("wishlist_count", 0),
                        sold_count=product.get("sold_count", 0),
                        created_at=product.get("created_at"),
                        updated_at=product.get("updated_at")
                    ))
            except:
                continue
        
        return ProductListResponse(
            success=True,
            products=products,
            total=len(products),
            page=1,
            limit=len(products),
            totalPages=1
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

# ==================== REVIEW/RATING API ENDPOINTS ====================

@app.post("/api/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(review_data: ReviewCreate):
    """Tạo đánh giá mới cho sản phẩm"""
    try:
        # Kiểm tra user tồn tại
        user = await users_collection.find_one({"_id": ObjectId(review_data.user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
        # Kiểm tra product tồn tại
        product = await products_collection.find_one({"_id": ObjectId(review_data.product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
        
        # Kiểm tra user đã review sản phẩm này chưa
        existing_review = await reviews_collection.find_one({
            "product_id": review_data.product_id,
            "user_id": review_data.user_id
        })
        if existing_review:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bạn đã đánh giá sản phẩm này rồi"
            )
        
        # Tạo review mới
        new_review = {
            "product_id": review_data.product_id,
            "user_id": review_data.user_id,
            "rating": review_data.rating,
            "comment": review_data.comment,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        result = await reviews_collection.insert_one(new_review)
        
        # Cập nhật rating của sản phẩm
        all_reviews = await reviews_collection.find({"product_id": review_data.product_id}).to_list(length=None)
        total_rating = sum(r.get("rating", 0) for r in all_reviews)
        average_rating = total_rating / len(all_reviews) if all_reviews else 0
        
        await products_collection.update_one(
            {"_id": ObjectId(review_data.product_id)},
            {"$set": {
                "rating": {
                    "average": round(average_rating, 1),
                    "count": len(all_reviews)
                }
            }}
        )
        
        return ReviewResponse(
            id=str(result.inserted_id),
            product_id=review_data.product_id,
            user_id=review_data.user_id,
            rating=review_data.rating,
            comment=review_data.comment,
            user_name=user.get("name", user.get("username", "Người dùng")),
            user_avatar=user.get("avatar", ""),
            created_at=new_review["created_at"],
            updated_at=new_review["updated_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.get("/api/reviews/product/{product_id}", response_model=ReviewListResponse)
async def get_product_reviews(product_id: str = Path(...)):
    """Lấy danh sách đánh giá của sản phẩm"""
    try:
        # Kiểm tra product tồn tại
        product = await products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
        
        # Lấy tất cả reviews
        cursor = reviews_collection.find({"product_id": product_id}).sort("created_at", -1)
        reviews = await cursor.to_list(length=None)
        
        # Tính toán rating distribution
        rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        total_rating = 0
        
        result_reviews = []
        for review in reviews:
            rating = review.get("rating", 0)
            if 1 <= rating <= 5:
                rating_distribution[rating] = rating_distribution.get(rating, 0) + 1
                total_rating += rating
            
            # Lấy thông tin user
            user = await users_collection.find_one({"_id": ObjectId(review.get("user_id"))})
            
            result_reviews.append(ReviewResponse(
                id=str(review["_id"]),
                product_id=review.get("product_id", ""),
                user_id=review.get("user_id", ""),
                rating=rating,
                comment=review.get("comment", ""),
                user_name=user.get("name", user.get("username", "Người dùng")) if user else "Người dùng",
                user_avatar=user.get("avatar", "") if user else "",
                created_at=review.get("created_at", datetime.now().isoformat()),
                updated_at=review.get("updated_at")
            ))
        
        average_rating = total_rating / len(reviews) if reviews else 0
        
        return ReviewListResponse(
            success=True,
            reviews=result_reviews,
            total=len(result_reviews),
            average_rating=round(average_rating, 1),
            rating_distribution=rating_distribution
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

# ==================== ORDER API ====================
@app.get("/api/orders/check/{user_id}/{product_id}", response_model=OrderCheckResponse)
async def check_user_ordered_product(user_id: str = Path(...), product_id: str = Path(...)):
    """Kiểm tra xem user đã mua và thanh toán thành công sản phẩm chưa"""
    try:
        # Tìm orders của user với status là "delivered" hoặc "completed"
        orders = await orders_collection.find({
            "user_id": user_id,
            "status": {"$in": ["delivered", "completed"]}
        }).to_list(length=None)
        
        has_ordered = False
        for order in orders:
            items = order.get("items", [])
            for item in items:
                if item.get("product_id") == product_id:
                    has_ordered = True
                    break
            if has_ordered:
                break
        
        return OrderCheckResponse(
            success=True,
            has_ordered=has_ordered,
            message="Đã mua sản phẩm" if has_ordered else "Chưa mua sản phẩm"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.post("/api/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order_data: OrderCreate):
    """Tạo đơn hàng mới"""
    try:
        # Generate order number
        import random
        order_number = f"VF{datetime.now().strftime('%Y%m%d')}{random.randint(1000, 9999)}"
        
        new_order = {
            "user_id": order_data.user_id,
            "order_number": order_number,
            "items": [item.dict() for item in order_data.items],
            "total_amount": order_data.total_amount,
            "shipping_address": order_data.shipping_address,
            "payment_method": order_data.payment_method,
            "status": order_data.status,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        result = await orders_collection.insert_one(new_order)
        
        new_order["_id"] = result.inserted_id
        
        return OrderResponse(
            id=str(result.inserted_id),
            user_id=new_order["user_id"],
            order_number=new_order["order_number"],
            items=new_order["items"],
            total_amount=new_order["total_amount"],
            shipping_address=new_order["shipping_address"],
            payment_method=new_order["payment_method"],
            status=new_order["status"],
            created_at=new_order["created_at"],
            updated_at=new_order["updated_at"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.get("/api/orders/user/{user_id}", response_model=OrderListResponse)
async def get_user_orders(user_id: str = Path(...)):
    """Lấy danh sách đơn hàng của user"""
    try:
        cursor = orders_collection.find({"user_id": user_id}).sort("created_at", -1)
        orders = await cursor.to_list(length=None)
        
        result_orders = []
        for order in orders:
            result_orders.append(OrderResponse(
                id=str(order["_id"]),
                user_id=order.get("user_id", ""),
                order_number=order.get("order_number", ""),
                items=order.get("items", []),
                total_amount=order.get("total_amount", 0),
                shipping_address=order.get("shipping_address", ""),
                payment_method=order.get("payment_method", "COD"),
                status=order.get("status", "pending"),
                created_at=order.get("created_at", datetime.now().isoformat()),
                updated_at=order.get("updated_at")
            ))
        
        return OrderListResponse(
            success=True,
            orders=result_orders,
            total=len(result_orders)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

# ==================== CART API ====================
@app.post("/api/cart/add")
async def add_to_cart(user_id: str = Query(...), product_id: str = Query(...), 
                      color: Optional[str] = None, size: Optional[str] = None, 
                      quantity: int = Query(1, ge=1)):
    """Thêm sản phẩm vào giỏ hàng"""
    try:
        # Lấy thông tin sản phẩm
        product = await products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
        
        # Tìm cart của user
        cart = await cart_collection.find_one({"user_id": user_id})
        
        cart_item = {
            "product_id": product_id,
            "product_name": product.get("name", ""),
            "product_image": product.get("image", ""),
            "variant_color": color,
            "variant_size": size,
            "quantity": quantity,
            "price": product.get("pricing", {}).get("sale") or product.get("pricing", {}).get("original", 0)
        }
        
        if cart:
            # Kiểm tra xem item đã có chưa
            items = cart.get("items", [])
            existing_index = None
            for i, item in enumerate(items):
                if (item.get("product_id") == product_id and 
                    item.get("variant_color") == color and 
                    item.get("variant_size") == size):
                    existing_index = i
                    break
            
            if existing_index is not None:
                # Update quantity
                items[existing_index]["quantity"] += quantity
            else:
                # Add new item
                items.append(cart_item)
            
            await cart_collection.update_one(
                {"user_id": user_id},
                {"$set": {"items": items, "updated_at": datetime.now().isoformat()}}
            )
        else:
            # Tạo cart mới
            await cart_collection.insert_one({
                "user_id": user_id,
                "items": [cart_item],
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            })
        
        return {"success": True, "message": "Đã thêm vào giỏ hàng"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.get("/api/cart/{user_id}")
async def get_cart(user_id: str = Path(...)):
    """Lấy giỏ hàng của user"""
    try:
        cart = await cart_collection.find_one({"user_id": user_id})
        if not cart:
            return {"success": True, "items": [], "total": 0}
        
        items = cart.get("items", [])
        total = sum(item.get("price", 0) * item.get("quantity", 0) for item in items)
        
        return {
            "success": True,
            "items": items,
            "total": total,
            "total_items": sum(item.get("quantity", 0) for item in items)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.put("/api/cart/{user_id}/{item_index}")
async def update_cart_item_quantity(user_id: str = Path(...), item_index: int = Path(...), 
                                   quantity: int = Query(..., ge=1)):
    """Cập nhật số lượng item trong giỏ hàng"""
    try:
        cart = await cart_collection.find_one({"user_id": user_id})
        if not cart:
            raise HTTPException(status_code=404, detail="Không tìm thấy giỏ hàng")
        
        items = cart.get("items", [])
        if item_index < 0 or item_index >= len(items):
            raise HTTPException(status_code=400, detail="Index không hợp lệ")
        
        items[item_index]["quantity"] = quantity
        
        await cart_collection.update_one(
            {"user_id": user_id},
            {"$set": {"items": items, "updated_at": datetime.now().isoformat()}}
        )
        
        return {"success": True, "message": "Đã cập nhật số lượng"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.delete("/api/cart/{user_id}/{item_index}")
async def remove_cart_item(user_id: str = Path(...), item_index: int = Path(...)):
    """Xóa item khỏi giỏ hàng"""
    try:
        cart = await cart_collection.find_one({"user_id": user_id})
        if not cart:
            raise HTTPException(status_code=404, detail="Không tìm thấy giỏ hàng")
        
        items = cart.get("items", [])
        if item_index < 0 or item_index >= len(items):
            raise HTTPException(status_code=400, detail="Index không hợp lệ")
        
        items.pop(item_index)
        
        await cart_collection.update_one(
            {"user_id": user_id},
            {"$set": {"items": items, "updated_at": datetime.now().isoformat()}}
        )
        
        return {"success": True, "message": "Đã xóa khỏi giỏ hàng"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

