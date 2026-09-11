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
        job_description: str | None = None,
    ):
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
            resume["extracted_text"],
            job_description=job_description,
        )

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