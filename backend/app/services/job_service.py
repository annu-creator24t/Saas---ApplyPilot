import json
from typing import Optional
from app.ai.gemini_client import generate
from app.ai.response_parser import _clean_json_response
from app.handlers.exceptions import AIException, NotFoundException, ValidationException
from app.prompts.job_match_prompt import build_job_match_prompt
from app.repositories.resume_repository import ResumeRepository
from app.schemas.application import JobMatchRequest, JobMatchResponse
from app.schemas.common import APIResponse
from app.services.subscription_service import SubscriptionService


class JobService:

    def __init__(self):
        self.resume_repo = ResumeRepository()
        self.subscription_service = SubscriptionService()

    async def analyze_job_match(
        self,
        user_id: str,
        request: JobMatchRequest,
    ) -> APIResponse:
        # Check AI usage permission
        await self.subscription_service.check_ai_permission(user_id)

        resume_text = ""

        # Fetch resume
        if request.resume_id:
            resume = await self.resume_repo.get_resume(request.resume_id)
            if resume and str(resume.get("user_id")) == str(user_id):
                resume_text = resume.get("extracted_text", "")
        
        # If no resume_id passed, pick user's latest uploaded resume
        if not resume_text:
            resumes = await self.resume_repo.get_user_resumes(user_id)
            if resumes:
                resume_text = resumes[0].get("extracted_text", "")

        if not resume_text:
            resume_text = "No resume uploaded by user. Analyze job description requirements, skills, and key keywords."

        try:
            prompt = build_job_match_prompt(
                resume_text=resume_text,
                job_description=request.job_description,
                job_title=request.job_title or "",
                company_name=request.company_name or "",
            )

            raw_response = generate(prompt)
            cleaned = _clean_json_response(raw_response)
            parsed_data = json.loads(cleaned)

            # Deduct credit on successful AI execution
            await self.subscription_service.deduct_ai_credit_on_success(user_id)

            response = JobMatchResponse(
                match_score=parsed_data.get("match_score", 75),
                matched_skills=parsed_data.get("matched_skills", []),
                missing_skills=parsed_data.get("missing_skills", []),
                key_keywords=parsed_data.get("key_keywords", []),
                strengths=parsed_data.get("strengths", []),
                weaknesses=parsed_data.get("weaknesses", []),
                recommendations=parsed_data.get("recommendations", []),
                summary=parsed_data.get("summary", ""),
                job_title=request.job_title,
                company_name=request.company_name,
                location=request.location,
            )

            return APIResponse(
                message="Job analyzed successfully.",
                data=response.model_dump(),
            )

        except json.JSONDecodeError:
            raise AIException(
                message="Failed to parse AI job analysis response.",
                error_code="AI_PARSE_ERROR",
            )
        except AIException:
            raise
        except Exception as e:
            raise AIException(
                message=f"Error analyzing job match: {str(e)}",
                error_code="JOB_MATCH_ERROR",
            )
