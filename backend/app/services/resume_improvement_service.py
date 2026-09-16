from app.ai.groq_client import generate
from app.ai.prompts import build_resume_improvement_prompt
from app.ai.response_parser import parse_resume_improvement
from app.core.logger import logger
from app.handlers.exceptions import (
    AIException,
    AuthorizationException,
    NotFoundException,
    ValidationException,
)
from app.repositories.resume_repository import ResumeRepository
from app.repositories.resume_improvement_repository import (
    ResumeImprovementRepository,
)
from app.schemas.common import APIResponse
from app.services.subscription_service import SubscriptionService


class ResumeImprovementService:

    def __init__(self):
        self.resume_repository = ResumeRepository()
        self.improvement_repository = ResumeImprovementRepository()
        self.subscription_service = SubscriptionService()

    async def improve_resume(
        self,
        resume_id: str,
        job_description: str,
        user_id: str,
    ):
        if not job_description or not job_description.strip():
            raise ValidationException("Job description is required to generate resume improvements.")

        await self.subscription_service.check_ai_permission(user_id)

        resume = await self.resume_repository.get_resume(resume_id)

        if not resume:
            raise NotFoundException("Resume not found.")

        if str(resume["user_id"]) != str(user_id):
            raise AuthorizationException(
                "You are not authorized to access this resume."
            )

        resume_text = resume.get("extracted_text")

        if not resume_text:
            raise NotFoundException(
                "Extracted resume text not found."
            )

        prompt = build_resume_improvement_prompt(
            resume_text,
            job_description.strip(),
        )

        try:
            response = generate(prompt)
            parsed = parse_resume_improvement(response)
        except (AIException, ValidationException):
            raise
        except Exception as e:
            logger.exception("Unexpected error in resume improvement: %s", e)
            raise AIException(
                "Unable to generate resume improvements at this time. Please try again.",
                error_code="RESUME_IMPROVEMENT_ERROR",
            )

        await self.subscription_service.deduct_ai_credit_on_success(user_id)

        improvement_data = {
            "user_id": user_id,
            "resume_id": resume_id,
            "job_description": job_description,
            **parsed,
        }

        improvement_id = await self.improvement_repository.create_improvement(
            improvement_data
        )

        return APIResponse(
            message="Resume improvement generated successfully.",
            data={
                "improvement_id": improvement_id,
                **parsed,
            },
        )