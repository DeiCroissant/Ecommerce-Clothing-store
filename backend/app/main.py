from fastapi import FastAPI, HTTPException, status, Path, Response, Query, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from app.database import users_collection, categories_collection, products_collection, reviews_collection, orders_collection, cart_collection, addresses_collection, coupons_collection, returns_collection, settings_collection, close_db
from app.schemas import (
    UserCreate,
    UserLogin,
    RegisterResponse,
    LoginResponse,
    ErrorResponse,
    UserResponse,
    UserUpdate,
    EmailVerifyRequest,
    EmailVerifyResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
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
    OrderStatusUpdate,
    OrderUpdateResponse,
    OrderItem,
    ShippingAddress,
    ProductVariants,
    AddressCreate,
    AddressUpdate,
    AddressResponse,
    AddressListResponse,
    CustomerResponse,
    CustomerListResponse,
    CustomerBanUpdate,
    CustomerRoleUpdate,
    PromotionEmailRequest,
    PromotionEmailResponse,
    CouponCreate,
    CouponUpdate,
    CouponResponse,
    CouponListResponse,
    CouponValidateRequest,
    CouponValidateResponse,
    ReturnCreate,
    ReturnUpdate,
    ReturnResponse,
    ReturnListResponse,
    DashboardResponse,
    DashboardKPIMetric,
    DashboardRevenueData,
    DashboardPendingOrder,
    DashboardLowStockProduct,
    Enable2FARequest,
    Enable2FAResponse,
    Disable2FARequest,
    Disable2FAResponse,
    Verify2FACodeRequest,
    Verify2FACodeResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
    Get2FAStatusResponse,
    PaymentMethodSetting,
    ShippingMethodSetting,
    PaymentSettingsUpdate,
    PaymentSettingsResponse,
)
from app.email_utils import send_verification_email, send_reset_password_email, send_promotion_email, send_2fa_code_email
from datetime import datetime, timedelta
import bcrypt
from bson import ObjectId
import secrets
import os
import re
from dotenv import load_dotenv
import asyncio

# Load environment variables
load_dotenv()

# VietQR + Casso payment integration
import app.payment_vietqr as payment_integration
import app.schemas as schemas

app = FastAPI(
    title="Vyron Fashion API",
    description="Backend API cho ứng dụng thời trang",
    version="1.0.0"
)

# Get frontend URL from environment
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

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

@app.on_event("startup")
async def startup_event():
    """Tạo indexes khi khởi động server để tối ưu performance"""
    try:
        print("🚀 Creating database indexes...")
        
        # Products collection indexes
        await products_collection.create_index("slug", unique=True)
        await products_collection.create_index("category.slug")
        await products_collection.create_index("status")
        await products_collection.create_index([("created_at", -1)])
        await products_collection.create_index([("wishlist_count", -1)])
        await products_collection.create_index([("pricing.sale", 1)])
        await products_collection.create_index([("pricing.sale", -1)])
        
        # Categories collection indexes
        await categories_collection.create_index("slug", unique=True)
        
        # Orders collection indexes
        await orders_collection.create_index("user_id")
        await orders_collection.create_index([("created_at", -1)])
        
        # Reviews collection indexes
        await reviews_collection.create_index("product_id")
        await reviews_collection.create_index("user_id")
        
        print("✅ Database indexes created successfully")
    except Exception as e:
        print(f"⚠️ Error creating indexes: {str(e)}")

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
            # Ensure images is always a list
            images = color.get("images", [])
            if images is None:
                images = []
            elif not isinstance(images, list):
                images = []
            
            normalized_colors.append({
                "name": color.get("name", ""),
                "slug": color.get("slug", ""),
                "hex": color.get("hex", "#000000"),
                "available": color.get("available", True),
                "images": images  # Preserve images array
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
        email_sent = await send_verification_email(new_user["email"], new_user["username"], verification_code, new_user.get("name"))

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

        # Kiểm tra tài khoản bị khóa
        if user.get("is_banned", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tài khoản của bạn đã bị khóa do vi phạm quy định của hệ thống. Vui lòng liên hệ với chúng tôi để được hỗ trợ."
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
        
        # Kiểm tra xem user có bật 2FA không
        if user.get("two_factor_enabled", False):
            # Tạo mã 2FA (6 số)
            import random
            two_factor_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            
            # Lưu mã 2FA vào database với thời gian hết hạn (10 phút)
            from datetime import timedelta
            expires_at = datetime.now() + timedelta(minutes=10)
            
            await users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {
                    "two_factor_code": two_factor_code,
                    "two_factor_expires": expires_at.isoformat()
                }}
            )
            
            # Gửi mã 2FA qua email
            email_sent = await send_2fa_code_email(
                to_email=user["email"],
                username=user["username"],
                code=two_factor_code,
                name=user.get("name", user["username"])
            )
            
            # Trả về response yêu cầu nhập mã 2FA
            return LoginResponse(
                success=False,
                message="Vui lòng nhập mã 2FA đã được gửi đến email của bạn",
                user=None,
                needsVerification=False,
                email=user.get("email"),
                needs_2fa=True,
                username=user["username"]
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
            emailVerified=user.get("emailVerified", False),
            avatar=user.get("avatar", ""),
            phone=user.get("phone", ""),
            address=user.get("address", ""),
            memberLevel=user.get("memberLevel", "bronze")
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
        emailVerified=user.get("emailVerified", False),
        avatar=user.get("avatar", ""),
        phone=user.get("phone", ""),
        address=user.get("address", ""),
        memberLevel=user.get("memberLevel", "bronze")
    )

@app.put("/api/user/{user_id}", response_model=UserResponse)
async def update_user_profile(user_id: str = Path(...), user_data: UserUpdate = None):
    """
    Cập nhật thông tin user profile
    Chỉ cho phép cập nhật phone và avatar
    """
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user_data:
            raise HTTPException(status_code=400, detail="Không có dữ liệu để cập nhật")
        
        # Chỉ cho phép cập nhật phone và avatar
        update_data = {}
        if user_data.phone is not None:
            update_data["phone"] = user_data.phone
        if user_data.avatar is not None:
            update_data["avatar"] = user_data.avatar
        
        if not update_data:
            raise HTTPException(status_code=400, detail="Không có dữ liệu để cập nhật")
        
        update_data["updated_at"] = datetime.now().isoformat()
        
        await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        # Lấy user đã cập nhật
        updated_user = await users_collection.find_one({"_id": ObjectId(user_id)})
        
        return UserResponse(
            id=str(updated_user["_id"]),
            username=updated_user["username"],
            email=updated_user["email"],
            name=updated_user["name"],
            dateOfBirth=updated_user["dateOfBirth"],
            createdAt=updated_user["createdAt"],
            role=updated_user.get("role", "user"),
            emailVerified=updated_user.get("emailVerified", False),
            avatar=updated_user.get("avatar", ""),
            phone=updated_user.get("phone", ""),
            address=updated_user.get("address", ""),
            memberLevel=updated_user.get("memberLevel", "bronze")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
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
        email_sent = await send_verification_email(user["email"], user["username"], verification_code, user.get("name"))
        
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

@app.post("/api/auth/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(request: ForgotPasswordRequest):
    """Gửi email đặt lại mật khẩu"""
    try:
        # Tìm user theo email
        user = await users_collection.find_one({"email": request.email})
        
        # Không tiết lộ nếu email không tồn tại (bảo mật)
        if not user:
            return ForgotPasswordResponse(
                success=True,
                message="Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu tới email của bạn.",
                emailSent=False
            )
        
        # Tạo reset token
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.now() + timedelta(hours=1)  # Token hết hạn sau 1 giờ
        
        # Lưu reset token vào database
        await users_collection.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "resetPasswordToken": reset_token,
                    "resetPasswordExpires": expires_at
                }
            }
        )
        
        # Tạo reset URL với frontend URL từ environment
        reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token}"
        
        # Gửi email
        email_sent = await send_reset_password_email(
            user["email"],
            user.get("username", "người dùng"),
            reset_token,
            reset_url,
            user.get("name")
        )
        
        return ForgotPasswordResponse(
            success=True,
            message="Đã gửi link đặt lại mật khẩu tới email của bạn." if email_sent else "Tạo token thành công. Vui lòng sử dụng token trong response.",
            emailSent=email_sent,
            resetToken=None if email_sent else reset_token
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.post("/api/auth/reset-password", response_model=ResetPasswordResponse)
async def reset_password(request: ResetPasswordRequest):
    """Đặt lại mật khẩu với token"""
    try:
        # Tìm user với token hợp lệ
        user = await users_collection.find_one({
            "resetPasswordToken": request.token,
            "resetPasswordExpires": {"$gt": datetime.now()}
        })
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token không hợp lệ hoặc đã hết hạn"
            )
        
        # Validate password: độ dài, chữ hoa, ký tự đặc biệt
        if len(request.new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mật khẩu phải có ít nhất 8 ký tự"
            )
        
        if not re.search(r'[A-Z]', request.new_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mật khẩu phải có ít nhất 1 chữ hoa"
            )
        
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', request.new_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mật khẩu phải có ít nhất 1 ký tự đặc biệt"
            )
        
        # Validate password không chứa username, tên, ngày sinh
        pw_lower = request.new_password.lower()
        pw_no_accent = remove_accents(request.new_password).lower()
        
        # Get user info
        name_key = remove_accents(user.get("name", "")).replace(" ", "").lower()
        username_key = remove_accents(user.get("username", "")).lower()
        dob_str = user.get("dateOfBirth", "").replace("-", "").replace("/", "")
        
        # Check username (không được trùng hoàn toàn hoặc chứa username)
        if username_key and len(username_key) >= 3:
            if pw_lower == username_key or username_key in pw_no_accent:
                raise HTTPException(status_code=400, detail="Mật khẩu không được trùng hoặc chứa tên đăng nhập")
        
        # Check tên (không được trùng hoàn toàn hoặc chứa tên đầy đủ)
        if name_key and len(name_key) >= 3:
            if pw_no_accent == name_key or name_key in pw_no_accent:
                raise HTTPException(status_code=400, detail="Mật khẩu không được trùng hoặc chứa tên cá nhân")
        
        # Check ngày sinh (không được chứa ngày sinh dạng YYYYMMDD, DDMMYYYY)
        if dob_str and len(dob_str) >= 6:
            # Check YYYYMMDD format
            if dob_str in pw_lower:
                raise HTTPException(status_code=400, detail="Mật khẩu không được chứa ngày sinh")
            # Check DDMMYYYY format
            if len(dob_str) == 8:
                reversed_dob = dob_str[4:8] + dob_str[2:4] + dob_str[0:2]  # YYYY-MM-DD -> DDMMYYYY
                if reversed_dob in pw_lower:
                    raise HTTPException(status_code=400, detail="Mật khẩu không được chứa ngày sinh")
        
        # Hash password mới
        hashed_password = bcrypt.hashpw(
            request.new_password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')
        
        # Cập nhật password và xóa reset token
        await users_collection.update_one(
            {"_id": user["_id"]},
            {
                "$set": {"password": hashed_password},
                "$unset": {
                    "resetPasswordToken": "",
                    "resetPasswordExpires": ""
                }
            }
        )
        
        return ResetPasswordResponse(
            success=True,
            message="Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

# ==================== CATEGORY API ENDPOINTS ====================

# Cache categories data trong 5 phút
categories_cache = {"data": None, "timestamp": None}
CATEGORIES_CACHE_DURATION = 300  # seconds

@app.get("/api/categories", response_model=CategoryListResponse)
async def get_categories(parent_id: Optional[str] = Query(None), status: Optional[str] = Query(None)):
    """
    Lấy danh sách danh mục - VERSION TỐI ƯU
    - Không có parent_id: Lấy tất cả
    - parent_id=null hoặc không gửi: Lấy danh mục chính (parent_id = None)
    - parent_id=<id>: Lấy danh mục con
    - status: Lọc theo trạng thái (active/inactive)
    """
    try:
        # Tạo cache key từ params
        cache_key = f"{parent_id}_{status}"
        
        # Check cache
        now = datetime.now()
        if categories_cache.get("data") and categories_cache.get("timestamp"):
            cached_data = categories_cache["data"].get(cache_key)
            if cached_data:
                cache_age = (now - categories_cache["timestamp"]).total_seconds()
                if cache_age < CATEGORIES_CACHE_DURATION:
                    print(f"✅ Returning cached categories data (age: {cache_age:.1f}s)")
                    return cached_data
        
        print(f"🔄 Generating fresh categories data...")
        
        query = {}
        # Xử lý parent_id: nếu là "null" string hoặc None, lấy danh mục chính
        if parent_id is not None:
            if parent_id == "null" or parent_id == "":
                query["parent_id"] = None
            else:
                query["parent_id"] = parent_id
        
        if status:
            query["status"] = status
        
        print(f"🔍 Query categories with: {query}")
        
        # ========== AGGREGATION PIPELINE - TỐI ƯU ==========
        
        # Pipeline để lấy categories với subcategories count và product count
        pipeline = [
            {"$match": query},
            {"$sort": {"created_at": 1, "_id": 1}},
            # Lookup subcategories count
            {
                "$lookup": {
                    "from": "categories",
                    "let": {"cat_id": {"$toString": "$_id"}},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq": ["$parent_id", "$$cat_id"]}}}
                    ],
                    "as": "subcategories"
                }
            },
            # Lookup products count (chỉ active)
            {
                "$lookup": {
                    "from": "products",
                    "localField": "slug",
                    "foreignField": "category.slug",
                    "pipeline": [
                        {"$match": {"status": "active"}}
                    ],
                    "as": "direct_products"
                }
            },
            # Project final result
            {
                "$project": {
                    "name": 1,
                    "slug": 1,
                    "description": 1,
                    "parent_id": 1,
                    "status": 1,
                    "created_at": 1,
                    "updated_at": 1,
                    "subcategories_count": {"$size": "$subcategories"},
                    "subcategory_slugs": "$subcategories.slug",
                    "direct_product_count": {"$size": "$direct_products"}
                }
            }
        ]
        
        categories = await categories_collection.aggregate(pipeline).to_list(length=None)
        
        # Tính product count cho từng category (bao gồm subcategories)
        # Lấy tất cả subcategory slugs một lần
        all_subcategory_slugs = set()
        for cat in categories:
            all_subcategory_slugs.update(cat.get("subcategory_slugs", []))
        
        # Query products một lần cho tất cả subcategories
        subcategory_products = {}
        if all_subcategory_slugs:
            pipeline_products = [
                {
                    "$match": {
                        "category.slug": {"$in": list(all_subcategory_slugs)},
                        "status": "active"
                    }
                },
                {
                    "$group": {
                        "_id": "$category.slug",
                        "count": {"$sum": 1}
                    }
                }
            ]
            product_counts = await products_collection.aggregate(pipeline_products).to_list(length=None)
            subcategory_products = {item["_id"]: item["count"] for item in product_counts}
        
        # Build result
        result = []
        for cat in categories:
            cat_id = str(cat["_id"])
            cat_slug = cat["slug"]
            
            # Tính tổng product count (direct + subcategories)
            direct_count = cat.get("direct_product_count", 0)
            sub_count = sum(subcategory_products.get(slug, 0) for slug in cat.get("subcategory_slugs", []))
            total_product_count = direct_count + sub_count
            
            result.append(CategoryResponse(
                id=cat_id,
                name=cat["name"],
                slug=cat_slug,
                description=cat.get("description", ""),
                parent_id=cat.get("parent_id"),
                status=cat.get("status", "active"),
                product_count=total_product_count,
                subcategories_count=cat.get("subcategories_count", 0),
                created_at=cat.get("created_at"),
                updated_at=cat.get("updated_at")
            ))
        
        response = CategoryListResponse(
            success=True,
            categories=result,
            total=len(result)
        )
        
        # Cache response
        if categories_cache.get("data") is None:
            categories_cache["data"] = {}
        categories_cache["data"][cache_key] = response
        categories_cache["timestamp"] = now
        
        print(f"✅ Categories data generated and cached")
        return response
        
    except Exception as e:
        print(f"❌ Error in get_categories: {str(e)}")
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
        
        # Clear cache
        categories_cache["data"] = None
        categories_cache["timestamp"] = None
        print("🗑️  Categories cache cleared")
        
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
        
        # Clear cache
        categories_cache["data"] = None
        categories_cache["timestamp"] = None
        print("🗑️  Categories cache cleared")
        
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
        
        # Clear cache
        categories_cache["data"] = None
        categories_cache["timestamp"] = None
        print("🗑️  Categories cache cleared")
        
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
    sizes: Optional[str] = Query(None),  # Comma-separated sizes
    colors: Optional[str] = Query(None),  # Comma-separated color slugs
    brands: Optional[str] = Query(None),  # Comma-separated brand slugs
    price_min: Optional[int] = Query(None),
    price_max: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100),
    sort: Optional[str] = Query('newest')
):
    """
    Lấy danh sách sản phẩm với filter hỗ trợ - VERSION TỐI ƯU VỚI CACHE
    - category_slug: Lọc theo category slug
    - status: Lọc theo trạng thái (active/inactive)
    - slug: Tìm sản phẩm theo slug
    - sizes: Filter theo sizes (S,M,L,XL)
    - colors: Filter theo màu sắc (slugs)
    - brands: Filter theo brands (slugs)
    - price_min, price_max: Filter theo giá
    - page: Trang hiện tại
    - limit: Số lượng mỗi trang
    - sort: Sắp xếp (newest, price_asc, price_desc)
    """
    try:
        # Cache key based on all parameters
        cache_key = f"{category_slug}_{status}_{slug}_{sizes}_{colors}_{brands}_{price_min}_{price_max}_{page}_{limit}_{sort}"
        now = datetime.now()
        
        # Check cache (2 minutes for products - frequently updated)
        if admin_products_cache.get("data"):
            cached = admin_products_cache["data"].get(cache_key)
            if cached:
                cache_age = (now - admin_products_cache["timestamp"]).total_seconds()
                if cache_age < ADMIN_CACHE_DURATION:
                    print(f"✅ Returning cached products (age: {cache_age:.1f}s)")
                    return cached
        
        print(f"🔄 Generating fresh products data...")
        
        query = {}
        
        if slug:
            # Try exact match first, then case-insensitive regex match
            print(f"🔍 Searching for product with slug: '{slug}'")
            
            # First try exact match
            query["slug"] = slug
            count = await products_collection.count_documents(query)
            
            if count == 0:
                # Try case-insensitive match
                print(f"⚠️ No exact match, trying case-insensitive search...")
                query["slug"] = {"$regex": f"^{slug}$", "$options": "i"}
                count = await products_collection.count_documents(query)
                
                if count == 0:
                    # Try without special characters normalization
                    print(f"⚠️ No case-insensitive match, trying partial match...")
                    query["slug"] = {"$regex": slug, "$options": "i"}
                    count = await products_collection.count_documents(query)
                    print(f"📊 Found {count} products with partial match")
        elif category_slug:
            query["category.slug"] = category_slug
        
        if status:
            query["status"] = status
        
        # Filter by sizes
        if sizes:
            size_list = [s.strip() for s in sizes.split(',')]
            query["variants.sizes.name"] = {"$in": size_list}
        
        # Filter by colors
        if colors:
            color_list = [c.strip() for c in colors.split(',')]
            query["variants.colors.slug"] = {"$in": color_list}
        
        # Filter by brands
        if brands:
            brand_list = [b.strip() for b in brands.split(',')]
            query["brand.slug"] = {"$in": brand_list}
        
        # Filter by price range
        if price_min is not None or price_max is not None:
            price_query = {}
            if price_min is not None:
                price_query["$gte"] = price_min
            if price_max is not None:
                price_query["$lte"] = price_max
            query["pricing.sale"] = price_query
        
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
        elif sort == 'popular' or sort == 'most_wishlisted':
            sort_dict = {"wishlist_count": -1, "created_at": -1}  # Sort by wishlist_count desc, then by created_at
        elif sort == 'best_sellers' or sort == 'most_sold':
            sort_dict = {"sold_count": -1, "created_at": -1}  # Sort by sold_count desc (most sold first)
        else:
            sort_dict = {"created_at": -1}
        
        # Đếm tổng số (tối ưu với hint index)
        total = await products_collection.count_documents(query)
        total_pages = (total + limit - 1) // limit
        
        # Projection - chỉ lấy các field cần thiết để giảm data transfer
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
        
        # Lấy sản phẩm với projection
        cursor = products_collection.find(query, projection).sort(list(sort_dict.items())).skip(skip).limit(limit)
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
        
        response = ProductListResponse(
            success=True,
            products=result,
            total=total,
            page=page,
            limit=limit,
            totalPages=total_pages
        )
        
        # Cache response
        if admin_products_cache.get("data") is None:
            admin_products_cache["data"] = {}
        admin_products_cache["data"][cache_key] = response
        admin_products_cache["timestamp"] = now
        
        print(f"✅ Products data cached")
        return response
        
    except Exception as e:
        print(f"❌ Error in get_products: {str(e)}")
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
        # Debug: Log images in color variants
        if 'variants' in new_product and 'colors' in new_product['variants']:
            for i, color in enumerate(new_product['variants']['colors']):
                images_count = len(color.get('images', []))
                print(f"  📸 Color {i} ({color.get('name', 'N/A')}): {images_count} images")
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
            "shipping_address": order_data.shipping_address.dict() if hasattr(order_data.shipping_address, 'dict') else order_data.shipping_address,
            "payment_method": order_data.payment_method,
            "status": order_data.status,
            "note": order_data.note or "",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        result = await orders_collection.insert_one(new_order)
        
        new_order["_id"] = result.inserted_id
        
        # Cập nhật sold_count cho các sản phẩm trong đơn hàng
        for item in order_data.items:
            product_id = item.product_id
            quantity = item.quantity
            try:
                await products_collection.update_one(
                    {"_id": ObjectId(product_id)},
                    {"$inc": {"sold_count": quantity}}
                )
            except Exception as e:
                print(f"Error updating sold_count for product {product_id}: {e}")
        
        # Convert shipping_address from dict to ShippingAddress object for response
        from app.schemas import ShippingAddress
        shipping_addr = new_order["shipping_address"]
        if isinstance(shipping_addr, dict):
            shipping_addr_obj = ShippingAddress(**shipping_addr)
        else:
            shipping_addr_obj = shipping_addr
        
        return OrderResponse(
            id=str(result.inserted_id),
            user_id=new_order["user_id"],
            order_number=new_order["order_number"],
            items=new_order["items"],
            total_amount=new_order["total_amount"],
            shipping_address=shipping_addr_obj,
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


# ==================== VIETQR + CASSO PAYMENT ENDPOINTS ====================
@app.post("/api/payments/vietqr/initiate", response_model=schemas.VietQRInitiateResponse)
async def vietqr_initiate(payload: schemas.VietQRInitiateRequest):
    """Tạo QR code VietQR cho thanh toán."""
    # Kiểm tra order tồn tại
    order = await orders_collection.find_one({"_id": ObjectId(payload.order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy order")

    # Tạo QR code
    result = await payment_integration.create_vietqr_payment(
        order_id=payload.order_id,
        amount=payload.amount,
        description=payload.description or f"Thanh toan don {payload.order_id[-8:]}"
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("message"))

    # Lưu thông tin payment
    payment_record = {
        "provider": "vietqr",
        "status": "pending",
        "amount": payload.amount,
        "payment_info": result.get("payment_info"),
        "qr_url": result.get("vietqr_url"),
        "created_at": datetime.now().isoformat(),
    }

    await orders_collection.update_one(
        {"_id": ObjectId(payload.order_id)},
        {"$set": {"payment": payment_record}}
    )

    return schemas.VietQRInitiateResponse(
        success=True,
        order_id=payload.order_id,
        qr_code=result.get("qr_code"),
        qr_data_url=result.get("qr_data_url"),
        vietqr_url=result.get("vietqr_url"),
        payment_info=result.get("payment_info"),
        message="QR code đã được tạo"
    )


@app.post("/api/payments/casso/webhook")
async def casso_webhook(request: Request):
    """Nhận webhook từ Casso khi có giao dịch mới."""
    print("\n" + "="*60)
    print("🔔 WEBHOOK RECEIVED FROM CASSO")
    print("="*60)
    
    # Đọc raw body
    body = await request.body()
    body_str = body.decode()
    
    print(f"📦 Raw body: {body_str[:200]}...")
    print(f"🔑 Headers: {dict(request.headers)}")
    
    # Parse JSON
    try:
        import json
        webhook_data = json.loads(body_str)
        print(f"✅ JSON parsed successfully")
        print(f"📊 Webhook data: {webhook_data}")
    except Exception as e:
        print(f"❌ JSON parse error: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    # Xác thực webhook signature
    signature = request.headers.get("X-Signature", "")
    print(f"🔐 Signature check: {'Present' if signature else 'Missing'}")
    
    if not payment_integration.verify_casso_webhook(body_str, signature):
        print(f"❌ Invalid signature!")
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    print(f"✅ Signature valid")

    # Casso gửi data trong format: {"error": 0, "data": [transaction1, transaction2, ...]}
    transactions = webhook_data.get("data", [])
    if not transactions:
        print(f"⚠️  No transactions in webhook")
        return {"success": False, "message": "Không có giao dịch nào trong webhook"}
    
    print(f"💰 Processing {len(transactions)} transaction(s)")
    
    # Xử lý từng transaction (thường chỉ có 1)
    results = []
    for idx, transaction in enumerate(transactions):
        print(f"\n--- Transaction #{idx + 1} ---")
        description = transaction.get("description", "")
        amount = transaction.get("amount", 0)
        tid = transaction.get("tid", "")
        when = transaction.get("when", "")
        casso_id = transaction.get("id", 0)
        
        print(f"💵 Amount: {amount:,}đ")
        print(f"📝 Description: {description}")
        print(f"🔖 Transaction ID: {tid}")
        
        # Tìm order_id trong description
        order_id = None
        import re
        match = re.search(r'[a-f0-9]{24}', description.lower())
        if match:
            order_id = match.group(0)
            print(f"🎯 Found Order ID: {order_id}")
        
        if not order_id:
            msg = f"Không tìm thấy order_id trong: {description}"
            print(f"❌ {msg}")
            results.append({"success": False, "message": msg})
            continue

        # Kiểm tra order tồn tại
        order = await orders_collection.find_one({"_id": ObjectId(order_id)})
        if not order:
            msg = f"Order {order_id} không tồn tại"
            print(f"❌ {msg}")
            results.append({"success": False, "message": msg})
            continue

        # Kiểm tra số tiền khớp
        expected_amount = order.get("total_amount", 0)
        print(f"💵 Expected: {expected_amount:,}đ | Received: {amount:,}đ")
        
        if abs(amount - expected_amount) > 1:  # Cho phép sai lệch 1đ
            msg = f"Số tiền không khớp: nhận {amount}, mong đợi {expected_amount}"
            print(f"❌ {msg}")
            results.append({
                "success": False, 
                "message": msg
            })
            continue

        # Cập nhật payment status
        print(f"🔄 Updating order {order_id}...")
        await orders_collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {
                "payment.status": "completed",
                "payment.transaction_id": tid,
                "payment.casso_id": casso_id,
                "payment.completed_at": when,
                "payment.raw_webhook": transaction,
                "status": "processing",
                "updated_at": datetime.now().isoformat()
            }}
        )
        
        msg = f"Đã cập nhật thanh toán cho order {order_id}"
        print(f"✅ {msg}")
        results.append({
            "success": True, 
            "message": msg,
            "order_id": order_id
        })

    print("\n" + "="*60)
    print(f"✅ WEBHOOK PROCESSED: {len(results)} result(s)")
    print("="*60 + "\n")
    
    return {"success": True, "processed": len(results), "results": results}


@app.get("/api/payments/status/{order_id}", response_model=schemas.PaymentStatusResponse)
async def get_payment_status(order_id: str = Path(...)):
    """Lấy trạng thái thanh toán của order."""
    order = await orders_collection.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    payment = order.get("payment", {})
    
    return schemas.PaymentStatusResponse(
        success=True,
        order_id=order_id,
        payment=payment,
        paid=payment.get("status") == "completed"
    )


@app.get("/api/orders/user/{user_id}", response_model=OrderListResponse)
async def get_user_orders(user_id: str = Path(...)):
    """Lấy danh sách đơn hàng của user"""
    try:
        cursor = orders_collection.find({"user_id": user_id}).sort("created_at", -1)
        orders = await cursor.to_list(length=None)
        
        from app.schemas import ShippingAddress
        result_orders = []
        for order in orders:
            shipping_addr = order.get("shipping_address", {})
            if isinstance(shipping_addr, dict) and shipping_addr:
                shipping_addr_obj = ShippingAddress(**shipping_addr)
            elif isinstance(shipping_addr, str):
                # Handle legacy string format
                shipping_addr_obj = ShippingAddress(
                    full_name="",
                    phone="",
                    email="",
                    street=shipping_addr,
                    ward="",
                    city=""
                )
            else:
                shipping_addr_obj = ShippingAddress(
                    full_name="",
                    phone="",
                    email="",
                    street="",
                    ward="",
                    city=""
                )
            
            result_orders.append(OrderResponse(
                id=str(order["_id"]),
                user_id=order.get("user_id", ""),
                order_number=order.get("order_number", ""),
                items=order.get("items", []),
                total_amount=order.get("total_amount", 0),
                shipping_address=shipping_addr_obj,
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

@app.get("/api/orders/{order_id}", response_model=OrderResponse)
async def get_order_by_id(order_id: str = Path(...)):
    """Lấy chi tiết đơn hàng theo ID"""
    try:
        from bson import ObjectId
        order = await orders_collection.find_one({"_id": ObjectId(order_id)})
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy đơn hàng"
            )
        
        from app.schemas import ShippingAddress
        shipping_addr = order.get("shipping_address", {})
        if isinstance(shipping_addr, dict) and shipping_addr:
            shipping_addr_obj = ShippingAddress(**shipping_addr)
        elif isinstance(shipping_addr, str):
            shipping_addr_obj = ShippingAddress(
                full_name="",
                phone="",
                email="",
                street=shipping_addr,
                ward="",
                city=""
            )
        else:
            shipping_addr_obj = ShippingAddress(
                full_name="",
                phone="",
                email="",
                street="",
                ward="",
                city=""
            )
        
        return OrderResponse(
            id=str(order["_id"]),
            user_id=order.get("user_id", ""),
            order_number=order.get("order_number", ""),
            items=order.get("items", []),
            total_amount=order.get("total_amount", 0),
            shipping_address=shipping_addr_obj,
            payment_method=order.get("payment_method", "COD"),
            status=order.get("status", "pending"),
            note=order.get("note", ""),
            created_at=order.get("created_at", datetime.now().isoformat()),
            updated_at=order.get("updated_at")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

# ==================== ADMIN ORDERS API ====================
@app.get("/api/admin/orders/count/pending")
async def get_pending_orders_count():
    """Đếm số đơn hàng đang chờ xử lý (pending hoặc processing)"""
    try:
        count = await orders_collection.count_documents({
            "status": {"$in": ["pending", "processing"]}
        })
        return {"count": count}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

# Cache cho admin queries
admin_orders_cache = {"data": None, "timestamp": None}
admin_customers_cache = {"data": None, "timestamp": None}
admin_returns_cache = {"data": None, "timestamp": None}
admin_products_cache = {"data": None, "timestamp": None}
ADMIN_CACHE_DURATION = 120  # 2 phút

@app.get("/api/admin/orders", response_model=OrderListResponse)
async def get_all_orders(
    status: Optional[str] = Query(None, description="Lọc theo trạng thái"),
    page: int = Query(1, ge=1, description="Số trang"),
    limit: int = Query(20, ge=1, le=100, description="Số lượng mỗi trang"),
    search: Optional[str] = Query(None, description="Tìm kiếm theo mã đơn hàng hoặc tên khách hàng")
):
    """Lấy tất cả đơn hàng (Admin only) - TỐI ƯU"""
    try:
        # Cache key
        cache_key = f"{status}_{page}_{limit}_{search}"
        now = datetime.now()
        
        # Check cache
        if admin_orders_cache.get("data"):
            cached = admin_orders_cache["data"].get(cache_key)
            if cached:
                cache_age = (now - admin_orders_cache["timestamp"]).total_seconds()
                if cache_age < ADMIN_CACHE_DURATION:
                    print(f"✅ Returning cached admin orders (age: {cache_age:.1f}s)")
                    return cached
        
        print(f"🔄 Generating fresh admin orders data...")
        
        query = {}
        
        # Filter by status
        if status and status != 'all':
            query["status"] = status
        
        # Search by order number or customer name
        if search:
            from bson import ObjectId
            from bson.errors import InvalidId
            # Try to search by order ID first
            try:
                query["_id"] = ObjectId(search)
            except (InvalidId, ValueError):
                # If not a valid ObjectId, search by order number, customer name, or phone
                query["$or"] = [
                    {"order_number": {"$regex": search, "$options": "i"}},
                    {"shipping_address.full_name": {"$regex": search, "$options": "i"}},
                    {"shipping_address.phone": {"$regex": search, "$options": "i"}}
                ]
        
        # Calculate skip
        skip = (page - 1) * limit
        
        # Get total count and orders in parallel
        total_task = orders_collection.count_documents(query)
        orders_task = orders_collection.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
        
        total, orders = await asyncio.gather(total_task, orders_task)
        
        from app.schemas import ShippingAddress
        result_orders = []
        for order in orders:
            shipping_addr = order.get("shipping_address", {})
            if isinstance(shipping_addr, dict) and shipping_addr:
                shipping_addr_obj = ShippingAddress(**shipping_addr)
            elif isinstance(shipping_addr, str):
                shipping_addr_obj = ShippingAddress(
                    full_name="",
                    phone="",
                    email="",
                    street=shipping_addr,
                    ward="",
                    city=""
                )
            else:
                shipping_addr_obj = ShippingAddress(
                    full_name="",
                    phone="",
                    email="",
                    street="",
                    ward="",
                    city=""
                )
            
            result_orders.append(OrderResponse(
                id=str(order["_id"]),
                user_id=order.get("user_id", ""),
                order_number=order.get("order_number", ""),
                items=order.get("items", []),
                total_amount=order.get("total_amount", 0),
                shipping_address=shipping_addr_obj,
                payment_method=order.get("payment_method", "COD"),
                status=order.get("status", "pending"),
                note=order.get("note", ""),
                created_at=order.get("created_at", datetime.now().isoformat()),
                updated_at=order.get("updated_at")
            ))
        
        response = OrderListResponse(
            success=True,
            orders=result_orders,
            total=total
        )
        
        # Cache response
        if admin_orders_cache.get("data") is None:
            admin_orders_cache["data"] = {}
        admin_orders_cache["data"][cache_key] = response
        admin_orders_cache["timestamp"] = now
        
        print(f"✅ Admin orders data cached")
        return response
        
    except Exception as e:
        print(f"❌ Error in get_all_orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.put("/api/admin/orders/{order_id}/status", response_model=OrderUpdateResponse)
async def update_order_status(
    order_id: str = Path(...),
    status_update: OrderStatusUpdate = Body(...)
):
    """Cập nhật trạng thái đơn hàng (Admin only)"""
    try:
        from bson import ObjectId
        from app.schemas import OrderStatusUpdate, ShippingAddress
        
        # Validate status
        valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled", "completed"]
        if status_update.status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Trạng thái không hợp lệ. Các trạng thái hợp lệ: {', '.join(valid_statuses)}"
            )
        
        # Find order
        order = await orders_collection.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy đơn hàng"
            )
        
        # Update status
        update_data = {
            "status": status_update.status,
            "updated_at": datetime.now().isoformat()
        }
        
        await orders_collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": update_data}
        )
        
        # Get updated order
        updated_order = await orders_collection.find_one({"_id": ObjectId(order_id)})
        
        # Prepare response
        shipping_addr = updated_order.get("shipping_address", {})
        if isinstance(shipping_addr, dict) and shipping_addr:
            shipping_addr_obj = ShippingAddress(**shipping_addr)
        elif isinstance(shipping_addr, str):
            shipping_addr_obj = ShippingAddress(
                full_name="",
                phone="",
                email="",
                street=shipping_addr,
                ward="",
                city=""
            )
        else:
            shipping_addr_obj = ShippingAddress(
                full_name="",
                phone="",
                email="",
                street="",
                ward="",
                city=""
            )
        
        order_response = OrderResponse(
            id=str(updated_order["_id"]),
            user_id=updated_order.get("user_id", ""),
            order_number=updated_order.get("order_number", ""),
            items=updated_order.get("items", []),
            total_amount=updated_order.get("total_amount", 0),
            shipping_address=shipping_addr_obj,
            payment_method=updated_order.get("payment_method", "COD"),
            status=updated_order.get("status", "pending"),
            note=updated_order.get("note", ""),
            created_at=updated_order.get("created_at", datetime.now().isoformat()),
            updated_at=updated_order.get("updated_at")
        )
        
        return OrderUpdateResponse(
            success=True,
            message=f"Đã cập nhật trạng thái đơn hàng thành {status_update.status}",
            order=order_response
        )
    except HTTPException:
        raise
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
        
        # Lấy ảnh theo màu đã chọn (nếu có)
        product_image = product.get("image", "")
        if color and product.get("variants", {}).get("colors"):
            colors = product.get("variants", {}).get("colors", [])
            for color_obj in colors:
                if (color_obj.get("slug") == color or color_obj.get("name") == color):
                    if color_obj.get("images") and len(color_obj.get("images")) > 0:
                        product_image = color_obj["images"][0]
                        break
        
        # Tìm cart của user
        cart = await cart_collection.find_one({"user_id": user_id})
        
        cart_item = {
            "product_id": product_id,
            "product_name": product.get("name", ""),
            "product_image": product_image,  # Ảnh theo màu đã chọn
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

@app.delete("/api/cart/{user_id}/item")
async def remove_cart_item_by_variant(
    user_id: str = Path(...), 
    product_id: str = Query(...),
    color: Optional[str] = Query(None),
    size: Optional[str] = Query(None)
):
    """Xóa item khỏi giỏ hàng theo product_id và variant"""
    try:
        cart = await cart_collection.find_one({"user_id": user_id})
        if not cart:
            raise HTTPException(status_code=404, detail="Không tìm thấy giỏ hàng")
        
        items = cart.get("items", [])
        
        # Tìm và xóa item khớp với product_id và variant
        found = False
        for i, item in enumerate(items):
            if (item.get("product_id") == product_id and 
                item.get("variant_color") == color and 
                item.get("variant_size") == size):
                items.pop(i)
                found = True
                break
        
        if not found:
            raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm trong giỏ hàng")
        
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

@app.delete("/api/cart/{user_id}/{item_index}")
async def remove_cart_item(user_id: str = Path(...), item_index: int = Path(...)):
    """Xóa item khỏi giỏ hàng (legacy endpoint)"""
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


@app.delete("/api/cart/{user_id}/clear")
async def clear_cart(user_id: str = Path(..., description="User ID")):
    """Xóa toàn bộ giỏ hàng của user"""
    try:
        # Validate user_id
        if not user_id or user_id == "null" or user_id == "undefined":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User ID không hợp lệ"
            )
        
        cart = await cart_collection.find_one({"user_id": user_id})
        if not cart:
            # Không có giỏ hàng cũng coi là success
            return {"success": True, "message": "Giỏ hàng đã trống"}
        
        # Xóa toàn bộ items
        await cart_collection.update_one(
            {"user_id": user_id},
            {"$set": {"items": [], "updated_at": datetime.now().isoformat()}}
        )
        
        return {"success": True, "message": "Đã xóa toàn bộ giỏ hàng"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

# ==================== ADDRESS API ENDPOINTS ====================

@app.get("/api/addresses/user/{user_id}", response_model=AddressListResponse)
async def get_user_addresses(user_id: str = Path(...)):
    """Lấy danh sách địa chỉ của user"""
    try:
        # Kiểm tra user tồn tại
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
        # Lấy tất cả addresses của user
        cursor = addresses_collection.find({"user_id": user_id}).sort("created_at", -1)
        addresses = await cursor.to_list(length=None)
        
        result_addresses = []
        for addr in addresses:
            result_addresses.append(AddressResponse(
            id=str(addr["_id"]),
            user_id=addr.get("user_id", ""),
            full_name=addr.get("full_name", ""),
            phone=addr.get("phone", ""),
            email=addr.get("email"),
            street=addr.get("street", ""),
            ward=addr.get("ward", ""),
            city=addr.get("city", ""),
            is_default=addr.get("is_default", False),
            label=addr.get("label"),
            created_at=addr.get("created_at", datetime.now().isoformat()),
            updated_at=addr.get("updated_at")
        ))
        
        return AddressListResponse(
            success=True,
            addresses=result_addresses,
            total=len(result_addresses)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.post("/api/addresses", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
async def create_address(address_data: AddressCreate):
    """Tạo địa chỉ mới"""
    try:
        # Kiểm tra user tồn tại
        user = await users_collection.find_one({"_id": ObjectId(address_data.user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
        # Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
        if address_data.is_default:
            await addresses_collection.update_many(
                {"user_id": address_data.user_id, "is_default": True},
                {"$set": {"is_default": False, "updated_at": datetime.now().isoformat()}}
            )
        
        # Tạo địa chỉ mới
        new_address = {
            "user_id": address_data.user_id,
            "full_name": address_data.full_name,
            "phone": address_data.phone,
            "email": address_data.email,
            "street": address_data.street,
            "ward": address_data.ward,
            "city": address_data.city,
            "is_default": address_data.is_default,
            "label": address_data.label,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        result = await addresses_collection.insert_one(new_address)
        
        return AddressResponse(
            id=str(result.inserted_id),
            user_id=new_address["user_id"],
            full_name=new_address["full_name"],
            phone=new_address["phone"],
            email=new_address["email"],
            street=new_address["street"],
            ward=new_address["ward"],
            city=new_address["city"],
            is_default=new_address["is_default"],
            label=new_address["label"],
            created_at=new_address["created_at"],
            updated_at=new_address["updated_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.put("/api/addresses/{address_id}", response_model=AddressResponse)
async def update_address(address_id: str = Path(...), address_data: AddressUpdate = None):
    """Cập nhật địa chỉ"""
    try:
        if not address_data:
            raise HTTPException(status_code=400, detail="Không có dữ liệu để cập nhật")
        
        # Kiểm tra địa chỉ tồn tại
        address = await addresses_collection.find_one({"_id": ObjectId(address_id)})
        if not address:
            raise HTTPException(status_code=404, detail="Không tìm thấy địa chỉ")
        
        user_id = address.get("user_id")
        
        # Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
        if address_data.is_default is True:
            await addresses_collection.update_many(
                {"user_id": user_id, "is_default": True, "_id": {"$ne": ObjectId(address_id)}},
                {"$set": {"is_default": False, "updated_at": datetime.now().isoformat()}}
            )
        
        # Cập nhật địa chỉ
        update_data = {}
        if address_data.full_name is not None:
            update_data["full_name"] = address_data.full_name
        if address_data.phone is not None:
            update_data["phone"] = address_data.phone
        if address_data.email is not None:
            update_data["email"] = address_data.email
        if address_data.street is not None:
            update_data["street"] = address_data.street
        if address_data.ward is not None:
            update_data["ward"] = address_data.ward
        if address_data.city is not None:
            update_data["city"] = address_data.city
        if address_data.is_default is not None:
            update_data["is_default"] = address_data.is_default
        if address_data.label is not None:
            update_data["label"] = address_data.label
        
        if not update_data:
            raise HTTPException(status_code=400, detail="Không có dữ liệu để cập nhật")
        
        update_data["updated_at"] = datetime.now().isoformat()
        
        await addresses_collection.update_one(
            {"_id": ObjectId(address_id)},
            {"$set": update_data}
        )
        
        # Lấy địa chỉ đã cập nhật
        updated_address = await addresses_collection.find_one({"_id": ObjectId(address_id)})
        
        return AddressResponse(
            id=str(updated_address["_id"]),
            user_id=updated_address.get("user_id", ""),
            full_name=updated_address.get("full_name", ""),
            phone=updated_address.get("phone", ""),
            email=updated_address.get("email"),
            street=updated_address.get("street", ""),
            ward=updated_address.get("ward", ""),
            city=updated_address.get("city", ""),
            is_default=updated_address.get("is_default", False),
            label=updated_address.get("label"),
            created_at=updated_address.get("created_at", datetime.now().isoformat()),
            updated_at=updated_address.get("updated_at")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.delete("/api/addresses/{address_id}")
async def delete_address(address_id: str = Path(...)):
    """Xóa địa chỉ"""
    try:
        # Kiểm tra địa chỉ tồn tại
        address = await addresses_collection.find_one({"_id": ObjectId(address_id)})
        if not address:
            raise HTTPException(status_code=404, detail="Không tìm thấy địa chỉ")
        
        # Xóa địa chỉ
        await addresses_collection.delete_one({"_id": ObjectId(address_id)})
        
        return {"success": True, "message": "Đã xóa địa chỉ"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

# ==================== ADMIN CUSTOMER MANAGEMENT ====================

@app.get("/api/admin/customers", response_model=CustomerListResponse)
async def get_all_customers(
    page: int = Query(1, ge=1, description="Số trang"),
    limit: int = Query(50, ge=1, le=100, description="Số lượng mỗi trang"),
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên, email, username"),
    role: Optional[str] = Query(None, description="Lọc theo role (user/admin)"),
    is_banned: Optional[bool] = Query(None, description="Lọc theo trạng thái ban"),
):
    """Lấy danh sách tất cả khách hàng - VERSION TỐI ƯU"""
    try:
        # Cache key
        cache_key = f"{page}_{limit}_{search}_{role}_{is_banned}"
        now = datetime.now()
        
        # Check cache
        if admin_customers_cache.get("data"):
            cached = admin_customers_cache["data"].get(cache_key)
            if cached:
                cache_age = (now - admin_customers_cache["timestamp"]).total_seconds()
                if cache_age < ADMIN_CACHE_DURATION:
                    print(f"✅ Returning cached admin customers (age: {cache_age:.1f}s)")
                    return cached
        
        print(f"🔄 Generating fresh admin customers data...")
        
        # Xây dựng query filter
        query = {}
        
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"username": {"$regex": search, "$options": "i"}}
            ]
        
        if role:
            query["role"] = role
        
        if is_banned is not None:
            query["is_banned"] = is_banned
        
        # Tính toán skip
        skip = (page - 1) * limit
        
        # ========== AGGREGATION PIPELINE - TỐI ƯU ==========
        
        # Pipeline để lấy users với order statistics
        pipeline = [
            {"$match": query},
            {"$sort": {"createdAt": -1}},
            {"$skip": skip},
            {"$limit": limit},
            # Convert _id to string for lookup
            {
                "$addFields": {
                    "user_id_str": {"$toString": "$_id"}
                }
            },
            # Lookup orders
            {
                "$lookup": {
                    "from": "orders",
                    "localField": "user_id_str",
                    "foreignField": "user_id",
                    "as": "orders"
                }
            },
            # Calculate statistics
            {
                "$project": {
                    "_id": 1,
                    "username": 1,
                    "email": 1,
                    "name": 1,
                    "dateOfBirth": 1,
                    "createdAt": 1,
                    "role": 1,
                    "emailVerified": 1,
                    "avatar": 1,
                    "phone": 1,
                    "address": 1,
                    "memberLevel": 1,
                    "is_banned": 1,
                    "total_orders": {"$size": "$orders"},
                    "total_spent": {"$sum": "$orders.total_amount"}
                }
            }
        ]
        
        # Run count and aggregation in parallel
        total_task = users_collection.count_documents(query)
        users_task = users_collection.aggregate(pipeline).to_list(length=limit)
        
        total, users = await asyncio.gather(total_task, users_task)
        
        # Build result
        customers = []
        for user in users:
            customers.append(CustomerResponse(
                id=str(user["_id"]),
                username=user["username"],
                email=user["email"],
                name=user["name"],
                dateOfBirth=user["dateOfBirth"],
                createdAt=user["createdAt"],
                role=user.get("role", "user"),
                emailVerified=user.get("emailVerified", False),
                avatar=user.get("avatar", ""),
                phone=user.get("phone", ""),
                address=user.get("address", ""),
                memberLevel=user.get("memberLevel", "bronze"),
                is_banned=user.get("is_banned", False),
                total_orders=user.get("total_orders", 0),
                total_spent=user.get("total_spent", 0)
            ))
        
        response = CustomerListResponse(
            success=True,
            customers=customers,
            total=total,
            page=page,
            limit=limit
        )
        
        # Cache response
        if admin_customers_cache.get("data") is None:
            admin_customers_cache["data"] = {}
        admin_customers_cache["data"][cache_key] = response
        admin_customers_cache["timestamp"] = now
        
        print(f"✅ Admin customers data cached")
        return response
        
    except Exception as e:
        print(f"❌ Error in get_all_customers: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.put("/api/admin/customers/{user_id}/ban", response_model=CustomerResponse)
async def ban_unban_customer(
    user_id: str = Path(...),
    ban_data: CustomerBanUpdate = Body(...)
):
    """Khóa hoặc mở khóa tài khoản khách hàng"""
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")
        
        # Cập nhật trạng thái ban
        await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_banned": ban_data.is_banned, "updated_at": datetime.now().isoformat()}}
        )
        
        # Lấy lại user đã cập nhật
        updated_user = await users_collection.find_one({"_id": ObjectId(user_id)})
        
        # Tính toán thống kê
        total_orders = await orders_collection.count_documents({"user_id": user_id})
        orders_cursor = orders_collection.find({"user_id": user_id})
        orders = await orders_cursor.to_list(length=None)
        total_spent = sum(order.get("total_amount", 0) for order in orders)
        
        return CustomerResponse(
            id=str(updated_user["_id"]),
            username=updated_user["username"],
            email=updated_user["email"],
            name=updated_user["name"],
            dateOfBirth=updated_user["dateOfBirth"],
            createdAt=updated_user["createdAt"],
            role=updated_user.get("role", "user"),
            emailVerified=updated_user.get("emailVerified", False),
            avatar=updated_user.get("avatar", ""),
            phone=updated_user.get("phone", ""),
            address=updated_user.get("address", ""),
            memberLevel=updated_user.get("memberLevel", "bronze"),
            is_banned=updated_user.get("is_banned", False),
            total_orders=total_orders,
            total_spent=total_spent
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.put("/api/admin/customers/{user_id}/role", response_model=CustomerResponse)
async def update_customer_role(
    user_id: str = Path(...),
    role_data: CustomerRoleUpdate = Body(...)
):
    """Cập nhật role của khách hàng"""
    try:
        if role_data.role not in ["user", "admin"]:
            raise HTTPException(status_code=400, detail="Role phải là 'user' hoặc 'admin'")
        
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")
        
        # Cập nhật role
        await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"role": role_data.role, "updated_at": datetime.now().isoformat()}}
        )
        
        # Lấy lại user đã cập nhật
        updated_user = await users_collection.find_one({"_id": ObjectId(user_id)})
        
        # Tính toán thống kê
        total_orders = await orders_collection.count_documents({"user_id": user_id})
        orders_cursor = orders_collection.find({"user_id": user_id})
        orders = await orders_cursor.to_list(length=None)
        total_spent = sum(order.get("total_amount", 0) for order in orders)
        
        return CustomerResponse(
            id=str(updated_user["_id"]),
            username=updated_user["username"],
            email=updated_user["email"],
            name=updated_user["name"],
            dateOfBirth=updated_user["dateOfBirth"],
            createdAt=updated_user["createdAt"],
            role=updated_user.get("role", "user"),
            emailVerified=updated_user.get("emailVerified", False),
            avatar=updated_user.get("avatar", ""),
            phone=updated_user.get("phone", ""),
            address=updated_user.get("address", ""),
            memberLevel=updated_user.get("memberLevel", "bronze"),
            is_banned=updated_user.get("is_banned", False),
            total_orders=total_orders,
            total_spent=total_spent
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.post("/api/admin/customers/send-promotion", response_model=PromotionEmailResponse)
async def send_promotion_emails(request: PromotionEmailRequest):
    """Gửi email khuyến mãi cho khách hàng được chọn hoặc tất cả khách hàng"""
    try:
        # Xác định danh sách user IDs
        if request.user_ids:
            # Gửi cho danh sách user cụ thể
            user_ids = [ObjectId(uid) for uid in request.user_ids]
            users = await users_collection.find({"_id": {"$in": user_ids}}).to_list(length=None)
        else:
            # Gửi cho tất cả users (trừ admin nếu muốn)
            users = await users_collection.find({"role": "user"}).to_list(length=None)
        
        sent_count = 0
        failed_count = 0
        
        # Gửi email cho từng user
        for user in users:
            try:
                success = await send_promotion_email(
                    to_email=user["email"],
                    username=user["username"],
                    name=user.get("name", user["username"]),
                    subject=request.subject,
                    content=request.content
                )
                if success:
                    sent_count += 1
                else:
                    failed_count += 1
            except Exception as e:
                print(f"[ERROR] Lỗi khi gửi email cho {user['email']}: {str(e)}")
                failed_count += 1
        
        return PromotionEmailResponse(
            success=True,
            message=f"Đã gửi {sent_count} email thành công, {failed_count} email thất bại",
            sent_count=sent_count,
            failed_count=failed_count
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

# ==================== ADMIN COUPON MANAGEMENT ====================

@app.get("/api/admin/coupons", response_model=CouponListResponse)
async def get_all_coupons():
    """Lấy danh sách tất cả mã giảm giá"""
    try:
        cursor = coupons_collection.find({}).sort("createdAt", -1)
        coupons_data = await cursor.to_list(length=None)
        
        coupons = []
        for coupon in coupons_data:
            coupons.append(CouponResponse(
                id=str(coupon["_id"]),
                code=coupon["code"],
                discount_type=coupon["discount_type"],
                discount_value=coupon["discount_value"],
                min_order_amount=coupon.get("min_order_amount", 0),
                max_discount=coupon.get("max_discount"),
                usage_limit=coupon.get("usage_limit"),
                used_count=coupon.get("used_count", 0),
                valid_from=coupon.get("valid_from"),
                valid_until=coupon.get("valid_until"),
                is_active=coupon.get("is_active", True),
                created_at=coupon["createdAt"],
                updated_at=coupon.get("updated_at")
            ))
        
        return CouponListResponse(
            success=True,
            coupons=coupons,
            total=len(coupons)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.post("/api/admin/coupons", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
async def create_coupon(coupon_data: CouponCreate):
    """Tạo mã giảm giá mới"""
    try:
        # Kiểm tra mã đã tồn tại chưa
        existing = await coupons_collection.find_one({"code": coupon_data.code})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mã giảm giá đã tồn tại"
            )
        
        # Validate discount_type
        if coupon_data.discount_type not in ["percentage", "fixed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="discount_type phải là 'percentage' hoặc 'fixed'"
            )
        
        # Validate discount_value
        if coupon_data.discount_type == "percentage" and coupon_data.discount_value > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Giảm giá phần trăm không được vượt quá 100%"
            )
        
        coupon_doc = {
            "code": coupon_data.code.upper(),
            "discount_type": coupon_data.discount_type,
            "discount_value": coupon_data.discount_value,
            "min_order_amount": coupon_data.min_order_amount,
            "max_discount": coupon_data.max_discount,
            "usage_limit": coupon_data.usage_limit,
            "used_count": 0,
            "valid_from": coupon_data.valid_from,
            "valid_until": coupon_data.valid_until,
            "is_active": coupon_data.is_active,
            "createdAt": datetime.now().isoformat(),
            "updated_at": None
        }
        
        result = await coupons_collection.insert_one(coupon_doc)
        
        # Lấy lại coupon vừa tạo
        new_coupon = await coupons_collection.find_one({"_id": result.inserted_id})
        
        return CouponResponse(
            id=str(new_coupon["_id"]),
            code=new_coupon["code"],
            discount_type=new_coupon["discount_type"],
            discount_value=new_coupon["discount_value"],
            min_order_amount=new_coupon.get("min_order_amount", 0),
            max_discount=new_coupon.get("max_discount"),
            usage_limit=new_coupon.get("usage_limit"),
            used_count=new_coupon.get("used_count", 0),
            valid_from=new_coupon.get("valid_from"),
            valid_until=new_coupon.get("valid_until"),
            is_active=new_coupon.get("is_active", True),
            created_at=new_coupon["createdAt"],
            updated_at=new_coupon.get("updated_at")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.put("/api/admin/coupons/{coupon_id}", response_model=CouponResponse)
async def update_coupon(
    coupon_id: str = Path(...),
    coupon_data: CouponUpdate = Body(...)
):
    """Cập nhật mã giảm giá"""
    try:
        coupon = await coupons_collection.find_one({"_id": ObjectId(coupon_id)})
        if not coupon:
            raise HTTPException(status_code=404, detail="Không tìm thấy mã giảm giá")
        
        update_data = {}
        
        if coupon_data.code is not None:
            # Kiểm tra mã đã tồn tại chưa (trừ chính nó)
            existing = await coupons_collection.find_one({
                "code": coupon_data.code.upper(),
                "_id": {"$ne": ObjectId(coupon_id)}
            })
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Mã giảm giá đã tồn tại"
                )
            update_data["code"] = coupon_data.code.upper()
        
        if coupon_data.discount_type is not None:
            if coupon_data.discount_type not in ["percentage", "fixed"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="discount_type phải là 'percentage' hoặc 'fixed'"
                )
            update_data["discount_type"] = coupon_data.discount_type
        
        if coupon_data.discount_value is not None:
            update_data["discount_value"] = coupon_data.discount_value
            # Validate percentage
            if update_data.get("discount_type", coupon["discount_type"]) == "percentage" and coupon_data.discount_value > 100:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Giảm giá phần trăm không được vượt quá 100%"
                )
        
        if coupon_data.min_order_amount is not None:
            update_data["min_order_amount"] = coupon_data.min_order_amount
        
        if coupon_data.max_discount is not None:
            update_data["max_discount"] = coupon_data.max_discount
        
        if coupon_data.usage_limit is not None:
            update_data["usage_limit"] = coupon_data.usage_limit
        
        if coupon_data.valid_from is not None:
            update_data["valid_from"] = coupon_data.valid_from
        
        if coupon_data.valid_until is not None:
            update_data["valid_until"] = coupon_data.valid_until
        
        if coupon_data.is_active is not None:
            update_data["is_active"] = coupon_data.is_active
        
        if update_data:
            update_data["updated_at"] = datetime.now().isoformat()
            await coupons_collection.update_one(
                {"_id": ObjectId(coupon_id)},
                {"$set": update_data}
            )
        
        # Lấy lại coupon đã cập nhật
        updated_coupon = await coupons_collection.find_one({"_id": ObjectId(coupon_id)})
        
        return CouponResponse(
            id=str(updated_coupon["_id"]),
            code=updated_coupon["code"],
            discount_type=updated_coupon["discount_type"],
            discount_value=updated_coupon["discount_value"],
            min_order_amount=updated_coupon.get("min_order_amount", 0),
            max_discount=updated_coupon.get("max_discount"),
            usage_limit=updated_coupon.get("usage_limit"),
            used_count=updated_coupon.get("used_count", 0),
            valid_from=updated_coupon.get("valid_from"),
            valid_until=updated_coupon.get("valid_until"),
            is_active=updated_coupon.get("is_active", True),
            created_at=updated_coupon["createdAt"],
            updated_at=updated_coupon.get("updated_at")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.post("/api/coupons/validate", response_model=CouponValidateResponse)
async def validate_coupon(request: CouponValidateRequest):
    """Validate mã giảm giá khi áp dụng"""
    try:
        # Tìm coupon theo code (uppercase)
        coupon = await coupons_collection.find_one({"code": request.code.upper()})
        
        if not coupon:
            return CouponValidateResponse(
                success=False,
                valid=False,
                message="Mã giảm giá không tồn tại",
                coupon=None,
                discount_amount=None
            )
        
        # Kiểm tra trạng thái active
        if not coupon.get("is_active", True):
            return CouponValidateResponse(
                success=False,
                valid=False,
                message="Mã giảm giá đã bị vô hiệu hóa",
                coupon=None,
                discount_amount=None
            )
        
        # Kiểm tra thời gian hiệu lực
        now = datetime.now()
        if coupon.get("valid_from"):
            valid_from = datetime.fromisoformat(coupon["valid_from"])
            if now < valid_from:
                return CouponValidateResponse(
                    success=False,
                    valid=False,
                    message=f"Mã giảm giá chưa có hiệu lực (từ {coupon['valid_from']})",
                    coupon=None,
                    discount_amount=None
                )
        
        if coupon.get("valid_until"):
            valid_until = datetime.fromisoformat(coupon["valid_until"])
            if now > valid_until:
                return CouponValidateResponse(
                    success=False,
                    valid=False,
                    message=f"Mã giảm giá đã hết hạn (đến {coupon['valid_until']})",
                    coupon=None,
                    discount_amount=None
                )
        
        # Kiểm tra số lần sử dụng
        used_count = coupon.get("used_count", 0)
        usage_limit = coupon.get("usage_limit")
        if usage_limit and used_count >= usage_limit:
            return CouponValidateResponse(
                success=False,
                valid=False,
                message="Mã giảm giá đã hết số lần sử dụng",
                coupon=None,
                discount_amount=None
            )
        
        # Kiểm tra đơn hàng tối thiểu
        min_order_amount = coupon.get("min_order_amount", 0)
        if request.subtotal < min_order_amount:
            return CouponValidateResponse(
                success=False,
                valid=False,
                message=f"Đơn hàng tối thiểu {int(min_order_amount):,}₫ để áp dụng mã này",
                coupon=None,
                discount_amount=None
            )
        
        # Tính toán số tiền giảm
        discount_amount = 0
        discount_type = coupon.get("discount_type")
        discount_value = coupon.get("discount_value", 0)
        
        if discount_type == "percentage":
            discount_amount = request.subtotal * discount_value / 100
            # Áp dụng max_discount nếu có
            max_discount = coupon.get("max_discount")
            if max_discount and discount_amount > max_discount:
                discount_amount = max_discount
        elif discount_type == "fixed":
            discount_amount = discount_value
            # Không được vượt quá subtotal
            if discount_amount > request.subtotal:
                discount_amount = request.subtotal
        
        # Tạo CouponResponse
        coupon_response = CouponResponse(
            id=str(coupon["_id"]),
            code=coupon["code"],
            discount_type=coupon["discount_type"],
            discount_value=coupon["discount_value"],
            min_order_amount=coupon.get("min_order_amount", 0),
            max_discount=coupon.get("max_discount"),
            usage_limit=coupon.get("usage_limit"),
            used_count=coupon.get("used_count", 0),
            valid_from=coupon.get("valid_from"),
            valid_until=coupon.get("valid_until"),
            is_active=coupon.get("is_active", True),
            created_at=coupon.get("createdAt", datetime.now().isoformat()),
            updated_at=coupon.get("updated_at")
        )
        
        return CouponValidateResponse(
            success=True,
            valid=True,
            message="Mã giảm giá hợp lệ",
            coupon=coupon_response,
            discount_amount=discount_amount
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.delete("/api/admin/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str = Path(...)):
    """Xóa mã giảm giá"""
    try:
        coupon = await coupons_collection.find_one({"_id": ObjectId(coupon_id)})
        if not coupon:
            raise HTTPException(status_code=404, detail="Không tìm thấy mã giảm giá")
        
        await coupons_collection.delete_one({"_id": ObjectId(coupon_id)})
        
        return {"success": True, "message": "Đã xóa mã giảm giá"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

# ==================== RETURN/REFUND API ENDPOINTS ====================

@app.get("/api/admin/returns", response_model=ReturnListResponse)
async def get_all_returns(status: Optional[str] = Query(None, description="Lọc theo trạng thái")):
    """Lấy danh sách tất cả yêu cầu trả hàng (admin) - VERSION TỐI ƯU"""
    try:
        # Cache key
        cache_key = f"returns_{status}"
        now = datetime.now()
        
        # Check cache
        if admin_returns_cache.get("data"):
            cached = admin_returns_cache["data"].get(cache_key)
            if cached:
                cache_age = (now - admin_returns_cache["timestamp"]).total_seconds()
                if cache_age < ADMIN_CACHE_DURATION:
                    print(f"✅ Returning cached admin returns (age: {cache_age:.1f}s)")
                    return cached
        
        print(f"🔄 Generating fresh admin returns data...")
        
        query = {}
        if status and status != 'all':
            query["status"] = status
        
        cursor = returns_collection.find(query).sort("createdAt", -1)
        returns_data = await cursor.to_list(length=None)
        
        returns = []
        for ret in returns_data:
            returns.append(ReturnResponse(
                id=str(ret["_id"]),
                return_number=ret.get("return_number", f"RET{str(ret['_id'])[:8].upper()}"),
                user_id=ret["user_id"],
                order_id=ret["order_id"],
                items=ret.get("items", []),
                reason=ret.get("reason", ""),
                description=ret.get("description"),
                refund_method=ret.get("refund_method", "original"),
                bank_account=ret.get("bank_account"),
                photos=ret.get("photos", []),
                status=ret.get("status", "pending"),
                refund_amount=ret.get("refund_amount"),
                refund_date=ret.get("refund_date"),
                admin_note=ret.get("admin_note"),
                created_at=ret.get("createdAt", datetime.now().isoformat()),
                updated_at=ret.get("updated_at")
            ))
        
        response = ReturnListResponse(
            success=True,
            returns=returns,
            total=len(returns)
        )
        
        # Cache response
        if admin_returns_cache.get("data") is None:
            admin_returns_cache["data"] = {}
        admin_returns_cache["data"][cache_key] = response
        admin_returns_cache["timestamp"] = now
        
        print(f"✅ Admin returns data cached")
        return response
        
    except Exception as e:
        print(f"❌ Error in get_all_returns: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.get("/api/returns", response_model=ReturnListResponse)
async def get_user_returns(user_id: str = Query(..., description="ID người dùng")):
    """Lấy danh sách yêu cầu trả hàng của người dùng"""
    try:
        cursor = returns_collection.find({"user_id": user_id}).sort("createdAt", -1)
        returns_data = await cursor.to_list(length=None)
        
        returns = []
        for ret in returns_data:
            returns.append(ReturnResponse(
                id=str(ret["_id"]),
                return_number=ret.get("return_number", f"RET{str(ret['_id'])[:8].upper()}"),
                user_id=ret["user_id"],
                order_id=ret["order_id"],
                items=ret.get("items", []),
                reason=ret.get("reason", ""),
                description=ret.get("description"),
                refund_method=ret.get("refund_method", "original"),
                bank_account=ret.get("bank_account"),
                photos=ret.get("photos", []),
                status=ret.get("status", "pending"),
                refund_amount=ret.get("refund_amount"),
                refund_date=ret.get("refund_date"),
                admin_note=ret.get("admin_note"),
                created_at=ret.get("createdAt", datetime.now().isoformat()),
                updated_at=ret.get("updated_at")
            ))
        
        return ReturnListResponse(
            success=True,
            returns=returns,
            total=len(returns)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.get("/api/returns/{return_id}", response_model=ReturnResponse)
async def get_return(return_id: str = Path(...)):
    """Lấy thông tin chi tiết một yêu cầu trả hàng"""
    try:
        return_doc = await returns_collection.find_one({"_id": ObjectId(return_id)})
        if not return_doc:
            raise HTTPException(status_code=404, detail="Không tìm thấy yêu cầu trả hàng")
        
        return ReturnResponse(
            id=str(return_doc["_id"]),
            return_number=return_doc.get("return_number", f"RET{str(return_doc['_id'])[:8].upper()}"),
            user_id=return_doc["user_id"],
            order_id=return_doc["order_id"],
            items=return_doc.get("items", []),
            reason=return_doc.get("reason", ""),
            description=return_doc.get("description"),
            refund_method=return_doc.get("refund_method", "original"),
            bank_account=return_doc.get("bank_account"),
            photos=return_doc.get("photos", []),
            status=return_doc.get("status", "pending"),
            refund_amount=return_doc.get("refund_amount"),
            refund_date=return_doc.get("refund_date"),
            admin_note=return_doc.get("admin_note"),
            created_at=return_doc.get("createdAt", datetime.now().isoformat()),
            updated_at=return_doc.get("updated_at")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.post("/api/returns", response_model=ReturnResponse, status_code=status.HTTP_201_CREATED)
async def create_return(return_data: ReturnCreate, user_id: str = Query(..., description="ID người dùng")):
    """Tạo yêu cầu trả hàng mới"""
    try:
        # Kiểm tra đơn hàng có tồn tại và thuộc về user không
        order = await orders_collection.find_one({"_id": ObjectId(return_data.order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
        
        if order.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập đơn hàng này")
        
        # Kiểm tra đơn hàng có thể trả hàng không (delivered hoặc completed)
        order_status = order.get("status", "")
        if order_status not in ["delivered", "completed"]:
            raise HTTPException(
                status_code=400,
                detail="Chỉ có thể trả hàng cho đơn hàng đã giao hoặc hoàn thành"
            )
        
        # Tính số tiền hoàn
        total_refund = sum(item.price * item.quantity for item in return_data.items)
        
        # Tạo return number
        return_count = await returns_collection.count_documents({})
        return_number = f"RET{str(return_count + 1).zfill(6)}"
        
        new_return = {
            "return_number": return_number,
            "user_id": user_id,
            "order_id": return_data.order_id,
            "items": [item.model_dump() for item in return_data.items],
            "reason": return_data.reason,
            "description": return_data.description,
            "refund_method": return_data.refund_method,
            "bank_account": return_data.bank_account,
            "photos": return_data.photos or [],
            "status": "pending",
            "refund_amount": total_refund,
            "refund_date": None,
            "admin_note": None,
            "createdAt": datetime.now().isoformat(),
            "updated_at": None
        }
        
        result = await returns_collection.insert_one(new_return)
        
        return ReturnResponse(
            id=str(result.inserted_id),
            return_number=return_number,
            user_id=user_id,
            order_id=return_data.order_id,
            items=return_data.items,
            reason=return_data.reason,
            description=return_data.description,
            refund_method=return_data.refund_method,
            bank_account=return_data.bank_account,
            photos=return_data.photos or [],
            status="pending",
            refund_amount=total_refund,
            refund_date=None,
            admin_note=None,
            created_at=new_return["createdAt"],
            updated_at=None
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.put("/api/returns/{return_id}", response_model=ReturnResponse)
async def update_return(return_id: str = Path(...), update_data: ReturnUpdate = Body(...)):
    """Cập nhật yêu cầu trả hàng (chủ yếu cho admin)"""
    try:
        return_doc = await returns_collection.find_one({"_id": ObjectId(return_id)})
        if not return_doc:
            raise HTTPException(status_code=404, detail="Không tìm thấy yêu cầu trả hàng")
        
        update_fields = {}
        if update_data.status is not None:
            if update_data.status not in ["pending", "approved", "processing", "completed", "rejected"]:
                raise HTTPException(status_code=400, detail="Trạng thái không hợp lệ")
            update_fields["status"] = update_data.status
        
        if update_data.admin_note is not None:
            update_fields["admin_note"] = update_data.admin_note
        
        if update_data.refund_amount is not None:
            update_fields["refund_amount"] = update_data.refund_amount
        
        if update_data.refund_date is not None:
            update_fields["refund_date"] = update_data.refund_date
        
        if update_fields:
            update_fields["updated_at"] = datetime.now().isoformat()
            await returns_collection.update_one(
                {"_id": ObjectId(return_id)},
                {"$set": update_fields}
            )
            
            # Invalidate admin returns cache
            admin_returns_cache["data"] = None
            print("🗑️ Admin returns cache invalidated")
        
        # Lấy lại return đã cập nhật
        updated_return = await returns_collection.find_one({"_id": ObjectId(return_id)})
        
        return ReturnResponse(
            id=str(updated_return["_id"]),
            return_number=updated_return.get("return_number", f"RET{str(updated_return['_id'])[:8].upper()}"),
            user_id=updated_return["user_id"],
            order_id=updated_return["order_id"],
            items=updated_return.get("items", []),
            reason=updated_return.get("reason", ""),
            description=updated_return.get("description"),
            refund_method=updated_return.get("refund_method", "original"),
            bank_account=updated_return.get("bank_account"),
            photos=updated_return.get("photos", []),
            status=updated_return.get("status", "pending"),
            refund_amount=updated_return.get("refund_amount"),
            refund_date=updated_return.get("refund_date"),
            admin_note=updated_return.get("admin_note"),
            created_at=updated_return.get("createdAt", datetime.now().isoformat()),
            updated_at=updated_return.get("updated_at")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

# ==================== DASHBOARD API ENDPOINTS ====================

# Cache dashboard data trong 2 phút
dashboard_cache = {"data": None, "timestamp": None}
CACHE_DURATION = 120  # seconds

@app.get("/api/admin/dashboard", response_model=DashboardResponse)
async def get_dashboard_stats():
    """Lấy thống kê dashboard cho admin - VERSION TỐI ƯU"""
    try:
        # Check cache
        now = datetime.now()
        if dashboard_cache["data"] and dashboard_cache["timestamp"]:
            cache_age = (now - dashboard_cache["timestamp"]).total_seconds()
            if cache_age < CACHE_DURATION:
                print(f"✅ Returning cached dashboard data (age: {cache_age:.1f}s)")
                return dashboard_cache["data"]
        
        print("🔄 Generating fresh dashboard data...")
        
        # Tính toán ngày
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday = today - timedelta(days=1)
        today_end = today + timedelta(days=1)
        
        # ========== AGGREGATION PIPELINE - TỐI ƯU ==========
        
        # 1. Doanh thu và đơn hàng - 1 query duy nhất cho tất cả
        revenue_pipeline = [
            {
                "$match": {
                    "created_at": {"$gte": (today - timedelta(days=14)).isoformat()},
                    "status": {"$in": ["completed", "delivered", "processing", "shipped"]}
                }
            },
            {
                "$project": {
                    "total_amount": 1,
                    "created_at": 1,
                    "status": 1,
                    "day": {
                        "$substr": ["$created_at", 0, 10]  # Extract YYYY-MM-DD
                    },
                    "is_today": {
                        "$eq": [
                            {"$substr": ["$created_at", 0, 10]},
                            today.strftime("%Y-%m-%d")
                        ]
                    },
                    "is_yesterday": {
                        "$eq": [
                            {"$substr": ["$created_at", 0, 10]},
                            yesterday.strftime("%Y-%m-%d")
                        ]
                    }
                }
            },
            {
                "$group": {
                    "_id": "$day",
                    "revenue": {"$sum": "$total_amount"},
                    "orders_count": {"$sum": 1},
                    "is_today": {"$first": "$is_today"},
                    "is_yesterday": {"$first": "$is_yesterday"}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        # 2. Customers mới
        customers_pipeline = [
            {
                "$match": {
                    "createdAt": {"$gte": yesterday}
                }
            },
            {
                "$project": {
                    "is_today": {
                        "$gte": ["$createdAt", today]
                    }
                }
            },
            {
                "$group": {
                    "_id": "$is_today",
                    "count": {"$sum": 1}
                }
            }
        ]
        
        # 3. Pending orders với customer info - 1 query với lookup
        pending_orders_pipeline = [
            {
                "$match": {"status": "pending"}
            },
            {"$sort": {"created_at": -1}},
            {"$limit": 5},
            {
                "$addFields": {
                    "user_object_id": {"$toObjectId": "$user_id"}
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_object_id",
                    "foreignField": "_id",
                    "as": "user_info"
                }
            },
            {
                "$project": {
                    "order_number": 1,
                    "total_amount": 1,
                    "created_at": 1,
                    "status": 1,
                    "items": 1,
                    "customer_name": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$user_info.name", 0]},
                            {"$ifNull": [
                                {"$arrayElemAt": ["$user_info.username", 0]},
                                "Khách hàng"
                            ]}
                        ]
                    }
                }
            }
        ]
        
        # 4. Low stock products - với điều kiện trong query
        low_stock_pipeline = [
            {
                "$match": {
                    "status": "active",
                    "$expr": {
                        "$lte": [
                            {"$ifNull": ["$inventory.quantity", 0]},
                            {"$ifNull": ["$inventory.low_stock_threshold", 10]}
                        ]
                    }
                }
            },
            {
                "$project": {
                    "name": 1,
                    "sku": 1,
                    "quantity": {"$ifNull": ["$inventory.quantity", 0]},
                    "threshold": {"$ifNull": ["$inventory.low_stock_threshold", 10]}
                }
            },
            {"$sort": {"quantity": 1}},
            {"$limit": 10}
        ]
        
        # ========== CHẠY TẤT CẢ QUERIES SONG SONG ==========
        revenue_data, customers_data, pending_orders_data, low_stock_data = await asyncio.gather(
            orders_collection.aggregate(revenue_pipeline).to_list(length=None),
            users_collection.aggregate(customers_pipeline).to_list(length=None),
            orders_collection.aggregate(pending_orders_pipeline).to_list(length=None),
            products_collection.aggregate(low_stock_pipeline).to_list(length=None)
        )
        
        # ========== XỬ LÝ KẾT QUẢ ==========
        
        # Revenue & Orders
        today_revenue = 0
        yesterday_revenue = 0
        today_orders_count = 0
        yesterday_orders_count = 0
        revenue_chart_data = []
        
        for item in revenue_data:
            revenue = item.get("revenue", 0)
            orders = item.get("orders_count", 0)
            
            if item.get("is_today"):
                today_revenue = revenue
                today_orders_count = orders
            if item.get("is_yesterday"):
                yesterday_revenue = revenue
                yesterday_orders_count = orders
            
            # Chart data (14 ngày gần nhất)
            try:
                date_str = datetime.strptime(item["_id"], "%Y-%m-%d").strftime("%d/%m")
            except:
                date_str = item["_id"][-5:]  # Fallback: lấy MM-DD
            
            revenue_chart_data.append(DashboardRevenueData(
                date=date_str,
                revenue=revenue
            ))
        
        # Tính % thay đổi
        revenue_change = ((today_revenue - yesterday_revenue) / yesterday_revenue * 100) if yesterday_revenue > 0 else 0
        orders_change = ((today_orders_count - yesterday_orders_count) / yesterday_orders_count * 100) if yesterday_orders_count > 0 else 0
        
        # Customers
        today_customers_count = 0
        yesterday_customers_count = 0
        for item in customers_data:
            if item["_id"]:  # is_today = true
                today_customers_count = item["count"]
            else:
                yesterday_customers_count = item["count"]
        
        customers_change = ((today_customers_count - yesterday_customers_count) / yesterday_customers_count * 100) if yesterday_customers_count > 0 else 0
        
        # Mock visits
        today_visits = today_orders_count * 60
        yesterday_visits = yesterday_orders_count * 60
        visits_change = ((today_visits - yesterday_visits) / yesterday_visits * 100) if yesterday_visits > 0 else 0
        
        # Pending Orders
        pending_orders = []
        for order in pending_orders_data:
            created_at = datetime.fromisoformat(order.get("created_at", now.isoformat()))
            time_diff = now - created_at
            
            if time_diff.total_seconds() < 3600:
                time_ago = f"{int(time_diff.total_seconds() / 60)} phút trước"
            elif time_diff.total_seconds() < 86400:
                time_ago = f"{int(time_diff.total_seconds() / 3600)} giờ trước"
            else:
                time_ago = f"{int(time_diff.total_seconds() / 86400)} ngày trước"
            
            pending_orders.append(DashboardPendingOrder(
                id=str(order["_id"]),
                order_number=order.get("order_number", f"ORD{str(order['_id'])[:8].upper()}"),
                customer_name=order.get("customer_name", "Khách hàng"),
                total_amount=order.get("total_amount", 0),
                items_count=len(order.get("items", [])),
                time_ago=time_ago,
                status=order.get("status", "pending")
            ))
        
        # Low Stock Products
        low_stock_products = [
            DashboardLowStockProduct(
                id=str(product["_id"]),
                name=product.get("name", ""),
                sku=product.get("sku", ""),
                stock=product.get("quantity", 0),
                threshold=product.get("threshold", 10)
            )
            for product in low_stock_data
        ]
        
        # KPIs
        kpis = [
            DashboardKPIMetric(
                id="revenue",
                title="Doanh thu hôm nay",
                value=today_revenue,
                change=revenue_change,
                trend="up" if revenue_change >= 0 else "down",
                is_currency=True
            ),
            DashboardKPIMetric(
                id="orders",
                title="Đơn hôm nay",
                value=today_orders_count,
                change=orders_change,
                trend="up" if orders_change >= 0 else "down",
                is_currency=False
            ),
            DashboardKPIMetric(
                id="customers",
                title="Khách mới",
                value=today_customers_count,
                change=customers_change,
                trend="up" if customers_change >= 0 else "down",
                is_currency=False
            ),
            DashboardKPIMetric(
                id="visits",
                title="Lượt truy cập",
                value=today_visits,
                change=visits_change,
                trend="up" if visits_change >= 0 else "down",
                is_currency=False
            )
        ]
        
        response = DashboardResponse(
            success=True,
            kpis=kpis,
            revenue_chart=revenue_chart_data,
            pending_orders=pending_orders,
            low_stock_products=low_stock_products
        )
        
        # Cache response
        dashboard_cache["data"] = response
        dashboard_cache["timestamp"] = now
        
        print(f"✅ Dashboard data generated and cached")
        return response
        
    except Exception as e:
        print(f"❌ Error in dashboard: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

# ==================== SECURITY API (2FA & PASSWORD) ====================

@app.get("/api/security/2fa/status/{user_id}", response_model=Get2FAStatusResponse)
async def get_2fa_status(user_id: str = Path(...)):
    """Lấy trạng thái 2FA của người dùng"""
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
        return Get2FAStatusResponse(
            success=True,
            two_factor_enabled=user.get("two_factor_enabled", False),
            user_email=user.get("email", "")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.post("/api/security/2fa/enable", response_model=Enable2FAResponse)
async def enable_2fa(request: Enable2FARequest):
    """Bật xác thực 2FA cho người dùng"""
    try:
        user = await users_collection.find_one({"_id": ObjectId(request.user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
        # Kiểm tra xem đã bật 2FA chưa
        if user.get("two_factor_enabled", False):
            return Enable2FAResponse(
                success=True,
                message="2FA đã được bật trước đó",
                two_factor_enabled=True
            )
        
        # Bật 2FA
        await users_collection.update_one(
            {"_id": ObjectId(request.user_id)},
            {"$set": {"two_factor_enabled": True}}
        )
        
        return Enable2FAResponse(
            success=True,
            message="Đã bật xác thực 2FA thành công",
            two_factor_enabled=True
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.post("/api/security/2fa/disable", response_model=Disable2FAResponse)
async def disable_2fa(request: Disable2FARequest):
    """Tắt xác thực 2FA cho người dùng"""
    try:
        user = await users_collection.find_one({"_id": ObjectId(request.user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
        # Xác minh mật khẩu
        if not bcrypt.checkpw(request.password.encode('utf-8'), user["password"].encode('utf-8')):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Mật khẩu không chính xác"
            )
        
        # Tắt 2FA
        await users_collection.update_one(
            {"_id": ObjectId(request.user_id)},
            {"$set": {"two_factor_enabled": False}, "$unset": {"two_factor_code": "", "two_factor_expires": ""}}
        )
        
        return Disable2FAResponse(
            success=True,
            message="Đã tắt xác thực 2FA thành công",
            two_factor_enabled=False
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.post("/api/security/2fa/verify", response_model=Verify2FACodeResponse)
async def verify_2fa_code(request: Verify2FACodeRequest):
    """Xác minh mã 2FA khi đăng nhập"""
    try:
        # Tìm user theo username
        user = await users_collection.find_one({"username": request.username})
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
        # Kiểm tra mã 2FA
        stored_code = user.get("two_factor_code")
        code_expires = user.get("two_factor_expires")
        
        if not stored_code or not code_expires:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không tìm thấy mã 2FA hoặc mã đã hết hạn"
            )
        
        # Kiểm tra mã có hết hạn không (10 phút)
        expires_time = datetime.fromisoformat(code_expires)
        if datetime.now() > expires_time:
            # Xóa mã đã hết hạn
            await users_collection.update_one(
                {"_id": user["_id"]},
                {"$unset": {"two_factor_code": "", "two_factor_expires": ""}}
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mã 2FA đã hết hạn. Vui lòng đăng nhập lại"
            )
        
        # Kiểm tra mã có đúng không
        if stored_code != request.code:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Mã 2FA không chính xác"
            )
        
        # Xóa mã 2FA sau khi xác minh thành công
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$unset": {"two_factor_code": "", "two_factor_expires": ""}}
        )
        
        # Trả về thông tin user
        user_response = UserResponse(
            id=str(user["_id"]),
            username=user["username"],
            email=user["email"],
            name=user["name"],
            dateOfBirth=user["dateOfBirth"],
            createdAt=user["createdAt"],
            role=user.get("role", "user"),
            emailVerified=user.get("emailVerified", False),
            avatar=user.get("avatar", ""),
            phone=user.get("phone", ""),
            address=user.get("address", ""),
            memberLevel=user.get("memberLevel", "bronze")
        )
        
        return Verify2FACodeResponse(
            success=True,
            message="Xác minh 2FA thành công",
            user=user_response
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.post("/api/security/change-password", response_model=ChangePasswordResponse)
async def change_password(request: ChangePasswordRequest):
    """Đổi mật khẩu cho người dùng"""
    try:
        user = await users_collection.find_one({"_id": ObjectId(request.user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
        # Xác minh mật khẩu hiện tại
        if not bcrypt.checkpw(request.current_password.encode('utf-8'), user["password"].encode('utf-8')):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Mật khẩu hiện tại không chính xác"
            )
        
        # Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
        if bcrypt.checkpw(request.new_password.encode('utf-8'), user["password"].encode('utf-8')):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mật khẩu mới không được trùng với mật khẩu hiện tại"
            )
        
        # Hash mật khẩu mới
        hashed_password = bcrypt.hashpw(request.new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Cập nhật mật khẩu
        await users_collection.update_one(
            {"_id": ObjectId(request.user_id)},
            {"$set": {"password": hashed_password}}
        )
        
        return ChangePasswordResponse(
            success=True,
            message="Đổi mật khẩu thành công"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

# ==================== SETTINGS ENDPOINTS ====================

@app.get("/api/settings/payments", response_model=PaymentSettingsResponse)
async def get_payment_settings():
    """Lấy cài đặt phương thức thanh toán và vận chuyển"""
    try:
        # Tìm settings trong database
        settings = await settings_collection.find_one({"type": "payment_shipping"})
        
        # Nếu chưa có settings, tạo mặc định
        if not settings:
            default_settings = {
                "type": "payment_shipping",
                "payment_methods": [
                    {
                        "id": "cod",
                        "name": "Thanh toán khi nhận hàng (COD)",
                        "description": "Thanh toán bằng tiền mặt khi nhận hàng",
                        "enabled": True
                    },
                    {
                        "id": "bank_transfer",
                        "name": "Chuyển khoản ngân hàng",
                        "description": "Chuyển khoản qua tài khoản ngân hàng",
                        "enabled": True
                    },
                    {
                        "id": "momo",
                        "name": "Ví điện tử MoMo",
                        "description": "Thanh toán qua ứng dụng MoMo",
                        "enabled": False
                    },
                    {
                        "id": "zalopay",
                        "name": "Ví điện tử ZaloPay",
                        "description": "Thanh toán qua ứng dụng ZaloPay",
                        "enabled": False
                    },
                    {
                        "id": "vnpay",
                        "name": "VNPay",
                        "description": "Thanh toán qua cổng VNPay",
                        "enabled": False
                    }
                ],
                "shipping_methods": [
                    {
                        "id": "standard",
                        "name": "Giao hàng tiêu chuẩn",
                        "description": "3-5 ngày",
                        "price": 30000,
                        "estimated_days": "3-5",
                        "enabled": True
                    },
                    {
                        "id": "express",
                        "name": "Giao hàng nhanh",
                        "description": "1-2 ngày",
                        "price": 50000,
                        "estimated_days": "1-2",
                        "enabled": True
                    },
                    {
                        "id": "free",
                        "name": "Miễn phí vận chuyển",
                        "description": "5-7 ngày",
                        "price": 0,
                        "estimated_days": "5-7",
                        "min_order": 500000,
                        "enabled": False
                    }
                ],
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
            await settings_collection.insert_one(default_settings)
            settings = default_settings
        
        return PaymentSettingsResponse(
            success=True,
            payment_methods=settings["payment_methods"],
            shipping_methods=settings["shipping_methods"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

@app.post("/api/settings/payments", response_model=PaymentSettingsResponse)
async def update_payment_settings(settings_update: PaymentSettingsUpdate):
    """Cập nhật cài đặt phương thức thanh toán và vận chuyển"""
    try:
        # Chuyển đổi Pydantic models sang dict
        payment_methods = [method.model_dump() for method in settings_update.payment_methods]
        shipping_methods = [method.model_dump() for method in settings_update.shipping_methods]
        
        # Cập nhật hoặc tạo mới settings
        result = await settings_collection.update_one(
            {"type": "payment_shipping"},
            {
                "$set": {
                    "payment_methods": payment_methods,
                    "shipping_methods": shipping_methods,
                    "updated_at": datetime.now()
                },
                "$setOnInsert": {
                    "type": "payment_shipping",
                    "created_at": datetime.now()
                }
            },
            upsert=True
        )
        
        return PaymentSettingsResponse(
            success=True,
            payment_methods=payment_methods,
            shipping_methods=shipping_methods
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi server: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    import os
    from dotenv import load_dotenv
    
    load_dotenv()  # Load .env file
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    print(f"🚀 Starting server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)

