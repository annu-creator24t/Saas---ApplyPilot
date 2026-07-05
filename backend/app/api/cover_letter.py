from fastapi import APIRouter
from pydantic import BaseModel

from app.services.gemini_service import generate_cover_letter
from app.prompts.cover_letter_prompt import build_cover_letter_prompt

router = APIRouter()


class CoverLetterRequest(BaseModel):
    resume: str
    job_description: str


@router.post("/generate-cover-letter")
async def generate(request: CoverLetterRequest):
    prompt = build_cover_letter_prompt(
        request.resume,
        request.job_description,
    )

    cover_letter = generate_cover_letter(prompt)

    return {
        "cover_letter": cover_letter
    }