from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
import re

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Tên đăng nhập")
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100, description="Tên người dùng")
    dateOfBirth: str = Field(..., description="Ngày sinh (YYYY-MM-DD)")
    role: str = Field('user', description='Role (user/admin)')
    avatar: Optional[str] = Field('', description="Avatar URL")
    phone: Optional[str] = Field('', description="Số điện thoại")
    address: Optional[str] = Field('', description="Địa chỉ")
    memberLevel: Optional[str] = Field('bronze', description="Cấp thành viên")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Mật khẩu")

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password: 8 ký tự, có chữ hoa và ký tự đặc biệt"""
        if len(v) < 8:
            raise ValueError('Mật khẩu phải có ít nhất 8 ký tự')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('Mật khẩu phải có ít nhất 1 chữ hoa')
        
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', v):
            raise ValueError('Mật khẩu phải có ít nhất 1 ký tự đặc biệt')
        
        return v

class UserLogin(BaseModel):
    username: str = Field(..., description="Tên đăng nhập hoặc email")
    password: str = Field(..., description="Mật khẩu")

class UserResponse(UserBase):
    id: str = Field(..., description="ID người dùng")
    createdAt: datetime = Field(..., description="Thời gian tạo")
    emailVerified: bool = Field(False, description="Email đã được xác minh")

    class Config:
        from_attributes = True

class RegisterResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None
    verificationCode: Optional[str] = None
    emailSent: bool = False

class LoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None
    needsVerification: bool = False
    email: Optional[str] = None

class ErrorResponse(BaseModel):
    success: bool
    error: str


class EmailVerifyRequest(BaseModel):
    username: str = Field(..., description="Tên đăng nhập cần xác minh")
    code: str = Field(..., min_length=4, max_length=12, description="Mã xác minh")


class EmailVerifyResponse(BaseModel):
    success: bool
    message: str


class ResendVerificationRequest(BaseModel):
    username: str = Field(..., description="Tên đăng nhập")


class ResendVerificationResponse(BaseModel):
    success: bool
    message: str
    verificationCode: Optional[str] = None
    emailSent: bool = False


# Category Schemas
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Tên danh mục")
    slug: str = Field(..., min_length=1, max_length=100, description="Slug URL")
    description: Optional[str] = Field('', description="Mô tả danh mục")
    parent_id: Optional[str] = Field(None, description="ID danh mục cha (null nếu là danh mục chính)")
    status: str = Field('active', description="Trạng thái (active/inactive)")

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    status: Optional[str] = Field(None, description="Trạng thái (active/inactive)")

class CategoryResponse(CategoryBase):
    id: str = Field(..., description="ID danh mục")
    product_count: int = Field(0, description="Số lượng sản phẩm")
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

class CategoryListResponse(BaseModel):
    success: bool
    categories: list[CategoryResponse]
    total: int

class CategoryDeleteResponse(BaseModel):
    success: bool
    message: str
    deleted_category: Optional[CategoryResponse] = None
    deleted_subcategories: list[CategoryResponse] = []


# Product Schemas
class ProductVariantColor(BaseModel):
    name: str
    slug: str
    hex: str
    available: bool = True

class ProductVariantSize(BaseModel):
    name: str
    available: bool = True
    stock: int = 0

class ProductVariants(BaseModel):
    colors: list[ProductVariantColor] = []
    sizes: list[ProductVariantSize] = []

class ProductInventory(BaseModel):
    in_stock: bool = True
    quantity: int = 0
    low_stock_threshold: int = 10

class ProductPricing(BaseModel):
    original: float
    sale: Optional[float] = None
    discount_percent: int = 0
    currency: str = "VND"

class ProductCategory(BaseModel):
    name: str
    slug: str

class ProductBrand(BaseModel):
    name: str
    slug: str

class ProductRating(BaseModel):
    average: float = 0.0
    count: int = 0

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=200)
    sku: str = Field(..., min_length=1, max_length=50)
    brand: ProductBrand
    category: ProductCategory
    pricing: ProductPricing
    short_description: str = ""
    image: str = ""
    images: list[str] = []
    variants: ProductVariants = ProductVariants()
    inventory: ProductInventory = ProductInventory()
    status: str = Field('active', description="Trạng thái (active/inactive)")
    rating: ProductRating = ProductRating()

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    slug: Optional[str] = Field(None, min_length=1, max_length=200)
    sku: Optional[str] = Field(None, min_length=1, max_length=50)
    brand: Optional[ProductBrand] = None
    category: Optional[ProductCategory] = None
    pricing: Optional[ProductPricing] = None
    short_description: Optional[str] = None
    image: Optional[str] = None
    images: Optional[list[str]] = None
    variants: Optional[ProductVariants] = None
    inventory: Optional[ProductInventory] = None
    status: Optional[str] = None
    rating: Optional[ProductRating] = None

class ProductResponse(ProductBase):
    id: str = Field(..., description="ID sản phẩm")
    wishlist_count: int = Field(0, description="Số lượt yêu thích")
    sold_count: int = Field(0, description="Số lượng đã bán")
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    success: bool
    products: list[ProductResponse]
    total: int
    page: int = 1
    limit: int = 24
    totalPages: int = 0

class ProductDeleteResponse(BaseModel):
    success: bool
    message: str
    deleted_product: Optional[ProductResponse] = None


# Wishlist Schemas
class WishlistItem(BaseModel):
    product_id: str
    added_at: str = Field(default_factory=lambda: datetime.now().isoformat())

class WishlistResponse(BaseModel):
    success: bool
    user_id: str
    wishlist: list[WishlistItem]
    total: int

class WishlistToggleResponse(BaseModel):
    success: bool
    message: str
    is_added: bool
    wishlist_count: int = Field(0, description="Số lượt yêu thích của sản phẩm")


# Review/Rating Schemas
class ReviewBase(BaseModel):
    product_id: str
    user_id: str
    rating: int = Field(..., ge=1, le=5, description="Đánh giá từ 1-5 sao")
    comment: str = Field("", max_length=2000, description="Bình luận")
    
class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: str = Field(..., description="ID đánh giá")
    user_name: str = Field(..., description="Tên người dùng")
    user_avatar: Optional[str] = Field("", description="Avatar người dùng")
    created_at: str = Field(..., description="Thời gian tạo")
    updated_at: Optional[str] = None

class ReviewListResponse(BaseModel):
    success: bool
    reviews: list[ReviewResponse]
    total: int
    average_rating: float = Field(0.0, ge=0, le=5)
    rating_distribution: dict = Field(default_factory=dict)  # {1: count, 2: count, ...}


# Order Schemas
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    product_image: Optional[str] = ""
    variant_color: Optional[str] = None
    variant_size: Optional[str] = None
    quantity: int
    price: float

class OrderBase(BaseModel):
    user_id: str
    items: list[OrderItem]
    total_amount: float
    shipping_address: str
    payment_method: str = "COD"
    status: str = Field("pending", description="pending, processing, shipped, delivered, cancelled, completed")

class OrderCreate(OrderBase):
    pass

class OrderResponse(OrderBase):
    id: str
    order_number: str
    created_at: str
    updated_at: Optional[str] = None

class OrderListResponse(BaseModel):
    success: bool
    orders: list[OrderResponse]
    total: int

class OrderCheckResponse(BaseModel):
    success: bool
    has_ordered: bool
    message: str

