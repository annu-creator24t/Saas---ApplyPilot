import json

from app.schemas.ats import ATSAnalysis


def parse_response(response: str) -> ATSAnalysis:

    cleaned = response.strip()

    if cleaned.startswith("```json"):
        cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    elif cleaned.startswith("```"):
        cleaned = cleaned.replace("```", "").strip()

    data = json.loads(cleaned)

    return ATSAnalysis(**data)

def parse_interview_questions(response: str):
    return json.loads(response)

def parse_resume_improvement(response: str) -> dict:
    import json

    response = response.strip()

    if response.startswith("```json"):
        response = response.replace("```json", "").replace("```", "").strip()
    elif response.startswith("```"):
        response = response.replace("```", "").strip()

    return json.loads(response)