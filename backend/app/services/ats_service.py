from typing import Optional

from app.ai.groq_client import generate
from app.ai.response_parser import parse_response
from app.core.logger import logger
from app.handlers.exceptions import AIException, ValidationException
from app.prompts.resume_prompt import build_resume_prompt


class ATSService:

    def analyze(
        self,
        resume_text: str,
        job_description: Optional[str] = None,
    ):
        if not resume_text or not resume_text.strip():
            raise ValidationException(
                "Resume content is empty. Please upload or select a valid resume."
            )

        try:
            prompt = build_resume_prompt(
                resume_text.strip(),
                job_description=job_description.strip() if job_description else None,
            )

            response = generate(prompt)

            analysis = parse_response(response)

            return analysis

        except (AIException, ValidationException):
            raise

        except Exception as e:
            logger.exception("Unexpected error during ATS analysis: %s", e)
            raise AIException(
                "Unable to analyze resume ATS compatibility. Please try again.",
                error_code="ATS_ANALYSIS_ERROR",
            )