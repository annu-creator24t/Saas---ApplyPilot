from app.ai.gemini_client import generate
from app.ai.prompts import build_resume_improvement_prompt
from app.ai.response_parser import parse_resume_improvement

from app.repositories.resume_repository import ResumeRepository
from app.repositories.resume_improvement_repository import (
    ResumeImprovementRepository,
)

from app.schemas.resume_improvement import ResumeImprovementResponse


class ResumeImprovementService:
    def __init__(self):
        self.resume_repository = ResumeRepository()
        self.improvement_repository = ResumeImprovementRepository()

    async def improve_resume(
        self,
        resume_id: str,
        job_description: str,
        user_id: str,
    ):
        resume = await self.resume_repository.get_resume(resume_id)

        if not resume:
            raise Exception("Resume not found")

        if str(resume["user_id"]) != str(user_id):
            raise Exception("Unauthorized")

        resume_text = resume.get("extracted_text")

        prompt = build_resume_improvement_prompt(
            resume_text,
            job_description,
        )

        response = generate(prompt)

        parsed = parse_resume_improvement(response)

        improvement_data = {
            "user_id": user_id,
            "resume_id": resume_id,
            "job_description": job_description,
            **parsed,
        }

        await self.improvement_repository.create_improvement(
            improvement_data
        )

        return ResumeImprovementResponse(**parsed)