from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.middleware.auth import get_current_user
from app.models.cover_letter import CoverLetter
from app.prompts.cover_letter_prompt import build_cover_letter_prompt
from app.services.cover_letter_service import save_cover_letter
from app.services.gemini_service import generate_cover_letter

router = APIRouter()


class CoverLetterRequest(BaseModel):
    resume: str
    job_description: str


@router.post("/generate-cover-letter")
async def generate(
    request: CoverLetterRequest,
    current_user=Depends(get_current_user),
):

    prompt = build_cover_letter_prompt(
        request.resume,
        request.job_description,
    )

    cover_letter = generate_cover_letter(prompt)

    document = CoverLetter(
        user_id=current_user["sub"],
        resume=request.resume,
        job_description=request.job_description,
        cover_letter=str(cover_letter),
    )

    document_id = await save_cover_letter(document)

    return {
        "success": True,
        "cover_letter_id": document_id,
        "cover_letter": cover_letter,
    }