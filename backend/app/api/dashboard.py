from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.services.dashboard_service import get_dashboard

router = APIRouter()


@router.get("/dashboard")
async def dashboard(
    current_user=Depends(get_current_user),
):

    dashboard = await get_dashboard(
        current_user["sub"]
    )

    return {
        "success": True,
        **dashboard
    }