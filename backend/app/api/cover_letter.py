from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user
from app.schemas.common import APIResponse
from app.schemas.cover_letter import CoverLetterRequest
from app.services.cover_letter_service import CoverLetterService

router = APIRouter(
    prefix="/cover-letter",
    tags=["Cover Letter"],
)

cover_letter_service = CoverLetterService()


@router.post(
    "/generate",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Cover Letter",
    description="Generate an AI-powered cover letter based on the uploaded resume and job description.",
)
async def generate_cover_letter(
    request: CoverLetterRequest,
    current_user=Depends(get_current_user),
):
    return await cover_letter_service.generate_cover_letter(
        user_id=str(current_user["_id"]),
        request=request,
    )