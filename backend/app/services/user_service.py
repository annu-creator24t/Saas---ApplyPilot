import math
from datetime import datetime, timedelta

from app.auth.jwt import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)
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
        clean_email = user.email.strip().lower()
        existing = await self.repository.get_user_by_email(clean_email)

        if existing:
            raise ValidationException("Email already exists.")

        now = datetime.utcnow()
        trial_end = now + timedelta(days=10)

        payload = {
            "full_name": user.full_name.strip() if user.full_name else "",
            "email": clean_email,
            "password": hash_password(user.password),
            "profile_picture": None,
            "is_verified": False,
            "is_active": True,
            "is_admin": False,
            "role": "user",
            "subscription_status": "free",
            "subscription_plan": "free",
            "free_usage_count": 0,
            "payment_status": "none",
            "trial_active": True,
            "trial_started_at": now,
            "trial_ends_at": trial_end,
            "created_at": now,
            "updated_at": now,
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
        clean_email = email.strip().lower() if email else ""
        user = await self.repository.get_user_by_email(clean_email)

        if not user:
            raise AuthenticationException("Invalid credentials.")

        is_valid = verify_password(
            password,
            user["password"],
        )

        if not is_valid:
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
    # Refresh Token
    # =====================================================

    async def refresh_access_token(
        self,
        refresh_token: str,
    ):
        try:
            payload = verify_refresh_token(refresh_token)
            user_id = payload.get("sub")
            if not user_id:
                raise AuthenticationException("Invalid refresh token.")

            user = await self.repository.get_user_by_id(user_id)
            if not user:
                raise AuthenticationException("User not found.")

            new_payload = {
                "sub": str(user["_id"]),
                "email": user["email"],
            }

            return APIResponse(
                message="Token refreshed successfully.",
                data={
                    "access_token": create_access_token(new_payload),
                    "refresh_token": create_refresh_token(new_payload),
                    "token_type": "bearer",
                },
            )
        except Exception:
            raise AuthenticationException("Invalid or expired refresh token.")

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

        user["id"] = str(user.pop("_id", ""))
        user.pop("password", None)
        user.setdefault("subscription_status", "free")
        user.setdefault("subscription_plan", "free")
        user.setdefault("free_usage_count", 0)
        user.setdefault("payment_status", "none")
        user.setdefault("is_admin", False)
        user.setdefault("role", "user")

        # Dynamic trial calculation
        now = datetime.utcnow()
        trial_ends = user.get("trial_ends_at")
        trial_active = False
        trial_days_remaining = 0

        if trial_ends:
            if isinstance(trial_ends, str):
                try:
                    trial_ends = datetime.fromisoformat(trial_ends.replace("Z", "+00:00")).replace(tzinfo=None)
                except Exception:
                    trial_ends = None
            if trial_ends and trial_ends > now:
                trial_active = True
                trial_days_remaining = max(1, int(math.ceil((trial_ends - now).total_seconds() / 86400)))

        user["trial_active"] = trial_active
        user["trial_days_remaining"] = trial_days_remaining

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

    # =====================================================
    # Request Password Reset Code
    # =====================================================

    async def request_password_reset(self, email: str):
        user = await self.repository.get_user_by_email(email)
        if not user:
            raise NotFoundException("User with this email address does not exist.")

        import secrets
        reset_code = str(secrets.randbelow(899999) + 100000)

        await self.repository.update_user(
            str(user["_id"]),
            {
                "reset_code": reset_code,
                "reset_code_created_at": datetime.utcnow(),
            },
        )

        return APIResponse(
            message="Password reset code generated successfully.",
            data={
                "email": email,
                "reset_code": reset_code,
            },
        )

    # =====================================================
    # Reset Password with Code
    # =====================================================

    async def reset_password(self, email: str, reset_code: str, new_password: str):
        user = await self.repository.get_user_by_email(email)
        if not user:
            raise NotFoundException("User with this email address does not exist.")

        stored_code = user.get("reset_code")
        created_at = user.get("reset_code_created_at")

        if not stored_code or stored_code != reset_code:
            raise ValidationException("Invalid or expired password reset code.")

        if created_at:
            if isinstance(created_at, datetime):
                time_elapsed = (datetime.utcnow() - created_at).total_seconds()
                if time_elapsed > 900:  # 15 minutes expiration
                    raise ValidationException("Invalid or expired password reset code.")

        await self.repository.update_user(
            str(user["_id"]),
            {
                "password": hash_password(new_password),
                "reset_code": None,
                "reset_code_created_at": None,
                "updated_at": datetime.utcnow(),
            },
        )

        return APIResponse(
            message="Password reset successfully. You can now sign in with your new password.",
        )