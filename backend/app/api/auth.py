from fastapi import APIRouter, Depends, Request, status
from fastapi.security import OAuth2PasswordRequestForm

from app.handlers.exceptions import ValidationException
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
# Login - Supports JSON and Form-Data
# =====================================================

@router.post(
    "/login",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Login User",
    description="Authenticate a user using JSON payload or form data, returning access & refresh tokens.",
)
async def login(request: Request):
    content_type = request.headers.get("content-type", "")

    if "application/json" in content_type:
        body = await request.json()
        email = body.get("email") or body.get("username")
        password = body.get("password")
    else:
        form = await request.form()
        email = form.get("username") or form.get("email")
        password = form.get("password")

    if not email or not password:
        raise ValidationException("Email and password are required.")

    return await service.login_user(str(email), str(password))


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