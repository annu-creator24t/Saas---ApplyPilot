from fastapi import APIRouter
from pydantic import BaseModel

from app.prompts.answer_prompt import build_answer_prompt
from app.services.gemini_service import evaluate_answer

router = APIRouter()


class AnswerRequest(BaseModel):
    question: str
    answer: str


@router.post("/evaluate-answer")
async def evaluate(request: AnswerRequest):

    prompt = build_answer_prompt(
        request.question,
        request.answer,
    )

    result = evaluate_answer(prompt)

    return result