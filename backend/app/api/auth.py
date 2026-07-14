from fastapi import APIRouter

from app.models.user import User
from app.schemas.auth_schema import (
    RegisterRequest,
    LoginRequest,
)
from app.services.auth_service import (
    register_user,
    login_user,
)

router = APIRouter()


@router.post("/register")
async def register(request: RegisterRequest):

    user = User(
        name=request.name,
        email=request.email,
        password=request.password,
    )

    return await register_user(user)


@router.post("/login")
async def login(request: LoginRequest):

    return await login_user(
        request.email,
        request.password,
    )