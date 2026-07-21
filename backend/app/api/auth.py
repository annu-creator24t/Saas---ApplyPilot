from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate
from app.services.user_service import UserService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    service = UserService()

    try:
        user_id = await service.register_user(user)

        return {
            "message": "User registered successfully.",
            "user_id": user_id,
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    service = UserService()

    try:
        return await service.login_user(
            credentials.email,
            credentials.password,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=str(e),
        )