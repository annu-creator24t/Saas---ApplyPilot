from fastapi import APIRouter, Depends, status

from app.common.responses import success_response
from app.core.dependencies import get_current_user

from app.schemas.resume_improvement import ResumeImprovementRequest
from app.services.resume_improvement_service import ResumeImprovementService

router = APIRouter(
    prefix="/resume-improvement",
    tags=["Resume Improvement"],
)

service = ResumeImprovementService()


@router.post("/generate", status_code=status.HTTP_200_OK)
async def generate_resume_improvement(
    request: ResumeImprovementRequest,
    current_user=Depends(get_current_user),
):
    result = await service.improve_resume(
        resume_id=request.resume_id,
        job_description=request.job_description,
        user_id=str(current_user["_id"]),
    )

    return success_response(
        message="Resume improved successfully.",
        data=result.model_dump(),
    )