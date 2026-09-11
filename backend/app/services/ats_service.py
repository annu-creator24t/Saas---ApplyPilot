from typing import Optional

from app.ai.groq_client import generate
from app.ai.response_parser import parse_response
from app.handlers.exceptions import AIException
from app.prompts.resume_prompt import build_resume_prompt


class ATSService:

    def analyze(
        self,
        resume_text: str,
        job_description: Optional[str] = None,
    ):
        try:
            prompt = build_resume_prompt(
                resume_text,
                job_description=job_description,
            )

            response = generate(prompt)

            analysis = parse_response(response)

            return analysis

        except AIException:
            raise

        except Exception as e:
            raise AIException(f"Unexpected AI error: {str(e)}")