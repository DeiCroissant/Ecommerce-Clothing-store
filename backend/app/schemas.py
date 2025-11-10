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
    avatar: Optional[str] = Field('', description="Avatar URL")
    phone: Optional[str] = Field('', description="Số điện thoại")
    address: Optional[str] = Field('', description="Địa chỉ")
    memberLevel: Optional[str] = Field('bronze', description="Cấp thành viên")

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    phone: Optional[str] = Field(None, description="Số điện thoại")
    avatar: Optional[str] = Field(None, description="Avatar URL (base64 hoặc URL)")

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
    needs_2fa: bool = False
    username: Optional[str] = None

class ErrorResponse(BaseModel):
    success: bool
    error: str


class EmailVerifyRequest(BaseModel):
    username: str = Field(..., description="Tên đăng nhập cần xác minh")
    code: str = Field(..., min_length=4, max_length=12, description="Mã xác minh")


class EmailVerifyResponse(BaseModel):
    success: bool
    message: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Email của người dùng")

class ForgotPasswordResponse(BaseModel):
    success: bool
    message: str
    emailSent: bool = False
    resetToken: Optional[str] = None  # Chỉ trả về nếu không gửi được email

class ResetPasswordRequest(BaseModel):
    token: str = Field(..., description="Token đặt lại mật khẩu")
    new_password: str = Field(..., min_length=8, description="Mật khẩu mới")

class ResetPasswordResponse(BaseModel):
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
    subcategories_count: Optional[int] = Field(0, description="Số lượng danh mục con")
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
    images: Optional[list[str]] = []  # Images for this color variant

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

class ShippingAddress(BaseModel):
    full_name: str
    phone: str
    email: Optional[str] = ""
    street: str
    ward: str
    city: str

class OrderBase(BaseModel):
    user_id: str
    items: list[OrderItem]
    total_amount: float
    shipping_address: ShippingAddress
    payment_method: str = "COD"
    status: str = Field("pending", description="pending, processing, shipped, delivered, cancelled, completed")
    note: Optional[str] = ""

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

class OrderStatusUpdate(BaseModel):
    status: str = Field(..., description="pending, processing, shipped, delivered, cancelled, completed")

class OrderUpdateResponse(BaseModel):
    success: bool
    message: str
    order: OrderResponse

# ==================== ADDRESS SCHEMAS ====================
class AddressBase(BaseModel):
    user_id: str = Field(..., description="User ID")
    full_name: str = Field(..., min_length=1, max_length=100, description="Họ và tên người nhận")
    phone: str = Field(..., min_length=10, max_length=11, description="Số điện thoại")
    email: Optional[str] = Field(None, description="Email người nhận")
    street: str = Field(..., min_length=1, max_length=200, description="Địa chỉ cụ thể (số nhà, tên đường)")
    ward: str = Field(..., min_length=1, max_length=100, description="Phường/Xã")
    city: str = Field(..., min_length=1, max_length=100, description="Tỉnh/Thành phố")
    is_default: bool = Field(False, description="Địa chỉ mặc định")
    label: Optional[str] = Field(None, max_length=50, description="Nhãn địa chỉ (ví dụ: Nhà, Văn phòng)")

class AddressCreate(AddressBase):
    pass

class AddressUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=11)
    email: Optional[str] = None
    street: Optional[str] = Field(None, min_length=1, max_length=200)
    ward: Optional[str] = Field(None, min_length=1, max_length=100)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    is_default: Optional[bool] = None
    label: Optional[str] = Field(None, max_length=50)

class AddressResponse(AddressBase):
    id: str
    created_at: str
    updated_at: Optional[str] = None

class AddressListResponse(BaseModel):
    success: bool
    addresses: list[AddressResponse]
    total: int

# Customer Management Schemas
class CustomerResponse(UserResponse):
    is_banned: Optional[bool] = Field(False, description="Trạng thái bị khóa")
    total_orders: Optional[int] = Field(0, description="Tổng số đơn hàng")
    total_spent: Optional[float] = Field(0.0, description="Tổng số tiền đã chi")

class CustomerListResponse(BaseModel):
    success: bool
    customers: list[CustomerResponse]
    total: int
    page: int
    limit: int

class CustomerBanUpdate(BaseModel):
    is_banned: bool = Field(..., description="Trạng thái ban (True = khóa, False = mở khóa)")

class CustomerRoleUpdate(BaseModel):
    role: str = Field(..., description="Role mới (user/admin)")

class PromotionEmailRequest(BaseModel):
    user_ids: Optional[list[str]] = Field(None, description="Danh sách user IDs (None = gửi cho tất cả)")
    subject: str = Field(..., description="Tiêu đề email")
    content: str = Field(..., description="Nội dung email (HTML)")

class PromotionEmailResponse(BaseModel):
    success: bool
    message: str
    sent_count: int
    failed_count: int

# Coupon Management Schemas
class CouponBase(BaseModel):
    code: str = Field(..., min_length=1, max_length=50, description="Mã giảm giá")
    discount_type: str = Field(..., description="Loại giảm giá: 'percentage' hoặc 'fixed'")
    discount_value: float = Field(..., gt=0, description="Giá trị giảm giá (% hoặc số tiền)")
    min_order_amount: float = Field(0, ge=0, description="Số tiền đơn hàng tối thiểu để áp dụng")
    max_discount: Optional[float] = Field(None, ge=0, description="Giảm tối đa (chỉ áp dụng khi discount_type = 'percentage')")
    usage_limit: Optional[int] = Field(None, gt=0, description="Số lượng sử dụng tối đa")
    used_count: int = Field(0, ge=0, description="Số lần đã sử dụng")
    valid_from: Optional[str] = Field(None, description="Ngày bắt đầu (YYYY-MM-DD)")
    valid_until: Optional[str] = Field(None, description="Ngày kết thúc (YYYY-MM-DD)")
    is_active: bool = Field(True, description="Trạng thái hoạt động")

class CouponCreate(CouponBase):
    pass

class CouponUpdate(BaseModel):
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    discount_type: Optional[str] = None
    discount_value: Optional[float] = Field(None, gt=0)
    min_order_amount: Optional[float] = Field(None, ge=0)
    max_discount: Optional[float] = Field(None, ge=0)
    usage_limit: Optional[int] = Field(None, gt=0)
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    is_active: Optional[bool] = None

class CouponResponse(CouponBase):
    id: str
    created_at: str
    updated_at: Optional[str] = None

class CouponListResponse(BaseModel):
    success: bool
    coupons: list[CouponResponse]
    total: int

class CouponValidateRequest(BaseModel):
    code: str = Field(..., description="Mã giảm giá")
    subtotal: float = Field(..., ge=0, description="Tổng tiền đơn hàng")

class CouponValidateResponse(BaseModel):
    success: bool
    valid: bool
    message: str
    coupon: Optional[CouponResponse] = None
    discount_amount: Optional[float] = None

# ==================== RETURN/REFUND SCHEMAS ====================

class ReturnItem(BaseModel):
    product_id: str = Field(..., description="ID sản phẩm")
    product_name: str = Field(..., description="Tên sản phẩm")
    product_image: Optional[str] = Field(None, description="Ảnh sản phẩm")
    quantity: int = Field(..., gt=0, description="Số lượng trả")
    reason: str = Field(..., description="Lý do trả hàng")
    price: float = Field(..., ge=0, description="Giá sản phẩm")

class ReturnBase(BaseModel):
    order_id: str = Field(..., description="ID đơn hàng")
    items: list[ReturnItem] = Field(..., min_length=1, description="Danh sách sản phẩm trả")
    reason: str = Field(..., description="Lý do trả hàng tổng quát")
    description: Optional[str] = Field(None, description="Mô tả chi tiết")
    refund_method: str = Field("original", description="Phương thức hoàn tiền: original, bank_transfer, wallet")
    bank_account: Optional[str] = Field(None, description="Số tài khoản ngân hàng (nếu refund_method = bank_transfer)")
    photos: Optional[list[str]] = Field([], description="Ảnh minh chứng")

class ReturnCreate(ReturnBase):
    pass

class ReturnUpdate(BaseModel):
    status: Optional[str] = Field(None, description="Trạng thái: pending, approved, processing, completed, rejected")
    admin_note: Optional[str] = Field(None, description="Ghi chú của admin")
    refund_amount: Optional[float] = Field(None, ge=0, description="Số tiền hoàn")
    refund_date: Optional[str] = Field(None, description="Ngày hoàn tiền")

class ReturnResponse(ReturnBase):
    id: str = Field(..., description="ID yêu cầu trả hàng")
    return_number: str = Field(..., description="Số yêu cầu trả hàng")
    user_id: str = Field(..., description="ID người dùng")
    status: str = Field("pending", description="Trạng thái: pending, approved, processing, completed, rejected")
    refund_amount: Optional[float] = Field(None, ge=0, description="Số tiền hoàn")
    refund_date: Optional[str] = Field(None, description="Ngày hoàn tiền")
    admin_note: Optional[str] = Field(None, description="Ghi chú của admin")
    created_at: str = Field(..., description="Ngày tạo")
    updated_at: Optional[str] = Field(None, description="Ngày cập nhật")

class ReturnListResponse(BaseModel):
    success: bool
    returns: list[ReturnResponse]
    total: int

# ==================== DASHBOARD SCHEMAS ====================

class DashboardKPIMetric(BaseModel):
    id: str
    title: str
    value: float
    change: float
    trend: str  # 'up' or 'down'
    is_currency: bool = False

class DashboardRevenueData(BaseModel):
    date: str
    revenue: float

class DashboardPendingOrder(BaseModel):
    id: str
    order_number: str
    customer_name: str
    total_amount: float
    items_count: int
    time_ago: str
    status: str

class DashboardLowStockProduct(BaseModel):
    id: str
    name: str
    sku: str
    stock: int
    threshold: int

class DashboardResponse(BaseModel):
    success: bool
    kpis: list[DashboardKPIMetric]
    revenue_chart: list[DashboardRevenueData]
    pending_orders: list[DashboardPendingOrder]
    low_stock_products: list[DashboardLowStockProduct]


# ==================== SECURITY SCHEMAS (2FA & PASSWORD) ====================

class Enable2FARequest(BaseModel):
    user_id: str = Field(..., description="ID người dùng")

class Enable2FAResponse(BaseModel):
    success: bool
    message: str
    two_factor_enabled: bool

class Disable2FARequest(BaseModel):
    user_id: str = Field(..., description="ID người dùng")
    password: str = Field(..., description="Mật khẩu xác nhận")

class Disable2FAResponse(BaseModel):
    success: bool
    message: str
    two_factor_enabled: bool

class Verify2FACodeRequest(BaseModel):
    username: str = Field(..., description="Tên đăng nhập")
    code: str = Field(..., min_length=6, max_length=6, description="Mã 2FA (6 số)")

class Verify2FACodeResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None

class ChangePasswordRequest(BaseModel):
    user_id: str = Field(..., description="ID người dùng")
    current_password: str = Field(..., description="Mật khẩu hiện tại")
    new_password: str = Field(..., min_length=8, description="Mật khẩu mới")

    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        """Validate password: 8 ký tự, có chữ hoa và ký tự đặc biệt"""
        if len(v) < 8:
            raise ValueError('Mật khẩu phải có ít nhất 8 ký tự')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('Mật khẩu phải có ít nhất 1 chữ hoa')
        
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', v):
            raise ValueError('Mật khẩu phải có ít nhất 1 ký tự đặc biệt')
        
        return v

class ChangePasswordResponse(BaseModel):
    success: bool
    message: str

class Get2FAStatusResponse(BaseModel):
    success: bool
    two_factor_enabled: bool
    user_email: Optional[str] = None


# ==================== SETTINGS SCHEMAS ====================

class PaymentMethodSetting(BaseModel):
    id: str = Field(..., description="ID phương thức thanh toán (cod, bank_transfer, momo, zalopay, vnpay)")
    name: str = Field(..., description="Tên phương thức thanh toán")
    description: Optional[str] = Field('', description="Mô tả phương thức")
    enabled: bool = Field(True, description="Trạng thái bật/tắt")

class ShippingMethodSetting(BaseModel):
    id: str = Field(..., description="ID phương thức vận chuyển (standard, express, free)")
    name: str = Field(..., description="Tên phương thức vận chuyển")
    description: Optional[str] = Field('', description="Mô tả phương thức")
    price: float = Field(0, description="Phí vận chuyển")
    estimated_days: str = Field('', description="Thời gian giao hàng ước tính")
    min_order: Optional[float] = Field(None, description="Giá trị đơn hàng tối thiểu (cho free shipping)")
    enabled: bool = Field(True, description="Trạng thái bật/tắt")

class PaymentSettingsUpdate(BaseModel):
    payment_methods: list[PaymentMethodSetting] = Field(..., description="Danh sách phương thức thanh toán")
    shipping_methods: list[ShippingMethodSetting] = Field(..., description="Danh sách phương thức vận chuyển")

class PaymentSettingsResponse(BaseModel):
    success: bool
    payment_methods: list[PaymentMethodSetting]
    shipping_methods: list[ShippingMethodSetting]

