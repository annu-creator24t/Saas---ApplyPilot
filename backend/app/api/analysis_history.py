from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user
from app.schemas.common import APIResponse
from app.services.analysis_history_service import AnalysisHistoryService

router = APIRouter(
    prefix="/analysis",
    tags=["Analysis History"],
)

service = AnalysisHistoryService()


@router.get(
    "/history",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Analysis History",
    description="Retrieve the authenticated user's resume analysis history.",
)
async def history(
    current_user=Depends(get_current_user),
):
    return await service.get_history(
        str(current_user["_id"])
    )