from app.ai.groq_client import generate
from app.ai.response_parser import parse_response
from app.handlers.exceptions import AIException
from app.prompts.resume_prompt import build_resume_prompt


class ATSService:

    def analyze(self, resume_text: str):

        try:
            prompt = build_resume_prompt(resume_text)

            response = generate(prompt)

            print("=" * 80)
            print("RAW LLM RESPONSE")
            try:
                print(response)
            except Exception:
                print(response.encode('ascii', 'ignore').decode('ascii'))
            print("=" * 80)

            analysis = parse_response(response)

            print("=" * 80)
            print("PARSED ANALYSIS")
            try:
                print(analysis)
            except Exception:
                print(str(analysis).encode('ascii', 'ignore').decode('ascii'))
            print("=" * 80)

            return analysis

        except AIException:
            raise

        except Exception as e:
            raise AIException(f"Unexpected AI error: {str(e)}")