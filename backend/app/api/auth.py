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


@router.post(
    "/register",
    response_model=APIResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register User",
    description="Register a new user account.",
)
async def register(user: UserCreate):
    return await service.register_user(user)


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