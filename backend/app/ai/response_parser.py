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