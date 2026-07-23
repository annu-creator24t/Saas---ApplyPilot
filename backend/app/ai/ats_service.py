from app.ai.gemini_client import generate
from app.ai.response_parser import parse_response
from app.prompts.resume_prompt import build_resume_prompt


class ATSService:

    def analyze(self, resume_text: str):

        prompt = build_resume_prompt(resume_text)

        response = generate(prompt)

        return parse_response(response)