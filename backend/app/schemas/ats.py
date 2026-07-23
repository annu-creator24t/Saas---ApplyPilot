from typing import List

from pydantic import BaseModel


class ATSAnalysis(BaseModel):

    ats_score: int

    summary: str

    strengths: List[str]

    weaknesses: List[str]

    missing_skills: List[str]

    grammar: str

    formatting: str

    recommendations: List[str]