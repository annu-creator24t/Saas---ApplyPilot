from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.middleware.auth import get_current_user
from app.models.interview import Interview
from app.prompts.interview_prompt import build_interview_prompt
from app.services.gemini_service import generate_interview_questions
from app.services.interview_service import save_interview

router = APIRouter()


class InterviewRequest(BaseModel):
    resume: str
    job_description: str


@router.post("/generate-interview")
async def generate(
    request: InterviewRequest,
    current_user=Depends(get_current_user),
):

    prompt = build_interview_prompt(
        request.resume,
        request.job_description,
    )

    questions = generate_interview_questions(prompt)

    interview = Interview(
        user_id=current_user["sub"],
        resume=request.resume,
        job_description=request.job_description,
        questions=str(questions),
    )

    document_id = await save_interview(interview)

    return {
        "success": True,
        "interview_id": document_id,
        "questions": questions,
    }