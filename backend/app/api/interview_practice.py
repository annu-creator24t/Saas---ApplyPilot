from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user
from app.schemas.common import APIResponse
from app.schemas.interview_practice import (
    InterviewPracticeRequest,
    EvaluateAnswerRequest,
    InterviewPracticeResponse,
    Evaluation,
)
from app.services.interview_practice_service import (
    InterviewPracticeService,
)

router = APIRouter(
    prefix="/interview/practice",
    tags=["Interview Practice"],
)

service = InterviewPracticeService()


@router.post(
    "/start",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Start Interview Practice",
)
async def start_practice(
    request: InterviewPracticeRequest,
    current_user=Depends(get_current_user),
):
    return await service.start_practice(
        user=current_user,
        request=request,
    )


@router.post(
    "/evaluate",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate Interview Answer",
)
async def evaluate_answer(
    request: EvaluateAnswerRequest,
    current_user=Depends(get_current_user),
):
    result = await service.evaluate_answer(
        question=request.question,
        answer=request.answer,
        user_id=str(current_user["_id"]),
    )

    return APIResponse(
        message="Answer evaluated successfully.",
        data=result,
    )