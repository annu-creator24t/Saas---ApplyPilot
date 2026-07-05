import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def _generate(prompt: str):
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response

    except Exception as e:
        print("\n========== GEMINI ERROR ==========")
        print(e)
        print("==================================\n")
        raise


def _clean_json(text: str):
    text = text.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "").replace("```", "").strip()

    return json.loads(text)


def analyze_resume(prompt: str):
    response = _generate(prompt)
    return _clean_json(response.text)


def generate_cover_letter(prompt: str):
    response = _generate(prompt)
    return response.text.strip()


def generate_interview_questions(prompt: str):
    response = _generate(prompt)
    return _clean_json(response.text)


def evaluate_answer(prompt: str):
    response = _generate(prompt)
    return _clean_json(response.text)