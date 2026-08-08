from datetime import datetime

from app.ai.groq_client import generate
from app.ai.response_parser import parse_interview_questions
from app.prompts.interview_questions_prompt import (
    build_interview_questions_prompt,
)
from app.handlers.exceptions import (
    AuthorizationException,
    NotFoundException,
)
from app.repositories.interview_questions_repository import (
    InterviewQuestionsRepository,
)
from app.repositories.resume_repository import ResumeRepository
from app.schemas.common import APIResponse
from app.schemas.interview_questions import (
    InterviewQuestionsRequest,
    InterviewQuestionsResponse,
)
from app.services.subscription_service import SubscriptionService


class InterviewQuestionsService:

    def __init__(self):
        self.resume_repository = ResumeRepository()
        self.questions_repository = InterviewQuestionsRepository()
        self.subscription_service = SubscriptionService()

    async def generate_questions(
        self,
        user: dict,
        request: InterviewQuestionsRequest,
    ):
        user_id = str(user["_id"])
        await self.subscription_service.check_ai_permission(user_id)

        # =====================================================
        # Get Resume
        # =====================================================

        resume = await self.resume_repository.get_resume(
            request.resume_id
        )

        if not resume:
            raise NotFoundException(
                "Resume not found."
            )

        # =====================================================
        # Verify Resume Ownership
        # =====================================================

        if str(resume["user_id"]) != str(user["_id"]):
            raise AuthorizationException(
                "You are not authorized to access this resume."
            )

        # =====================================================
        # Get Resume Text
        # =====================================================

        resume_text = resume.get("extracted_text")

        if not resume_text:
            raise NotFoundException(
                "Resume text not found."
            )

        # =====================================================
        # Build AI Prompt
        # =====================================================

        prompt = build_interview_questions_prompt(
            resume_text,
            request.job_description,
        )

        # =====================================================
        # Generate Interview Questions
        # =====================================================

        response = generate(prompt)

        # =====================================================
        # Parse AI Response
        # =====================================================

        questions = parse_interview_questions(
            response
        )

        await self.subscription_service.deduct_ai_credit_on_success(user_id)

        # =====================================================
        # Store Questions
        # =====================================================

        interview_id = (
            await self.questions_repository.create_questions(
                {
                    "user_id": resume["user_id"],
                    "resume_id": request.resume_id,
                    "job_description": request.job_description,
                    "technical": questions["technical"],
                    "behavioral": questions["behavioral"],
                    "hr": questions["hr"],
                    "created_at": datetime.utcnow(),
                }
            )
        )

        # =====================================================
        # Response
        # =====================================================

        return APIResponse(
            message="Interview questions generated successfully.",
            data=InterviewQuestionsResponse(
                interview_id=interview_id,
                technical=questions["technical"],
                behavioral=questions["behavioral"],
                hr=questions["hr"],
            ),
        )