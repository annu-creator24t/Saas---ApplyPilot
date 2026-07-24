from fastapi import APIRouter, status

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
):
    return await service.analyze_resume(resume_id)