from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.middleware.auth import get_current_user
from app.models.interview import Interview
from app.prompts.interview_prompt import build_interview_prompt
from app.services.gemini_service import generate_interview_questions
from app.services.interview_service import (
    save_interview,
    get_interview_by_id,
    delete_interview,
)

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


@router.get("/interview/{interview_id}")
async def get_interview(
    interview_id: str,
    current_user=Depends(get_current_user),
):

    interview = await get_interview_by_id(interview_id)

    if interview is None:
        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    if interview["user_id"] != current_user["sub"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied.",
        )

    return {
        "success": True,
        "interview": interview,
    }


@router.delete("/interview/{interview_id}")
async def remove_interview(
    interview_id: str,
    current_user=Depends(get_current_user),
):

    interview = await get_interview_by_id(interview_id)

    if interview is None:
        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    if interview["user_id"] != current_user["sub"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied.",
        )

    deleted = await delete_interview(interview_id)

    return {
        "success": deleted,
    }