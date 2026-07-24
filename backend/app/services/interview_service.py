from datetime import datetime

from app.ai.gemini_client import generate
from app.ai.prompts import build_interview_prompt
from app.ai.response_parser import parse_interview_questions
from app.handlers.exceptions import (
    AIException,
    AuthorizationException,
    NotFoundException,
)
from app.repositories.interview_repository import InterviewRepository
from app.repositories.resume_repository import ResumeRepository
from app.schemas.common import APIResponse
from app.schemas.interview import InterviewRequest


class InterviewService:

    def __init__(self):
        self.resume_repository = ResumeRepository()
        self.interview_repository = InterviewRepository()

    async def generate_questions(
        self,
        user_id: str,
        request: InterviewRequest,
    ):

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
        prompt = build_interview_prompt(
            resume_text,
            request.job_description,
        )

        # Generate & Parse Questions
        try:
            response = generate(prompt)
            questions = parse_interview_questions(response)
        except Exception as e:
            raise AIException(str(e))

        # Save Interview
        interview_id = await self.interview_repository.create_interview(
            {
                "user_id": resume.get("user_id"),
                "resume_id": request.resume_id,
                "job_description": request.job_description,
                "technical": questions["technical"],
                "behavioral": questions["behavioral"],
                "hr": questions["hr"],
                "created_at": datetime.utcnow(),
            }
        )

        # Return Standardized Response
        return APIResponse(
            message="Interview questions generated successfully.",
            data={
                "interview_id": interview_id,
                "technical": questions["technical"],
                "behavioral": questions["behavioral"],
                "hr": questions["hr"],
            },
        )