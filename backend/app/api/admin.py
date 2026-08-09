from fastapi import APIRouter, Depends, status, HTTPException
from pydantic import BaseModel, EmailStr

from app.core.dependencies import get_current_admin_user, get_current_user
from app.db.connection import get_database
from app.schemas.common import APIResponse
from app.services.admin_service import AdminService

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)

service = AdminService()


class MakeAdminRequest(BaseModel):
    email: EmailStr


@router.get(
    "/stats",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Owner / Admin System Statistics",
    description="Fetch system-wide metrics: total users, active users, AI generations, free vs premium users.",
)
async def get_admin_statistics(
    current_user: dict = Depends(get_current_admin_user),
):
    return await service.get_system_statistics()


@router.post(
    "/make-admin",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Grant Admin Role to User",
    description="Promotes a user account to admin/owner status by email address.",
)
async def make_admin(
    request: MakeAdminRequest,
    current_user: dict = Depends(get_current_admin_user),
):
    db = get_database()
    user = await db["users"].find_one({"email": request.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email '{request.email}' not found.",
        )

    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"is_admin": True, "role": "admin"}}
    )

    return APIResponse(
        message=f"User '{request.email}' successfully promoted to Admin.",
        data={"email": request.email, "is_admin": True, "role": "admin"},
    )
