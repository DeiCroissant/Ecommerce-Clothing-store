from fastapi import FastAPI, HTTPException, status, Path, Response
from fastapi.middleware.cors import CORSMiddleware
from app.database import users_collection, close_db
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

