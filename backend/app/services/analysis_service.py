from app.handlers.exceptions import (
    AuthorizationException,
    NotFoundException,
)
from app.repositories.resume_repository import ResumeRepository
from app.schemas.common import APIResponse
from app.services.ats_service import ATSService
from app.services.subscription_service import SubscriptionService


class AnalysisService:

    def __init__(self):
        self.repository = ResumeRepository()
        self.ats = ATSService()
        self.subscription_service = SubscriptionService()

    async def analyze_resume(
        self,
        resume_id: str,
        user_id: str,
    ):
        # 1. Check AI usage permission
        await self.subscription_service.check_ai_permission(user_id)

        # Fetch resume
        resume = await self.repository.get_resume(
            resume_id
        )

        if not resume:
            raise NotFoundException(
                "Resume not found."
            )

        # Verify ownership
        if str(resume["user_id"]) != str(user_id):
            raise AuthorizationException(
                "Unauthorized."
            )

        # Run ATS analysis
        analysis = self.ats.analyze(
            resume["extracted_text"]
        )

        # Deduct credit on successful AI execution
        await self.subscription_service.deduct_ai_credit_on_success(user_id)

        # Save analysis
        await self.repository.update_analysis(
            resume_id,
            analysis.model_dump(),
        )

        # Fetch updated resume
        updated_resume = await self.repository.get_resume(
            resume_id
        )

        return APIResponse(
            message="Resume analyzed successfully.",
            data={
                "analysis": analysis.model_dump(),
                "resume": updated_resume,
            },
        )