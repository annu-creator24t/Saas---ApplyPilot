from fastapi import APIRouter, Depends, status

from app.common.responses import success_response
from app.core.dependencies import get_current_user
from app.schemas.interview import InterviewRequest
from app.services.interview_service import InterviewService

router = APIRouter(
    prefix="/interview",
    tags=["Interview"],
)

service = InterviewService()


@router.post(
    "/generate",
    status_code=status.HTTP_200_OK,
)
async def generate_questions(
    request: InterviewRequest,
    current_user=Depends(get_current_user),
):
    result = await service.generate_questions(
        user_id=str(current_user["_id"]),
        request=request,
    )

    return success_response(
        message="Interview questions generated successfully.",
        data=result.model_dump(),
    )