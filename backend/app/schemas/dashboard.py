from pydantic import BaseModel
from typing import Optional


class DashboardResponse(BaseModel):
    total_resumes: int
    total_analyses: int
    average_score: float
    highest_score: float
    latest_resume: Optional[str] = None
    latest_analysis_score: Optional[float] = None