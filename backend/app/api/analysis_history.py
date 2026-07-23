from fastapi import APIRouter, Depends

from app.services.analysis_history_service import AnalysisHistoryService

from app.schemas.analysis_history import AnalysisHistoryResponse

from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/analysis",
    tags=["Analysis History"]
)

service = AnalysisHistoryService()


@router.get(
    "/history",
    response_model=AnalysisHistoryResponse
)
async def history(
    current_user=Depends(get_current_user)
):
    return await service.get_history(
        str(current_user["_id"])
    )