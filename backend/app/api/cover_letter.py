from fastapi import APIRouter, Depends, status

from app.common.responses import success_response
from app.core.dependencies import get_current_user
from app.schemas.cover_letter import CoverLetterRequest
from app.services.cover_letter_service import CoverLetterService

router = APIRouter(
    prefix="/cover-letter",
    tags=["Cover Letter"],
)

cover_letter_service = CoverLetterService()


@router.post(
    "/generate",
    status_code=status.HTTP_200_OK,
)
async def generate_cover_letter(
    request: CoverLetterRequest,
    current_user=Depends(get_current_user),
):

    result = await cover_letter_service.generate_cover_letter(
        user_id=str(current_user["_id"]),
        request=request,
    )

    return success_response(
        message="Cover letter generated successfully.",
        data=result.model_dump(),
    )