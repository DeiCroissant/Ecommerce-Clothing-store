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

