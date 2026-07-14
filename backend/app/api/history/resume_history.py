from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.services.resume_service import get_resume_history

router = APIRouter()


@router.get("/history/resumes")
async def resume_history(
    current_user=Depends(get_current_user),
):

    history = await get_resume_history(
        current_user["sub"]
    )

    return {
        "success": True,
        "history": history,
    }