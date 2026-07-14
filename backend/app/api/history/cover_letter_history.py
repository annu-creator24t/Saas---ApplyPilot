from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.services.cover_letter_service import get_cover_letter_history

router = APIRouter()


@router.get("/history/cover-letters")
async def cover_letter_history(
    current_user=Depends(get_current_user),
):

    history = await get_cover_letter_history(
        current_user["sub"]
    )

    return {
        "success": True,
        "history": history,
    }