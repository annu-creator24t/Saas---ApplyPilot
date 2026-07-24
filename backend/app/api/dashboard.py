from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user
from app.schemas.common import APIResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)

service = DashboardService()


@router.get(
    "",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Dashboard",
    description="Retrieve dashboard statistics and analytics for the authenticated user.",
)
async def dashboard(
    current_user=Depends(get_current_user),
):
    return await service.get_dashboard(
        str(current_user["_id"])
    )