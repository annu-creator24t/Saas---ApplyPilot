from datetime import datetime

from app.ai.gemini_client import generate
from app.ai.response_parser import parse_interview_questions
from app.prompts.interview_questions_prompt import (
    build_interview_questions_prompt,
)

from app.handlers.exceptions import (
    AuthorizationException,
    NotFoundException,
)

from app.repositories.interview_questions_repository import (
    InterviewQuestionsRepository,
)
from app.repositories.resume_repository import (
    ResumeRepository,
)

from app.schemas.common import APIResponse
from app.schemas.interview_questions import (
    InterviewQuestionsRequest,
    InterviewQuestionsResponse,
)


class InterviewQuestionsService:

    def __init__(self):
        self.resume_repository = ResumeRepository()
        self.questions_repository = (
            InterviewQuestionsRepository()
        )

    async def generate_questions(
        self,
        user: dict,
        request: InterviewQuestionsRequest,
    ):

        resume = await self.resume_repository.get_resume(
            request.resume_id
        )

        if not resume:
            raise NotFoundException(
                "Resume not found."
            )

        if str(resume["user_id"]) != str(user["_id"]):
            raise AuthorizationException(
                "You are not authorized to access this resume."
            )

        resume_text = resume.get(
            "extracted_text"
        )

        if not resume_text:
            raise NotFoundException(
                "Resume text not found."
            )

        prompt = build_interview_questions_prompt(
            resume_text,
            request.job_description,
        )

        response = await generate(prompt)

        questions = parse_interview_questions(
            response
        )

        interview_id = (
            await self.questions_repository.create_questions(
                {
                    "user_id": resume["user_id"],
                    "resume_id": request.resume_id,
                    "job_description": request.job_description,
                    "technical": questions["technical"],
                    "behavioral": questions["behavioral"],
                    "hr": questions["hr"],
                    "created_at": datetime.utcnow(),
                }
            )
        )

        return APIResponse(
            message="Interview questions generated successfully.",
            data=InterviewQuestionsResponse(
                interview_id=interview_id,
                technical=questions["technical"],
                behavioral=questions["behavioral"],
                hr=questions["hr"],
            ),
        )