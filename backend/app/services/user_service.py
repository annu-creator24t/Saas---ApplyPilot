from datetime import datetime

from app.auth.jwt import create_access_token, create_refresh_token
from app.auth.password import hash_password, verify_password
from app.handlers.exceptions import (
    AuthenticationException,
    NotFoundException,
    ValidationException,
)
from app.repositories.user_repository import UserRepository
from app.schemas.common import APIResponse


class UserService:

    def __init__(self):
        self.repository = UserRepository()

    # =====================================================
    # Register
    # =====================================================

    async def register_user(self, user):

        existing = await self.repository.get_user_by_email(user.email)

        if existing:
            raise ValidationException("Email already exists.")

        payload = {
            "full_name": user.full_name,
            "email": user.email,
            "password": hash_password(user.password),
            "profile_picture": None,
            "is_verified": False,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        user_id = await self.repository.create_user(payload)

        return APIResponse(
            message="User registered successfully.",
            data={
                "user_id": user_id,
            },
        )

    # =====================================================
    # Login
    # =====================================================

    async def login_user(
        self,
        email: str,
        password: str,
    ):

        user = await self.repository.get_user_by_email(email)

        if not user:
            raise AuthenticationException("Invalid credentials.")

        if not verify_password(
            password,
            user["password"],
        ):
            raise AuthenticationException("Invalid credentials.")

        payload = {
            "sub": str(user["_id"]),
            "email": user["email"],
        }

        return APIResponse(
            message="Login successful.",
            data={
                "access_token": create_access_token(payload),
                "refresh_token": create_refresh_token(payload),
                "token_type": "bearer",
            },
        )

    # =====================================================
    # Get Profile
    # =====================================================

    async def get_profile(
        self,
        user_id: str,
    ):
        user = await self.repository.get_user_by_id(user_id)

        if not user:
            raise NotFoundException("User not found.")

        user["id"] = str(user["_id"])

        return APIResponse(
            message="Profile fetched successfully.",
            data=user,
        )

    # =====================================================
    # Update Profile
    # =====================================================

    async def update_profile(
        self,
        user_id: str,
        full_name: str,
    ):

        user = await self.repository.get_user_by_id(user_id)

        if not user:
            raise NotFoundException("User not found.")

        await self.repository.update_user(
            user_id,
            {
                "full_name": full_name,
                "updated_at": datetime.utcnow(),
            },
        )

        return APIResponse(
            message="Profile updated successfully.",
        )

    # =====================================================
    # Change Password
    # =====================================================

    async def change_password(
        self,
        user_id: str,
        current_password: str,
        new_password: str,
    ):

        user = await self.repository.get_user_by_id(user_id)

        if not user:
            raise NotFoundException("User not found.")

        if not verify_password(
            current_password,
            user["password"],
        ):
            raise AuthenticationException(
                "Current password is incorrect."
            )

        await self.repository.update_password(
            user_id,
            hash_password(new_password),
        )

        return APIResponse(
            message="Password changed successfully.",
        )