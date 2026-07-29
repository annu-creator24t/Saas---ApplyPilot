from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.common import APIResponse
from app.schemas.user import UserCreate
from app.services.user_service import UserService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

service = UserService()


# =====================================================
# Register
# =====================================================

@router.post(
    "/register",
    response_model=APIResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register User",
    description="Register a new user account.",
)
async def register(user: UserCreate):
    return await service.register_user(user)


# =====================================================
# Login - Used by Frontend
# =====================================================

@router.post(
    "/login",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Login User",
    description="Authenticate a user and return access & refresh tokens.",
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    return await service.login_user(
        form_data.username,
        form_data.password,
    )


# =====================================================
# OAuth2 Token - Used by Swagger Authorize
# =====================================================

@router.post(
    "/token",
    status_code=status.HTTP_200_OK,
    summary="OAuth2 Token",
    description="OAuth2-compatible login endpoint used by Swagger.",
)
async def oauth2_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    response = await service.login_user(
        form_data.username,
        form_data.password,
    )

    return {
        "access_token": response.data["access_token"],
        "token_type": "bearer",
    }