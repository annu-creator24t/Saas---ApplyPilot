from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CoverLetterRequest(BaseModel):
    resume_id: str = Field(..., description="Resume ID")
    job_description: str = Field(..., description="Target job description")


class CoverLetter(BaseModel):
    id: Optional[str] = None

    user_id: str

    resume_id: str

    job_description: str

    cover_letter: str

    created_at: datetime = Field(default_factory=datetime.utcnow)


class CoverLetterResponse(BaseModel):
    cover_letter: str