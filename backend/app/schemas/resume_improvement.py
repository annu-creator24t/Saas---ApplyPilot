from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ResumeImprovementRequest(BaseModel):
    resume_id: str = Field(..., description="Resume ID")
    job_description: str = Field(..., description="Target job description")


class ResumeImprovementResponse(BaseModel):
    professional_summary: str
    skills: List[str]
    experience: str
    projects: str
    recommendations: List[str]


class ResumeImprovement(BaseModel):
    id: Optional[str] = None

    user_id: str
    resume_id: str
    job_description: str

    professional_summary: str
    skills: List[str]
    experience: str
    projects: str
    recommendations: List[str]

    created_at: datetime = Field(default_factory=datetime.utcnow)