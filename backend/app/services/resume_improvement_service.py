from app.ai.gemini_client import generate
from app.ai.prompts import build_resume_improvement_prompt
from app.ai.response_parser import parse_resume_improvement

from app.handlers.exceptions import (
    AIException,
    AuthorizationException,
    NotFoundException,
)

from app.repositories.resume_repository import ResumeRepository
from app.repositories.resume_improvement_repository import (
    ResumeImprovementRepository,
)

from app.schemas.common import APIResponse


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
            job_description,
        )

        try:
            response = generate(prompt)
            parsed = parse_resume_improvement(response)
        except Exception as e:
            raise AIException(str(e))

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