from fastapi import APIRouter
from pydantic import BaseModel

from app.prompts.interview_prompt import build_interview_prompt
from app.services.gemini_service import generate_interview_questions

router = APIRouter()


class InterviewRequest(BaseModel):
    resume: str
    job_description: str


@router.post("/generate-interview")
async def generate(request: InterviewRequest):

    prompt = build_interview_prompt(
        request.resume,
        request.job_description,
    )

    questions = generate_interview_questions(prompt)

    return {
        "questions": questions
    }