from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.services.interview_service import get_interview_history

router = APIRouter()


@router.get("/history/interviews")
async def interview_history(
    current_user=Depends(get_current_user),
):

    history = await get_interview_history(
        current_user["sub"]
    )

    return {
        "success": True,
        "history": history,
    }