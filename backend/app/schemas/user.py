from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# =====================================================
# Register User
# =====================================================

class UserCreate(BaseModel):
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
    )


# =====================================================
# User Response
# =====================================================

class UserResponse(BaseModel):
    id: str

    full_name: str

    email: EmailStr

    profile_picture: Optional[str] = None

    is_verified: bool

    is_active: bool

    created_at: datetime

    class Config:
        from_attributes = True


# =====================================================
# Update Profile
# =====================================================

class UpdateProfileRequest(BaseModel):
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )


# =====================================================
# Change Password
# =====================================================

class ChangePasswordRequest(BaseModel):
    current_password: str

    new_password: str = Field(
        ...,
        min_length=8,
    )