from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user
from app.schemas.common import APIResponse
from app.schemas.user import (
    ChangePasswordRequest,
    UpdateProfileRequest,
)
from app.services.user_service import UserService

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

service = UserService()


# =====================================================
# Get Current User Profile
# =====================================================

@router.get(
    "/me",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Current User Profile",
    description="Fetch the profile details of the authenticated user.",
)
async def get_profile(
    current_user: dict = Depends(get_current_user),
):
    return await service.get_profile(
        str(current_user["_id"])
    )


# =====================================================
# Update Profile
# =====================================================

@router.patch(
    "/me",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Update User Profile",
    description="Update the authenticated user's profile information.",
)
async def update_profile(
    request: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
):
    return await service.update_profile(
        user_id=str(current_user["_id"]),
        full_name=request.full_name,
    )


# =====================================================
# Change Password
# =====================================================

@router.patch(
    "/change-password",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Change Password",
    description="Change the password of the authenticated user.",
)
async def change_password(
    request: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
):
    return await service.change_password(
        user_id=str(current_user["_id"]),
        current_password=request.current_password,
        new_password=request.new_password,
    )