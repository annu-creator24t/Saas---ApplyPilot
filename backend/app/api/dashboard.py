from fastapi import APIRouter, Depends

from app.services.dashboard_service import DashboardService
from app.schemas.dashboard import DashboardResponse
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

service = DashboardService()


@router.get(
    "",
    response_model=DashboardResponse
)
async def dashboard(current_user=Depends(get_current_user)):
    return await service.get_dashboard(str(current_user["_id"]))