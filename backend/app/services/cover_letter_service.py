from datetime import datetime

from app.ai.gemini_client import generate
from app.ai.prompts import build_cover_letter_prompt
from app.handlers.exceptions import (
    AuthorizationException,
    NotFoundException,
)
from app.repositories.cover_letter_repository import CoverLetterRepository
from app.repositories.resume_repository import ResumeRepository
from app.schemas.common import APIResponse
from app.schemas.cover_letter import (
    CoverLetterRequest,
    CoverLetterResponse,
)
from app.services.subscription_service import SubscriptionService


class CoverLetterService:

    def __init__(self):
        self.resume_repository = ResumeRepository()
        self.cover_letter_repository = CoverLetterRepository()
        self.subscription_service = SubscriptionService()

    async def generate_cover_letter(
        self,
        user_id: str,
        request: CoverLetterRequest,
    ):
        # 1. Check AI usage permission
        await self.subscription_service.check_ai_permission(user_id)

        # Fetch Resume
        resume = await self.resume_repository.get_resume(
            request.resume_id
        )

        if not resume:
            raise NotFoundException("Resume not found.")

        # Security Check
        if str(resume.get("user_id")) != str(user_id):
            raise AuthorizationException(
                "You are not authorized to access this resume."
            )

        # Extract Resume Text
        resume_text = resume.get("extracted_text")

        if not resume_text:
            raise NotFoundException(
                "Extracted resume text not found."
            )

        # Build Prompt
        prompt = build_cover_letter_prompt(
            resume_text=resume_text,
            job_description=request.job_description,
        )

        # Generate Cover Letter
        cover_letter = generate(prompt).strip()

        # Deduct credit on successful AI execution
        await self.subscription_service.deduct_ai_credit_on_success(user_id)

        # Save Cover Letter
        await self.cover_letter_repository.create_cover_letter(
            {
                "user_id": resume.get("user_id"),
                "resume_id": request.resume_id,
                "job_description": request.job_description,
                "cover_letter": cover_letter,
                "created_at": datetime.utcnow(),
            }
        )

        return APIResponse(
            message="Cover letter generated successfully.",
            data=CoverLetterResponse(
                cover_letter=cover_letter,
            ),
        )