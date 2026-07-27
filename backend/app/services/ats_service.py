from app.ai.gemini_client import generate
from app.ai.response_parser import parse_response
from app.handlers.exceptions import AIException
from app.prompts.resume_prompt import build_resume_prompt
from app.schemas.common import APIResponse


class ATSService:

    def analyze(self, resume_text: str):

        try:
            prompt = build_resume_prompt(resume_text)

            response = generate(prompt)

            analysis = parse_response(response)

            return APIResponse(
                message="ATS analysis completed successfully.",
                data=analysis,
            )

        except AIException:
            raise

        except Exception as e:
            raise AIException(f"Unexpected AI error: {str(e)}")