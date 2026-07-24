from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user
from app.schemas.common import APIResponse
from app.schemas.resume_improvement import ResumeImprovementRequest
from app.services.resume_improvement_service import ResumeImprovementService

router = APIRouter(
    prefix="/resume-improvement",
    tags=["Resume Improvement"],
)

service = ResumeImprovementService()


@router.post(
    "/generate",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Resume Improvement",
    description="Analyze the uploaded resume against a job description and provide AI-powered suggestions for improvement.",
)
async def generate_resume_improvement(
    request: ResumeImprovementRequest,
    current_user=Depends(get_current_user),
):
    return await service.improve_resume(
        resume_id=request.resume_id,
        job_description=request.job_description,
        user_id=str(current_user["_id"]),
    )