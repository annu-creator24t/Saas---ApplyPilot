from datetime import datetime

from app.ai.groq_client import generate
from app.ai.response_parser import parse_interview_questions
from app.core.logger import logger
from app.handlers.exceptions import (
    AIException,
    AuthorizationException,
    NotFoundException,
    ValidationException,
)
from app.prompts.interview_questions_prompt import (
    build_interview_questions_prompt,
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
        if not request.job_description or not request.job_description.strip():
            raise ValidationException("Job description is required to generate interview questions.")

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

        tech_list = questions.get("technical", [])
        beh_list = questions.get("behavioral", [])
        hr_list = questions.get("hr", [])

        # =====================================================
        # Store Questions
        # =====================================================

        interview_id = (
            await self.questions_repository.create_questions(
                {
                    "user_id": str(resume["user_id"]),
                    "resume_id": request.resume_id,
                    "job_description": request.job_description,
                    "technical": tech_list,
                    "behavioral": beh_list,
                    "hr": hr_list,
                    "created_at": datetime.utcnow(),
                }
            )
        )

        # Deduct credit ONLY after successful generation and persistence
        await self.subscription_service.deduct_ai_credit_on_success(user_id)

        # =====================================================
        # Response
        # =====================================================

        return APIResponse(
            message="Interview questions generated successfully.",
            data=InterviewQuestionsResponse(
                interview_id=interview_id,
                technical=tech_list,
                behavioral=beh_list,
                hr=hr_list,
            ),
        )