from app.ai.ats_service import ATSService
from app.repositories.resume_repository import ResumeRepository


class AnalysisService:

    def __init__(self):
        self.repository = ResumeRepository()
        self.ats = ATSService()

    async def analyze_resume(self, resume_id: str):

        # Fetch resume from MongoDB
        resume = await self.repository.get_resume(resume_id)

        if not resume:
            return {
                "error": "Resume not found"
            }

        # Run ATS Analysis
        analysis = self.ats.analyze(
            resume["extracted_text"]
        )

        # Save analysis back to MongoDB
        await self.repository.update_analysis(
            resume_id,
            analysis.model_dump()
        )

        # Return analysis to API
        return analysis