from pydantic import BaseModel
from typing import List


class AnalysisHistoryItem(BaseModel):
    analysis_id: str
    resume_id: str
    resume_name: str
    overall_score: float
    created_at: str


class AnalysisHistoryResponse(BaseModel):
    analyses: List[AnalysisHistoryItem]