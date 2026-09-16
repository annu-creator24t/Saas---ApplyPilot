import json

from app.ai.groq_client import generate
from app.ai.response_parser import _clean_json_response
from app.core.logger import logger
from app.handlers.exceptions import (
    AIException,
    AuthorizationException,
    NotFoundException,
    ValidationException,
)
from app.prompts.job_match_prompt import (
    build_job_match_prompt,
)
from app.repositories.resume_repository import (
    ResumeRepository,
)
from app.schemas.application import (
    JobMatchRequest,
    JobMatchResponse,
)
from app.schemas.common import (
    APIResponse,
)
from app.services.subscription_service import (
    SubscriptionService,
)


class JobService:

    def __init__(self):
        self.resume_repo = ResumeRepository()
        self.subscription_service = (
            SubscriptionService()
        )

    # =====================================================
    # ANALYZE JOB MATCH
    # =====================================================

    async def analyze_job_match(
        self,
        user_id: str,
        request: JobMatchRequest,
    ) -> APIResponse:
        if not request.job_description or not request.job_description.strip():
            raise ValidationException("Job description is required for job match analysis.")

        resume = None

        # =================================================
        # 2. If extension explicitly selected a resume,
        #    use that resume.
        # =================================================

        if request.resume_id:

            resume = (
                await self.resume_repo.get_resume(
                    request.resume_id
                )
            )

            if not resume:
                raise NotFoundException(
                    "Selected resume was not found."
                )

            # Security check:
            # the selected resume MUST belong to
            # the authenticated user.
            if str(
                resume.get("user_id")
            ) != str(user_id):

                raise AuthorizationException(
                    "You are not authorized to use this resume."
                )

        # =================================================
        # 3. Normal extension flow
        #
        #    If no resume_id was provided:
        #
        #    default resume
        #          ↓
        #    latest resume
        # =================================================

        if not resume:

            resume = (
                await self.resume_repo.get_default_resume(
                    user_id
                )
            )

        # =================================================
        # 4. Backward compatibility
        #
        #    Existing resumes may not yet have
        #    is_default=True.
        #
        #    Therefore fall back to latest resume.
        # =================================================

        if not resume:

            resume = (
                await self.resume_repo.get_latest_resume(
                    user_id
                )
            )

        # =================================================
        # 5. Resume is REQUIRED for match score
        #
        #    NEVER send fake resume text to AI.
        # =================================================

        if not resume:

            raise NotFoundException(
                "No resume found. Please upload a resume to your ApplyPilot account before analyzing jobs."
            )

        # =================================================
        # 6. Extract stored resume text
        # =================================================

        resume_text = (
            resume.get(
                "extracted_text"
            )
            or ""
        ).strip()

        if not resume_text:

            raise NotFoundException(
                "The selected resume does not contain extracted text. Please upload the resume again from ApplyPilot."
            )

        # =================================================
        # 7. Build AI prompt
        # =================================================

        try:

            prompt = build_job_match_prompt(
                resume_text=resume_text,
                job_description=request.job_description,
                job_title=(
                    request.job_title
                    or ""
                ),
                company_name=(
                    request.company_name
                    or ""
                ),
            )

            # =================================================
            # 8. Generate AI analysis
            # =================================================

            raw_response = generate(
                prompt
            )

            # =================================================
            # 9. Clean AI JSON
            # =================================================

            cleaned = _clean_json_response(
                raw_response
            )

            # =================================================
            # 10. Parse AI response
            # =================================================

            parsed_data = json.loads(
                cleaned
            )

            # =================================================
            # 11. Validate match score
            # =================================================

            match_score = parsed_data.get(
                "match_score"
            )

            if match_score is None:
                raise AIException(
                    message=(
                        "AI response did not contain a match score."
                    ),
                    error_code=(
                        "AI_INVALID_RESPONSE"
                    ),
                )

            try:
                match_score = int(
                    match_score
                )
            except (
                TypeError,
                ValueError,
            ):
                raise AIException(
                    message=(
                        "AI returned an invalid match score."
                    ),
                    error_code=(
                        "AI_INVALID_SCORE"
                    ),
                )

            # Keep score within schema range.
            match_score = max(
                0,
                min(
                    100,
                    match_score,
                ),
            )



            # =================================================
            # 13. Build response
            # =================================================

            response = JobMatchResponse(
                match_score=match_score,

                matched_skills=(
                    parsed_data.get(
                        "matched_skills",
                        [],
                    )
                    or []
                ),

                missing_skills=(
                    parsed_data.get(
                        "missing_skills",
                        [],
                    )
                    or []
                ),

                key_keywords=(
                    parsed_data.get(
                        "key_keywords",
                        [],
                    )
                    or []
                ),

                strengths=(
                    parsed_data.get(
                        "strengths",
                        [],
                    )
                    or []
                ),

                weaknesses=(
                    parsed_data.get(
                        "weaknesses",
                        [],
                    )
                    or []
                ),

                recommendations=(
                    parsed_data.get(
                        "recommendations",
                        [],
                    )
                    or []
                ),

                summary=(
                    parsed_data.get(
                        "summary",
                        "",
                    )
                    or ""
                ),

                job_title=request.job_title,

                company_name=(
                    request.company_name
                ),

                location=request.location,
            )

            # =================================================
            # 14. Return API response
            # =================================================

            return APIResponse(
                message=(
                    "Job analyzed successfully."
                ),
                data=response.model_dump(),
            )

        # =====================================================
        # JSON parsing failure
        # =====================================================

        except json.JSONDecodeError:

            raise AIException(
                message=(
                    "Failed to parse AI job analysis response."
                ),
                error_code=(
                    "AI_PARSE_ERROR"
                ),
            )

        # =====================================================
        # Preserve explicit AI exceptions
        # =====================================================

        except AIException:
            raise

        # =====================================================
        # Unexpected failure
        # =====================================================

        except Exception as e:
            logger.exception("Unexpected error during job match analysis: %s", e)
            raise AIException(
                message="Unable to analyze job match at this time. Please try again shortly.",
                error_code="JOB_MATCH_ERROR",
            )