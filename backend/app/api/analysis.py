from fastapi import APIRouter

from app.services.analysis_service import AnalysisService

router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"],
)


@router.post("/resume/{resume_id}")
async def analyze_resume(resume_id: str):

    service = AnalysisService()

    return await service.analyze_resume(resume_id)