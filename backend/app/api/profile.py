from fastapi import APIRouter, Depends, HTTPException

from app.middleware.auth import get_current_user
from app.services.user_service import get_user_by_id

router = APIRouter()


@router.get("/profile")
async def profile(
    current_user=Depends(get_current_user),
):

    user = await get_user_by_id(
        current_user["sub"]
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    return {
        "success": True,
        "user": user,
    }