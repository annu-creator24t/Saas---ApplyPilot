from datetime import datetime

from app.ai.gemini_client import generate
from app.ai.prompts import build_interview_prompt
from app.ai.response_parser import parse_interview_questions
from app.handlers.exceptions import (
    AuthorizationException,
    NotFoundException,
)
from app.repositories.interview_repository import InterviewRepository
from app.repositories.resume_repository import ResumeRepository
from app.schemas.interview import (
    InterviewRequest,
    InterviewResponse,
)


class InterviewService:

    def __init__(self):
        self.resume_repository = ResumeRepository()
        self.interview_repository = InterviewRepository()

    async def generate_questions(
        self,
        user_id: str,
        request: InterviewRequest,
    ) -> InterviewResponse:

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

        # Generate Questions
        response = generate(prompt)

        # Parse Response
        questions = parse_interview_questions(response)

        # Save Interview
        await self.interview_repository.create_interview(
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

        # Return Response
        return InterviewResponse(**questions)