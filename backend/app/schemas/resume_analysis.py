from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ResumeAnalysis(BaseModel):

    id: Optional[str] = None

    user_id: str

    resume_text: str

    job_description: str

    analysis: str

    created_at: datetime = datetime.utcnow()