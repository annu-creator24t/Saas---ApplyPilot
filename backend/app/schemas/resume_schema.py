from pydantic import BaseModel
from typing import List


class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    job_description: str


class ResumeAnalysisResponse(BaseModel):
    ats_score: int
    match_score: int
    missing_skills: List[str]
    strengths: List[str]
    resume_suggestions: List[str]
    interview_questions: List[str]