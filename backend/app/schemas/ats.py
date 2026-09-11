from typing import List, Optional

from pydantic import BaseModel, Field


class ResumeAnalysisRequest(BaseModel):
    job_description: Optional[str] = Field(
        None,
        description="Optional target job description to evaluate ATS match against",
    )


class ATSAnalysis(BaseModel):

    ats_score: int

    summary: str

    strengths: List[str]

    weaknesses: List[str]

    missing_skills: List[str]

    grammar: str

    formatting: str

    recommendations: List[str]