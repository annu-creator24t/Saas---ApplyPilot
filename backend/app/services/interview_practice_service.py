from datetime import datetime
from typing import Any, Optional

from app.ai.groq_client import generate
from app.ai.response_parser import (
    parse_interview_questions,
    parse_interview_evaluation,
)
from app.core.logger import logger
from app.handlers.exceptions import (
    AIException,
    AuthorizationException,
    NotFoundException,
    ValidationException,
)
from app.prompts.interview_questions_prompt import (
    build_interview_questions_prompt,
)
from app.prompts.interview_evaluation_prompt import (
    build_interview_evaluation_prompt,
)
from app.repositories.interview_practice_repository import (
    InterviewPracticeRepository,
)
from app.repositories.resume_repository import (
    ResumeRepository,
)
from app.schemas.common import APIResponse
from app.schemas.interview_practice import (
    InterviewPracticeRequest,
    InterviewPracticeResponse,
)
from app.services.subscription_service import SubscriptionService


class InterviewPracticeService:

    def __init__(self):
        self.resume_repository = ResumeRepository()
        self.practice_repository = (
            InterviewPracticeRepository()
        )
        self.subscription_service = SubscriptionService()

    async def start_practice(
        self,
        user: dict,
        request: InterviewPracticeRequest,
    ):
        if not request.job_description or not request.job_description.strip():
            raise ValidationException("Job description is required to start interview practice.")

        user_id = str(user["_id"])
        await self.subscription_service.check_ai_permission(user_id)

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

        response = generate(prompt)

        raw_questions = parse_interview_questions(
            response
        )

        # Safely extract questions from possible dictionary structures
        raw_tech = (
            raw_questions.get("technical")
            or raw_questions.get("technical_questions")
            or []
        )
        raw_beh = (
            raw_questions.get("behavioral")
            or raw_questions.get("behavioral_questions")
            or []
        )
        raw_hr = (
            raw_questions.get("hr")
            or raw_questions.get("hr_questions")
            or []
        )

        formatted_questions = []

        def _format_item(item: Any, default_cat: str) -> dict:
            if isinstance(item, dict):
                return {
                    "question": str(item.get("question", "")).strip() or "Interview question",
                    "category": item.get("category", default_cat),
                    "difficulty": item.get("difficulty", "Medium"),
                }
            return {
                "question": str(item).strip(),
                "category": default_cat,
                "difficulty": "Medium",
            }

        for item in raw_tech:
            formatted_questions.append(_format_item(item, "Technical"))
        for item in raw_beh:
            formatted_questions.append(_format_item(item, "Behavioral"))
        for item in raw_hr:
            formatted_questions.append(_format_item(item, "HR"))

        if not formatted_questions:
            formatted_questions = [
                {
                    "question": "Can you walk me through your background and relevant technical experience?",
                    "category": "Technical",
                    "difficulty": "Medium",
                }
            ]

        session_id = (
            await self.practice_repository.create_session(
                {
                    "user_id": str(user["_id"]),
                    "resume_id": request.resume_id,
                    "job_description": request.job_description,
                    "questions": formatted_questions,
                    "average_score": 0,
                    "status": "in_progress",
                    "created_at": datetime.utcnow(),
                }
            )
        )

        # Deduct credit ONLY after successful generation, parsing, and persistence
        await self.subscription_service.deduct_ai_credit_on_success(user_id)

        return APIResponse(
            message="Interview practice started successfully.",
            data=InterviewPracticeResponse(
                session_id=session_id,
                questions=formatted_questions,
            ),
        )

    async def evaluate_answer(
        self,
        question: str,
        answer: str,
        user_id: str = None,
        session_id: str = None,
        question_index: int = None,
    ):
        if not question or not question.strip():
            raise ValidationException("Question cannot be empty.")

        if not answer or not answer.strip():
            raise ValidationException("Answer cannot be empty. Please provide an answer to evaluate.")

        if user_id:
            await self.subscription_service.check_ai_permission(user_id)

        prompt = build_interview_evaluation_prompt(
            question.strip(),
            answer.strip(),
        )

        try:
            response = generate(prompt)

            result = parse_interview_evaluation(
                response
            )
        except (AIException, ValidationException):
            raise
        except Exception as exc:
            logger.exception("Unexpected error during interview evaluation: %s", exc)
            raise AIException(
                "Unable to evaluate answer at this time. Please try again.",
                error_code="EVALUATION_ERROR",
            )

        # Update session persistence if session_id provided
        if session_id:
            try:
                session = await self.practice_repository.get_session(session_id)
                if session and (not user_id or str(session.get("user_id")) == str(user_id)):
                    questions = session.get("questions", [])
                    idx = question_index if (question_index is not None and 0 <= question_index < len(questions)) else None

                    if idx is None:
                        # Find matching question by text
                        for i, q in enumerate(questions):
                            q_text = q.get("question") if isinstance(q, dict) else str(q)
                            if q_text == question:
                                idx = i
                                break

                    if idx is not None and idx < len(questions):
                        if isinstance(questions[idx], dict):
                            questions[idx]["user_answer"] = answer
                            questions[idx]["evaluation"] = result

                        # Recalculate average score
                        evaluated_scores = [
                            q.get("evaluation", {}).get("score", 0)
                            for q in questions
                            if isinstance(q, dict) and q.get("evaluation") and isinstance(q.get("evaluation"), dict)
                        ]
                        avg_score = (sum(evaluated_scores) / len(evaluated_scores)) if evaluated_scores else 0

                        await self.practice_repository.update_session(
                            session_id,
                            {
                                "questions": questions,
                                "average_score": avg_score,
                                "updated_at": datetime.utcnow(),
                            },
                        )
            except Exception:
                # Non-fatal session update error
                pass

        return result