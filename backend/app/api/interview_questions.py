from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user
from app.schemas.common import APIResponse
from app.schemas.interview_questions import (
    InterviewQuestionsRequest,
    InterviewQuestionsResponse,
)
from app.services.interview_questions_service import (
    InterviewQuestionsService,
)

router = APIRouter(
    prefix="/interview/questions",
    tags=["Interview Questions"],
)

service = InterviewQuestionsService()


@router.post(
    "/generate",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Interview Questions",
)
async def generate_interview_questions(
    request: InterviewQuestionsRequest,
    current_user=Depends(get_current_user),
):
    return await service.generate_questions(
        user=current_user,
        request=request,
    )