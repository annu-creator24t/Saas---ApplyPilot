from app.ai.gemini_client import generate
from app.ai.response_parser import parse_response
from app.handlers.exceptions import AIException
from app.prompts.resume_prompt import build_resume_prompt


class ATSService:

    def analyze(self, resume_text: str):

        try:
            prompt = build_resume_prompt(resume_text)

            response = generate(prompt)

            print("=" * 80)
            print("RAW GEMINI RESPONSE")
            print(response)
            print("=" * 80)

            analysis = parse_response(response)

            print("=" * 80)
            print("PARSED ANALYSIS")
            print(analysis)
            print("=" * 80)

            return analysis

        except AIException:
            raise

        except Exception as e:
            raise AIException(f"Unexpected AI error: {str(e)}")