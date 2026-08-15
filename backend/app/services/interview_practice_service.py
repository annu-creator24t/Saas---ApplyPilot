from datetime import datetime

from app.ai.groq_client import generate
from app.ai.response_parser import (
    parse_interview_questions,
    parse_interview_evaluation,
)
from app.prompts.interview_questions_prompt import (
    build_interview_questions_prompt,
)
from app.prompts.interview_evaluation_prompt import (
    build_interview_evaluation_prompt,
)

from app.handlers.exceptions import (
    AuthorizationException,
    NotFoundException,
)

from app.repositories.interview_practice_repository import (
    InterviewPracticeRepository,
)
from app.repositories.resume_repository import (
    ResumeRepository,
)
from app.schemas.common import APIResponse

from app.schemas.interview_practice import (
    InterviewPracticeRequest,
    InterviewPracticeResponse,
)
from app.services.subscription_service import SubscriptionService


class InterviewPracticeService:

    def __init__(self):
        self.resume_repository = ResumeRepository()
        self.practice_repository = (
            InterviewPracticeRepository()
        )
        self.subscription_service = SubscriptionService()

    async def start_practice(
        self,
        user: dict,
        request: InterviewPracticeRequest,
    ):
        user_id = str(user["_id"])
        await self.subscription_service.check_ai_permission(user_id)

        resume = await self.resume_repository.get_resume(
            request.resume_id
        )

        if not resume:
            raise NotFoundException(
                "Resume not found."
            )

        if str(resume["user_id"]) != str(user["_id"]):
            raise AuthorizationException(
                "You are not authorized to access this resume."
            )

        resume_text = resume.get(
            "extracted_text"
        )

        if not resume_text:
            raise NotFoundException(
                "Resume text not found."
            )

        prompt = build_interview_questions_prompt(
            resume_text,
            request.job_description,
        )

        response = generate(prompt)

        await self.subscription_service.deduct_ai_credit_on_success(user_id)

        questions = parse_interview_questions(
            response
        )

        all_questions = (
            questions["technical"]
            + questions["behavioral"]
            + questions["hr"]
        )

        session_id = (
            await self.practice_repository.create_session(
                {
                    "user_id": resume["user_id"],
                    "resume_id": request.resume_id,
                    "job_description": request.job_description,
                    "questions": all_questions,
                    "average_score": 0,
                    "status": "in_progress",
                    "created_at": datetime.utcnow(),
                }
            )
        )

        return APIResponse(
            message="Interview practice started successfully.",
            data=InterviewPracticeResponse(
                session_id=session_id,
                questions=all_questions,
            ),
        )

    async def evaluate_answer(
        self,
        question: str,
        answer: str,
        user_id: str = None,
    ):
        if user_id:
            await self.subscription_service.check_ai_permission(user_id)

        prompt = build_interview_evaluation_prompt(
            question,
            answer,
        )

        response = generate(prompt)

        if user_id:
            await self.subscription_service.deduct_ai_credit_on_success(user_id)

        result = parse_interview_evaluation(
            response
        )

        return result