from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user
from app.schemas.common import APIResponse
from app.schemas.interview import InterviewRequest
from app.services.interview_service import InterviewService

router = APIRouter(
    prefix="/interview",
    tags=["Interview"],
)

service = InterviewService()


@router.post(
    "/generate",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Interview Questions",
    description="Generate AI-powered interview questions based on the uploaded resume and job description.",
)
async def generate_questions(
    request: InterviewRequest,
    current_user=Depends(get_current_user),
):
    return await service.generate_questions(
        user_id=str(current_user["_id"]),
        request=request,
    )