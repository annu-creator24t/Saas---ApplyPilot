from datetime import datetime

from app.auth.jwt import create_access_token, create_refresh_token
from app.auth.password import hash_password, verify_password
from app.repositories.user_repository import UserRepository


class UserService:

    def __init__(self):
        self.repository = UserRepository()

    async def register_user(self, user):

        existing = await self.repository.get_user_by_email(user.email)

        if existing:
            raise ValueError("Email already exists.")

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

        return await self.repository.create_user(payload)

    async def login_user(self, email: str, password: str):

        user = await self.repository.get_user_by_email(email)

        if not user:
            raise ValueError("Invalid credentials.")

        if not verify_password(password, user["password"]):
            raise ValueError("Invalid credentials.")

        payload = {
            "sub": str(user["_id"]),
            "email": user["email"],
        }

        return {
            "access_token": create_access_token(payload),
            "refresh_token": create_refresh_token(payload),
            "token_type": "bearer",
        }