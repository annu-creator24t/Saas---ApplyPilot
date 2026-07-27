from fastapi import (
    APIRouter,
    Depends,
    status,
)

from app.core.dependencies import get_current_user
from app.schemas.common import APIResponse
from app.services.analysis_service import AnalysisService

router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"],
)

service = AnalysisService()


@router.post(
    "/resume/{resume_id}",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Resume",
    description="Analyze an uploaded resume using AI and generate an ATS report.",
)
async def analyze_resume(
    resume_id: str,
    current_user=Depends(get_current_user),
):
    return await service.analyze_resume(
        resume_id=resume_id,
        user_id=str(current_user["_id"]),
    )