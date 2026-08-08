from fastapi import APIRouter, Depends, status
from app.core.dependencies import get_current_user
from app.schemas.application import JobMatchRequest
from app.schemas.common import APIResponse
from app.services.job_service import JobService

router = APIRouter(
    prefix="/job",
    tags=["Job Analysis"],
)

service = JobService()


@router.post(
    "/analyze",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Job Description",
    description="Analyze a target job description against user resume and calculate match score & skill gaps.",
)
async def analyze_job(
    request: JobMatchRequest,
    current_user: dict = Depends(get_current_user),
):
    return await service.analyze_job_match(
        user_id=str(current_user["_id"]),
        request=request,
    )
